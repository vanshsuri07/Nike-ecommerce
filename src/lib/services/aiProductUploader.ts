import 'dotenv/config';
import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../lib/db/schema';
import { saveImage } from '../utils/imageUtils';

// AI Product Uploader Service

export const ProductAIOutputSchema = z.object({
  description: z.string().min(1, 'Description cannot be empty.'),
  price: z.number().positive('Price must be a positive number.'),
  color: z.string().min(1, 'Color cannot be empty.'),
  hexCode: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid hex code format.'),
  category: z.string().min(1, 'Category cannot be empty.'),
});

export type ProductAIOutput = z.infer<typeof ProductAIOutputSchema>;

const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
};

export async function createProductFromAI(
  db: NodePgDatabase<typeof schema>,
  productName: string,
  imagePath?: string,
) {
  return db.transaction(async (tx) => {
    // 1. Generate product data from AI
    const aiData = await generateProductDataWithGemini(productName, imagePath);
    console.log('AI Generated Data:', aiData);

    // 2. Get or create category
    const categorySlug = slugify(aiData.category);
    let [category] = await tx
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.slug, categorySlug));
    if (!category) {
      console.log(`Category "${aiData.category}" not found, creating it...`);
      [category] = await tx
        .insert(schema.categories)
        .values({ name: aiData.category, slug: categorySlug })
        .returning();
    }

    // 3. Get or create color
    const colorSlug = slugify(aiData.color);
    let [color] = await tx
      .select()
      .from(schema.colors)
      .where(eq(schema.colors.slug, colorSlug));
    if (!color) {
      console.log(`Color "${aiData.color}" not found, creating it...`);
      [color] = await tx
        .insert(schema.colors)
        .values({
          name: aiData.color,
          slug: colorSlug,
          hexCode: aiData.hexCode,
        })
        .returning();
    }

    // 4. Get or create size
    const sizeSlug = 'one-size';
    let [size] = await tx
      .select()
      .from(schema.sizes)
      .where(eq(schema.sizes.slug, sizeSlug));
    if (!size) {
      console.log(`Size "One Size" not found, creating it...`);
      [size] = await tx
        .insert(schema.sizes)
        .values({ name: 'One Size', slug: sizeSlug })
        .returning();
    }

    // 5. Insert the product
    const [product] = await tx
      .insert(schema.products)
      .values({
        name: productName,
        description: aiData.description,
        price: String(aiData.price),
        categoryId: category.id,
      })
      .returning();
    console.log('Inserted Product ID:', product.id);

    // 6. Insert the product variant
    const sku = `${slugify(productName)}-${colorSlug}`.substring(0, 50);
    const [variant] = await tx
      .insert(schema.productVariants)
      .values({
        productId: product.id,
        colorId: color.id,
        sizeId: size.id,
        price: String(aiData.price),
        sku: sku,
      })
      .returning();
    console.log('Inserted Variant ID:', variant.id);

    // 7. Handle Image
    if (imagePath) {
      const imageUrl = await saveImage(imagePath);
      await tx.insert(schema.productImages).values({
        productId: product.id,
        variantId: variant.id,
        url: imageUrl,
        isPrimary: true,
      });
      console.log('Inserted Product Image URL:', imageUrl);
    }

    // 8. Update product with default variant ID
    await tx
      .update(schema.products)
      .set({ defaultVariantId: variant.id })
      .where(eq(schema.products.id, product.id));
    console.log('Updated product with default variant ID.');

    const [finalProduct] = await tx
      .select()
      .from(schema.products)
      .where(eq(schema.products.id, product.id));

    return finalProduct;
  });
}

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.avif':
      return 'image/avif';
    default:
      throw new Error(`Unsupported image type: ${ext}`);
  }
}

export async function generateProductDataWithGemini(
  name: string,
  imagePath?: string,
): Promise<ProductAIOutput> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY environment variable is not set.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });

  const prompt = `
    You are an expert in Nike product data.
    Based on the product name "${name}" ${
    imagePath ? 'and the provided image' : ''
  }, generate a JSON object with the following fields:
    - description: A compelling product description for an e-commerce store.
    - price: The retail price as a number.
    - color: The primary color of the product.
    - hexCode: The hex code for the primary color (e.g., "#000000").
    - category: The most specific product category (e.g., "Running Shoes", "Basketball Shorts", "Lifestyle T-Shirt").

    The output must be a single, valid JSON object and nothing else.
    Example:
    {
      "description": "The Nike Air Max 270 features Nike's largest-ever Max Air unit, providing visible cushioning and all-day comfort in a sleek, modern design.",
      "price": 150,
      "color": "Black/Anthracite/White",
      "hexCode": "#000000",
      "category": "Lifestyle Shoes"
    }
  `;

  const imageParts = [];
  if (imagePath) {
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image path does not exist: ${imagePath}`);
    }
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString('base64');
    imageParts.push({
      inlineData: {
        data: imageBase64,
        mimeType: getMimeType(imagePath),
      },
    });
  }

  const generationConfig = {
    temperature: 0.3,
    maxOutputTokens: 2048,
    responseMimeType: 'application/json',
  };

  const safetySettings = [
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
  ];

  let attempts = 0;
  const maxAttempts = 3;
  while (attempts < maxAttempts) {
    try {
      attempts++;
      console.log(
        `Attempt ${attempts}: Generating product data for "${name}"...`,
      );

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }, ...imageParts] }],
        generationConfig,
        safetySettings,
      });

      const response = result.response;
      const text = response.text();

      const parsedJson = JSON.parse(text);
      const validatedData = ProductAIOutputSchema.parse(parsedJson);

      console.log('Successfully generated and validated product data.');
      return validatedData;
    } catch (error) {
      console.error(`Attempt ${attempts} failed:`, error);
      if (attempts >= maxAttempts) {
        throw new Error(
          'Failed to generate and parse product data after multiple attempts.',
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }
  throw new Error('Exited retry loop unexpectedly.');
}
