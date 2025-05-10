import type { Order } from "@/types"
import { getCart } from "./cart"
import { handleApiError } from "./error-utils"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

export async function getOrders() {
  try {
    // Attempt to fetch orders from the API
    const response = await fetch(`${API_URL}/api/orders/`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    })
    if (!response.ok) throw new Error('Failed to fetch orders')
    return await response.json()
  } catch (error) {
    handleApiError(error, {
      customMessage: "Could not retrieve your orders. Please try again later."
    })
    throw error
  }
}

export async function getOrder(orderId: number) {
  try {
    // Attempt to fetch a specific order from the API
    const response = await fetch(`${API_URL}/api/orders/${orderId}/`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    })
    if (!response.ok) throw new Error('Failed to fetch order')
    return await response.json()
  } catch (error) {
    handleApiError(error, {
      customMessage: "Could not retrieve order details. Please try again later."
    })
    throw error
  }
}

export async function createOrderFromCart() {
  try {
    // Attempt to create an order from the cart via the API
    const response = await fetch(`${API_URL}/api/orders/create_from_cart/`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    })
    if (!response.ok) throw new Error('Failed to create order from cart')
    return await response.json()
  } catch (error) {
    handleApiError(error, {
      customMessage: "Could not create your order. Please try again later."
    })
    throw error
  }
}

export async function cancelOrder(orderId: number) {
  try {
    // Attempt to cancel the order via the API
    const response = await fetch(`${API_URL}/api/orders/${orderId}/cancel_order/`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ order_id: orderId }),
    })
    if (!response.ok) throw new Error('Failed to cancel order')
    return await response.json()
  } catch (error) {
    handleApiError(error, {
      customMessage: "Could not cancel your order. Please try again later."
    })
    throw error
  }
}
