"use client"

import { createContext, useState, useEffect, type ReactNode } from "react"
import { getWishlist, addItemToWishlist, removeWishlistItem } from "@/lib/api/wishlist"
import type { WishlistItem } from "@/types"

interface WishlistContextType {
  wishlistItems: WishlistItem[]
  isLoading: boolean
  addToWishlist: (productId: number) => Promise<void>
  removeFromWishlist: (productId: number) => Promise<void>
  isInWishlist: (productId: number) => boolean
}

export const WishlistContext = createContext<WishlistContextType>({
  wishlistItems: [],
  isLoading: true,
  addToWishlist: async () => {},
  removeFromWishlist: async () => {},
  isInWishlist: () => false,
})

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchWishlist = async () => {
      setIsLoading(true)
      try {
        const wishlist = await getWishlist()
        setWishlistItems(wishlist.wishlist_items || [])
      } catch (error) {
        console.error("Failed to fetch wishlist:", error)
        setWishlistItems([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchWishlist()
  }, [])

  const addToWishlist = async (productId: number) => {
    try {
      await addItemToWishlist(productId)

      // Refetch wishlist to get updated items
      const wishlist = await getWishlist()
      setWishlistItems(wishlist.wishlist_items || [])
    } catch (error) {
      console.error("Failed to add item to wishlist:", error)
      throw error
    }
  }

  const removeFromWishlist = async (productId: number) => {
    try {
      await removeWishlistItem(productId)
      setWishlistItems(wishlistItems.filter((item) => item.product.id !== productId))
    } catch (error) {
      console.error("Failed to remove item from wishlist:", error)
      throw error
    }
  }

  const isInWishlist = (productId: number) => {
    return wishlistItems.some((item) => item.product.id === productId)
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        isLoading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

