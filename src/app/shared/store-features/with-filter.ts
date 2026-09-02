import { computed } from '@angular/core';
import {
  patchState,
  signalStoreFeature,
  type,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';

/**
 * Reusable signalStore feature that adds a multi-field `filter` object plus a
 * `filteredItems` computed to any store whose state has an `items: Entity[]` array.
 *
 * `setFilter` merges partial patches into the current filter, so callers can set
 * one field at a time (e.g. `setFilter({ keyword: 'foo' })` then later
 * `setFilter({ tenantId: 'asd' })`) and `predicate` sees the combined result.
 */
export function withFilter<Entity, Filter extends Record<string, unknown>>(
  initialFilter: Filter,
  predicate: (item: Entity, filter: Filter) => boolean,
) {
  return signalStoreFeature(
    { state: type<{ items: Entity[] }>() },
    withState({ filter: initialFilter }),
    withComputed(({ items, filter }) => ({
      filteredItems: computed(() => items().filter((item) => predicate(item, filter()))),
    })),
    withMethods((store) => ({
      setFilter(filter: Partial<Filter>): void {
        patchState(store, (state) => ({ filter: { ...state.filter, ...filter } }));
      },
      resetFilter(): void {
        patchState(store, { filter: initialFilter });
      },
    })),
  );
}
