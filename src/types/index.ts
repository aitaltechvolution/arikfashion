export interface Product {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  images: string[];
  category: string;
  colors: string[];
  sizes: string[];
  lengths?: string[];
  stock: number;
  description: string;
  isNew?: boolean;
  isFeatured?: boolean;
  onSale?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  color: string;
  size: string;
  length?: string;
}

export interface WishlistItem {
  product: Product;
}
