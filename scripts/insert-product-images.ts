import "dotenv/config";
import { Pool } from "pg";
import { v4 as uuidv4 } from "uuid";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Required for Neon
});

async function insertSizes() {
  const client = await pool.connect();

  const sizes = [
    { name: "5", slug: "5", sort_order: 5 },
    { name: "6", slug: "6", sort_order: 6 },
    { name: "7", slug: "7", sort_order: 7 },
    { name: "8", slug: "8", sort_order: 8 },
    { name: "9", slug: "9", sort_order: 9 },
    { name: "10", slug: "10", sort_order: 10 },
    { name: "11", slug: "11", sort_order: 11 },
    { name: "12", slug: "12", sort_order: 12 },
    { name: "13", slug: "13", sort_order: 13 },
    { name: "14", slug: "14", sort_order: 14 },
  ];

  try {
    for (const size of sizes) {
      await client.query(
        `INSERT INTO sizes (id, name, slug, sort_order)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (slug) DO NOTHING`,
        [uuidv4(), size.name, size.slug, size.sort_order]
      );
    }
    console.log("✅ Sizes 5–14 inserted successfully!");
  } catch (err) {
    console.error("❌ Error inserting sizes:", err);
  } finally {
    client.release();
    process.exit();
  }
}

insertSizes();
