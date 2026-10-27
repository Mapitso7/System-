import { LOW_STOCK_LIMIT } from '../hooks.js';

export default function StockBadge({ quantity }) {
  if (quantity === 0) return <span className="badge badge-out">Out of stock</span>;
  if (quantity < LOW_STOCK_LIMIT) return <span className="badge badge-low">Low stock</span>;
  return <span className="badge badge-ok">Available</span>;
}
