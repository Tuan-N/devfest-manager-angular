import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { API_URL } from './core/tokens';
import { loadingInterceptor } from './core/loading.interceptor';
import { notifyInterceptor } from './core/notify.interceptor';
import { environment } from '../environments/environment';
import { IMAGE_LOADER, ImageLoaderConfig } from '@angular/common';
import {
  provideClientHydration,
  withEventReplay,
  withIncrementalHydration,
} from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),

    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),

    provideHttpClient(withInterceptors([loadingInterceptor, notifyInterceptor])),
    { provide: API_URL, useValue: environment.apiUrl },
    // {
    //   provide: IMAGE_LOADER,
    //   useValue: (config: ImageLoaderConfig) => {
    //     // remove /images/ from src
    //     const src = config.src.replace('/images/', '');
    //     return `https://static-assets.dev/cdn-cgi/image/width=${config.width},format=auto/https://storage.googleapis.com/images-cdn-e0395.firebasestorage.app/${src}`;
    //   },
    // },
    provideClientHydration(),
  ],
};
