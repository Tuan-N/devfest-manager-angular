import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { GlobalLoadingStore } from '../core/global-loading.store';

@Component({
  selector: 'app-notify-toast',
  template: `
    <div
      class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm"
      role="region"
      aria-label="Notifications"
    >
      @for (n of loading.notifications(); track n.id) {
        <div
          class="flex items-start gap-3 rounded-lg shadow-lg p-4 text-sm text-white"
          [class.bg-red-600]="n.type === 'error'"
          [class.bg-green-600]="n.type === 'success'"
          role="alert"
        >
          <span class="flex-grow">{{ n.message }}</span>
          <button
            type="button"
            (click)="loading.dismiss(n.id)"
            class="shrink-0 opacity-80 hover:opacity-100 cursor-pointer"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      }
    </div>
  `,
})
export class NotifyToast {
  protected readonly loading = inject(GlobalLoadingStore);
}
