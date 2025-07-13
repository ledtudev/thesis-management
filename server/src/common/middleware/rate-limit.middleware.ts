// import { Injectable, NestMiddleware } from '@nestjs/common';
// import { NextFunction, Request, Response } from 'express';
// import { RedisService } from '../services/redis.service';

// @Injectable()
// export class RateLimitMiddleware implements NestMiddleware {
//   constructor(private readonly redisService: RedisService) {}

//   async use(req: Request, res: Response, next: NextFunction) {
//     const ip = req.ip;
//     const key = `rate-limit:${ip}`;

//     try {
//       const current = await this.redisService.incr(key);

//       // Set expiration if this is the first request
//       if (current === 1) {
//         await this.redisService.set(key, '1', 900); // 15 minutes
//       }

//       // Set rate limit headers
//       res.setHeader('X-RateLimit-Limit', '100');
//       res.setHeader('X-RateLimit-Remaining', Math.max(0, 100 - current));
//       res.setHeader('X-RateLimit-Reset', Math.floor(Date.now() / 1000) + 900);

//       // Check if rate limit exceeded
//       if (current > 100) {
//         return res.status(429).json({
//           statusCode: 429,
//           message: 'Too Many Requests',
//           error: 'Rate limit exceeded. Please try again later.',
//         });
//       }

//       next();
//     } catch (error) {
//       // If Redis fails, allow the request to proceed
//       console.error('Rate limit error:', error);
//       next();
//     }
//   }
// }
