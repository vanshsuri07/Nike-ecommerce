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
