import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { EntityManager } from '@mikro-orm/postgresql';
import { GroupFormationService } from './group-formation.service';

/**
 * Scheduler that triggers group formation on a regular interval.
 * Runs every minute by default (configurable via GROUP_FORMATION_CRON_SCHEDULE).
 *
 * Features:
 * - Distributed locking to prevent concurrent runs across multiple instances
 * - Configurable schedule via environment variable
 * - Can be disabled via GROUP_FORMATION_ENABLED=false
 */
@Injectable()
export class GroupFormationScheduler implements OnModuleInit {
  private readonly logger = new Logger(GroupFormationScheduler.name);
  private readonly processId: string;
  private readonly enabled: boolean;
  private readonly lockTimeoutSeconds: number;

  // Local lock to prevent overlapping runs within the same process
  private isLocallyRunning = false;

  constructor(
    private readonly groupFormationService: GroupFormationService,
    private readonly configService: ConfigService,
    private readonly em: EntityManager,
  ) {
    // Generate unique process ID for lock ownership
    this.processId = `${process.pid}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // Check if scheduler is enabled (default: true in production, can be disabled for tests)
    const enabledConfig = this.configService.get<string>(
      'GROUP_FORMATION_ENABLED',
    );
    this.enabled = enabledConfig !== 'false';

    // Lock timeout in seconds (default: 5 minutes)
    this.lockTimeoutSeconds =
      this.configService.get<number>('GROUP_FORMATION_LOCK_TIMEOUT_SECONDS') ??
      300;

    if (!this.enabled) {
      this.logger.warn(
        'Group formation scheduler is DISABLED (GROUP_FORMATION_ENABLED=false)',
      );
    }
  }

  onModuleInit(): void {
    if (this.enabled) {
      this.logger.log(
        `Group formation scheduler initialized. ` +
          `processId=${this.processId}, lockTimeout=${this.lockTimeoutSeconds}s`,
      );
    }
  }

  /**
   * Cron job that runs every minute to form groups for departing trips.
   *
   * Uses distributed locking to ensure only one instance runs at a time.
   * Note: The cron expression can be overridden via GROUP_FORMATION_CRON_SCHEDULE env var.
   *
   * Default: Every minute (* * * * *)
   */
  @Cron(process.env.GROUP_FORMATION_CRON_SCHEDULE ?? '* * * * *')
  async handleCron(): Promise<void> {
    // Skip if disabled
    if (!this.enabled) {
      return;
    }

    // Prevent local overlapping runs
    if (this.isLocallyRunning) {
      this.logger.debug('Group formation already running locally, skipping');
      return;
    }

    this.isLocallyRunning = true;

    try {
      // Try to acquire distributed lock
      const lockAcquired = await this.acquireDistributedLock();

      if (!lockAcquired) {
        this.logger.debug(
          'Could not acquire distributed lock, another instance is running',
        );
        return;
      }

      this.logger.log('[CRON] Starting scheduled group formation job');

      try {
        const result = await this.groupFormationService.formGroups();

        if (result.tripsProcessed > 0) {
          this.logger.log(
            `[CRON] Job completed: ` +
              `trips=${result.tripsProcessed}, ` +
              `groups=${result.totalGroupsFormed}, ` +
              `users=${result.totalUsersGrouped}, ` +
              `duration=${result.metrics.runDurationMs}ms`,
          );
        } else {
          this.logger.debug('[CRON] Job completed: no trips to process');
        }
      } finally {
        // Release the lock
        await this.releaseDistributedLock();
      }
    } catch (error) {
      this.logger.error(
        '[CRON] Scheduled group formation job failed',
        error instanceof Error ? error.stack : error,
      );
    } finally {
      this.isLocallyRunning = false;
    }
  }

  /**
   * Attempt to acquire a distributed lock using the database.
   * Returns true if lock was acquired, false otherwise.
   *
   * Uses PostgreSQL advisory locks for atomicity.
   */
  private async acquireDistributedLock(): Promise<boolean> {
    const lockName = 'group_formation_job';
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.lockTimeoutSeconds * 1000);

    try {
      // Use PostgreSQL advisory lock for atomic lock acquisition
      // pg_try_advisory_lock returns true if lock acquired, false if already held
      const lockId = this.hashStringToNumber(lockName);

      const result = await this.em.execute<[{ pg_try_advisory_lock: boolean }]>(
        `SELECT pg_try_advisory_lock(${lockId}) as pg_try_advisory_lock`,
      );

      const acquired = result[0]?.pg_try_advisory_lock === true;

      if (acquired) {
        this.logger.debug(
          `Acquired distributed lock: lockId=${lockId}, expires=${expiresAt.toISOString()}`,
        );
      }

      return acquired;
    } catch (error) {
      this.logger.error(
        'Failed to acquire distributed lock',
        error instanceof Error ? error.message : error,
      );
      return false;
    }
  }

  /**
   * Release the distributed lock.
   */
  private async releaseDistributedLock(): Promise<void> {
    const lockName = 'group_formation_job';
    const lockId = this.hashStringToNumber(lockName);

    try {
      await this.em.execute(`SELECT pg_advisory_unlock(${lockId})`);
      this.logger.debug(`Released distributed lock: lockId=${lockId}`);
    } catch (error) {
      this.logger.error(
        'Failed to release distributed lock',
        error instanceof Error ? error.message : error,
      );
    }
  }

  /**
   * Convert a string to a stable number for use as PostgreSQL advisory lock ID.
   * Uses a simple hash function.
   */
  private hashStringToNumber(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    // Ensure positive number within PostgreSQL bigint range
    return Math.abs(hash);
  }
}
