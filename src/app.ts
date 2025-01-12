import Fastify from "fastify";
import cors from "@fastify/cors";
import { config } from "./config/db";
import productRoutes from "./routes/product.route";
import transactionRoutes from "./routes/transaction.route";
import { migration } from "./migrations/migration";
import db from "./database/postgres.database";

const app = Fastify({
  logger: true,
});

app.register(cors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

app.register(productRoutes);
app.register(transactionRoutes);

app.get("/healthchecker", async (request, reply) => {
  reply.send({ message: `${config.app.name} server running...` });
});

const start = async () => {
  try {
    await db.connect();
    await migration();

    await app.listen(
      { port: config.app.port, host: config.app.host },
      (err) => {
        if (err) throw err;
      }
    );

    app.log.info(
      `Listening and serving HTTP on ${config.app.host}:${config.app.port}`
    );
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};
start();
