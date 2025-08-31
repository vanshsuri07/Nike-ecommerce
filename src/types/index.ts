export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string;
  image: string | null;
  category: string;
  colors: string;
  bestseller: boolean;
}
