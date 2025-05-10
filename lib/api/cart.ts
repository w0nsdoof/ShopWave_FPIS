import type { CartItem } from "@/types"
import { getProduct } from "./products"
import { handleApiError } from "./error-utils"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

// Get cart data
export async function getCart() {
  try {
    const response = await fetch(`${API_URL}/carts/`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch cart data')
    }
    
    return response.json()
  } catch (error) {
    handleApiError(error, { 
      customMessage: "Could not retrieve your cart. Please try again later."
    })
    throw error
  }
}

// Create a new cart
export async function createCart() {
  try {
    const response = await fetch(`${API_URL}/carts/`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    })
    
    if (!response.ok) {
      throw new Error('Failed to create cart')
    }
    
    return response.json()
  } catch (error) {
    handleApiError(error, { 
      customMessage: "Could not create your cart. Please try again later."
    })
    throw error
  }
}

// Add item to cart
export async function addItemToCart(productId: number, quantity: number) {
  try {
    const response = await fetch(`${API_URL}/carts/add_item/`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ product_id: productId, quantity }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to add item to cart')
    }
    
    return response.json()
  } catch (error) {
    handleApiError(error, { 
      customMessage: "Could not add the item to your cart. Please try again later."
    })
    throw error
  }
}

// Update cart item
export async function updateCartItem(itemId: number, quantity: number) {
  try {
    const response = await fetch(`${API_URL}/carts/update_item/`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cart_item_id: itemId, quantity }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to update cart item')
    }
    
    return response.json()
  } catch (error) {
    handleApiError(error, { 
      customMessage: "Could not update the item in your cart. Please try again later."
    })
    throw error
  }
}

// Remove item from cart
export async function removeCartItem(itemId: number) {
  try {
    const response = await fetch(`${API_URL}/carts/remove_item/`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cart_item_id: itemId }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to remove item from cart')
    }
    
    return response.json()
  } catch (error) {
    handleApiError(error, { 
      customMessage: "Could not remove the item from your cart. Please try again later."
    })
    throw error
  }
}
