'use server';

import { db } from '@/db';
import * as schema from '@/lib/db/schema';
import { and, asc, desc, eq, gte, lte, inArray, sql, count, min, SQL, isNull } from 'drizzle-orm';
import { ProductFilters } from '@/lib/utils/query';

export async function getAllProducts(filters: ProductFilters) {
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
        const genderIds = db.select({ id: schema.genders.id }).from(schema.genders).where(inArray(schema.genders.name, filters.gender));
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

    let imagesQuery;
    if (filters.color?.length) {
        const colorIds = await db.select({ id: schema.colors.id }).from(schema.colors).where(inArray(schema.colors.name, filters.color));
        const variantIds = await db.select({ id: schema.productVariants.id }).from(schema.productVariants).where(and(
            inArray(schema.productVariants.productId, ids),
            inArray(schema.productVariants.colorId, colorIds.map(c => c.id))
        ));
        imagesQuery = db.select().from(schema.productImages).where(
            and(
                inArray(schema.productImages.productId, ids),
                inArray(schema.productImages.variantId, variantIds.map(v => v.id))
            )
        ).orderBy(schema.productImages.sortOrder);
    } else {
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
        const prices = p.variants.map(v => parseFloat(v.price));
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

export async function getProduct(productId: string) {
    const product = await db.query.products.findFirst({
        where: eq(schema.products.id, productId),
        with: {
            brand: true,
            category: true,
            gender: true,
            variants: {
                with: {
                    color: true,
                    size: true,
                }
            },
            images: {
                orderBy: schema.productImages.sortOrder,
            },
        }
    });
    return product;
}
