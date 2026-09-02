import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

export type NotificationType = 'error' | 'success';

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
}

interface GlobalLoadingState {
  pendingCount: number;
  notifications: Notification[];
}

/**
 * App-wide UI state: the loading indicator (e.g. a top progress bar) and toast
 * notifications. Loading uses a counter instead of a boolean so overlapping
 * requests from different feature stores don't clobber each other - `isLoading`
 * stays true until every `start()` has a matching `stop()`.
 */
export const GlobalLoadingStore = signalStore(
  { providedIn: 'root' },
  withState<GlobalLoadingState>({ pendingCount: 0, notifications: [] }),
  withComputed(({ pendingCount }) => ({
    isLoading: computed(() => pendingCount() > 0),
  })),
  withMethods((store) => {
    let nextNotificationId = 0;

    const dismiss = (id: number): void => {
      patchState(store, (state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    };

    const notify = (type: NotificationType, message: string, duration = 5000): void => {
      const id = nextNotificationId++;
      patchState(store, (state) => ({
        notifications: [...state.notifications, { id, type, message }],
      }));
      setTimeout(() => dismiss(id), duration);
    };

    return {
      start(): void {
        patchState(store, (state) => ({ pendingCount: state.pendingCount + 1 }));
      },
      stop(): void {
        patchState(store, (state) => ({ pendingCount: Math.max(0, state.pendingCount - 1) }));
      },
      error(message: string): void {
        notify('error', message);
      },
      success(message: string): void {
        notify('success', message);
      },
      dismiss,
    };
  }),
);
