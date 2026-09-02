import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { GlobalLoadingStore } from './global-loading.store';

/**
 * Set on a request's `context` to opt it out of the global error toast, e.g. when
 * a component already renders its own inline error state for that request -
 * `http.get(url, { context: new HttpContext().set(SKIP_NOTIFY, true) })`.
 */
export const SKIP_NOTIFY = new HttpContextToken<boolean>(() => false);

/**
 * Surfaces every failing HTTP request as a toast via GlobalLoadingStore, so
 * failures get user-visible feedback for free - no per-service error handling
 * needed unless a component wants its own inline error UI instead (SKIP_NOTIFY).
 */
export const notifyInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_NOTIFY)) {
    return next(req);
  }

  const globalLoading = inject(GlobalLoadingStore);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const message =
        typeof err.error?.message === 'string'
          ? err.error.message
          : `Request failed: ${req.method} ${req.url}`;
      globalLoading.error(message);
      return throwError(() => err);
    }),
  );
};
