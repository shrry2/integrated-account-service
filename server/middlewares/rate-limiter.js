const redis = require('redis');
const { RateLimiterMemory, RateLimiterRedis } = require('rate-limiter-flexible');
const Boom = require('@hapi/boom');

const { IS_PROD } = require('../constants');

// TODO: Check when integrate with production environment

if (!process.env.REDIS_HOST || !process.env.REDIS_PORT) {
  throw new Error('rateLimiter: Redis connection info (REDIS_HOST/REDIS_PORT) is not defined');
}

// default redis connection info
let redisHost = 'localhost';
let redisPort = 6379;
let db = 0;

// load from environment variables in production environment
if (IS_PROD) {
  redisHost = process.env.REDIS_HOST;
  redisPort = process.env.REDIS_PORT;
  db = process.env.REDIS_DB_INDEX_RATE_LIMITER;
}

// setup insurance limiter
const rateLimiterMemory = new RateLimiterMemory({
  points: 60, // 300 / 5 if there are 5 processes at all
  duration: 60,
});

// setup main limiter with redis
const redisClient = redis.createClient({
  host: redisHost,
  port: redisPort,
  enable_offline_queue: false,
  db,
});

exports.createLimiter = (opts) => {
  const options = {
    ...opts,
    storeClient: redisClient,
    inmemoryBlockOnConsumed: 301, // If requests exceed 300 times per minute
    inmemoryBlockDuration: 120, // Block it for 2 minutes in memory, so no requests go to Redis
    insuranceLimiter: rateLimiterMemory,
  };
  return new RateLimiterRedis(options);
};

exports.createMiddleware = (limiter) => (req, res, next) => {
  const key = req.ip; // TODO: Implement user id

  limiter.consume(key)
    .then(() => {
      next();
    })
    .catch((rejRes) => {
      if (rejRes instanceof Error) {
        // Some Redis error
        req.logger.error('rateLimiter: Redis error occurred while rate limiter processing.');
        throw rejRes;
      }

      // too many requests
      req.logger.warn('rateLimiter: Rate limiter has been activated and blocked the request.');
      req.logger.info({
        ...rejRes,
        key: limiter.getKey(key),
      });
      return next(Boom.tooManyRequests());
    });
};

exports.resetLimiter = async (limiter, req) => {
  const key = req.ip; // TODO: Implement user id

  try {
    await limiter.delete(key);
    req.logger.debug(`rateLimiter: Rate limiter [${limiter.getKey(key)}] has been reset.`);
  } catch (e) {
    // it is not a serious problem so just log and not block request
    req.logger.error(e);
  }
};
