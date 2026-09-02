import { Component, effect, inject, signal } from '@angular/core';
import { EventCard } from './event-card';
import { SearchBar } from './search-bar';
import { EventsEntityStore } from '../../core/events-entity.store';
import { EventsDataService } from '../../core/events-data.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { DevFestEvent } from '../../models/event.model';

@Component({
  selector: 'app-event-list',
  imports: [EventCard, SearchBar],
  // Page-scoped store: a fresh instance (and its entity/filter state) is
  // created when this component is instantiated and destroyed with it.
  providers: [EventsEntityStore, EventsDataService],
  template: `
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">Upcoming Events</h1>
      <!-- TODO Mod 1: Add SearchBar here -->
      <app-search-bar [(query)]="searchQuery" />

      <p class="text-gray-500 mt-2">Searching for: {{ searchQuery() }}</p>
    </div>

    <!-- 1. Error State -->
    @if (store.error()) {
      <div class="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
        Failed to load events. Is the server running?
      </div>
    }

    <!-- 2. Loading State -->
    @if (store.loading()) {
      <div class="text-center py-12 text-gray-500 animate-pulse">Loading events...</div>
    }

    <!-- 3. Data State -->
    @if (store.loaded()) {
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (event of store.entities(); track event.id) {
          <app-event-card
            [id]="event.id"
            [title]="event.title"
            [date]="event.date"
            [image]="event.image"
            (delete)="deleteEvent(event)"
            [trackingId]="'event_card_' + event.id"
          />
        } @empty {
          <p class="col-span-3 text-center text-gray-500">No events found.</p>
        }
      </div>
    }
  `,
})
export class EventList {
  protected readonly store = inject(EventsEntityStore);

  readonly searchQuery = signal('');
  private readonly debouncedQuery = toSignal(
    toObservable(this.searchQuery).pipe(debounceTime(300), distinctUntilChanged()),
    { initialValue: '' },
  );

  constructor() {
    // searchQuery -> debouncedQuery -> store filter -> reload, mirroring the
    // live connection httpResource used to give us automatically.
    effect(() => {
      const q = this.debouncedQuery();
      this.store.updateFilter({ q });
      // load() re-throws after recording the failure in store.error(); the
      // error is already reflected in state, so there's nothing more to do.
      this.store.load().catch(() => {});
    });
  }

  deleteEvent(event: DevFestEvent) {
    this.store.delete(event).catch(() => {});
  }
}
