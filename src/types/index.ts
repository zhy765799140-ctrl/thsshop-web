export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  detailImage: string;
  description: string;
  sizes: string[];
  colors: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'paid' | 'shipped';
  buyerPhone: string;
  buyerName: string;
  createdAt: string;
  paymentProof?: string;
  remark?: string;
}
