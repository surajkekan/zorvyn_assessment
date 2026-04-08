/**
 * Utility functions for consistent formatting across the application.
 */

/**
 * Formats a date string into a user-friendly format (e.g., "Apr 8, 2026").
 * @param {string} dateStr - ISO date string.
 * @returns {string} Formatted date.
 */
export const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    }).format(date);
};

/**
 * Formats a date string for charts (e.g., "8 Apr").
 * @param {string} dateStr - ISO date string.
 * @returns {string} Formatted date.
 */
export const formatChartDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'short'
    }).format(date);
};

/**
 * Formats a number as currency (e.g., "$1,234.56").
 * @param {number} amount - The amount to format.
 * @returns {string} Formatted currency.
 */
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};
