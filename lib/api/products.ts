import type { Product } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ProductsParams {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  limit?: number;
}

// Mock data for development
const mockProducts: Product[] = [
  {
    id: 1,
    name: "Premium Headphones",
    description: "High-quality wireless headphones with noise cancellation.",
    price: "129.99",
    stock_quantity: 50,
    category_id: 1,
    created_at: "2023-01-15T10:30:00Z",
    updated_at: "2023-01-15T10:30:00Z",
  },
  {
    id: 2,
    name: "Smartphone Case",
    description: "Durable and stylish case for your smartphone.",
    price: "19.99",
    stock_quantity: 100,
    category_id: 2,
    created_at: "2023-01-16T11:45:00Z",
    updated_at: "2023-01-16T11:45:00Z",
  },
  {
    id: 3,
    name: "Wireless Charger",
    description: "Fast wireless charging pad compatible with all Qi-enabled devices.",
    price: "34.99",
    stock_quantity: 75,
    category_id: 1,
    created_at: "2023-01-17T09:15:00Z",
    updated_at: "2023-01-17T09:15:00Z",
  },
  {
    id: 4,
    name: "Bluetooth Speaker",
    description: "Portable speaker with excellent sound quality and long battery life.",
    price: "79.99",
    stock_quantity: 30,
    category_id: 1,
    created_at: "2023-01-18T14:20:00Z",
    updated_at: "2023-01-18T14:20:00Z",
  },
];

export async function getProducts(params: ProductsParams = {}) {
  try {
    const response = await fetch(`${API_URL}/api/products/`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn("API failed, using mock data:", error);
    let filteredProducts = [...mockProducts];

    if (params.categoryId) {
      filteredProducts = filteredProducts.filter((p) => p.category_id === params.categoryId);
    }

    if (params.minPrice) {
      // @ts-ignore
      filteredProducts = filteredProducts.filter((p) => Number(p.price) >= params.minPrice);
    }

    if (params.maxPrice) {
      // @ts-ignore
      filteredProducts = filteredProducts.filter((p) => Number(p.price) <= params.maxPrice);
    }

    if (params.sortBy) {
      switch (params.sortBy) {
        case "price_asc":
          filteredProducts.sort((a, b) => Number(a.price) - Number(b.price));
          break;
        case "price_desc":
          filteredProducts.sort((a, b) => Number(b.price) - Number(a.price));
          break;
        case "newest":
          filteredProducts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          break;
      }
    }

    if (params.limit) {
      filteredProducts = filteredProducts.slice(0, params.limit);
    }

    return filteredProducts;
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
    console.warn(`API failed for product ID ${id}, using mock data:`, error);
    const product = mockProducts.find((p) => p.id === id);
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
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
    console.warn("API failed, using mock data for search:", error);
    if (!query) return [];
    const searchTerm = query.toLowerCase();
    return mockProducts.filter(
        (product) =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
    );
  }
}
