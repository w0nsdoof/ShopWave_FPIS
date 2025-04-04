"use client"

import { createContext, useState, useEffect, type ReactNode } from "react"
import { getCart, createCart, addItemToCart, updateCartItem as updateItem, removeCartItem } from "@/lib/api/cart"
import type { CartItem } from "@/types"

interface CartContextType {
  cartItems: CartItem[]
  isLoading: boolean
  addToCart: (productId: number, quantity: number) => Promise<void>
  updateCartItem: (itemId: number, quantity: number) => Promise<void>
  removeFromCart: (itemId: number) => Promise<void>
}

export const CartContext = createContext<CartContextType>({
  cartItems: [],
  isLoading: true,
  addToCart: async () => {},
  updateCartItem: async () => {},
  removeFromCart: async () => {},
})

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCart = async () => {
      setIsLoading(true)
      try {
        let cart
        try {
          cart = await getCart()
        } catch (error) {
          // If no cart exists, create one
          cart = await createCart()
        }

        setCartItems(cart.cart_items || [])
      } catch (error) {
        console.error("Failed to fetch cart:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCart()
  }, [])

  const addToCart = async (productId: number, quantity: number) => {
    try {
      const newItem = await addItemToCart(productId, quantity)
      setCartItems([...cartItems, newItem])
    } catch (error) {
      console.error("Failed to add item to cart:", error)
      throw error
    }
  }

  const updateCartItem = async (itemId: number, quantity: number) => {
    try {
      if (quantity === 0) {
        await removeFromCart(itemId)
        return
      }

      const updatedItem = await updateItem(itemId, quantity)
      setCartItems(cartItems.map((item) => (item.id === itemId ? updatedItem : item)))
    } catch (error) {
      console.error("Failed to update cart item:", error)
      throw error
    }
  }

  const removeFromCart = async (itemId: number) => {
    try {
      await removeCartItem(itemId)
      setCartItems(cartItems.filter((item) => item.id !== itemId))
    } catch (error) {
      console.error("Failed to remove item from cart:", error)
      throw error
    }
  }

  return (
    <CartContext.Provider value={{ cartItems, isLoading, addToCart, updateCartItem, removeFromCart }}>
      {children}
    </CartContext.Provider>
  )
}

