import type { Review } from "@/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Mock data for development
const mockReviews: Record<number, Review[]> = {
  1: [
    {
      id: 1,
      product: 1,
      user: 1,
      rating: 8,
      comment: "Great product! I love the sound quality and comfort.",
      created_at: "2023-02-10T14:30:00Z",
    },
    {
      id: 2,
      product: 1,
      user: 2,
      rating: 7,
      comment: "Good value for money. Battery life could be better though.",
      created_at: "2023-02-15T09:45:00Z",
    },
  ],
}

export async function getReviews(productId: number) {
  try {
    // Attempt to fetch from API
    const response = await fetch(`${API_URL}/api/products/${productId}/reviews/`)
    if (!response.ok) throw new Error('Failed to fetch reviews from the API')
    return await response.json()
  } catch (error) {
    console.warn('Using mock reviews due to an error:', error)
    // Use mock data if the API call fails
    return mockReviews[productId] || []
  }
}

export async function createReview(productId: number, data: { rating: number; comment: string }) {
  try {
    // Attempt to create review via API
    const response = await fetch(`${API_URL}/api/products/${productId}/reviews/`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create review')
    return await response.json()
  } catch (error) {
    console.warn('Using mock review creation due to an error:', error)
    // Create review in mock data if API fails
    if (!mockReviews[productId]) {
      mockReviews[productId] = []
    }

    const newReview: Review = {
      id: Date.now(),
      product: productId,
      user: 1, // Current user
      rating: data.rating,
      comment: data.comment,
      created_at: new Date().toISOString(),
    }

    mockReviews[productId].unshift(newReview)
    return newReview
  }
}

export async function updateReview(productId: number, reviewId: number, data: { rating: number; comment: string }) {
  try {
    // Attempt to update review via API
    const response = await fetch(`${API_URL}/api/products/${productId}/reviews/${reviewId}/`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update review')
    return await response.json()
  } catch (error) {
    console.warn('Using mock review update due to an error:', error)

    // Update review in mock data if API fails
    if (!mockReviews[productId]) {
      throw new Error("Product not found")
    }

    const reviewIndex = mockReviews[productId].findIndex((r) => r.id === reviewId)

    if (reviewIndex === -1) {
      throw new Error("Review not found")
    }

    mockReviews[productId][reviewIndex] = {
      ...mockReviews[productId][reviewIndex],
      rating: data.rating,
      comment: data.comment,
      updated_at: new Date().toISOString(),
    }

    return mockReviews[productId][reviewIndex]
  }
}

export async function deleteReview(productId: number, reviewId: number) {
  try {
    // Attempt to delete review via API
    const response = await fetch(`${API_URL}/api/products/${productId}/reviews/${reviewId}/`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    })
    if (!response.ok) throw new Error('Failed to delete review')
    return await response.json()
  } catch (error) {
    console.warn('Using mock review deletion due to an error:', error)

    // Delete review from mock data if API fails
    if (!mockReviews[productId]) {
      throw new Error("Product not found")
    }

    mockReviews[productId] = mockReviews[productId].filter((r) => r.id !== reviewId)

    return { message: "Review deleted successfully." }
  }
}
