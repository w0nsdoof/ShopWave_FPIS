import type { Category } from "@/types"
import type { Product } from "@/types"
import { handleApiError } from "./error-utils"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

// No longer using mock data - removed mockCategories as we now rely on the API
// If needed for reference, the category structure is as follows:
/*
  {
    id: 1,
    name: "Electronics",
    parent: null,
    subcategories: [
      {
        id: 5,
        name: "Smartphones",
        parent: 1,
        subcategories: []
      },
      {
        id: 6,
        name: "Laptops",
        parent: 1,
        subcategories: []
      }
    ]
  },
  {
    id: 2,
    name: "Accessories",
    parent: null,
    subcategories: []
  },
  {
    id: 3,
    name: "Clothing",
    parent: null,
    subcategories: [
      {
        id: 7,
        name: "Men's Clothing",
        parent: 3,
        subcategories: []
      },
      {
        id: 8,
        name: "Women's Clothing",
        parent: 3,
        subcategories: []
      }
    ]
  },
  {
    id: 4,
    name: "Home & Kitchen",
    parent: null,
    subcategories: []
  }
]

// Sample product data structure (for reference only)
/*
  1: [
    {
      id: 101,
      name: "General Electronics Item",
      description: "A general electronics product",
      price: "99.99",
      stock_quantity: 50,
      category_id: 1,
      created_at: "2023-01-15T10:30:00Z",
      updated_at: "2023-01-15T10:30:00Z"
    }
  ],
  5: [
    {
      id: 102,
      name: "Google Pixel 7",
      description: "Latest smartphone from Google",
      price: "599.99",
      stock_quantity: 25,
      category_id: 5,
      created_at: "2023-01-15T10:30:00Z",
      updated_at: "2023-01-15T10:30:00Z"
    },
    {
      id: 103,
      name: "iPhone 14",
      description: "Apple's flagship smartphone",
      price: "799.99",
      stock_quantity: 15,
      category_id: 5,
      created_at: "2023-01-15T10:30:00Z",
      updated_at: "2023-01-15T10:30:00Z"
    }
  ],
  6: [
    {
      id: 104,
      name: "MacBook Pro M2",
      description: "Powerful laptop with Apple Silicon",
      price: "1299.99",
      stock_quantity: 10,
      category_id: 6,
      created_at: "2023-01-15T10:30:00Z",
      updated_at: "2023-01-15T10:30:00Z"
    }
  ]
}
*/

export async function getCategories() {
  try {
    const response = await fetch(`${API_URL}/api/categories/`)
    if (!response.ok) throw new Error('Failed to fetch categories')
    return await response.json()
  } catch (error) {
    handleApiError(error, {
      customMessage: "Could not retrieve categories. Please try again later."
    })
    throw error
  }
}

export async function getCategory(id: number) {
  try {
    // Attempt to fetch a specific category from the API
    const response = await fetch(`${API_URL}/api/categories/${id}/`)
    if (!response.ok) throw new Error('Failed to fetch category')
    return await response.json()
  } catch (error) {
    handleApiError(error, {
      customMessage: "Could not retrieve category details. Please try again later."
    })
    throw error
  }
}

export async function getCategorySubcategories(id: number) {
  try {
    // Use the specific endpoint for subcategories
    const response = await fetch(`${API_URL}/api/categories/${id}/subcategories/`)
    if (!response.ok) throw new Error('Failed to fetch subcategories')
    return await response.json()
  } catch (error) {
    handleApiError(error, {
      customMessage: "Could not retrieve subcategories. Please try again later."
    })
    throw error
  }
}

export async function getCategoryProducts(id: number) {
  try {
    // Use the specific endpoint for products in a category hierarchy
    const response = await fetch(`${API_URL}/api/categories/${id}/products/`)
    if (!response.ok) throw new Error('Failed to fetch category products')
    return await response.json()
  } catch (error) {
    handleApiError(error, {
      customMessage: "Could not retrieve products for this category. Please try again later."
    })
    throw error
  }
}


