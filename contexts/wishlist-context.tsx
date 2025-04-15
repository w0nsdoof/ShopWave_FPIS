"use client"

import { createContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { getWishlist, addItemToWishlist, removeWishlistItem } from "@/lib/api/wishlist"
import type { WishlistItem, Product } from "@/types"

interface WishlistContextType {
  wishlistItems: WishlistItem[]
  isLoading: boolean
  addToWishlist: (productId: number) => Promise<void>
  removeFromWishlist: (productId: number) => Promise<void>
  isInWishlist: (productId: number) => boolean
  refreshWishlist: () => Promise<void>
}

export const WishlistContext = createContext<WishlistContextType>({
  wishlistItems: [],
  isLoading: true,
  addToWishlist: async () => {},
  removeFromWishlist: async () => {},
  isInWishlist: () => false,
  refreshWishlist: async () => {},
})

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now())

  const refreshWishlist = useCallback(async () => {
    setIsLoading(true)
    try {
      const wishlist = await getWishlist()
      // Handle array response - take the first item's wishlist_items
      if (Array.isArray(wishlist)) {
        setWishlistItems(wishlist[0]?.wishlist_items || [])
      } else {
        setWishlistItems(wishlist?.wishlist_items || [])
      }
    } catch (error) {
      console.error("Failed to fetch wishlist:", error)
      setWishlistItems([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch wishlist when component mounts or lastRefresh changes
  useEffect(() => {
    refreshWishlist()
  }, [lastRefresh, refreshWishlist])

  // Add useEffect for route changes - refresh wishlist when page changes
  useEffect(() => {
    // Listen for route changes
    const handleRouteChange = () => {
      refreshWishlist()
    }
    
    // Add event listener for route changes
    window.addEventListener('popstate', handleRouteChange)
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange)
    }
  }, [refreshWishlist])

  const addToWishlist = async (productId: number) => {
    try {
      const result = await addItemToWishlist(productId)
      
      // Optimistically update the local state
      // First check if the item is already in the wishlist
      if (!isInWishlist(productId)) {
        // Get the product details from the API response if available
        let newProduct: Product | null = null
        
        if (result && result.product) {
          newProduct = result.product
        }
        
        if (newProduct) {
          // Add the new item to the wishlist items
          const newWishlistItem: WishlistItem = {
            id: result.id || Math.random(), // Use the id from result or generate a temporary one
            product: newProduct,
            created_at: new Date().toISOString()
          }
          
          setWishlistItems(prevItems => [...prevItems, newWishlistItem])
        } else {
          // If we can't get product details from the response, refresh the wishlist
          refreshWishlist()
        }
      }
    } catch (error) {
      console.error("Failed to add item to wishlist:", error)
      // Refresh wishlist to ensure consistent state
      refreshWishlist()
      throw error
    }
  }

  const removeFromWishlist = async (productId: number) => {
    try {
      await removeWishlistItem(productId)
      
      // Optimistically update the local state
      setWishlistItems(prevItems => prevItems.filter((item) => item.product.id !== productId))
    } catch (error) {
      console.error("Failed to remove item from wishlist:", error)
      // Refresh wishlist to ensure consistent state
      refreshWishlist()
      throw error
    }
  }

  const isInWishlist = useCallback((productId: number) => {
    return wishlistItems.some((item) => item.product.id === productId)
  }, [wishlistItems])

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        isLoading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

