import { InjectionToken, inject } from '@angular/core';

// 1. The Base URL Token
// This allows us to switch environments (dev/prod) easily.
export const API_URL = new InjectionToken<string>('API_URL');

export const TICKETS_URL = new InjectionToken<string>('TICKETS_URL', {
  providedIn: 'root',
  factory: () => {
    const api = inject(API_URL);
    return `${api}/tickets`;
  },
});
