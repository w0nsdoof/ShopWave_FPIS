"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useWishlist } from "@/hooks/use-wishlist"
import { useCart } from "@/hooks/use-cart"

export default function WishlistPage() {
  const [isMovingToCart, setIsMovingToCart] = useState<number | null>(null)
  const { wishlistItems, removeFromWishlist, isLoading } = useWishlist()
  const { addToCart } = useCart()
  const { toast } = useToast()

  const handleRemoveFromWishlist = async (productId: number) => {
    try {
      await removeFromWishlist(productId)
      toast({
        title: "Removed from wishlist",
        description: "The item has been removed from your wishlist.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleMoveToCart = async (productId: number) => {
    setIsMovingToCart(productId)
    try {
      await addToCart(productId, 1)
      await removeFromWishlist(productId)
      toast({
        title: "Added to cart",
        description: "The item has been moved from your wishlist to your cart.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move item to cart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsMovingToCart(null)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Wishlist</h1>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Wishlist</h1>
        <div className="text-center py-12 border rounded-lg">
          <Heart className="h-12 w-12 mx-auto text-muted-foreground" />
          <h2 className="text-xl font-semibold mt-4 mb-2">Your wishlist is empty</h2>
          <p className="text-muted-foreground mb-6">Save items you love for later by adding them to your wishlist.</p>
          <Button asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Wishlist</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlistItems.map((item) => (
          <div key={item.id} className="border rounded-lg overflow-hidden group">
            <div className="relative aspect-square bg-muted">
              <Image
                src={
                  item.product.image 
                    ? (item.product.image.startsWith('http') 
                       ? item.product.image 
                       : `/api/media${item.product.image}`)
                    : `/placeholder.svg?height=300&width=300&text=${encodeURIComponent(item.product.name)}`
                }
                alt={item.product.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="rounded-full"
                  onClick={() => handleMoveToCart(item.product.id)}
                  disabled={isMovingToCart === item.product.id}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {isMovingToCart === item.product.id ? "Adding..." : "Add to Cart"}
                </Button>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 rounded-full bg-background/80 hover:bg-background text-red-500 hover:text-red-600"
                onClick={() => handleRemoveFromWishlist(item.product.id)}
              >
                <Heart className="h-4 w-4 fill-current" />
              </Button>
            </div>
            <div className="p-4">
              <Link href={`/products/${item.product.id}`}>
                <h3 className="font-medium hover:underline">{item.product.name}</h3>
              </Link>
              <div className="mt-2 font-bold">${Number(item.product.price).toFixed(2)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

