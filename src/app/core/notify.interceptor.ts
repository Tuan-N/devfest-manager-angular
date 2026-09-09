import {
  HttpContextToken,
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, map, throwError } from 'rxjs';
import { isApiEnvelope } from './api-envelope';
import { GlobalLoadingStore } from './global-loading.store';

/**
 * Set on a request's `context` to opt it out of the global error toast, e.g. when
 * a component already renders its own inline error state for that request -
 * `http.get(url, { context: new HttpContext().set(SKIP_NOTIFY, true) })`.
 * This only silences the toast - a failing `code` still rejects the request.
 */
export const SKIP_NOTIFY = new HttpContextToken<boolean>(() => false);

/**
 * Every response body arrives as `{ code, data }`. This interceptor is the one
 * place that knows about that envelope: a non-'Success' code is turned into an
 * HttpErrorResponse (so it flows through the same error path as a real HTTP
 * failure), and a successful body is unwrapped to just `data`. Services and
 * httpResource() calls elsewhere in the app see plain entity types and never
 * handle the envelope themselves.
 *
 * Surfaces every failing request as a toast via GlobalLoadingStore, so
 * failures get user-visible feedback for free - no per-service error handling
 * needed unless a component wants its own inline error UI instead (SKIP_NOTIFY).
 */
export const notifyInterceptor: HttpInterceptorFn = (req, next) => {
  const skipToast = req.context.get(SKIP_NOTIFY);
  const globalLoading = inject(GlobalLoadingStore);

  return next(req).pipe(
    map((event) => {
      if (!(event instanceof HttpResponse) || !isApiEnvelope(event.body)) {
        return event;
      }
      if (event.body.code !== 'Success') {
        throw new HttpErrorResponse({
          error: event.body,
          status: event.status,
          url: event.url ?? undefined,
        });
      }
      return event.clone({ body: event.body.data });
    }),
    catchError((err: HttpErrorResponse) => {
      if (!skipToast) {
        const message =
          typeof err.error?.message === 'string' && err.error.message.length > 0
            ? err.error.message
            : typeof err.error?.code === 'string'
              ? `API error: ${err.error.code}`
              : `Request failed: ${req.method} ${req.url}`;
        globalLoading.error(message);
      }
      return throwError(() => err);
    }),
  );
};
