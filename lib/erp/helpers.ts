export const money = (n: number) =>
  new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(n || 0);

export const genId = (prefix: string) => `${prefix}${Math.floor(Math.random() * 1000000)}`;
