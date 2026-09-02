import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

/**
 * App-wide loading indicator (e.g. a top progress bar). Uses a counter instead of a
 * boolean so overlapping requests from different feature stores don't clobber each
 * other - `isLoading` stays true until every `start()` has a matching `stop()`.
 */
export const GlobalLoadingStore = signalStore(
  { providedIn: 'root' },
  withState({ pendingCount: 0 }),
  withComputed(({ pendingCount }) => ({
    isLoading: computed(() => pendingCount() > 0),
  })),
  withMethods((store) => ({
    start(): void {
      patchState(store, (state) => ({ pendingCount: state.pendingCount + 1 }));
    },
    stop(): void {
      patchState(store, (state) => ({ pendingCount: Math.max(0, state.pendingCount - 1) }));
    },
  })),
);
