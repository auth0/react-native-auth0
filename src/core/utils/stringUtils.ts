/**
 * Pure string utility functions with no external dependencies.
 * This avoids circular dependencies with models.
 */

/**
 * A helper that converts a single snake_case or kebab-case string to camelCase.
 * e.g., 'user_profile' -> 'userProfile'
 */
export function snakeToCamel(str: string): string {
  var parts = str.split('_').filter((part) => part.length > 0);
  if (parts.length === 0) return '';

  return parts.reduce(function (p, c, index) {
    if (index === 0) {
      return c.charAt(0).toLowerCase() + c.slice(1);
    }
    return p + c.charAt(0).toUpperCase() + c.slice(1);
  }, '');
}
