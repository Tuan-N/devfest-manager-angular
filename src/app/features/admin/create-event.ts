import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { form, FormField, required, minLength, disabled, debounce } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { EventsEntityStore } from '../../core/events-entity.store';
import { EventsDataService } from '../../core/events-data.service';
import { DevFestEvent } from '../../models/event.model';

interface CreateEventForm extends Omit<DevFestEvent, 'id'> {}

@Component({
  selector: 'app-create-event',
  imports: [FormField],
  // Page-scoped store: a fresh instance is created for this component and
  // destroyed with it, mirroring EventList's usage of EventsEntityStore.
  providers: [EventsEntityStore, EventsDataService],
  template: `
    <div class="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
      <h2 class="text-2xl font-bold mb-6 text-gray-800">Create New Event</h2>

      <form (submit)="onSubmit($event)" class="space-y-6">
        <!-- Title -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Event Title</label>

          <!-- BINDING: Use [formField] pointing to the form tree property -->
          <input
            [formField]="form.title"
            type="text"
            class="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g. Angular Workshop"
          />

          <!-- ERROR HANDLING: Check touched() AND invalid() signals -->
          @if (form.title().touched() && form.title().invalid()) {
            <p class="text-red-500 text-sm mt-1">{{ form.title().errors()[0].message }}</p>
          }
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            [formField]="form.description"
            rows="3"
            class="w-full px-4 py-2 border rounded-md outline-none"
          ></textarea>

          @if (form.description().touched() && form.description().invalid()) {
            <p class="text-red-500 text-sm mt-1">{{ form.description().errors()[0].message }}</p>
          }
        </div>

        <!-- Date & Location -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label>Date</label>
            <input
              [formField]="form.date"
              type="datetime-local"
              class="w-full px-4 py-2 border rounded-md"
            />
          </div>
          <div>
            <label>Location</label>
            <input
              [formField]="form.location"
              type="text"
              class="w-full px-4 py-2 border rounded-md"
            />
          </div>
        </div>

        <div class="border-t border-gray-100 pt-4">
          <div class="flex justify-between items-center mb-2">
            <label class="block text-sm font-medium text-gray-700">Speakers</label>
            <button
              type="button"
              (click)="addSpeaker()"
              class="text-sm text-blue-600 hover:underline"
            >
              + Add Speaker
            </button>
          </div>

          <div class="space-y-2">
            <!-- Iterate over the SOURCE data to get the index -->
            @for (speaker of eventData().speakers; track $index) {
              <div class="flex gap-2">
                <!-- Bind to form.speakers[index] -->
                <input
                  [formField]="form.speakers[$index]"
                  type="text"
                  placeholder="Speaker Name"
                  class="flex-1 px-4 py-2 border rounded-md"
                />

                <button type="button" (click)="removeSpeaker($index)" class="text-red-500 px-2">
                  ✕
                </button>
              </div>
            }
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-4 pt-4">
          <button type="button" class="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>

          <!-- Form-Level Validity: form().invalid() -->
          <button
            type="submit"
            [disabled]="form().invalid()"
            class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Create Event
          </button>
        </div>
      </form>
    </div>
  `,
})
export class CreateEvent {
  private readonly eventsStore = inject(EventsEntityStore);
  private readonly router = inject(Router);

  // 2. The Source of Truth
  // This writable signal holds the data.
  // We initialize it with empty/default values.
  readonly eventData = signal<CreateEventForm>({
    title: '',
    description: '',
    date: new Date().toISOString().slice(0, 16), // Default to now
    location: '',
    speakers: [],
    image: '/images/event4.png',
  });

  // 3. Create Form & Validation Schema
  readonly form = form(this.eventData, (root) => {
    // Title Rules
    required(root.title, { message: 'Title is required' });

    // Description Rules
    // A. Debounce: Wait 1000ms after typing stops before updating the model
    debounce(root.description, 1000);

    // B. Conditional Disable: Disable description if Title is empty
    // valueOf() lets us look up the current value of other fields
    disabled(root.description, ({ valueOf }) => !valueOf(root.title));

    // C. Validation
    required(root.description, { message: 'Description is required' });
    minLength(root.description, 10, { message: 'Description must be at least 10 chars' });

    // Other Rules
    required(root.date, { message: 'Date is required' });
    required(root.location, { message: 'Location is required' });
  });

  addSpeaker() {
    // Update the source signal. The form automatically detects the new item.
    this.eventData.update((current) => ({
      ...current,
      speakers: [...current.speakers, ''],
    }));
  }

  removeSpeaker(index: number) {
    this.eventData.update((current) => ({
      ...current,
      speakers: current.speakers.filter((_, i) => i !== index),
    }));
  }

  async onSubmit(event: SubmitEvent) {
    // Prevent default form submission
    event.preventDefault();
    // 1. Check form-level validity signal
    if (this.form().invalid()) return;

    // 2. Read the Source Signal directly
    const payload = this.eventData();

    // 3. Send to the store; the server assigns the id.
    try {
      await this.eventsStore.create(payload as unknown as DevFestEvent);
      alert('Event Created!');
      this.router.navigate(['/']);
    } catch (err) {
      console.error(err);
    }
  }
}
