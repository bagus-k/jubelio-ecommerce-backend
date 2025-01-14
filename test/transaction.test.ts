import Fastify, { FastifyInstance } from "fastify";
import tap from "tap";

const transactionsResponseMock = async (fastify: FastifyInstance) => {
  fastify.get("/api/v1/transactions", async (request, reply) => {
    reply.status(200).send({
      data: [
        {
          id: 30,
          sku: "36T6X4M3",
          qty: 5,
          amount: "649.95",
        },
      ],
      total_data: 5,
      page: "1",
      total_page: 1,
    });
  });

  fastify.get("/api/v1/transactions/30", async (request, reply) => {
    reply.status(200).send({
      message: "Transaction retrieved successfully",
      data: {
        id: 30,
        sku: "36T6X4M3",
        qty: 5,
        amount: "649.95",
      },
    });
  });

  fastify.post("/api/v1/transactions", async (request, reply) => {
    reply.status(201).send({
      message: "Transaction created successfully",
      data: {
        title: "Women's Wrist Watch",
        sku: "36T6X4M3",
        qty: 2,
        amount: 259.98,
      },
    });
  });

  fastify.put("/api/v1/transactions/30", async (request, reply) => {
    reply.status(200).send({
      message: "Transaction updated successfully",
      data: {
        title: "Women's Wrist Watch",
        sku: "36T6X4M3",
        qty: 2,
        amount: 259.98,
      },
    });
  });

  fastify.delete("/api/v1/transactions/30", async (request, reply) => {
    reply.status(200).send({
      message: "Transaction deleted successfully",
      data: {
        id: "1",
      },
    });
  });
};

const transactionBody = {
  sku: "36T6X4M3",
  qty: 2,
};

tap.test("Transaction Routes", async (t) => {
  const app = Fastify();
  app.register(transactionsResponseMock);

  t.teardown(() => app.close());

  t.test(
    "GET `/api/v1/transactions` should get list of transactions",
    async (t) => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/transactions",
      });

      t.equal(response.statusCode, 200, "Get transaction returns 200");

      t.same(
        JSON.parse(response.payload),
        {
          data: [
            {
              id: 30,
              sku: "36T6X4M3",
              qty: 5,
              amount: "649.95",
            },
          ],
          total_data: 5,
          page: "1",
          total_page: 1,
        },
        "Get transactions returns the correct Transactions data"
      );
    }
  );

  t.test(
    "GET `/api/v1/transactions/:id` should get detail transaction",
    async (t) => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/transactions/30",
      });

      t.equal(response.statusCode, 200, "Transaction detail returns 200");
      t.same(
        JSON.parse(response.payload),
        {
          message: "Transaction retrieved successfully",
          data: {
            id: 30,
            sku: "36T6X4M3",
            qty: 5,
            amount: "649.95",
          },
        },
        "Transaction detail returns the correct transaction details"
      );
    }
  );

  t.test(
    "POST `/api/v1/transactions` should add a new transaction",
    async (t) => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/transactions",
        payload: transactionBody,
      });

      t.equal(response.statusCode, 201, "Transaction is created");
      t.same(
        JSON.parse(response.payload),
        {
          message: "Transaction created successfully",
          data: {
            title: "Women's Wrist Watch",
            sku: "36T6X4M3",
            qty: 2,
            amount: 259.98,
          },
        },
        "Transaction detail matches"
      );
    }
  );

  t.test(
    "PUT `/api/v1/transactions/:id` should update a transaction",
    async (t) => {
      const response = await app.inject({
        method: "PUT",
        url: "/api/v1/transactions/30",
        payload: transactionBody,
      });

      t.equal(response.statusCode, 200, "Transaction is updated");
      t.same(
        JSON.parse(response.payload),
        {
          message: "Transaction updated successfully",
          data: {
            title: "Women's Wrist Watch",
            sku: "36T6X4M3",
            qty: 2,
            amount: 259.98,
          },
        },
        "Transaction detail matches"
      );
    }
  );

  t.test(
    "DELETE `/api/v1/transactions/:id` should delete a transaction",
    async (t) => {
      const response = await app.inject({
        method: "DELETE",
        url: "/api/v1/transactions/30",
      });

      t.equal(response.statusCode, 200, "Transaction is deleted");
      t.same(
        JSON.parse(response.payload),
        {
          message: "Transaction deleted successfully",
          data: {
            id: "1",
          },
        },
        "Transaction deleted matches"
      );
    }
  );
});
