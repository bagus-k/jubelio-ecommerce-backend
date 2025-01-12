import { FastifyReply, FastifyRequest } from "fastify";
import database from "../database/postgres.database";

type TransactionResponse = {
  id: number;
  sku: string;
  qty: string;
  amount: number;
};

export const getTransactions = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const {
    page = 1,
    limit = 10,
    keyword = "",
  } = request.query as { page: number; limit: number; keyword: string };
  const offset = (page - 1) * limit;
  try {
    const formattedKeyword = `%${keyword}%`;

    const transaction: TransactionResponse[] =
      await database.any<TransactionResponse>(
        "SELECT adjustment_transactions.id, products.sku, adjustment_transactions.qty, adjustment_transactions.amount FROM adjustment_transactions LEFT JOIN products ON products.id = adjustment_transactions.product_id WHERE products.sku ILIKE $1 AND products.deleted_at IS NULL AND adjustment_transactions.deleted_at IS NULL LIMIT $2 OFFSET $3",
        [formattedKeyword, limit, offset]
      );

    const getTotalData = await database.one(
      "SELECT COUNT(*) FROM adjustment_transactions WHERE deleted_at IS NULL"
    );

    const totalData = parseInt(getTotalData.count, 10);
    const totalPage = Math.ceil(totalData / limit);

    return reply.status(200).send({
      data: transaction,
      total_data: totalData,
      page: page,
      total_page: totalPage,
    });
  } catch (error) {
    console.error("Error getting transactions:", error);
    return reply.status(500).send({
      error: "Internal Server Error",
      message: "An error occurred when getting transactions.",
    });
  }
};

export const getDetailTransaction = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = request.params as { id: number };

  try {
    const transaction: TransactionResponse[] =
      await database.any<TransactionResponse>(
        "SELECT adjustment_transactions.id, products.sku, adjustment_transactions.qty, adjustment_transactions.amount FROM adjustment_transactions LEFT JOIN products ON products.id = adjustment_transactions.product_id WHERE adjustment_transactions.id = $1 AND products.deleted_at IS NULL AND adjustment_transactions.deleted_at IS NULL",
        [id]
      );

    if (transaction.length === 0) {
      return reply
        .status(404)
        .send({ message: "Transaction not found", data: {} });
    }

    return reply.status(200).send({
      message: "Transaction retrieved successfully",
      data: transaction[0],
    });
  } catch (error) {
    console.error("Error get detail transaction:", error);
    return reply.status(500).send({
      error: "Internal Server Error",
      message: "An error occurred when get detail transaction.",
    });
  }
};

export const createTransaction = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const transaction = request.body as {
    qty: number;
    sku: string;
  };

  if (!transaction.sku || !transaction.qty) {
    return reply.status(412).send({
      error: "Validation Error",
      message: "SKU, and Qty are required.",
    });
  }

  try {
    await database.tx(async (t) => {
      const [product] = await t.query("SELECT * FROM products WHERE sku = $1", [
        transaction.sku,
      ]);

      if (!product) {
        return reply.status(412).send({
          error: "Validation Error",
          message: `Product with SKU "${transaction.sku}" is not found.`,
        });
      }

      var stock = product.stock + transaction.qty;

      if (product.stock === 0 || stock < 1) {
        return reply.status(412).send({
          error: "Validation Error",
          message: `Product with SKU "${product.sku}" is currently unavailable.`,
        });
      }

      var amount = product.price * transaction.qty;

      await t.result(
        "INSERT INTO adjustment_transactions (product_id, qty, amount, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())",
        [product.id, transaction.qty, amount]
      );

      await t.result(
        "UPDATE products SET stock = $1, updated_at = NOW() WHERE id = $2 AND deleted_at IS NULL",
        [stock, product.id]
      );

      return reply.status(201).send({
        message: "Transaction created successfully",
        data: {
          title: product?.title,
          sku: product?.sku,
          qty: transaction.qty,
          amount: amount,
        },
      });
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return reply.status(500).send({
      error: "Internal Server Error",
      message: "An error occurred when creating the transaction.",
    });
  }
};

export const updateTransaction = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const transaction = request.body as {
    qty: number;
  };

  const { id } = request.params as { id: number };

  if (!transaction.qty || !id) {
    return reply.status(412).send({
      error: "Validation Error",
      message: "SKU, and Qty are required.",
    });
  }

  try {
    await database.tx(async (t) => {
      const [dataTransaction] = await t.query(
        "SELECT * FROM adjustment_transactions WHERE id = $1",
        [id]
      );

      if (!dataTransaction) {
        return reply.status(404).send({
          error: "Not Found",
          message: `Transaction with id "${id}" is not found.`,
        });
      }

      const [product] = await t.query("SELECT * FROM products WHERE id = $1", [
        dataTransaction.product_id,
      ]);

      var stock = product.stock + (transaction.qty - dataTransaction.qty);

      if (product.stock === 0 || stock < 1) {
        return reply.status(412).send({
          error: "Validation Error",
          message: `Product with SKU "${product.sku}" is currently unavailable.`,
        });
      }

      var amount = product.price * transaction.qty;

      await t.result(
        "UPDATE adjustment_transactions SET qty = $1, amount = $2 WHERE id = $3 AND deleted_at IS NULL",
        [transaction.qty, amount, id]
      );

      await t.result(
        "UPDATE products SET stock = $1, updated_at = NOW() WHERE id = $2 AND deleted_at IS NULL",
        [stock, product.id]
      );

      return reply.status(201).send({
        message: "Transaction updated successfully",
        data: {
          title: product?.title,
          sku: product?.sku,
          qty: transaction.qty,
          amount: amount,
        },
      });
    });
  } catch (error) {
    console.error("Error updating transaction:", error);
    return reply.status(500).send({
      error: "Internal Server Error",
      message: "An error occurred when updating the transaction.",
    });
  }
};

export const deleteTransaction = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = request.params as { id: number };

  try {
    await database.tx(async (t) => {
      const result = await t.result(
        "UPDATE adjustment_transactions SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL",
        [id]
      );

      if (result.rowCount === 0) {
        return reply
          .status(404)
          .send({ message: "Transaction not found", data: {} });
      }

      return reply.status(200).send({
        message: "Transaction deleted successfully",
        data: { id: id },
      });
    });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return reply.status(500).send({
      error: "Internal Server Error",
      message: "An error occurred when deleting the transaction.",
    });
  }
};
