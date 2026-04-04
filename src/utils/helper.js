/**
 * Format number to INR currency
 */
export const formatINR = (amount) => {
  if (typeof amount !== "number") return "₹0";
  return `₹${amount.toLocaleString("en-IN")}`;
};

/**
 * Resolve an image URL stored by the backend.
 * Paths like "/uploads/cars/xxx.jpg" are served by Express, not Vite.
 * In development the Vite proxy handles it; in production the helper
 * prepends the backend origin so the browser always finds the file.
 */
const API_ORIGIN = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api'
).replace(/\/api\/?$/, '');

export const getImageUrl = (path) => {
  if (!path) return null;
  // Already absolute (http/https/blob/data)
  if (/^https?:\/\/|^blob:|^data:/.test(path)) return path;
  // Relative path — prepend backend origin
  return `${API_ORIGIN}${path.startsWith('/') ? '' : '/'}${path}`;
};



/**
 * Calculate rental price based on days
 */
export const calculateRentalPrice = (pricePerDay, days) => {
  if (days < 1) return 0;
  return pricePerDay * days;
};

/**
 * Calculate total cart value
 */
export const calculateCartTotals = (cartItems) => {
  const rentalTotal = cartItems.reduce(
    (sum, item) => sum + item.pricePerDay * item.rentalDays,
    0
  );

  const depositTotal = cartItems.reduce(
    (sum, item) => sum + item.securityDeposit,
    0
  );

  return {
    rentalTotal,
    depositTotal,
    grandTotal: rentalTotal + depositTotal,
  };
};

/**
 * Get unique categories from products
 */
export const getUniqueCategories = (products) => {
  return ["All", ...new Set(products.map((p) => p.category))];
};

/**
 * Truncate long text for cards
 */
export const truncateText = (text, length = 80) => {
  if (!text) return "";
  return text.length > length ? `${text.slice(0, length)}...` : text;
};

/**
 * Simple debounce utility (for search later)
 */
export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};
