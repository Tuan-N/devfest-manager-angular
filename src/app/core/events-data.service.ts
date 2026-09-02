import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { DataService } from '@ngrx-toolkit/core';
import { DevFestEvent } from '../models/event.model';
import { API_URL } from './tokens';

export interface EventFilter extends Record<string, unknown> {
  q: string;
}

/**
 * Adapts EventsService's HTTP calls to the Promise-based `DataService`
 * contract that `withDataService` (ngrx-toolkit) expects. Not root-provided —
 * intended to be provided alongside EventsEntityStore wherever it's used.
 */
@Injectable()
export class EventsDataService implements DataService<DevFestEvent, EventFilter> {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${inject(API_URL)}/events`;

  load(filter: EventFilter): Promise<DevFestEvent[]> {
    const url = filter.q ? `${this.apiUrl}?q=${filter.q}` : this.apiUrl;
    return firstValueFrom(this.http.get<DevFestEvent[]>(url));
  }

  loadById(id: string): Promise<DevFestEvent> {
    return firstValueFrom(this.http.get<DevFestEvent>(`${this.apiUrl}/${id}`));
  }

  create(entity: DevFestEvent): Promise<DevFestEvent> {
    return firstValueFrom(this.http.post<DevFestEvent>(this.apiUrl, entity));
  }

  update(entity: DevFestEvent): Promise<DevFestEvent> {
    return firstValueFrom(this.http.put<DevFestEvent>(`${this.apiUrl}/${entity.id}`, entity));
  }

  updateAll(entities: DevFestEvent[]): Promise<DevFestEvent[]> {
    return Promise.all(entities.map((entity) => this.update(entity)));
  }

  async delete(entity: DevFestEvent): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${entity.id}`));
  }
}
