import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GroupFormationService } from './group-formation.service';

/**
 * Scheduler that triggers group formation on a regular interval.
 * Runs every minute to check for trips departing soon and form groups.
 */
@Injectable()
export class GroupFormationScheduler {
  private readonly logger = new Logger(GroupFormationScheduler.name);
  private isRunning = false;

  constructor(private readonly groupFormationService: GroupFormationService) {}

  /**
   * Cron job that runs every minute to form groups for departing trips.
   * Uses a lock to prevent overlapping executions.
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron(): Promise<void> {
    // Prevent overlapping runs
    if (this.isRunning) {
      this.logger.debug(
        'Group formation job already running, skipping this cycle',
      );
      return;
    }

    this.isRunning = true;
    this.logger.log('Starting scheduled group formation job');

    try {
      const result = await this.groupFormationService.formGroups();

      if (result.tripsProcessed > 0) {
        this.logger.log(
          `Scheduled job completed: processed ${result.tripsProcessed} trips, ` +
            `formed ${result.totalGroupsFormed} groups, ` +
            `grouped ${result.totalUsersGrouped} users`,
        );
      } else {
        this.logger.debug('Scheduled job completed: no trips to process');
      }
    } catch (error) {
      this.logger.error('Scheduled group formation job failed', error);
    } finally {
      this.isRunning = false;
    }
  }
}
