const buckets = new Map();

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

function computeKey(req, keyBy) {
  const ip = getClientIp(req);
  if (!keyBy) {
    return ip;
  }

  const custom = keyBy(req);
  if (!custom) {
    return ip;
  }

  return `${ip}:${String(custom).trim().toLowerCase()}`;
}

export function createRateLimiter({
  windowMs,
  max,
  message = 'Too many requests. Please try again later.',
  keyBy,
}) {
  const configWindow = Number(windowMs) || 60_000;
  const configMax = Number(max) || 10;

  return (req, res, next) => {
    const now = Date.now();
    const routeKey = req.baseUrl + req.path;
    const clientKey = computeKey(req, keyBy);
    const bucketKey = `${routeKey}:${clientKey}`;

    const existing = buckets.get(bucketKey);

    if (!existing || now > existing.resetAt) {
      buckets.set(bucketKey, {
        count: 1,
        resetAt: now + configWindow,
      });
      return next();
    }

    if (existing.count >= configMax) {
      const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
      res.setHeader('Retry-After', String(retryAfterSeconds));
      return res.status(429).json({
        success: false,
        message,
        code: 'RATE_LIMITED',
        retryAfterSeconds,
      });
    }

    existing.count += 1;
    buckets.set(bucketKey, existing);

    if (buckets.size > 10_000) {
      for (const [key, value] of buckets.entries()) {
        if (value.resetAt <= now) {
          buckets.delete(key);
        }
      }
    }

    return next();
  };
}
