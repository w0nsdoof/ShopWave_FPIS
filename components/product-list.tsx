"use client"

import { useEffect, useState } from "react"
import { useSearchParams, usePathname } from "next/navigation"
import ProductCard from "@/components/product-card"
import { getProducts } from "@/lib/api/products"
import { getCategoryProducts } from "@/lib/api/categories"
import type { Product } from "@/types"

interface ProductListProps {
  categoryId?: number
}

export default function ProductList({ categoryId }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()
  const pathname = usePathname()
  
  // Create a key that changes when URL parameters change to trigger re-fetch
  const urlKey = searchParams.toString()

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      
      try {
        // If filtering by a specific category directly from category page
        if (categoryId) {
          // Use the categoryProducts endpoint for direct category pages
          const categoryProducts = await getCategoryProducts(categoryId)
          setProducts(categoryProducts)
        } 
        // If no category filtering is applied
        else {
          // Just get all products normally
          const allProducts = await getProducts({})
          setProducts(allProducts)
        }
      } catch (error) {
        console.error("Failed to fetch products:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [categoryId, urlKey, searchParams]) // Add searchParams to dependencies
  
  // Apply filters whenever search params or products change
  useEffect(() => {
    if (products.length === 0) return;
    
    // Get all filter parameters
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : 0
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : Infinity
    const sortBy = searchParams.get("sortBy") || "price_asc" // Changed default from "newest" to "price_asc"
    
    // Apply filtering on the client side
    let filtered = [...products];
    
    // Filter by price range
    filtered = filtered.filter(product => {
      const price = parseFloat(product.price)
      return price >= minPrice && price <= maxPrice
    })
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price_asc":
          return parseFloat(a.price) - parseFloat(b.price)
        case "price_desc":
          return parseFloat(b.price) - parseFloat(a.price)
        case "name_asc":
          return a.name.localeCompare(b.name)
        default:
          return parseFloat(a.price) - parseFloat(b.price) // Default to price_asc
      }
    })
    
    setFilteredProducts(filtered)
  }, [products, searchParams])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-lg border p-4 space-y-4">
            <div className="aspect-square rounded-md bg-muted animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-12 border rounded-md">
        <h2 className="text-xl font-semibold mb-2">No products found</h2>
        <p className="text-muted-foreground">Try adjusting your filters or search criteria.</p>
      </div>
    )
  }

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}

