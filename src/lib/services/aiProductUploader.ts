import 'dotenv/config';
import { z } from 'zod';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../lib/db/schema';
import { saveImage } from '../utils/imageUtils';

// Helper functions (could be moved to a shared utility file)
function pick<T>(arr: T[], n: number) {
  const a = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && a.length; i++) {
    const idx = Math.floor(Math.random() * a.length);
    out.push(a.splice(idx, 1)[0]);
  }
  return out;
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// AI Product Uploader Service

export const ProductAIOutputSchema = z.object({
  description: z.string().min(1, 'Description cannot be empty.'),
  price: z.number().positive('Price must be a positive number.'),
  color: z.string().min(1, 'Color cannot be empty.'),
  hexCode: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid hex code format.'),
  category: z.string().min(1, 'Category cannot be empty.'),
  gender: z.enum(['Men', 'Women', 'Unisex', 'Kids']),
  brand: z.string().min(1, 'Brand cannot be empty.').default('Nike'),


});

export type ProductAIOutput = z.infer<typeof ProductAIOutputSchema>;
// Add this after step 1 (Generate product data from AI)
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
    // Delete these lines from the top level
const stripe_product_id = "prod_" + Math.random().toString(36).substr(2, 9);
const stripe_price_id = "price_" + Math.random().toString(36).substr(2, 9);
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

    // 4. Get all available sizes
    const allSizes = await tx.select().from(schema.sizes);
    if (allSizes.length === 0) {
      throw new Error('No sizes found in the database. Please seed the sizes table first.');
    }

    // 5. Get or create brand
    const brandSlug = slugify(aiData.brand);
    let [brand] = await tx
      .select()
      .from(schema.brands)
      .where(eq(schema.brands.slug, brandSlug));
    if (!brand) {
      console.log(`Brand "${aiData.brand}" not found, creating it...`);
      [brand] = await tx
        .insert(schema.brands)
        .values({ name: aiData.brand, slug: brandSlug })
        .returning();
    }

    // 6. Get or create gender
    const genderSlug = slugify(aiData.gender);
    let [gender] = await tx
      .select()
      .from(schema.genders)
      .where(eq(schema.genders.slug, genderSlug));
    if (!gender) {
      console.log(`Gender "${aiData.gender}" not found, creating it...`);
      [gender] = await tx
        .insert(schema.genders)
        .values({ label: aiData.gender, slug: genderSlug })
        .returning();
    }

    // 7. Insert the product
    const [product] = await tx
      .insert(schema.products)
      .values({
        name: productName,
        description: aiData.description,
        price: String(aiData.price),
        categoryId: category.id,
        brandId: brand.id,
        genderId: gender.id,
        isPublished: true,
        stripeProductId: stripe_product_id,
        stripePriceId: stripe_price_id,
        image: imagePath ? await saveImage(imagePath) : null,
      })
      .returning();
    console.log('Inserted Product ID:', product.id);

    // 8. Insert product variants for a selection of sizes
    const sizeChoices = pick(allSizes, randInt(3, Math.min(5, allSizes.length))); // Using the pick function from seed.ts
    const variantIds: string[] = [];
    let defaultVariantId: string | null = null;

    for (const size of sizeChoices) {
      const sku = `${slugify(productName)}-${colorSlug}-${size.slug}`.substring(0, 50);
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
      variantIds.push(variant.id);
      if (!defaultVariantId) {
        defaultVariantId = variant.id;
      }
    }
    console.log(`Inserted ${variantIds.length} variants for product ${product.id}`);

    // 9. Handle Image
    if (imagePath && defaultVariantId) {
      const imageUrl = await saveImage(imagePath);
      await tx.insert(schema.productImages).values({
        productId: product.id,
        variantId: defaultVariantId,
        url: imageUrl,
        isPrimary: true,
      });
      console.log('Inserted Product Image URL:', imageUrl);
    }

    // 10. Update product with default variant ID
    if (defaultVariantId) {
      await tx
        .update(schema.products)
        .set({ defaultVariantId: defaultVariantId })
        .where(eq(schema.products.id, product.id));
      console.log('Updated product with default variant ID.');
    }

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
  // Use gemini-1.5-flash for higher rate limits and faster response
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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
    - gender: The target gender - must be one of: "Men", "Women", "Unisex", or "Kids".
    - brand: The brand name (default to "Nike" unless specified otherwise).

    The output must be a single, valid JSON object and nothing else.
    Example:
    {
      "description": "The Nike Air Max 270 features Nike's largest-ever Max Air unit, providing visible cushioning and all-day comfort in a sleek, modern design.",
      "price": 150,
      "color": "Black/Anthracite/White",
      "hexCode": "#000000",
      "category": "Lifestyle Shoes",
      "gender": "Unisex",
      "brand": "Nike"
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
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  ];

  let attempts = 0;
  const maxAttempts = 5; // Increased from 3 to 5
  
  while (attempts < maxAttempts) {
    try {
      attempts++;
      console.log(
        `Attempt ${attempts}/${maxAttempts}: Generating product data for "${name}"...`,
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
      console.error(`Attempt ${attempts}/${maxAttempts} failed:`, error);
      
      // Calculate exponential backoff delay
      let delay = Math.pow(2, attempts - 1) * 5000; // 5s, 10s, 20s, 40s, 80s
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('429') || error.message.includes('quota')) {
          console.log('Rate limit hit. Using extended delay...');
          delay = 60000; // 60 seconds for rate limits
        } else if (error.message.includes('503') || error.message.includes('overloaded')) {
          console.log('Service overloaded. Using exponential backoff...');
          delay = Math.min(delay, 120000); // Cap at 2 minutes
        } else if (error.message.includes('500')) {
          console.log('Internal server error. Using moderate delay...');
          delay = Math.min(delay, 30000); // Cap at 30 seconds
        }
      }
      
      if (attempts >= maxAttempts) {
        // Provide a more helpful error message
        let errorMessage = 'Failed to generate product data after multiple attempts.';
        
        if (error instanceof Error) {
          if (error.message.includes('503') || error.message.includes('overloaded')) {
            errorMessage += ' The Gemini API is currently overloaded. Please try again in a few minutes.';
          } else if (error.message.includes('429') || error.message.includes('quota')) {
            errorMessage += ' Rate limit exceeded. Consider upgrading your API plan or wait longer between requests.';
          } else {
            errorMessage += ` Last error: ${error.message}`;
          }
        }
        
        throw new Error(errorMessage);
      }
      
      // Wait before retry with exponential backoff
      console.log(`Waiting ${delay / 1000} seconds before retry...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('Exited retry loop unexpectedly.');
}

// Alternative: Add a fallback function that creates basic product data
export function createFallbackProductData(name: string): ProductAIOutput {
  console.log('Using fallback product data generation...');
  
  // Extract basic info from product name
  const nameLower = name.toLowerCase();
  let category = 'Lifestyle';
  let gender: 'Men' | 'Women' | 'Unisex' | 'Kids' = 'Unisex';
  const price = 100; // Default price
  
  // Basic category detection
  if (nameLower.includes('shoe') || nameLower.includes('force') || nameLower.includes('max')) {
    category = 'Lifestyle Shoes';
  } else if (nameLower.includes('shirt') || nameLower.includes('tee')) {
    category = 'Lifestyle T-Shirt';
  } else if (nameLower.includes('short')) {
    category = 'Shorts';
  } else if (nameLower.includes('jacket') || nameLower.includes('hoodie')) {
    category = 'Outerwear';
  }
  
  // Basic gender detection
  if (nameLower.includes('men') || nameLower.includes("men's")) {
    gender = 'Men';
  } else if (nameLower.includes('women') || nameLower.includes("women's")) {
    gender = 'Women';
  } else if (nameLower.includes('kid') || nameLower.includes('youth')) {
    gender = 'Kids';
  }
  
  // Basic color detection
  let color = 'White';
  let hexCode = '#FFFFFF';
  if (nameLower.includes('black')) {
    color = 'Black';
    hexCode = '#000000';
  } else if (nameLower.includes('blue')) {
    color = 'Blue';
    hexCode = '#0066CC';
  } else if (nameLower.includes('red')) {
    color = 'Red';
    hexCode = '#CC0000';
  }
  
  return {
    description: `The ${name} offers classic Nike style and comfort. Perfect for everyday wear with premium materials and iconic design.`,
    price,
    color,
    hexCode,
    category,
    gender,
    brand: 'Nike'
  };
}

// Modified main function that uses fallback on repeated failures
export async function generateProductDataWithGeminiAndFallback(
  name: string,
  imagePath?: string,
): Promise<ProductAIOutput> {
  try {
    return await generateProductDataWithGemini(name, imagePath);
  } catch (error) {
    console.error('Gemini API failed after all retries. Using fallback data generation...');
    console.error('Error:', error);
    return createFallbackProductData(name);
  }
}