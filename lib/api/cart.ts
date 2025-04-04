import type { CartItem } from "@/types"
import { getProduct } from "./products"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Mock data for development
let mockCartItems: CartItem[] = []

// Helper function to handle API errors and fallback to mock
async function handleApiError<T>(apiCall: () => Promise<T>, fallbackData: T): Promise<T> {
  try {
    const response = await apiCall()
    return response
  } catch (error) {
    console.error("API call failed, falling back to mock:", error)
    return fallbackData
  }
}

// Get cart data (API or mock)
export async function getCart() {
  return handleApiError(async () => {
    const response = await fetch(`${API_URL}/api/carts/`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    })
    return response.json()
  }, {
    id: 1,
    user: 1,
    cart_items: mockCartItems,
    total_items: mockCartItems.reduce((sum, item) => sum + item.quantity, 0),
    total_price: mockCartItems.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })
}

// Create a new cart (API or mock)
export async function createCart() {
  return handleApiError(async () => {
    const response = await fetch(`${API_URL}/api/carts/`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    })
    return response.json()
  }, {
    id: 1,
    user: 1,
    cart_items: [],
    total_items: 0,
    total_price: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })
}

// Add item to cart (API or mock)
export async function addItemToCart(productId: number, quantity: number) {
  return handleApiError(async () => {
    const response = await fetch(`${API_URL}/api/carts/add_item/`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ product_id: productId, quantity }),
    })
    return response.json()
  }, async () => {
    const product = await getProduct(productId)

    // Check if the product is already in the cart
    const existingItemIndex = mockCartItems.findIndex((item) => item.product.id === productId)

    if (existingItemIndex !== -1) {
      // Update quantity if the product is already in the cart
      mockCartItems[existingItemIndex].quantity += quantity
      return mockCartItems[existingItemIndex]
    } else {
      // Add new item if the product is not in the cart
      const newItem: CartItem = {
        id: Date.now(),
        product,
        quantity,
        subtotal: Number(product.price) * quantity,
      }

      mockCartItems.push(newItem)
      return newItem
    }
  })
}

// Update cart item (API or mock)
export async function updateCartItem(itemId: number, quantity: number) {
  return handleApiError(async () => {
    const response = await fetch(`${API_URL}/api/carts/update_item/`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cart_item_id: itemId, quantity }),
    })
    return response.json()
  }, async () => {
    const itemIndex = mockCartItems.findIndex((item) => item.id === itemId)

    if (itemIndex === -1) {
      throw new Error("Cart item not found")
    }

    mockCartItems[itemIndex].quantity = quantity
    mockCartItems[itemIndex].subtotal = Number(mockCartItems[itemIndex].product.price) * quantity

    return mockCartItems[itemIndex]
  })
}

// Remove item from cart (API or mock)
export async function removeCartItem(itemId: number) {
  return handleApiError(async () => {
    const response = await fetch(`${API_URL}/api/carts/remove_item/`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cart_item_id: itemId }),
    })
    return response.json()
  }, async () => {
    const itemIndex = mockCartItems.findIndex((item) => item.id === itemId)

    if (itemIndex === -1) {
      throw new Error("Cart item not found")
    }

    mockCartItems = mockCartItems.filter((item) => item.id !== itemId)

    return { message: "Item removed from cart." }
  })
}
