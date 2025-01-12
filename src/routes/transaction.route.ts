import { FastifyInstance } from "fastify";
import {
  createTransaction,
  deleteTransaction,
  getDetailTransaction,
  getTransactions,
  updateTransaction,
} from "../controller/transaction.controller";

const transactionRoutes = async (fastify: FastifyInstance) => {
  fastify.get("/api/v1/transactions", getTransactions);
  fastify.get("/api/v1/transactions/:id", getDetailTransaction);
  fastify.post("/api/v1/transactions", createTransaction);
  fastify.put("/api/v1/transactions/:id", updateTransaction);
  fastify.delete("/api/v1/transactions/:id", deleteTransaction);
};

export default transactionRoutes;
