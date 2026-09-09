/**
 * Every backend response is wrapped in one of two shapes:
 * - success: `{ code: 'Success', data: T }`
 * - failure: `{ code: <error code>, message: string }` - no `data`.
 *
 * `notifyInterceptor` unwraps this centrally, so the rest of the app works with
 * plain entity types and never sees the envelope.
 */
export interface ApiEnvelope<T> {
  code: string;
  data?: T;
  message?: string;
}

export function isApiEnvelope(body: unknown): body is ApiEnvelope<unknown> {
  return (
    typeof body === 'object' && body !== null && typeof (body as { code?: unknown }).code === 'string'
  );
}
