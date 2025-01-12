import { FastifyReply, FastifyRequest } from "fastify";
import database from "../database/postgres.database";

type ProductResponse = {
  id: number;
  title: string;
  sku: string;
  image: string;
  price: number;
  stock: number;
};

export const getProducts = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const {
    page = 1,
    limit = 8,
    keyword = "",
  } = request.query as { page: number; limit: number; keyword: string };
  const offset = (page - 1) * limit;
  try {
    const formattedKeyword = `%${keyword}%`;

    const products: ProductResponse[] = await database.any<ProductResponse>(
      "SELECT id, title, sku, image, price, stock FROM products where title ILIKE $1 AND deleted_at IS NULL ORDER BY updated_at DESC LIMIT $2 OFFSET $3",
      [formattedKeyword, limit, offset]
    );

    const getTotalData = await database.one(
      "SELECT COUNT(*) FROM products WHERE deleted_at IS NULL"
    );

    const totalData = parseInt(getTotalData.count, 10);
    const totalPage = Math.ceil(totalData / limit);

    return reply.status(200).send({
      data: products,
      total_data: totalData,
      page: page,
      total_page: totalPage,
    });
  } catch (error) {
    console.error("Error get products:", error);
    return reply.status(500).send({
      error: "Internal Server Error",
      message: "An error occurred when get the products.",
    });
  }
};

export const getDetailProduct = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = request.params as { id: number };

  try {
    const product: ProductResponse[] = await database.any<ProductResponse>(
      "SELECT id, title, sku, image, price, stock, description FROM products WHERE id = $1",
      [id]
    );

    if (product.length === 0) {
      return reply.status(404).send({ message: "Product not found", data: {} });
    }

    return reply.status(200).send({
      message: "Product retrieved successfully",
      data: product[0],
    });
  } catch (error) {
    console.error("Error get detail product:", error);
    return reply.status(500).send({
      error: "Internal Server Error",
      message: "An error occurred when get detail product.",
    });
  }
};

export const createProduct = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const product = request.body as {
    title: string;
    sku: string;
    image: string;
    price: number;
    description?: string;
    stock: number;
  };

  if (
    !product.title ||
    !product.sku ||
    !product.image ||
    !product.price ||
    !product.stock
  ) {
    return reply.status(422).send({
      error: "Validation Error",
      message: "Title, SKU, Image, Stock and Price are required.",
    });
  }

  try {
    await database.tx(async (t) => {
      const [existingSkuProduct] = await t.query(
        "SELECT title, sku, image, price, stock, description FROM products WHERE sku = $1",
        [product.sku]
      );

      if (existingSkuProduct) {
        return reply.status(422).send({
          error: "Validation Error",
          message: `Product with SKU "${product.sku}" already exists.`,
        });
      }

      await t.result(
        "INSERT INTO products (title, sku, image, price, description, stock, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())",
        [
          product.title,
          product.sku,
          product.image,
          product.price,
          product.description || null,
          product.stock,
        ]
      );

      return reply.status(201).send({
        message: "Product created successfully",
        data: product,
      });
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return reply.status(500).send({
      error: "Internal Server Error",
      message: "An error occurred when creating the product.",
    });
  }
};

export const updateProduct = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const product = request.body as {
    title: string;
    sku: string;
    image: string;
    price: number;
    description?: string;
  };

  const { id } = request.params as { id: number };

  if (
    !product.title ||
    !product.sku ||
    !product.image ||
    !product.price ||
    !id
  ) {
    return reply.status(422).send({
      error: "Validation Error",
      message: "Title, SKU, Image, and Price are required.",
    });
  }

  try {
    await database.tx(async (t) => {
      const [existingSkuProduct] = await t.query(
        "SELECT * FROM products WHERE sku = $1 AND id <> $2",
        [product.sku, id]
      );

      if (existingSkuProduct) {
        return reply.status(422).send({
          error: "Validation Error",
          message: `Product with SKU "${product.sku}" already exists.`,
        });
      }

      const result = await t.result(
        "UPDATE products SET title = $1, sku = $2, image = $3, price = $4, description = $5, updated_at = NOW() WHERE id = $6 AND deleted_at IS NULL",
        [
          product.title,
          product.sku,
          product.image,
          product.price,
          product.description || null,
          id,
        ]
      );

      if (result.rowCount === 0) {
        return reply
          .status(404)
          .send({ message: "Product not found", data: {} });
      }

      return reply.status(200).send({
        message: "Product updated successfully",
        data: product,
      });
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return reply.status(500).send({
      error: "Internal Server Error",
      message: "An error occurred when updating the product.",
    });
  }
};

export const deleteProduct = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = request.params as { id: number };

  try {
    await database.tx(async (t) => {
      const result = await t.result(
        "UPDATE products SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL",
        [id]
      );

      if (result.rowCount === 0) {
        return reply
          .status(404)
          .send({ message: "Product not found", data: {} });
      }

      await t.result(
        "UPDATE adjustment_transactions SET deleted_at = NOW() WHERE product_id = $1 AND deleted_at IS NULL",
        [id]
      );

      return reply.status(200).send({
        message: "Product deleted successfully",
        data: { id: id },
      });
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return reply.status(500).send({
      error: "Internal Server Error",
      message: "An error occurred when deleting the product.",
    });
  }
};

export const fetchProduct = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const response = await fetch("https://dummyjson.com/products?limit=0");
    const data = await response.json();

    if (data.products && data.products.length > 0) {
      for (const product of data.products) {
        const {
          title,
          sku,
          image = product.images ? product.images[0] : null,
          price,
          description,
          stock,
        } = product as {
          title?: string;
          sku?: string;
          image?: string;
          price?: number;
          description?: string;
          stock?: number;
        };

        const [existingSkuProduct] = await database.query(
          "SELECT * FROM products WHERE sku = $1",
          [sku]
        );

        if (existingSkuProduct) {
          await database.query(
            "UPDATE products SET title = $1, image = $2, price = $3, description = $4, stock = $5, updated_at = NOW() WHERE sku = $6",
            [
              title || null,
              image || null,
              price || 0,
              description || null,
              stock || 0,
              sku,
            ]
          );
        } else {
          await database.query(
            "INSERT INTO products (title, sku, image, price, description, stock, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())",
            [title, sku, image, price || 0, description, stock || 0]
          );
        }
      }
      return reply.status(200).send({
        message: "Product fetched successfully",
      });
    } else {
      return reply.status(404).send({
        message: "Product is empty",
      });
    }
  } catch (error) {
    console.error("Error updating product:", error);
    return reply.status(500).send({
      error: "Internal Server Error",
      message: "Error when fetching",
    });
  }
};
