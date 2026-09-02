import { computed } from '@angular/core';
import { patchState, signalStoreFeature, withComputed, withMethods, withState } from '@ngrx/signals';

export interface LoadingState {
  loading: Record<string, boolean>;
}

/**
 * Reusable signalStore feature that tracks loading per method/key, so multiple
 * API calls on the same store (e.g. `load` and `save`) can show independent spinners.
 */
export function withLoading() {
  return signalStoreFeature(
    withState<LoadingState>({ loading: {} }),
    withComputed(({ loading }) => ({
      isLoading: computed(() => Object.values(loading()).some(Boolean)),
    })),
    withMethods((store) => ({
      isLoadingFor(key: string) {
        return computed(() => !!store.loading()[key]);
      },
    })),
  );
}

// Helpers for state updates - pass a key identifying which method/request is in flight.
export function setLoading(key: string) {
  return (state: LoadingState): Partial<LoadingState> => ({
    loading: { ...state.loading, [key]: true },
  });
}

export function setLoaded(key: string) {
  return (state: LoadingState): Partial<LoadingState> => ({
    loading: { ...state.loading, [key]: false },
  });
}
