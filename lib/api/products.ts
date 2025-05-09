import type { Product } from "@/types";
import { handleApiError } from "./error-utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ProductsParams {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  limit?: number;
}

// Removed mock data - we now use real API data with proper error handling
// Products structure (for reference only):
/*
  {
    id: 1,
    name: "Premium Headphones",
    description: "High-quality wireless headphones with noise cancellation.",
    price: "129.99",
    stock_quantity: 50,
    category_id: 5, // Updated to match "Smartphones" under "Electronics"
    created_at: "2023-01-15T10:30:00Z",
    updated_at: "2023-01-15T10:30:00Z",
  },
  {
    id: 2,
    name: "Smartphone Case",
    description: "Durable and stylish case for your smartphone.",
    price: "19.99",
    stock_quantity: 100,
    category_id: 5, // Updated to match "Smartphones"
    created_at: "2023-01-16T11:45:00Z",
    updated_at: "2023-01-16T11:45:00Z",
  },
  {
    id: 3,
    name: "Wireless Charger",
    description: "Fast wireless charging pad compatible with all Qi-enabled devices.",
    price: "34.99",
    stock_quantity: 75,
    category_id: 5, // Updated to match "Smartphones"
    created_at: "2023-01-17T09:15:00Z",
    updated_at: "2023-01-17T09:15:00Z",
  },
  {
    id: 4,
    name: "Bluetooth Speaker",
    description: "Portable speaker with excellent sound quality and long battery life.",
    price: "79.99",
    stock_quantity: 30,
    category_id: 1, // Updated to match "Electronics" parent category
    created_at: "2023-01-18T14:20:00Z",
    updated_at: "2023-01-18T14:20:00Z",
  },
  // Adding new products for other categories
  {
    id: 5,
    name: "MacBook Pro",
    description: "Powerful laptop for professionals.",
    price: "1299.99",
    stock_quantity: 15,
    category_id: 6, // Laptops category
    created_at: "2023-01-19T08:30:00Z",
    updated_at: "2023-01-19T08:30:00Z",
  },
  {
    id: 6,
    name: "Cotton T-Shirt",
    description: "Comfortable everyday t-shirt.",
    price: "24.99",
    stock_quantity: 200,
    category_id: 7, // Men's Clothing
    created_at: "2023-01-20T10:15:00Z",
    updated_at: "2023-01-20T10:15:00Z",
  },
  {
    id: 7,
    name: "Summer Dress",
    description: "Light and breezy summer dress.",
    price: "49.99",
    stock_quantity: 75,
    category_id: 8, // Women's Clothing
    created_at: "2023-01-21T11:20:00Z",
    updated_at: "2023-01-21T11:20:00Z",
  },
  {
    id: 8,
    name: "Coffee Maker",
    description: "Automatic drip coffee machine.",
    price: "89.99",
    stock_quantity: 40,
    category_id: 4, // Home & Kitchen
    created_at: "2023-01-22T14:45:00Z",
    updated_at: "2023-01-22T14:45:00Z",
  }
*/

export async function getProducts(params: ProductsParams = {}) {
  try {
    const response = await fetch(`${API_URL}/api/products/`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    handleApiError(error, {
      customMessage: "Could not retrieve products. Please try again later."
    });
    throw error;
  }
}

export async function getProduct(id: number) {
  try {
    const response = await fetch(`${API_URL}/api/products/${id}/`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    handleApiError(error, {
      customMessage: "Could not retrieve product details. Please try again later."
    });
    throw error;
  }
}

export async function searchProducts(query: string) {
  try {
    const response = await fetch(`${API_URL}/api/products/?search=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    handleApiError(error, {
      customMessage: "Search is currently unavailable. Please try again later."
    });
    throw error;
  }
}
