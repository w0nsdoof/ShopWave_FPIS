"use client"

import { createContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { getWishlist, addItemToWishlist, removeWishlistItem } from "@/lib/api/wishlist"
import type { WishlistItem, Product } from "@/types"
import { useAuth } from "@/hooks/use-auth"

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
  const [isLoading, setIsLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now())
  const { user } = useAuth()
  
  // Use actual authentication state from auth context
  const isAuthenticated = !!user

  const refreshWishlist = useCallback(async () => {
    // Skip API call if not authenticated
    if (!isAuthenticated) {
      setIsLoading(false)
      setWishlistItems([])
      return
    }

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
  }, [isAuthenticated])

  // Fetch wishlist only when authenticated and when lastRefresh changes
  useEffect(() => {
    if (isAuthenticated) {
      refreshWishlist()
    }
  }, [lastRefresh, refreshWishlist, isAuthenticated])
  
  // Removed the route change listener as it was causing unnecessary API requests
  // Wishlist will be fetched when needed through the refreshWishlist function

  const addToWishlist = async (productId: number) => {
    // Check if user is authenticated before attempting to add to wishlist
    if (!isAuthenticated) {
      throw new Error("You need to be logged in to add items to wishlist")
    }
    
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
    // Check if user is authenticated
    if (!isAuthenticated) {
      throw new Error("You need to be logged in to remove items from wishlist")
    }
    
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
    // If user is not authenticated, always return false
    if (!isAuthenticated) {
      return false
    }
    return wishlistItems.some((item) => item.product.id === productId)
  }, [wishlistItems, isAuthenticated])

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

