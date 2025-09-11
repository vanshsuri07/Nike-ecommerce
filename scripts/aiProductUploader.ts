import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { createProductFromAI } from '../src/lib/services/aiProductUploader';
import * as schema from '../src/lib/db/schema';
import path from 'path';
import 'dotenv/config';

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1 || args.length > 2) {
    console.error(
      'Usage: npm run ai:upload -- "<product-name>" [path/to/image.jpg]',
    );
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set in .env file');
  }

  if (!process.env.GOOGLE_API_KEYS) {
    throw new Error('GOOGLE_API_KEYS is not set in .env file');
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const db: NodePgDatabase<typeof schema> = drizzle(pool, { schema, logger: true });

  try {
    const [productName, imageRelativePath] = args;

    const productNames = process.argv.slice(2);
     if (productNames.length === 0) {
    console.error('Please provide at least one product name');
    process.exit(1);
    }

    const imagePath = imageRelativePath
      ? path.resolve(process.cwd(), imageRelativePath)
      : undefined;

    console.log(`Starting AI product upload for: "${productName}"`);
    if (imagePath) {
      console.log(`Using image: ${imagePath}`);
    }

    // Pass the db instance to the service function
    const newProduct = await createProductFromAI(db, productName, imagePath);

    console.log('\n✅ Product upload successful!');
    console.log('---------------------------------');
    console.log('Product Name:', newProduct.name);
    console.log('Product ID:', newProduct.id);
    console.log('Description:', newProduct.description);
    console.log('Price:', newProduct.price);
    console.log('Default Variant ID:', newProduct.defaultVariantId);
    console.log('---------------------------------');
  } catch (error) {
    console.error('\n❌ Product upload failed.');
    if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('An unknown error occurred:', error);
    }
    process.exit(1);
  } finally {
    console.log('Closing database connection...');
    await pool.end();
  }
}

main().catch((error) => {
  console.error('An unexpected error occurred in the CLI script:', error);
  process.exit(1);
});