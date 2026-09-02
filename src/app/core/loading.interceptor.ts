import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { GlobalLoadingStore } from './global-loading.store';

/**
 * Set on a request's `context` to opt it out of the global progress bar/overlay,
 * e.g. `http.get(url, { context: new HttpContext().set(SKIP_LOADING, true) })`.
 */
export const SKIP_LOADING = new HttpContextToken<boolean>(() => false);

/**
 * Tracks every outgoing HTTP request in GlobalLoadingStore, so the app-wide
 * progress bar/overlay works for free - no per-service wiring needed.
 */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_LOADING)) {
    return next(req);
  }

  const globalLoading = inject(GlobalLoadingStore);
  globalLoading.start();
  return next(req).pipe(finalize(() => globalLoading.stop()));
};
