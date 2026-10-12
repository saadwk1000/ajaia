export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("X-Ajaia-Request", "1");
  if (options.body && !(options.body instanceof FormData))
    headers.set("Content-Type", "application/json");
  let response: Response;
  try {
    response = await fetch(`/api/v1${path}`, {
      ...options,
      headers,
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError")
      throw error;
    throw new ApiError("Unable to reach the service. Please try again.", 0);
  }
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      data && typeof data === "object" && "message" in data
        ? data.message
        : "Request failed. Please try again.";
    const error = new ApiError(
      Array.isArray(message) ? message.join(". ") : String(message),
      response.status,
    );
    if (response.status === 401 && !path.startsWith("/auth/"))
      window.dispatchEvent(new Event("ajaia:session-expired"));
    throw error;
  }
  if (data === null && response.status !== 204)
    throw new ApiError("The service returned an invalid response.", 502);
  return data as T;
}
export const json = (value: unknown) => JSON.stringify(value);
export const errorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
