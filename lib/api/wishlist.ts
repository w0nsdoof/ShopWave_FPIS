import type { WishlistItem } from "@/types"
import { getProduct } from "./products"
import { handleApiError } from "./error-utils"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

export async function getWishlist() {
  try {
    // Attempt to fetch the wishlist from the API
    const response = await fetch(`${API_URL}/wishlist/`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    })
    if (!response.ok) throw new Error('Failed to fetch wishlist from the API')
    return await response.json()
  } catch (error) {
    handleApiError(error, {
      customMessage: "Could not retrieve your wishlist. Please try again later."
    })
    throw error
  }
}

export async function addItemToWishlist(productId: number) {
  try {
    // Attempt to add an item to the wishlist via the API
    const response = await fetch(`${API_URL}/wishlist/add_item/`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ product_id: productId }),
    })
    if (!response.ok) throw new Error('Failed to add item to wishlist')
    return await response.json()
  } catch (error) {
    handleApiError(error, {
      customMessage: "Could not add item to wishlist. Please try again later."
    })
    throw error
  }
}

export async function removeWishlistItem(productId: number) {
  try {
    // Attempt to remove an item from the wishlist via the API
    const response = await fetch(`${API_URL}/wishlist/remove_item/`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ product_id: productId }),
    })
    if (!response.ok) throw new Error('Failed to remove item from wishlist')
    return await response.json()
  } catch (error) {
    handleApiError(error, {
      customMessage: "Could not remove item from wishlist. Please try again later."
    })
    throw error
  }
}
