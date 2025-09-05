import { TProduct as TProductSchema } from "@/lib/db/schema/products";
import { TProductVariant as TProductVariantSchema } from "@/lib/db/schema/variants";
import { TBrand as TBrandSchema } from "@/lib/db/schema/brands";
import { TProductImage as TProductImageSchema } from "@/lib/db/schema/product-images";
import { TSize as TSizeSchema } from "@/lib/db/schema/filters/sizes";

export type TProduct = TProductSchema;
export type TProductVariant = TProductVariantSchema;
export type TBrand = TBrandSchema;
export type TProductImage = TProductImageSchema;
export type TSize = TSizeSchema;

export type TProductWithVariants = TProduct & {
    brand: TBrand;
    images: TProductImage[];
    variants: (TProductVariant & {
        size: TSize;
    })[];
};
