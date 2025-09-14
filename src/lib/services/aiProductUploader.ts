import 'dotenv/config';
import { z } from 'zod';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../lib/db/schema';
import { saveImage } from '../utils/imageUtils';

// AI Product Uploader Service
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

    // Generate Stripe IDs
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

    // 4. Get sizes and select random ones
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

    // 8. Insert product variants
    const sizeChoices = pick(allSizes, randInt(5, Math.min(5, allSizes.length)));
    let defaultVariant: typeof schema.productVariants.$inferSelect | null = null;

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
      
      console.log('Inserted Variant ID:', variant.id);
      
      // Set the first variant as default
      if (!defaultVariant) {
        defaultVariant = variant;
      }

      // 9. Handle Image for each variant
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
    }

    // 10. Update product with default variant ID
    if (defaultVariant) {
      await tx
        .update(schema.products)
        .set({ defaultVariantId: defaultVariant.id })
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

// --- API Key Rotation ---
let currentKeyIndex = 0;

function getNextApiKey(): string {
  const keys = process.env.GOOGLE_API_KEYS?.split(',').map(k => k.trim()) || [];
  if (keys.length === 0) {
    throw new Error('No API keys found in GOOGLE_API_KEYS (comma separated)');
  }
  const key = keys[currentKeyIndex % keys.length];
  currentKeyIndex++;
  return key;
}

export async function generateProductDataWithGemini(
  name: string,
  imagePath?: string,
): Promise<ProductAIOutput> {
  let attempts = 0;
  const maxAttempts = 5; // total tries across all keys

  while (attempts < maxAttempts) {
    try {
      attempts++;

      // Rotate API key
      const apiKey = getNextApiKey();
      console.log(`🔑 Using API Key ${currentKeyIndex}/${process.env.GOOGLE_API_KEYS?.split(',').length || 0}`);

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `
        You are an expert in Nike product data.
        Based on the product name "${name}" ${imagePath ? 'and the provided image' : ''}, generate a JSON object with:
        - description: A compelling product description.
        - price: Positive number.
        - color: Primary color.
        - hexCode: Hex for primary color.
        - category: Specific category.
        - gender: Exactly one of: "Men", "Women", "Unisex", "Kids".

        **Gender Rules:**
        - Contains "Men" or "Men's" → Men
        - Contains "Women" or "Women's" → Women
        - Contains "Boy", "Girl", "Youth", "Kids" → Kids
        - Otherwise → only "Unisex" if it truly fits all genders.

        Output only valid JSON.
      `;

      const imageParts = [];
      if (imagePath) {
        if (!fs.existsSync(imagePath)) throw new Error(`Image path does not exist: ${imagePath}`);
        const imageBuffer = fs.readFileSync(imagePath);
        imageParts.push({
          inlineData: {
            data: imageBuffer.toString('base64'),
            mimeType: getMimeType(imagePath),
          },
        });
      }

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }, ...imageParts] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json',
        },
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ],
      });

      const responseText = result.response.text();
      const parsedJson = JSON.parse(responseText);

      // ✅ Sanitize hexCode before Zod validation
      if (parsedJson.hexCode) {
        parsedJson.hexCode = parsedJson.hexCode.trim();
        const match = parsedJson.hexCode.match(/#?[0-9a-fA-F]{6}/);
        parsedJson.hexCode = match
          ? (match[0].startsWith('#') ? match[0] : `#${match[0]}`)
          : '#000000'; // fallback color
      }

      const validatedData = ProductAIOutputSchema.parse(parsedJson);

      console.log('✅ Successfully generated product data.');
      return validatedData;
    } catch (error) {
      console.error(`❌ Attempt ${attempts}/${maxAttempts} failed:`, error);

      // Quota hit → try next key
      if (error instanceof Error && (error.message.includes('429') || error.message.includes('quota'))) {
        console.log('⚠️ Quota limit hit — switching API key...');
        continue; // try with next key
      }

      // Backoff delay for other errors
      const delay = Math.min(Math.pow(2, attempts - 1) * 5000, 120000);
      console.log(`⏳ Waiting ${delay / 1000}s before retry...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }

  throw new Error('All API keys failed or retries exhausted.');
}

// --- Fallback Wrapper ---
export async function generateProductDataWithGeminiAndFallback(
  name: string,
  imagePath?: string,
): Promise<ProductAIOutput> {
  try {
    return await generateProductDataWithGemini(name, imagePath);
  } catch (error) {
    console.error('⚠️ Gemini failed after all retries. Using fallback.',error);
    return createFallbackProductData(name);
  }
}

// Alternative: Add a fallback function that creates basic product data
// Alternative: Add a fallback function that creates basic product data
export function createFallbackProductData(name: string): ProductAIOutput {
  console.log('Using fallback product data generation...');

  const nameLower = name.toLowerCase();
  let category = 'Lifestyle';
  let gender: 'Men' | 'Women' | 'Unisex' | 'Kids';

  // 🎯 Explicit gender detection (still wins if keywords present)
  if (/\bmen\b|\bmen's\b/i.test(nameLower)) {
    gender = 'Men';
  } else if (/\bwomen\b|\bwomen's\b/i.test(nameLower)) {
    gender = 'Women';
  } else if (/\bkid\b|\bkids\b|\byouth\b|\bboy\b|\bgirl\b/i.test(nameLower)) {
    gender = 'Kids';
  } else {
    // 🎯 Equal probability if not specified
    const genders: ('Men' | 'Women' | 'Unisex' | 'Kids')[] = [
      'Men',
      'Women',
      'Unisex',
      'Kids',
    ];
    gender = genders[Math.floor(Math.random() * genders.length)];
  }

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
    brand: 'Nike',
  };
}
