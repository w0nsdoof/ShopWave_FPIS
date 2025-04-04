"use client"

import { Suspense } from "react"
import ProductList from "@/components/product-list"
import ProductFilters from "@/components/product-filters"
import ProductSkeleton from "@/components/product-skeleton"

export default function ProductsPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">All Products</h1>

            <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8">
                {/* Wrap ProductFilters with Suspense if it's using hooks like useSearchParams */}
                <Suspense fallback={<ProductSkeleton count={8} />}>
                    <ProductFilters />
                </Suspense>

                <div>
                    <Suspense fallback={<ProductSkeleton count={8} />}>
                        <ProductList />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}
