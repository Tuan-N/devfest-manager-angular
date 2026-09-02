import {
  Component,
  Injector,
  afterNextRender,
  effect,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { GlobalLoadingStore } from '../core/global-loading.store';

@Component({
  selector: 'app-loading-indicator',
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    @if (visible()) {
      <div class="fixed inset-x-0 top-0 z-50 h-1 overflow-hidden bg-blue-100" aria-hidden="true">
        <div
          class="h-full bg-blue-600 transition-[width] ease-out"
          [style.width.%]="progress()"
          [style.transition-duration]="progress() === 100 ? '200ms' : '8s'"
        ></div>
      </div>
      <div class="fixed inset-0 z-40 cursor-wait bg-black/5"></div>
      <span class="sr-only" role="status">Loading…</span>
    }
  `,
})
export class LoadingIndicator {
  private readonly loading = inject(GlobalLoadingStore);
  private readonly injector = inject(Injector);

  // A real download-progress percentage isn't available for arbitrary API calls, so
  // this fakes one the way NProgress/YouTube-style bars do: jump to a small head
  // start, then slowly ease toward 90% for as long as the request is in flight, and
  // snap to 100% the instant it completes.
  protected readonly visible = signal(false);
  protected readonly progress = signal(0);

  constructor() {
    effect(() => {
      if (this.loading.isLoading()) {
        this.visible.set(true);
        this.progress.set(8);
        // The width must actually paint at 8% before jumping to 90%, otherwise the
        // browser coalesces both writes into one frame and the transition never runs.
        // afterNextRender gates this to the client only (this branch can also run
        // during SSR, where requestAnimationFrame doesn't exist); the nested rAFs
        // inside it are what guarantee an intervening real paint on the client -
        // afterNextRender's own callback ordering isn't guaranteed to span a frame.
        afterNextRender(
          () => requestAnimationFrame(() => requestAnimationFrame(() => this.progress.set(90))),
          { injector: this.injector },
        );
      } else if (this.visible()) {
        this.progress.set(100);
        setTimeout(() => {
          this.visible.set(false);
          this.progress.set(0);
        }, 250);
      }
    });
  }
}
