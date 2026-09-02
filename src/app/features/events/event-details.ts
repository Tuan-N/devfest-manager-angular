import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { EventsService } from '../../core/events.service';
import { CommonModule, DatePipe, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/cart.service';

@Component({
  selector: 'app-event-details',
  imports: [CommonModule, RouterLink, DatePipe, NgOptimizedImage],
  template: `
    <div class="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto min-h-[600px]">
      <!-- Back Button -->
      <a routerLink="/" class="text-blue-600 hover:underline mb-6 inline-block">
        ← Back to Events
      </a>

      <!-- Loading State -->
      @if (eventResource.isLoading()) {
        <div class="animate-pulse h-64 bg-gray-100 rounded-lg"></div>
      }

      <!-- Error State -->
      @if (eventResource.error()) {
        <div class="text-red-600 p-4 bg-red-50 rounded">Event not found.</div>
      }

      <!-- Success State -->
      <!-- Always check hasValue() before accessing value() -->
      @if (eventResource.hasValue()) {
        @let event = eventResource.value()!;

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Left: Content -->
          <div class="md:col-span-2 space-y-4">
            <h1 class="text-4xl font-bold text-gray-900">{{ event.title }}</h1>
            <p class="text-gray-500 text-lg">
              {{ event.date | date: 'fullDate' }} • {{ event.location }}
            </p>
            <p class="text-gray-700 leading-relaxed text-lg">{{ event.description }}</p>

            <!-- large spacer that pushes the map below the fold (deferred). -->
            <div class="h-96 p-12">
              <p>Check the venue details below</p>
            </div>
            <div class="bg-gray-50 p-6 rounded-xl h-fit border border-gray-100">
              <!--
                @defer (hydrate on viewport)
                SSR Behavior: The SERVER renders the @placeholder content (or the main content if compatible).
                Hydration Behavior: The browser downloads the JS for this block ONLY when it enters the viewport.
                provideClientHydration(withIncrementalHydration())
                -->
              @defer (hydrate on viewport) {
                <div class="h-140 bg-gray-200 rounded mb-4 overflow-hidden relative">
                  <img
                    [ngSrc]="'/images/venue-map.png'"
                    width="500"
                    height="600"
                    class="w-full h-full object-cover"
                  />
                </div>
              } @placeholder {
                <!-- Rendered instantly on Server, visible immediately -->
                <div
                  class="h-140 bg-gray-100 rounded mb-4 flex items-center justify-center border-2 border-dashed border-gray-300"
                >
                  <span class="text-gray-400">Map Loading...</span>
                </div>
              }
            </div>
          </div>

          <!-- Right: Actions -->
          <div class="bg-gray-50 p-6 rounded-xl h-fit border border-gray-100">
            <div class="h-48 bg-gray-200 rounded mb-4 overflow-hidden">
              <!-- We will optimize this image in Day 2 -->
              <img
                [ngSrc]="event.image"
                width="220"
                height="220"
                priority
                class="w-full h-full object-cover"
              />
            </div>

            @defer (hydrate on interaction) {
              <button
                (click)="addToCart()"
                class="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 shadow-lg transition"
              >
                Buy Tickets
              </button>
            } @placeholder {
              <button
                class="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 shadow-lg transition"
              >
                Buy Tickets
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class EventDetails {
  private readonly eventsService = inject(EventsService);
  private readonly cartService = inject(CartService);

  readonly id = input.required<string>();

  readonly eventResource = this.eventsService.getEventResource(this.id);

  addToCart() {
    this.cartService.addTicket(this.id());
  }
}
