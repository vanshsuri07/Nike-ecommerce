import queryString from 'query-string';

interface UrlQueryParams {
  params: string;
  key: string;
  value: string | null;
}

export const formUrlQuery = ({ params, key, value }: UrlQueryParams) => {
  const currentUrl = queryString.parse(params);

  if (value === null || value === '') {
    delete currentUrl[key];
  } else {
    currentUrl[key] = value;
  }

  return queryString.stringifyUrl(
    { url: window.location.pathname, query: currentUrl },
    { skipNull: true },
  );
};

interface RemoveUrlQueryParams {
  params: string;
  keysToRemove: string[];
}

export const removeKeysFromQuery = ({ params, keysToRemove }: RemoveUrlQueryParams) => {
  const currentUrl = queryString.parse(params);

  keysToRemove.forEach((key) => {
    delete currentUrl[key];
  });

  return queryString.stringifyUrl(
    { url: window.location.pathname, query: currentUrl },
    { skipNull: true },
  );
};

// New code for product filtering

export interface ProductFilters {
  search?: string;
  category?: string[];
  brand?: string[];
  gender?: string[];
  color?: string[];
  size?: string[];
  priceMin?: number;
  priceMax?: number;
  sortBy?: 'latest' | 'price_asc' | 'price_desc';
  page: number;
  limit: number;
}

export const parseFilterParams = (
  searchParams: { [key:string]: string | string[] | undefined }
): ProductFilters => {
  const getValues = (value: string | string[] | undefined) =>
    value ? (Array.isArray(value) ? value : value.split(',')) : undefined;

  const priceRange = searchParams.price ? String(searchParams.price).split('-') : [];

  return {
    search: searchParams.search ? String(searchParams.search) : undefined,
    category: getValues(searchParams.category),
    brand: getValues(searchParams.brand),
    gender: getValues(searchParams.gender),
    color: getValues(searchParams.color),
    size: getValues(searchParams.size),
    priceMin: searchParams.priceMin ? Number(searchParams.priceMin) : (priceRange[0] ? Number(priceRange[0]) : undefined),
    priceMax: searchParams.priceMax ? Number(searchParams.priceMax) : (priceRange[1] ? Number(priceRange[1]) : undefined),
    sortBy: (searchParams.sortBy as ProductFilters['sortBy']) || 'latest',
    page: searchParams.page ? parseInt(String(searchParams.page), 10) : 1,
    limit: searchParams.limit ? parseInt(String(searchParams.limit), 10) : 12,
  };
};
