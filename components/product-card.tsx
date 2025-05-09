"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useCart } from "@/hooks/use-cart"
import { useWishlist } from "@/hooks/use-wishlist"
import type { Product } from "@/types"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const { addToCart } = useCart()
  const { addToWishlist, isInWishlist, removeFromWishlist, refreshWishlist } = useWishlist()
  const { toast } = useToast()

  // Update local state when wishlist status changes
  useEffect(() => {
    setIsWishlisted(isInWishlist(product.id))
  }, [product.id, isInWishlist])

  // Remove the automatic refresh on mount to prevent excessive API calls
  // The wishlist will be refreshed by the WishlistProvider when needed

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsAddingToCart(true)
    try {
      await addToCart(product.id, 1)
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product to cart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsAddingToWishlist(true)
    
    try {
      // Use local state for immediate feedback
      if (isWishlisted) {
        // Optimistically update UI
        setIsWishlisted(false)
        await removeFromWishlist(product.id)
        toast({
          title: "Removed from wishlist",
          description: `${product.name} has been removed from your wishlist.`,
        })
      } else {
        // Optimistically update UI
        setIsWishlisted(true)
        await addToWishlist(product.id)
        toast({
          title: "Added to wishlist",
          description: `${product.name} has been added to your wishlist.`,
        })
      }
    } catch (error) {
      // Revert optimistic update if there was an error
      setIsWishlisted(isInWishlist(product.id))
      toast({
        title: "Error",
        description: "Failed to update wishlist. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAddingToWishlist(false)
    }
  }

  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="rounded-lg border overflow-hidden transition-all hover:shadow-md">
        <div className="relative aspect-square bg-muted">
          <Image
            src={
              product.image 
                ? (product.image.startsWith('http') 
                  ? product.image 
                  : `http://localhost${product.image}`) // Add domain if path is relative
                : `/placeholder.svg?height=300&width=300&text=${encodeURIComponent(product.name)}`
            }
            alt={product.name}
            fill
            priority
            className="object-cover"
            unoptimized // Add unoptimized prop to bypass Next.js Image optimization for external URLs
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="rounded-full"
              onClick={handleAddToCart}
              disabled={isAddingToCart}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className={`absolute top-2 right-2 rounded-full bg-background/80 hover:bg-background ${
              isWishlisted ? "text-red-500 hover:text-red-600" : ""
            }`}
            onClick={handleWishlistToggle}
            disabled={isAddingToWishlist}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
          </Button>
        </div>
        <div className="p-4">
          <h3 className="font-medium line-clamp-1">{product.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{product.description}</p>
          <div className="mt-2 font-bold">${Number(product.price).toFixed(2)}</div>
        </div>
      </div>
    </Link>
  )
}

