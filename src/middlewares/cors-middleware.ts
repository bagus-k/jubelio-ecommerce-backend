import cors from "@fastify/cors";
import { FastifyInstance } from "fastify";

export async function corsMiddleware(fastify: FastifyInstance) {
  fastify.register(cors, {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });
}
