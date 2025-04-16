"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useParams } from "next/navigation"
import { Minus, Plus, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useCart } from "@/hooks/use-cart"
import { useWishlist } from "@/hooks/use-wishlist"
import ProductReviews from "@/components/product-reviews"
import { getProduct } from "@/lib/api/products"
import { getReviews } from "@/lib/api/reviews"
import type { Product, Review } from "@/types"

export default function ProductPage() {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false)
  const { addToCart } = useCart()
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist()
  const { toast } = useToast()

  useEffect(() => {
    const fetchProductData = async () => {
      setIsLoading(true)
      try {
        const productData = await getProduct(Number(id))
        setProduct(productData)
        
        // Fetch reviews for the product
        const reviewsData = await getReviews(Number(id))
        setReviews(reviewsData)
      } catch (error) {
        console.error("Failed to fetch product data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchProductData()
    }
  }, [id])

  const handleAddToCart = async () => {
    if (!product) return

    setIsAddingToCart(true)
    try {
      await addToCart(product.id, quantity)
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

  const handleWishlistToggle = async () => {
    if (!product) return

    setIsAddingToWishlist(true)
    try {
      if (isInWishlist(product.id)) {
        await removeFromWishlist(product.id)
        toast({
          title: "Removed from wishlist",
          description: `${product.name} has been removed from your wishlist.`,
        })
      } else {
        await addToWishlist(product.id)
        toast({
          title: "Added to wishlist",
          description: `${product.name} has been added to your wishlist.`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update wishlist. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAddingToWishlist(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square bg-muted rounded-lg animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
            <div className="h-6 bg-muted rounded animate-pulse w-1/4 mt-4" />
            <div className="h-24 bg-muted rounded animate-pulse mt-4" />
            <div className="h-10 bg-muted rounded animate-pulse mt-6" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-muted-foreground">The product you are looking for does not exist or has been removed.</p>
      </div>
    )
  }

  // Calculate average rating from 0-10 and convert to 0-5 scale for display
  const rawAverageRating = reviews.length > 0 
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length 
    : 0;
  
  // Convert from 0-10 scale to 0-5 scale
  const averageRatingOutOf5 = parseFloat((rawAverageRating / 2).toFixed(1));

  const inWishlist = isInWishlist(product.id)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aspect-square relative bg-muted rounded-lg overflow-hidden">
          <Image
            src={
              product.image 
                ? (product.image.startsWith('http') 
                   ? product.image 
                   : `http://localhost${product.image}`)
                : `/placeholder.svg?height=600&width=600&text=${encodeURIComponent(product.name)}`
            }
            alt={product.name}
            fill
            priority
            className="object-cover"
            unoptimized // Add unoptimized prop to bypass Next.js Image optimization for external URLs
          />
        </div>

        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>

          <div className="flex items-center mt-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-5 w-5 ${i < averageRatingOutOf5 ? "fill-primary text-primary" : "text-muted-foreground"}`} />
              ))}
            </div>
            <span className="text-sm text-muted-foreground ml-2">({reviews.length} reviews)</span>
          </div>

          <div className="mt-4">
            <span className="text-2xl font-bold">${Number(product.price).toFixed(2)}</span>
            {product.stock_quantity > 0 ? (
              <span className="text-sm text-green-600 ml-2">In Stock ({product.stock_quantity} available)</span>
            ) : (
              <span className="text-sm text-red-600 ml-2">Out of Stock</span>
            )}
          </div>

          <div className="mt-6">
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          <div className="mt-8">
            <div className="flex items-center mb-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="mx-4 font-medium w-8 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                disabled={quantity >= product.stock_quantity}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                className="flex-1"
                onClick={handleAddToCart}
                disabled={isAddingToCart || product.stock_quantity === 0}
              >
                {isAddingToCart ? "Adding..." : "Add to Cart"}
              </Button>
              <Button
                variant={inWishlist ? "destructive" : "outline"}
                onClick={handleWishlistToggle}
                disabled={isAddingToWishlist}
              >
                {inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <Tabs defaultValue="description">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-6">
            <div className="prose max-w-none">
              <p>{product.description}</p>
              <h3 className="text-lg font-semibold mt-4">Product Details</h3>
              <ul className="mt-2 space-y-1">
                <li>Category: {product.category_id}</li>
                <li>Stock: {product.stock_quantity} units</li>
                <li>SKU: PROD-{product.id}</li>
              </ul>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            <ProductReviews productId={product.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

