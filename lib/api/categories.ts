import type { Category } from "@/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Mock data for development
const mockCategories: Category[] = [
  {
    id: 1,
    name: "Electronics",
    parent_id: null,
    created_at: "2023-01-10T08:00:00Z",
    updated_at: "2023-01-10T08:00:00Z",
  },
  {
    id: 2,
    name: "Accessories",
    parent_id: null,
    created_at: "2023-01-10T08:05:00Z",
    updated_at: "2023-01-10T08:05:00Z",
  },
  {
    id: 3,
    name: "Clothing",
    parent_id: null,
    created_at: "2023-01-10T08:10:00Z",
    updated_at: "2023-01-10T08:10:00Z",
  },
  {
    id: 4,
    name: "Home & Kitchen",
    parent_id: null,
    created_at: "2023-01-10T08:15:00Z",
    updated_at: "2023-01-10T08:15:00Z",
  },
  {
    id: 5,
    name: "Smartphones",
    parent_id: 1,
    created_at: "2023-01-10T08:20:00Z",
    updated_at: "2023-01-10T08:20:00Z",
  },
  {
    id: 6,
    name: "Laptops",
    parent_id: 1,
    created_at: "2023-01-10T08:25:00Z",
    updated_at: "2023-01-10T08:25:00Z",
  },
]

export async function getCategories() {
  try {
    const response = await fetch(`${API_URL}/api/categories/`)
    if (!response.ok) throw new Error('Failed to fetch categories')
    return await response.json()
  } catch (error) {
    console.warn('Using mock categories due to an error:', error)
    return mockCategories  // Return mock data if API call fails
  }
}

export async function getCategory(id: number) {
  try {
    // Attempt to fetch a specific category from the API
    const response = await fetch(`${API_URL}/api/categories/${id}/`)
    if (!response.ok) throw new Error('Failed to fetch category')
    return await response.json()
  } catch (error) {
    console.warn('Using mock category due to an error:', error)
    // For development, use mock data
    const category = mockCategories.find((c) => c.id === id)
    if (!category) {
      throw new Error("Category not found")
    }
    return category
  }
}


