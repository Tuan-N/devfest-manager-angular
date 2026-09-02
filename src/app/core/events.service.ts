import { Injectable, inject, Signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { DevFestEvent } from '../models/event.model';
import { API_URL } from './tokens';

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

      return `${this.apiUrl}/${eventId}`;
    });
  }

  createEvent(event: Omit<DevFestEvent, 'id'>): Observable<DevFestEvent> {
    return this.http
      .post<DevFestEvent>(this.apiUrl, event)
      .pipe(tap((event) => console.log('Event created:', event)));
  }
}
