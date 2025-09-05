import { TCart, TCartItem } from '@/lib/db/schema/carts';
import { TProduct } from '@/lib/db/schema/products';
import { TProductImage } from '@/lib/db/schema/product-images';
import { TProductVariant } from '@/lib/db/schema/variants';

export type CartItemWithProduct = TCartItem & {
  productVariant: TProductVariant & {
    product: TProduct & {
      images: TProductImage[];
    };
  };
};

export type CartWithItems = TCart & {
  items: CartItemWithProduct[];
};
