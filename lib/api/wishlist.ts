import type { WishlistItem } from "@/types"
import { getProduct } from "./products"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Mock data for development
let mockWishlistItems: WishlistItem[] = []

export async function getWishlist() {
  try {
    // Attempt to fetch the wishlist from the API
    const response = await fetch(`${API_URL}/api/wishlist/`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    })
    if (!response.ok) throw new Error('Failed to fetch wishlist from the API')
    return await response.json()
  } catch (error) {
    console.warn('Using mock wishlist due to an error:', error)
    // Return mock wishlist data if API call fails
    return {
      id: 1,
      wishlist_items: mockWishlistItems,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }
}

export async function addItemToWishlist(productId: number) {
  try {
    // Attempt to add an item to the wishlist via the API
    const response = await fetch(`${API_URL}/api/wishlist/add_item/`, {
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
    console.warn('Using mock add item to wishlist due to an error:', error)

    // For development, add the item to the mock wishlist
    const product = await getProduct(productId)

    // Check if the product is already in the wishlist
    const existingItem = mockWishlistItems.find((item) => item.product.id === productId)

    if (existingItem) {
      return { message: "Product already in wishlist." }
    }

    const newItem: WishlistItem = {
      id: Date.now(),
      product,
      created_at: new Date().toISOString(),
    }

    mockWishlistItems.push(newItem)

    return { message: "Product added to wishlist." }
  }
}

export async function removeWishlistItem(productId: number) {
  try {
    // Attempt to remove an item from the wishlist via the API
    const response = await fetch(`${API_URL}/api/wishlist/remove_item/`, {
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
    console.warn('Using mock remove item from wishlist due to an error:', error)

    // For development, remove the item from the mock wishlist
    mockWishlistItems = mockWishlistItems.filter((item) => item.product.id !== productId)

    return { message: "Product removed from wishlist." }
  }
}
