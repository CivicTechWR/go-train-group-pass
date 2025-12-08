import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { wrap } from '@mikro-orm/core';
import { Trip, Itinerary } from '../entities';
import { GroupFormationService } from './group-formation.service';

/**
 * Configuration for group formation timing
 */
const FORMATION_LEAD_TIME_MINUTES = 15;

/**
 * Scheduler that triggers group formation at the right time.
 *
 * Instead of polling every minute, this schedules one-time jobs
 * based on trip departure times when itineraries are created.
 *
 * Simplified for MVP - runs in single instance without distributed locking.
 */
@Injectable()
export class GroupFormationScheduler {
  private readonly logger = new Logger(GroupFormationScheduler.name);

  // Track scheduled jobs to avoid duplicates
  private scheduledTrips = new Set<string>();

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly groupFormationService: GroupFormationService,
    @InjectRepository(Trip)
    private readonly tripRepository: EntityRepository<Trip>,
    @InjectRepository(Itinerary)
    private readonly itineraryRepository: EntityRepository<Itinerary>,
  ) {}

  /**
   * Schedule group formation for an itinerary.
   * Called when an itinerary is created or a user checks in.
   *
   * Schedules a one-time job for (departureTime - FORMATION_LEAD_TIME_MINUTES).
   */
  async scheduleForItinerary(itineraryId: string): Promise<void> {
    const itinerary = await this.itineraryRepository.findOne(
      { id: itineraryId },
      {
        populate: [
          'tripBookings',
          'tripBookings.trip',
          'tripBookings.trip.originStopTime',
          'tripBookings.trip.gtfsTrip',
        ],
      },
    );

    if (!itinerary) {
      this.logger.warn(`Itinerary ${itineraryId} not found`);
      return;
    }

    // Schedule for each trip in the itinerary
    for (const booking of itinerary.tripBookings.getItems()) {
      await this.scheduleForTrip(booking.trip);
    }
  }

  /**
   * Schedule group formation for a specific trip.
   */
  async scheduleForTrip(trip: Trip): Promise<void> {
    const jobName = `group-formation-${trip.id}`;

    // Skip if already scheduled
    if (this.scheduledTrips.has(trip.id)) {
      this.logger.debug(`Trip ${trip.id} already scheduled`);
      return;
    }

    // Get departure time from trip
    const departureTime = this.getTripDepartureTime(trip);
    if (!departureTime) {
      this.logger.warn(`Trip ${trip.id} has no valid departure time`);
      return;
    }

    // Calculate when to run (departureTime - lead time)
    const formationTime = new Date(
      departureTime.getTime() - FORMATION_LEAD_TIME_MINUTES * 60 * 1000,
    );
    const now = new Date();

    // If formation time has passed, run immediately
    if (formationTime <= now) {
      this.logger.log(`Trip ${trip.id}: Formation time passed, running now`);
      await this.runGroupFormation(trip.id);
      return;
    }

    // Schedule for the future
    const delayMs = formationTime.getTime() - now.getTime();

    const timeout = setTimeout(() => {
      void this.runGroupFormation(trip.id);
    }, delayMs);

    // Register with NestJS scheduler registry
    this.schedulerRegistry.addTimeout(jobName, timeout);
    this.scheduledTrips.add(trip.id);

    this.logger.log(
      `Scheduled group formation for trip ${trip.id} at ${formationTime.toISOString()} ` +
        `(in ${Math.round(delayMs / 60000)} minutes)`,
    );
  }

  /**
   * Get the departure time as a Date for a trip.
   * Combines the trip date (from serviceId) with departure time (from originStopTime).
   */
  private getTripDepartureTime(trip: Trip): Date | null {
    // Ensure originStopTime is loaded
    if (!wrap(trip.originStopTime).isInitialized()) {
      this.logger.debug(`Trip ${trip.id}: originStopTime not loaded`);
      return null;
    }

    // Get the trip date
    const tripDate = trip.date;
    if (!tripDate) {
      this.logger.debug(`Trip ${trip.id}: no date available`);
      return null;
    }

    // Parse GTFS time (HH:MM:SS)
    const timeStr = trip.originStopTime.departureTime;
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);

    // Create departure date
    const departureDate = new Date(tripDate);
    departureDate.setHours(hours, minutes, seconds, 0);

    return departureDate;
  }

  /**
   * Cancel scheduled group formation for a trip.
   */
  cancelForTrip(tripId: string): void {
    const jobName = `group-formation-${tripId}`;

    if (this.schedulerRegistry.doesExist('timeout', jobName)) {
      this.schedulerRegistry.deleteTimeout(jobName);
      this.scheduledTrips.delete(tripId);
      this.logger.log(`Cancelled group formation for trip ${tripId}`);
    }
  }

  /**
   * Run group formation for a trip.
   */
  private async runGroupFormation(tripId: string): Promise<void> {
    try {
      this.logger.log(`Running group formation for trip ${tripId}`);

      const trip = await this.tripRepository.findOne({ id: tripId });
      if (!trip) {
        this.logger.error(`Trip ${tripId} not found`);
        return;
      }

      const result = await this.groupFormationService.formGroupsForTrip(trip);

      this.logger.log(
        `Group formation complete for trip ${tripId}: ` +
          `${result.groupsFormed} groups, ${result.usersGrouped} users grouped`,
      );
    } catch (error) {
      this.logger.error(
        `Group formation failed for trip ${tripId}`,
        error instanceof Error ? error.stack : error,
      );
    } finally {
      // Clean up
      this.scheduledTrips.delete(tripId);
    }
  }

  /**
   * Get list of currently scheduled trips.
   */
  getScheduledTrips(): string[] {
    return Array.from(this.scheduledTrips);
  }
}
