export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  first_name: string
  last_name: string
}

export interface Product {
  id: number
  name: string
  description: string
  price: string
  stock_quantity: number
  category_id: number
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  name: string
  parent_id: number | null
  created_at: string
  updated_at: string
}

export interface CartItem {
  id: number
  product: Product
  quantity: number
  subtotal: number
}

export interface WishlistItem {
  id: number
  product: Product
  created_at: string
}

export interface OrderItem {
  id: number
  product: Product
  quantity: number
  subtotal: number
}

export interface Order {
  id: number
  user: number
  order_status: string
  total_amount: string
  items: OrderItem[]
  total_items: number
  created_at: string
  updated_at: string
}

export interface Review {
  id: number
  product: number
  user: number
  rating: number
  comment: string
  created_at: string
  updated_at?: string
}

