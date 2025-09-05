import { TCart, TCartItem } from '@/lib/db/schema/carts';
import { TProduct } from '@/lib/db/schema/products';
import { TProductVariant } from '@/lib/db/schema/variants';

export type CartItemWithProduct = TCartItem & {
  productVariant: TProductVariant & {
    product: TProduct;
  };
};

export type CartWithItems = TCart & {
  items: CartItemWithProduct[];
};
