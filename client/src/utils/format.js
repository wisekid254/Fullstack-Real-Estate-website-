export const formatPrice = (price, type) => {
  if (price >= 1000000) {
    return `KES ${(price / 1000000).toFixed(1)}M`;
  }
  if (price >= 1000) {
    return `KES ${(price / 1000).toFixed(0)}K`;
  }
  return `KES ${price.toLocaleString()}`;
};

export const formatPriceWithType = (price, type) => {
  const base = formatPrice(price);
  return type === "rent" ? `${base}/mo` : base;
};

export const formatArea = (area) => `${area} m²`;

export const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
