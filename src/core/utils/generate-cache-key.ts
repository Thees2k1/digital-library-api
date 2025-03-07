// export function generateCacheKey(
//   prefix: string,
//   params: Record<string, any>,
// ): string {
//   const filteredParams = Object.entries(params)
//     .filter(([_, value]) => value !== undefined && value !== null)
//     .reduce(
//       (acc, [key, value]) => {
//         if (Array.isArray(value)) {
//           acc[key] = value.join(',');
//         } else if (typeof value === 'object') {
//           acc[key] = JSON.stringify(value);
//         } else {
//           acc[key] = value;
//         }
//         return acc;
//       },
//       {} as Record<string, any>,
//     );

//   const queryString = Object.entries(filteredParams)
//     .map(([key, value]) => `${key}=${value}`)
//     .join('&');

//   return queryString ? `${prefix}:${queryString}` : prefix;
// }

export function generateCacheKey(
  prefix: string,
  params: Record<string, any>,
): string {
  // Filter out undefined or null params
  const filteredParams = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .reduce(
      (acc, [key, value]) => {
        acc[key] = value;
        return acc;
      },
      {} as Record<string, any>,
    );

  // Convert params to a query string
  const queryString = Object.entries(filteredParams)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  // Combine prefix and query string
  return queryString ? `${prefix}:${queryString}` : prefix;
}
