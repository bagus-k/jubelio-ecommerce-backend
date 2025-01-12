import db from "../database/postgres.database";

export const migration = async () => {
  try {
    await db.none(`
       CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          sku VARCHAR(255) NOT NULL UNIQUE,
          image VARCHAR(255),
          price DECIMAL(10, 2) NOT NULL,
          description TEXT,
          stock INT DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ,
          deleted_at TIMESTAMPTZ 
      );
    `);
    console.log("products table created or already exists.");

    await db.none(`
        CREATE TABLE IF NOT EXISTS adjustment_transactions (
            id SERIAL PRIMARY KEY,             
            product_id SERIAL NOT NULL, 
            qty INT NOT NULL,                    
            amount DECIMAL(10, 2) NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ,
            deleted_at TIMESTAMPTZ,     
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE 
        )
    `);
    console.log("adjustment_transaction table created or already exists.");
  } catch (error) {
    console.error("Error during migration:", error);
  }
};
