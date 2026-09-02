import { signalStore, withComputed } from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';
import { withCallState, withDataService } from '@ngrx-toolkit/core';
import { EventsDataService, EventFilter } from './events-data.service';
import { DevFestEvent } from '../models/event.model';

/**
 * Page-scoped store for EventList — provide via a component's `providers`
 * rather than root, so each place that uses it gets its own instance.
 * Built with ngrx-toolkit's withDataService: entity state, filter,
 * selection, and CRUD methods (load/create/update/delete) are generated
 * instead of hand-written.
 */
export const EventsEntityStore = signalStore(
  withCallState(),
  withEntities<DevFestEvent>(),
  withDataService({
    dataServiceType: EventsDataService,
    filter: { q: '' } as EventFilter,
  }),
  withComputed(({ entities }) => ({
    count: () => entities().length,
  })),
);
