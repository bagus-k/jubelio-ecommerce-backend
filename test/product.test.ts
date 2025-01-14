import Fastify, { FastifyInstance } from "fastify";
import tap from "tap";

const productsResponseMock = async (fastify: FastifyInstance) => {
  fastify.get("/api/v1/products", async (request, reply) => {
    reply.status(200).send({
      data: [
        {
          id: 211,
          title: "testing",
          sku: "test0101001",
          image:
            "https://cdn.dummyjson.com/products/images/womens-dresses/Black%20Women's%20Gown/1.png",
          price: "100.00",
          stock: 2,
        },
      ],
      total_data: 5,
      page: "1",
      total_page: 1,
    });
  });

  fastify.get("/api/v1/products/211", async (request, reply) => {
    reply.status(200).send({
      message: "Product retrieved successfully",
      data: {
        id: 211,
        title: "testing",
        sku: "test0101001",
        image:
          "https://cdn.dummyjson.com/products/images/womens-dresses/Black%20Women's%20Gown/1.png",
        price: "100.00",
        stock: 2,
        description: null,
      },
    });
  });

  fastify.post("/api/v1/products", async (request, reply) => {
    reply.status(201).send({
      message: "Product created successfully",
      data: {
        title: "New Product",
        sku: "NEW123",
        image: "https://example.com/product-image.png",
        price: "99.99",
        description: "Product description",
      },
    });
  });

  fastify.put("/api/v1/products/211", async (request, reply) => {
    reply.status(200).send({
      message: "Product updated successfully",
      data: {
        title: "testing",
        sku: "test0101001",
        image:
          "https://cdn.dummyjson.com/products/images/womens-dresses/Black%20Women's%20Gown/1.png",
        price: "100.00",
        description: "testing",
      },
    });
  });

  fastify.delete("/api/v1/products/211", async (request, reply) => {
    reply.status(200).send({
      message: "Product deleted successfully",
      data: {
        id: "211",
      },
    });
  });

  fastify.get("/api/v1/products/fetch", async (request, reply) => {
    reply.status(200).send({
      message: "Product fetched successfully",
    });
  });
};

const productBodyMock = {
  title: "New Product",
  sku: "NEW123",
  image: "https://example.com/product-image.png",
  price: "99.99",
  description: "Product description",
};

tap.test("Product Routes", async (t) => {
  const app = Fastify();
  app.register(productsResponseMock);

  t.teardown(() => app.close());

  t.test("GET `/api/v1/products` route", async (t) => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/products",
    });

    t.equal(response.statusCode, 200, "Product route returns 200");

    const expectedResponse = {
      data: [
        {
          id: 211,
          title: "testing",
          sku: "test0101001",
          image:
            "https://cdn.dummyjson.com/products/images/womens-dresses/Black%20Women's%20Gown/1.png",
          price: "100.00",
          stock: 2,
        },
      ],
      total_data: 5,
      page: "1",
      total_page: 1,
    };

    const body = JSON.parse(response.payload);

    t.same(
      body,
      expectedResponse,
      "Product route returns the correct products data"
    );
  });

  t.test("GET `/api/v1/products/:id` route", async (t) => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/products/211",
    });

    t.equal(response.statusCode, 200, "Product detail route returns 200");
    t.same(
      JSON.parse(response.payload),
      {
        message: "Product retrieved successfully",
        data: {
          id: 211,
          title: "testing",
          sku: "test0101001",
          image:
            "https://cdn.dummyjson.com/products/images/womens-dresses/Black%20Women's%20Gown/1.png",
          price: "100.00",
          stock: 2,
          description: null,
        },
      },
      "Product detail route returns the correct product details"
    );
  });

  t.test("POST `/api/v1/products` should add a new product", async (t) => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/products",
      payload: productBodyMock,
    });

    t.equal(response.statusCode, 201, "Product is created");
    t.same(
      JSON.parse(response.payload),
      {
        message: "Product created successfully",
        data: {
          title: "New Product",
          sku: "NEW123",
          image: "https://example.com/product-image.png",
          price: "99.99",
          description: "Product description",
        },
      },
      "Product detail matches"
    );
  });

  t.test("PUT `/api/v1/products/:id` should update a product", async (t) => {
    const response = await app.inject({
      method: "PUT",
      url: "/api/v1/products/211",
      payload: productBodyMock,
    });

    t.equal(response.statusCode, 200, "Product is updated");
    t.same(
      JSON.parse(response.payload),
      {
        message: "Product updated successfully",
        data: {
          title: "testing",
          sku: "test0101001",
          image:
            "https://cdn.dummyjson.com/products/images/womens-dresses/Black%20Women's%20Gown/1.png",
          price: "100.00",
          description: "testing",
        },
      },
      "Product detail matches"
    );
  });

  t.test("DELETE `/api/v1/products/:id` should delete a product", async (t) => {
    const response = await app.inject({
      method: "DELETE",
      url: "/api/v1/products/211",
    });

    t.equal(response.statusCode, 200, "Product is deleted");
    t.same(
      JSON.parse(response.payload),
      {
        message: "Product deleted successfully",
        data: {
          id: "211",
        },
      },
      "Product deleted matches"
    );
  });

  t.test(
    "GET `/api/v1/products/fetch` should fetch products from https://dummyjson.com/",
    async (t) => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/products/fetch",
      });

      t.equal(response.statusCode, 200, "Product is fetched");
      t.same(
        JSON.parse(response.payload),
        {
          message: "Product fetched successfully",
        },
        "Product sucessfully fetched"
      );
    }
  );
});
