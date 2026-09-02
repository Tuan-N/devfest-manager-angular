import { Injectable, inject, Signal } from '@angular/core';
import { HttpClient, HttpContext, httpResource } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { DevFestEvent } from '../models/event.model';
import { API_URL } from './tokens';
import { SKIP_NOTIFY } from './notify.interceptor';

@Injectable({
  providedIn: 'root',
})
export class EventsService {
  private http = inject(HttpClient);
  // Construct the events API URL
  private apiUrl = `${inject(API_URL)}/events`;

  getEventResource(id: Signal<string>) {
    return httpResource<DevFestEvent>(() => {
      const eventId = id();
      // If no ID (or routing transition), don't fetch yet
      if (!eventId) return undefined;

      return {
        url: `${this.apiUrl}/${eventId}`,
        // EventDetails already renders its own "Event not found" error state.
        context: new HttpContext().set(SKIP_NOTIFY, true),
      };
    });
  }

  createEvent(event: Omit<DevFestEvent, 'id'>): Observable<DevFestEvent> {
    return this.http
      .post<DevFestEvent>(this.apiUrl, event)
      .pipe(tap((event) => console.log('Event created:', event)));
  }
}
