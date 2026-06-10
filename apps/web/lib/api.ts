import {
  clearStoredSession,
  getAccessToken,
  getStoredSession,
  storeSession,
  type AuthSession,
} from './auth';

const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api').replace(
  /\/$/,
  '',
);

type ApiFetchOptions = RequestInit & {
  auth?: boolean;
  retryOnUnauthorized?: boolean;
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export async function apiFetch<TResponse>(
  path: string,
  { auth = true, retryOnUnauthorized = true, headers, ...options }: ApiFetchOptions = {},
): Promise<TResponse> {
  const requestHeaders = new Headers(headers);

  if (!requestHeaders.has('Content-Type') && options.body) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  if (auth) {
    const accessToken = getAccessToken();

    if (accessToken) {
      requestHeaders.set('Authorization', `Bearer ${accessToken}`);
    }
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: requestHeaders,
  });

  if (response.status === 401 && auth && retryOnUnauthorized) {
    const refreshed = await refreshSession();

    if (refreshed) {
      return apiFetch<TResponse>(path, {
        ...options,
        auth,
        headers,
        retryOnUnauthorized: false,
      });
    }
  }

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return response.json() as Promise<TResponse>;
}

export async function login(email: string, password: string) {
  const session = await apiFetch<AuthSession>('/auth/login', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ email, password }),
  });

  storeSession(session);
  return session;
}

export async function logout() {
  const refreshToken = getStoredSession()?.tokens.refreshToken;

  if (!refreshToken) {
    clearStoredSession();
    return;
  }

  try {
    await apiFetch<{ success: boolean }>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
      retryOnUnauthorized: false,
    });
  } finally {
    clearStoredSession();
  }
}

async function refreshSession() {
  const session = getStoredSession();

  if (!session?.tokens.refreshToken) {
    clearStoredSession();
    return null;
  }

  try {
    const refreshedSession = await apiFetch<AuthSession>('/auth/refresh', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ refreshToken: session.tokens.refreshToken }),
    });

    storeSession(refreshedSession);
    return refreshedSession;
  } catch {
    clearStoredSession();
    return null;
  }
}

async function readErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as { message?: string | string[]; error?: string };
    const message = Array.isArray(payload.message) ? payload.message.join(', ') : payload.message;

    return message ?? payload.error ?? `Erro HTTP ${response.status}`;
  } catch {
    return `Erro HTTP ${response.status}`;
  }
}
