import { FastifyInstance } from "fastify";
import {
  createProduct,
  deleteProduct,
  fetchProduct,
  getDetailProduct,
  getProducts,
  updateProduct,
} from "../controller/product.controller";

const productRoutes = async (fastify: FastifyInstance) => {
  fastify.get("/api/v1/products", getProducts);
  fastify.get("/api/v1/products/:id", getDetailProduct);
  fastify.post("/api/v1/products", createProduct);
  fastify.put("/api/v1/products/:id", updateProduct);
  fastify.delete("/api/v1/products/:id", deleteProduct);
  fastify.get("/api/v1/products/fetch", fetchProduct);
};

export default productRoutes;
