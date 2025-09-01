export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  gender: 'Men' | 'Women' | 'Unisex';
  category: 'Lifestyle' | 'Running' | 'Basketball';
  colors: string[];
  sizes: number[];
  isNew: boolean;
  isBestSeller: boolean;
  createdAt: Date;
};

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Nike Air Max 90',
    price: 120,
    image: '/shoes/shoe-1.jpg',
    gender: 'Men',
    category: 'Lifestyle',
    colors: ['Black', 'White', 'Red'],
    sizes: [8, 9, 10, 11],
    isNew: true,
    isBestSeller: true,
    createdAt: new Date('2024-07-20T10:00:00Z'),
  },
  {
    id: '2',
    name: 'Nike Air Force 1',
    price: 100,
    image: '/shoes/shoe-2.webp',
    gender: 'Unisex',
    category: 'Lifestyle',
    colors: ['White', 'Black'],
    sizes: [7, 8, 9, 10, 11, 12],
    isNew: false,
    isBestSeller: false,
    createdAt: new Date('2024-06-15T10:00:00Z'),
  },
  {
    id: '3',
    name: 'Nike Zoom Pegasus 40',
    price: 130,
    image: '/shoes/shoe-3.webp',
    gender: 'Women',
    category: 'Running',
    colors: ['Blue', 'Green'],
    sizes: [6, 7, 8, 9],
    isNew: true,
    isBestSeller: false,
    createdAt: new Date('2024-07-22T10:00:00Z'),
  },
  {
    id: '4',
    name: 'Nike Dunk Low',
    price: 110,
    image: '/shoes/shoe-4.webp',
    gender: 'Unisex',
    category: 'Lifestyle',
    colors: ['Gray', 'White'],
    sizes: [8, 9, 10],
    isNew: false,
    isBestSeller: true,
    createdAt: new Date('2024-05-10T10:00:00Z'),
  },
  {
    id: '5',
    name: 'Nike LeBron XX',
    price: 200,
    image: '/shoes/shoe-5.avif',
    gender: 'Men',
    category: 'Basketball',
    colors: ['Black', 'Red'],
    sizes: [10, 11, 12, 13],
    isNew: true,
    isBestSeller: false,
    createdAt: new Date('2024-07-18T10:00:00Z'),
  },
  {
    id: '6',
    name: 'Nike React Infinity Run',
    price: 160,
    image: '/shoes/shoe-6.avif',
    gender: 'Women',
    category: 'Running',
    colors: ['White', 'Pink'],
    sizes: [7, 8, 9],
    isNew: false,
    isBestSeller: true,
    createdAt: new Date('2024-04-01T10:00:00Z'),
  },
  {
    id: '7',
    name: 'Nike Blazer Mid \'77',
    price: 105,
    image: '/shoes/shoe-7.avif',
    gender: 'Unisex',
    category: 'Lifestyle',
    colors: ['White', 'Blue'],
    sizes: [8, 9, 10, 11],
    isNew: false,
    isBestSeller: false,
    createdAt: new Date('2024-03-12T10:00:00Z'),
  },
  {
    id: '8',
    name: 'Nike Air Zoom G.T. Cut',
    price: 170,
    image: '/shoes/shoe-8.avif',
    gender: 'Men',
    category: 'Basketball',
    colors: ['Green', 'Black'],
    sizes: [9, 10, 11],
    isNew: true,
    isBestSeller: false,
    createdAt: new Date('2024-07-25T10:00:00Z'),
  },
];

export const GENDERS = ['Men', 'Women', 'Unisex'];
export const SIZES = [6, 7, 8, 9, 10, 11, 12, 13];
export const COLORS = ['Black', 'White', 'Red', 'Blue', 'Green', 'Gray', 'Pink'];
export const CATEGORIES = ['Lifestyle', 'Running', 'Basketball'];

interface GetProductsParams {
  gender?: string | string[];
  size?: string | string[];
  color?: string | string[];
  sort?: string;
}

export const getProducts = (params: GetProductsParams) => {
  let products = [...mockProducts];

  // Filtering
  if (params.gender) {
    const genders = Array.isArray(params.gender) ? params.gender : params.gender.split(',');
    products = products.filter(p => genders.includes(p.gender));
  }
  if (params.color) {
    const colors = Array.isArray(params.color) ? params.color : params.color.split(',');
    products = products.filter(p => p.colors.some(c => colors.includes(c)));
  }
  if (params.size) {
    const sizes = (Array.isArray(params.size) ? params.size : params.size.split(',')).map(Number);
    products = products.filter(p => p.sizes.some(s => sizes.includes(s)));
  }

  // Sorting
  switch (params.sort) {
    case 'newest':
      products.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      break;
    case 'price_asc':
      products.sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      products.sort((a, b) => b.price - a.price);
      break;
    default:
      // Default sort or featured
      products.sort((a, b) => (b.isBestSeller ? 1 : -1));
      break;
  }

  return products;
};
