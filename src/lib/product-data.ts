import { StaticImageData } from 'next/image';
import shoe1 from '/public/shoes/shoe-1.jpg';
import shoe2 from '/public/shoes/shoe-2.webp';
import shoe3 from '/public/shoes/shoe-3.webp';
import shoe4 from '/public/shoes/shoe-4.webp';
import shoe5 from '/public/shoes/shoe-5.avif';
import shoe6 from '/public/shoes/shoe-6.avif';
import shoe7 from '/public/shoes/shoe-7.avif';
import shoe8 from '/public/shoes/shoe-8.avif';




export interface ProductVariant {
  color: string;
  colorCode: string;
  images: (StaticImageData | string)[];
}

export interface ProductDetail {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  description: string;
  specs: string;
  variants: ProductVariant[];
  sizes: string[];
  reviews: {
    rating: number;
    count: number;
  };
}

export const products: ProductDetail[] = [
  {
    id: 1,
    name: 'Nike Air Max 270',
    price: 150,
    originalPrice: 200,
    discount: '25% off',
    description:
      'The Nike Air Max 270 delivers visible cushioning under every step. Updated for modern comfort, it pays homage to the original 1991 Air Max 180 with its exaggerated tongue top and heritage tongue logo.',
    specs: 'Shown: Black/White/Solar Red\nStyle: AH8050-002',
    variants: [
      {
        color: 'Red',
        colorCode: '#ff0000',
        images: [shoe1, shoe2, shoe3, shoe4],
      },
      {
        color: 'Blue',
        colorCode: '#0000ff',
        images: [shoe5, shoe6, shoe7, shoe8],
      },
    ],
    sizes: ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '12'],
    reviews: {
      rating: 4.5,
      count: 120,
    },
  },
  {
    id: 2,
    name: 'Nike Zoom Fly 5',
    price: 170,
    description: 'Bridge the gap between your weekend training run and race day in a durable design you can deploy in the starting corral of your favorite 5K and for months after your conquest.',
    specs: 'Shown: White/Black/Volt\nStyle: DM8968-100',
    variants: [
        {
            color: 'Green',
            colorCode: '#00ff00',
            images: [shoe5, shoe6, shoe7, shoe8],
        },
        {
            color: 'Orange',
            colorCode: '#ffa500',
            images: [shoe1, shoe2, shoe3, shoe4],
        }
    ],
    sizes: ['8', '8.5', '9', '9.5', '10', '10.5', '11'],
    reviews: {
        rating: 4.8,
        count: 88
    }
  }
];
