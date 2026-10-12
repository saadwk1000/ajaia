function integerSetting(
  value: unknown,
  fallback: number,
  name: string,
  min: number,
  max: number,
) {
  const result = value === undefined || value === '' ? fallback : Number(value);
  if (!Number.isInteger(result) || result < min || result > max)
    throw new Error(`${name} must be an integer between ${min} and ${max}`);
  return result;
}
function frontendOrigin(value: string, requireHttps: boolean) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('Frontend origins must be complete HTTP(S) URLs');
  }
  if (url.origin !== value || !['https:', 'http:'].includes(url.protocol))
    throw new Error(
      'Frontend origins must be exact origins without paths or trailing slashes',
    );
  if (
    requireHttps &&
    (url.protocol !== 'https:' ||
      ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) ||
      url.hostname.endsWith('.localhost'))
  )
    throw new Error('Hosted frontend origins must use a public HTTPS URL');
  return url.origin;
}
export function validateEnvironment(env: Record<string, unknown>) {
  if (
    typeof env.DATABASE_URL !== 'string' ||
    !/^postgres(ql)?:\/\//.test(env.DATABASE_URL)
  )
    throw new Error('DATABASE_URL must be a PostgreSQL connection URL');
  const hosted =
    env.VERCEL === '1' ||
    ['production', 'preview'].includes(String(env.VERCEL_ENV));
  const secure = env.NODE_ENV === 'production' || hosted;
  const configured =
    typeof env.FRONTEND_ORIGIN === 'string' ? env.FRONTEND_ORIGIN.trim() : '';
  if (!configured && secure)
    throw new Error(
      'FRONTEND_ORIGIN is required: set the actual frontend HTTPS origin in the API project environment',
    );
  const origin = frontendOrigin(configured || 'http://localhost:3000', secure);
  const additional =
    typeof env.ADDITIONAL_FRONTEND_ORIGINS === 'string'
      ? env.ADDITIONAL_FRONTEND_ORIGINS.split(',')
          .map((value) => value.trim())
          .filter(Boolean)
      : [];
  const allowedOrigins = [
    ...new Set([
      origin,
      ...additional.map((value) => frontendOrigin(value, secure)),
    ]),
  ];
  return {
    ...env,
    FRONTEND_ORIGIN: origin,
    ALLOWED_FRONTEND_ORIGINS: allowedOrigins,
    SESSION_COOKIE_SECURE: secure,
    PORT: integerSetting(env.PORT, 4000, 'PORT', 1, 65535),
    TRUST_PROXY: integerSetting(
      env.TRUST_PROXY,
      hosted ? 1 : 0,
      'TRUST_PROXY',
      0,
      1,
    ),
    DB_POOL_MAX: integerSetting(env.DB_POOL_MAX, 5, 'DB_POOL_MAX', 1, 20),
    DB_CONNECT_TIMEOUT_MS: integerSetting(
      env.DB_CONNECT_TIMEOUT_MS,
      10000,
      'DB_CONNECT_TIMEOUT_MS',
      1000,
      60000,
    ),
  };
}
