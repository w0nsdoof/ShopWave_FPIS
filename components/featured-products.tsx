"use client"

import { useEffect, useState } from "react"
import ProductCard from "@/components/product-card"
import { getProducts } from "@/lib/api/products"
import type { Product } from "@/types"

// Use data caching to avoid repeated API requests
let cachedProducts: Product[] | null = null
let cacheTime: number = 0
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>(cachedProducts || [])
  const [isLoading, setIsLoading] = useState(!cachedProducts)

  useEffect(() => {
    const fetchProducts = async () => {
      // If we have valid cached data, use it
      const now = Date.now()
      if (cachedProducts && (now - cacheTime) < CACHE_DURATION) {
        setProducts(cachedProducts)
        setIsLoading(false)
        return
      }
      
      try {
        const data = await getProducts({ limit: 4 })
        setProducts(data)
        
        // Update cache
        cachedProducts = data
        cacheTime = now
      } catch (error) {
        console.error("Failed to fetch featured products:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg border p-4 space-y-4">
            <div className="aspect-square rounded-md bg-muted animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

