import { FastifyInstance } from "fastify";
import fastifyRateLimit from "@fastify/rate-limit";

export async function rateLimiterMiddleware(fastify: FastifyInstance) {
  fastify.register(fastifyRateLimit, {
    max: 100, // Maximum number of requests per window
    timeWindow: "1 minute", // Time window duration
    keyGenerator: (req: { ip: any }) => req.ip, // Use the IP address as the key
    errorResponseBuilder: () => ({
      statusCode: 429,
      error: "Too Many Requests",
      message:
        "You have exceeded the maximum number of requests. Please try again later.",
    }),
  });
}
