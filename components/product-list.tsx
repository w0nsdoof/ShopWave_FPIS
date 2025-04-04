"use client"

import {useEffect, useState} from "react"
import {useSearchParams} from "next/navigation"
import ProductCard from "@/components/product-card"
import {getProducts} from "@/lib/api/products"
import type {Product} from "@/types"

interface ProductListProps {
    categoryId?: number
}

export default function ProductList({categoryId}: ProductListProps) {
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const searchParams = useSearchParams()

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true)

            const categoryId = searchParams.get("category")
            const minPrice = searchParams.get("minPrice")
            const maxPrice = searchParams.get("maxPrice")
            const sortBy = searchParams.get("sortBy")

            try {
                const data = await getProducts({
                    categoryId: categoryId ? Number.parseInt(categoryId) : undefined,
                    minPrice: minPrice ? Number.parseFloat(minPrice) : undefined,
                    maxPrice: maxPrice ? Number.parseFloat(maxPrice) : undefined,
                    sortBy: sortBy || undefined,
                })
                setProducts(data)
            } catch (error) {
                console.error("Failed to fetch products:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchProducts()
    }, [searchParams])

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="rounded-lg border p-4 space-y-4">
                        <div className="aspect-square rounded-md bg-muted animate-pulse"/>
                        <div className="h-4 bg-muted rounded animate-pulse"/>
                        <div className="h-4 bg-muted rounded w-1/2 animate-pulse"/>
                    </div>
                ))}
            </div>
        )
    }

    if (products.length === 0) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-2">No products found</h2>
                <p className="text-muted-foreground">Try adjusting your filters or search criteria.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
                <ProductCard key={product.id} product={product}/>
            ))}
        </div>
    )
}

