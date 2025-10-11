/**
 * A private helper that converts a single snake_case or kebab-case string to camelCase.
 * e.g., 'user_profile' -> 'userProfile'
 */
function snakeToCamel(str: string): string {
  var parts = str.split('_').filter((part) => part.length > 0);
  if (parts.length === 0) return '';

  return parts.reduce(function (p, c, index) {
    if (index === 0) {
      return c.charAt(0).toLowerCase() + c.slice(1);
    }
    return p + c.charAt(0).toUpperCase() + c.slice(1);
  }, '');
}

/**
 * Recursively traverses an object or an array and converts all keys from
 * snake_case to camelCase.
 *
 * @param data The object or array to be transformed.
 * @returns A new object or array with all keys in camelCase.
 */
function deepCamelCase<T>(data: any): T {
  if (Array.isArray(data)) {
    return data.map((v) => deepCamelCase(v)) as T;
  }
  if (data && typeof data === 'object' && data.constructor === Object) {
    const newObj: { [key: string]: any } = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const camelKey = snakeToCamel(key);
        newObj[camelKey] = deepCamelCase(data[key]);
      }
    }
    return newObj as T;
  }
  return data as T;
}

/**
 * Converts a JavaScript object into a URL-encoded query string.
 *
 * @remarks
 * Keys with `null` or `undefined` values are ignored.
 *
 * @example
 * ```
 * toUrlQueryParams({ a: 1, b: 'hello world' })
 * // returns "a=1&b=hello%20world"
 * ```
 *
 * @param params The object of parameters to convert.
 * @returns A URL-encoded query string.
 */
function toUrlQueryParams(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  for (const key in params) {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      const value = params[key];
      if (value !== null && value !== undefined) {
        searchParams.append(key, String(value));
      }
    }
  }
  return searchParams.toString();
}

// Export all functions at the end
export { snakeToCamel, deepCamelCase, toUrlQueryParams };
