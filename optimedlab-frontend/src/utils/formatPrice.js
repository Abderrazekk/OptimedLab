// src/utils/formatPrice.js
/**
 * Format a number as Tunisian Dinar (TND) with three decimals, symbol first.
 * @param {number|string} value - The amount to format.
 * @returns {string} Formatted price, e.g. "TND 123.450"
 */
export const formatPrice = (value) => {
  if (value === null || value === undefined || isNaN(value)) return 'TND 0.000';
  return `TND ${Number(value).toFixed(3)}`;
};