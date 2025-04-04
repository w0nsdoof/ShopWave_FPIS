import type { Order } from "@/types"
import { getCart } from "./cart"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Mock data for development
const mockOrders: Order[] = []

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
    console.warn('Using mock orders due to an error:', error)
    // Return mock orders if API call fails
    return mockOrders
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
    console.warn('Using mock order due to an error:', error)
    // For development, use mock data
    const order = mockOrders.find((o) => o.id === orderId)
    if (!order) {
      throw new Error("Order not found")
    }
    return order
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
    console.warn('Using mock create order from cart due to an error:', error)

    // For development, create an order from the mock cart
    const cart = await getCart()

    if (cart.cart_items.length === 0) {
      throw new Error("Cart is empty")
    }

    const newOrder: Order = {
      id: Date.now(),
      user: 1,
      order_status: "pending",
      total_amount: cart.cart_items.reduce((sum: number, item: { product: { price: any }; quantity: number }) => sum + Number(item.product.price) * item.quantity, 0).toString(),
      items: cart.cart_items.map((item: { id: any; product: { price: any }; quantity: number }) => ({
        id: item.id,
        product: item.product,
        quantity: item.quantity,
        subtotal: Number(item.product.price) * item.quantity,
      })),
      total_items: cart.cart_items.reduce((sum: any, item: { quantity: any }) => sum + item.quantity, 0),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    mockOrders.push(newOrder)

    // Clear the cart
    cart.cart_items = []

    return {
      order: newOrder,
      payment_url: `http://localhost:8000/api/payment/${Math.random().toString(36).substring(2)}/`,
    }
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
    console.warn('Using mock cancel order due to an error:', error)

    // For development, cancel the order in the mock orders
    const orderIndex = mockOrders.findIndex((o) => o.id === orderId)

    if (orderIndex === -1) {
      throw new Error("Order not found")
    }

    if (mockOrders[orderIndex].order_status !== "pending") {
      throw new Error("Only pending orders can be cancelled")
    }

    mockOrders[orderIndex].order_status = "cancelled"
    mockOrders[orderIndex].updated_at = new Date().toISOString()

    return mockOrders[orderIndex]
  }
}
