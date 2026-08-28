import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { TICKETS_URL } from './tokens';

interface TicketEntry {
  id: string;
  eventId: string;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly ticketsURL = inject(TICKETS_URL);

  private readonly ticketIds = signal<string[]>([]);

  readonly count = computed(() => this.ticketIds().length);

  constructor() {
    this.loadTickets();
  }

  private loadTickets(): void {
    this.http.get<TicketEntry[]>(this.ticketsURL).subscribe({
      next: (data) => {
        const ids = data.map((t) => t.eventId);
        this.ticketIds.set(ids);
      },
      error: (err) => console.error('Failed to load cart', err),
    });
  }

  addTicket(eventId: string) {
    const prevIds = this.ticketIds();

    this.ticketIds.update((ids) => [...ids, eventId]);
    this.http.post(this.ticketsURL, { eventId }).subscribe({
      next: () => {
        console.log('Optimistic update was successful');
      },
      error: (err) => {
        console.log('Sync Failed ', err);
        this.ticketIds.set(prevIds);
      },
    });
  }
}
