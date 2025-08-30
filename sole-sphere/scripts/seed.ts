import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../src/db/schema';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const main = async () => {
  try {
    console.log('Seeding database...');

    await db.delete(schema.products).values(); // Clear existing data

    const nikeProducts = [
      {
        name: 'Nike Air Max 97',
        description: 'A classic sneaker with a retro-futuristic design.',
        price: '170.00',
        image: '/images/nike-air-max-97.jpg',
      },
      {
        name: 'Nike Air Force 1',
        description: 'An iconic sneaker that has been a staple for decades.',
        price: '90.00',
        image: '/images/nike-air-force-1.jpg',
      },
      {
        name: 'Nike Blazer Mid 77',
        description: 'A vintage-inspired sneaker with a timeless design.',
        price: '100.00',
        image: '/images/nike-blazer-mid-77.jpg',
      },
      {
        name: 'Nike React Infinity Run Flyknit',
        description: 'A running shoe designed to help reduce injury and keep you on the run.',
        price: '160.00',
        image: '/images/nike-react-infinity-run-flyknit.jpg',
      },
    ];

    await db.insert(schema.products).values(nikeProducts);

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

main();
