export const usd = (value: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value);

export const sol = (value: number): string => `${value.toFixed(4)} SOL`;

export const shortAddress = (value: string): string => `${value.slice(0, 4)}...${value.slice(-4)}`;

export const humanAge = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remMin = minutes % 60;
  return `${hours}h ${remMin}m`;
};
