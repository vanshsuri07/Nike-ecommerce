'use server';

import { db } from '@/db';
import * as schema from '@/lib/db/schema';
import { and, asc, desc, eq, gte, lte, inArray, sql, count, min, SQL, isNull, InferSelectModel, not, or } from 'drizzle-orm';
import { ProductFilters } from '@/lib/utils/query';

// Explicit type for the returned product structure to ensure type safety
type Product = InferSelectModel<typeof schema.products>;
type Brand = InferSelectModel<typeof schema.brands>;
type Category = InferSelectModel<typeof schema.categories>;
type Gender = InferSelectModel<typeof schema.genders>;
type ProductVariant = InferSelectModel<typeof schema.productVariants>;
type Color = InferSelectModel<typeof schema.colors>;
type Size = InferSelectModel<typeof schema.sizes>;
type ProductImage = InferSelectModel<typeof schema.productImages>;

export type ProductWithDetails = Product & {
    brand: Brand | null;
    category: Category | null;
    gender: Gender | null;
    variants: (ProductVariant & {
        color: Color;
        size: Size;
    })[];
    images: ProductImage[];
    minPrice: string;
    maxPrice: string;
};

export async function getAllProducts(filters: ProductFilters): Promise<{ products: ProductWithDetails[], totalCount: number }> {
    const { page, limit, sortBy } = filters;

    const conditions: (SQL | undefined)[] = [eq(schema.products.isPublished, true)];

    if (filters.search) {
        const tsquery = filters.search.trim().split(' ').join(' & ');
        conditions.push(sql`to_tsvector('english', ${schema.products.name} || ' ' || ${schema.products.description}) @@ to_tsquery('english', ${tsquery})`);
    }

    if (filters.category?.length) {
        const categoryIds = db.select({ id: schema.categories.id }).from(schema.categories).where(inArray(schema.categories.name, filters.category));
        conditions.push(inArray(schema.products.categoryId, categoryIds));
    }
    if (filters.brand?.length) {
        const brandIds = db.select({ id: schema.brands.id }).from(schema.brands).where(inArray(schema.brands.name, filters.brand));
        conditions.push(inArray(schema.products.brandId, brandIds));
    }
    if (filters.gender?.length) {
        const genderIds = db.select({ id: schema.genders.id }).from(schema.genders).where(inArray(schema.genders.label, filters.gender));
        conditions.push(inArray(schema.products.genderId, genderIds));
    }

    const variantConditions: (SQL | undefined)[] = [];
    if (filters.color?.length) {
        const colorIds = db.select({ id: schema.colors.id }).from(schema.colors).where(inArray(schema.colors.name, filters.color));
        variantConditions.push(inArray(schema.productVariants.colorId, colorIds));
    }
    if (filters.size?.length) {
        const sizeIds = db.select({ id: schema.sizes.id }).from(schema.sizes).where(inArray(schema.sizes.name, filters.size));
        variantConditions.push(inArray(schema.productVariants.sizeId, sizeIds));
    }
    if (filters.priceMin !== undefined) {
        variantConditions.push(gte(schema.productVariants.price, filters.priceMin.toString()));
    }
    if (filters.priceMax !== undefined) {
        variantConditions.push(lte(schema.productVariants.price, filters.priceMax.toString()));
    }

    if (variantConditions.length > 0) {
        const subquery = db.selectDistinct({ productId: schema.productVariants.productId })
            .from(schema.productVariants)
            .where(and(...variantConditions.filter((c): c is SQL => !!c)));
        conditions.push(inArray(schema.products.id, subquery));
    }

    const where = and(...conditions.filter((c): c is SQL => !!c));

    const countQuery = db.select({ count: count() }).from(schema.products).where(where);

    let productIds: { id: string }[];

    if (sortBy === 'price_asc' || sortBy === 'price_desc') {
        const direction = sortBy === 'price_asc' ? asc : desc;
        const productsWithPrice = db.selectDistinct({
            id: schema.products.id,
            minPrice: min(schema.productVariants.price).as('min_price')
        })
        .from(schema.products)
        .leftJoin(schema.productVariants, eq(schema.products.id, schema.productVariants.productId))
        .where(where)
        .groupBy(schema.products.id)
        .orderBy(direction(sql`min_price`))
        .limit(limit)
        .offset((page - 1) * limit);

        productIds = await productsWithPrice;
    } else {
        const orderedQuery = db.select({ id: schema.products.id })
            .from(schema.products)
            .where(where)
            .orderBy(desc(schema.products.createdAt))
            .limit(limit)
            .offset((page - 1) * limit);
        productIds = await orderedQuery;
    }

    if (productIds.length === 0) {
        return { products: [], totalCount: 0 };
    }

    const ids = productIds.map(p => p.id);

    const totalResult = await countQuery;
    const totalCount = totalResult[0]?.count ?? 0;

    const finalProductsData = await db.query.products.findMany({
        where: inArray(schema.products.id, ids),
        with: {
            brand: true,
            category: true,
            gender: true,
            variants: { with: { color: true, size: true } },
        }
    });

   // Replace your imagesQuery section with this:

let imagesQuery;
if (filters.color?.length) {
    const colorIds = await db.select({ id: schema.colors.id }).from(schema.colors).where(inArray(schema.colors.name, filters.color));
    const variantIds = await db.select({ id: schema.productVariants.id }).from(schema.productVariants).where(and(
        inArray(schema.productVariants.productId, ids),
        inArray(schema.productVariants.colorId, colorIds.map(c => c.id))
    ));
    
    // Get both variant-specific images AND main product images
    imagesQuery = db.select().from(schema.productImages).where(
        and(
            inArray(schema.productImages.productId, ids),
            // Get images for the matching color variants OR main product images (null variantId)
            sql`(${schema.productImages.variantId} IN ${variantIds.map(v => v.id)} OR ${schema.productImages.variantId} IS NULL)`
        )
    ).orderBy(schema.productImages.sortOrder);
} else {
    // When no color filter, get main product images only
    imagesQuery = db.select().from(schema.productImages).where(
        and(
            inArray(schema.productImages.productId, ids),
            isNull(schema.productImages.variantId)
        )
    ).orderBy(schema.productImages.sortOrder);
}
    const images = await imagesQuery;
    const imagesByProductId = images.reduce((acc, image) => {
        if (!acc[image.productId]) {
            acc[image.productId] = [];
        }
        acc[image.productId].push(image);
        return acc;
    }, {} as Record<string, (typeof images)>);

    const finalProducts = finalProductsData.map(p => {
        const prices: number[] = p.variants.map((v: ProductVariant) => parseFloat(v.price));
        const minPrice = prices.length ? Math.min(...prices) : 0;
        const maxPrice = prices.length ? Math.max(...prices) : 0;
        return {
            id: p.id,
            name: p.name,
            description: p.description,
            categoryId: p.categoryId,
            genderId: p.genderId,
            brandId: p.brandId,
            isPublished: p.isPublished,
            defaultVariantId: p.defaultVariantId,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
            brand: p.brand,
            category: p.category,
            gender: p.gender,
            variants: p.variants,
            minPrice: minPrice.toString(),
            maxPrice: maxPrice.toString(),
            images: imagesByProductId[p.id] || [],
        };
    });

    const productsById = finalProducts.reduce((acc, p) => {
        acc[p.id] = p;
        return acc;
    }, {} as Record<string, typeof finalProducts[0]>);

    const sortedFinalProducts = ids.map(id => productsById[id]).filter(Boolean);

    return { products: sortedFinalProducts, totalCount };
}

// Define the structured return type for a single product page
export type ProductDetails = Product & {
  brand: Brand;
  category: Category;
  gender: Gender;
  variants: (ProductVariant & {
    color: Color;
    size: Size;
    images: ProductImage[]; // Images specific to this variant
  })[];
  mainImages: ProductImage[]; // Images not tied to a specific variant
};

export async function getProduct(productId: string): Promise<ProductDetails | null> {
  // Fetch the product with all its relations in one go
  const productData = await db.query.products.findFirst({
    where: and(
      eq(schema.products.id, productId),
      eq(schema.products.isPublished, true)
    ),
    with: {
      brand: true,
      category: true,
      gender: true,
      variants: {
        with: {
          color: true,
          size: true,
        },
        // Order variants if needed, e.g., by color or size name
        orderBy: (variants, { asc }) => [asc(variants.id)],
      },
      images: {
        orderBy: (images, { asc }) => [asc(images.sortOrder)],
      },
    },
  });

  // If no product is found or essential relations are missing, return null
  if (!productData || !productData.brand || !productData.category || !productData.gender) {
    return null;
  }

  // Separate images into main images and variant-specific images
  const mainImages = productData.images.filter((img) => !img.variantId);
  const variantImages = productData.images.filter((img) => img.variantId);

  // Create a map for easy lookup of images by variantId
  const imagesByVariant = variantImages.reduce((acc, image) => {
    if (!image.variantId) return acc;
    if (!acc[image.variantId]) {
      acc[image.variantId] = [];
    }
    acc[image.variantId].push(image);
    return acc;
  }, {} as Record<string, ProductImage[]>);

  // Enhance variants with their specific images
  const variantsWithImages = productData.variants.map((variant) => ({
    ...variant,
    images: imagesByVariant[variant.id] || [],
  }));

  // Construct the final, well-structured product object
  const product: ProductDetails = {
    ...productData,
    // Non-null assertions because we checked them above
    brand: productData.brand!,
    category: productData.category!,
    gender: productData.gender!,
    variants: variantsWithImages,
    mainImages: mainImages,
  };

  return product;
}

export type Review = {
  id: string;
  author: string;
  rating: number;
  title: string | null;
  content: string;
  createdAt: string;
};

export async function getProductReviews(productId: string): Promise<Review[]> {
  const reviewsData = await db
    .select({
      id: schema.reviews.id,
      rating: schema.reviews.rating,
      comment: schema.reviews.comment,
      createdAt: schema.reviews.createdAt,
      author: schema.users.name,
    })
    .from(schema.reviews)
    .innerJoin(schema.users, eq(schema.reviews.userId, schema.users.id))
    .where(eq(schema.reviews.productId, productId))
    .orderBy(desc(schema.reviews.createdAt));

  if (!reviewsData) {
    return [];
  }

  return reviewsData.map((r) => ({
    id: r.id,
    author: r.author || 'Anonymous',
    rating: r.rating,
    title: null, // No title field in the database schema
    content: r.comment || '',
    createdAt: r.createdAt.toISOString(),
  }));
}

export type RecommendedProduct = {
  id: string;
  name: string;
  price: string;
  image: string;
  defaultVariantId?: string;
};

export async function getRecommendedProducts(productId: string): Promise<RecommendedProduct[]> {
  // Step 1: Fetch the current product's details for recommendations
  const currentProduct = await db.query.products.findFirst({
    where: eq(schema.products.id, productId),
    columns: {
      categoryId: true,
      brandId: true,
      genderId: true,
    },
  });

  if (!currentProduct) {
    return [];
  }

  // Step 2: Find related products
  const recommendedProductsData = await db
    .select({
      id: schema.products.id,
      name: schema.products.name,
      defaultVariantId: schema.products.defaultVariantId,
      price: sql<string>`MIN(${schema.productVariants.price})`.as('price'),
      image: sql<string>`(
        SELECT url FROM ${schema.productImages}
        WHERE product_id = ${schema.products.id}
        ORDER BY sort_order
        LIMIT 1
      )`.as('image'),
    })
    .from(schema.products)
    .leftJoin(schema.productVariants, eq(schema.products.id, schema.productVariants.productId))
    .where(
      and(
        eq(schema.products.isPublished, true),
        not(eq(schema.products.id, productId)),
        or(
          currentProduct.categoryId ? eq(schema.products.categoryId, currentProduct.categoryId) : sql`false`,
          currentProduct.brandId ? eq(schema.products.brandId, currentProduct.brandId) : sql`false`
        )
      )
    )
    .groupBy(schema.products.id)
    .limit(4);

  // Filter out any products that didn't have a valid image URL or price
  const validRecommendedProducts = recommendedProductsData.filter(p => p.image && p.price);

  return validRecommendedProducts.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price!,
      image: p.image!,
      defaultVariantId: p.defaultVariantId || undefined,
  }));
}