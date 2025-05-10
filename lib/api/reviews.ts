import type { Review } from "@/types"
import { handleApiError } from "./error-utils"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

// Removed mock data - we now use real API data with proper error handling
// Reviews structure (for reference only):
/*
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
*/

export async function getReviews(productId: number) {
  try {
    // Attempt to fetch from API
    const response = await fetch(`${API_URL}/products/${productId}/reviews/`)
    if (!response.ok) throw new Error('Failed to fetch reviews from the API')
    return await response.json()
  } catch (error) {
    handleApiError(error, {
      customMessage: "Could not load reviews. Please try again later."
    })
    throw error
  }
}

export async function createReview(productId: number, data: { rating: number; comment: string }) {
  try {
    // Attempt to create review via API
    const response = await fetch(`${API_URL}/products/${productId}/reviews/`, {
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
    handleApiError(error, {
      customMessage: "Could not submit your review. Please try again later."
    })
    throw error
  }
}

export async function updateReview(productId: number, reviewId: number, data: { rating: number; comment: string }) {
  try {
    // Attempt to update review via API
    const response = await fetch(`${API_URL}/products/${productId}/reviews/${reviewId}/`, {
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
    handleApiError(error, {
      customMessage: "Could not update your review. Please try again later."
    })
    throw error
  }
}

export async function deleteReview(productId: number, reviewId: number) {
  try {
    // Attempt to delete review via API
    const response = await fetch(`${API_URL}/products/${productId}/reviews/${reviewId}/`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    })
    if (!response.ok) throw new Error('Failed to delete review')
    return await response.json()
  } catch (error) {
    handleApiError(error, {
      customMessage: "Could not delete your review. Please try again later."
    })
    throw error
  }
}
