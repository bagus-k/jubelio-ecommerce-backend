import dotenv from "dotenv";

dotenv.config();

interface Config {
  app: {
    name: string;
    host: string;
    port: number;
  };
  database: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    max_idle: number;
    max_open: number;
    timeout: number;
  };
  rateLimiter: {
    max: number;
  };
}

export const config: Config = {
  app: {
    name: process.env.APP_NAME || "ecommerce",
    host: process.env.APP_HOST || "0.0.0.0",
    port: parseInt(process.env.APP_PORT || "8080"),
  },
  database: {
    host: process.env.DB_HOST || "0.0.0.0",
    port: parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_DATABASE || "",
    username: process.env.DB_USERNAME || "",
    password: process.env.DB_PASSWORD || "",
    max_idle: parseInt(process.env.DB_MAX_IDLE || "30000") || 10,
    max_open: parseInt(process.env.DB_MAX_OPEN || "100") || 100,
    timeout: parseInt(process.env.DB_TIMEOUT || "2000") || 2000,
  },
  rateLimiter: {
    max: parseInt(process.env.RATE_LIMITER_MAX || "100") || 100,
  },
};
