import dotenv from "dotenv";

dotenv.config();

export const config = {
  app: {
    name: process.env.APP_NAME,
    host: process.env.APP_HOST,
    port: parseInt(process.env.APP_PORT || "8080"),
  },
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_DATABASE,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  },
};
