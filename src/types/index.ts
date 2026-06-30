export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  userId: string;
  createdAt: string;
  items: OrderItem[];
  total: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Address {
  street?: string;
  city?: string;
  department?: string;
}

export interface User {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  address?: Address;
  phone?: string;
}
