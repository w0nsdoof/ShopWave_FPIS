"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import ProductCard from "@/components/product-card"
import { searchProducts } from "@/lib/api/products"
import type { Product } from "@/types"

export default function SearchPage() {
    const searchParams = useSearchParams()
    const query = searchParams.get("q") || ""
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!query) {
                setProducts([])
                setIsLoading(false)
                return
            }

            setIsLoading(true)
            try {
                const results = await searchProducts(query)
                setProducts(results)
            } catch (error) {
                console.error("Failed to fetch search results:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchSearchResults()
    }, [query])

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <Button variant="ghost" asChild className="mb-4">
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold">Search Results</h1>
                {query && <p className="text-muted-foreground mt-2">Showing results for "{query}"</p>}
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="rounded-lg border p-4 space-y-4">
                            <div className="aspect-square rounded-md bg-muted animate-pulse" />
                            <div className="h-4 bg-muted rounded animate-pulse" />
                            <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
                        </div>
                    ))}
                </div>
            ) : products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 border rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">No products found</h2>
                    <p className="text-muted-foreground mb-6">
                        {query
                            ? `We couldn't find any products matching "${query}"`
                            : "Please enter a search term to find products"}
                    </p>
                    <Button asChild>
                        <Link href="/products">Browse All Products</Link>
                    </Button>
                </div>
            )}
        </div>
    )
}

