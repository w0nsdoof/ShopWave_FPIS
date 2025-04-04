"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import ProductList from "@/components/product-list"
import ProductSkeleton from "@/components/product-skeleton"
import { getCategory } from "@/lib/api/categories"
import { getCategories } from "@/lib/api/categories"
import type { Category } from "@/types"

export default function CategoryPage() {
    const { id } = useParams()
    const router = useRouter()
    const [category, setCategory] = useState<Category | null>(null)
    const [subcategories, setSubcategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchCategory = async () => {
            setIsLoading(true)
            try {
                const categoryData = await getCategory(Number(id))
                console.log("Fetched category:", categoryData)  // Log to confirm it's being fetched

                setCategory(categoryData)

                // Fetch subcategories
                const allCategories = await getCategories()
                console.log("Fetched categories:", allCategories)  // Log categories (mock or real)

                const subs = allCategories.filter((cat: { parent_id: number }) => cat.parent_id === Number(id))
                setSubcategories(subs)
            } catch (error) {
                console.error("Failed to fetch category:", error)
            } finally {
                setIsLoading(false)
            }
        }

        if (id) {
            fetchCategory()
        }
    }, [id])


    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="h-8 bg-muted rounded animate-pulse w-1/4 mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-20 bg-muted rounded animate-pulse" />
                    ))}
                </div>
                <ProductSkeleton count={6} />
            </div>
        )
    }

    if (!category) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
                <p className="text-muted-foreground mb-6">The category you are looking for does not exist.</p>
                <Button asChild>
                    <Link href="/categories">Browse All Categories</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <h1 className="text-3xl font-bold">{category.name}</h1>
            </div>

            {subcategories.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Subcategories</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {subcategories.map((subcat) => (
                            <Link
                                key={subcat.id}
                                href={`/categories/${subcat.id}`}
                                className="border rounded-lg p-4 hover:border-primary transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">{subcat.name}</span>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            <div>
                <h2 className="text-xl font-semibold mb-4">Products in {category.name}</h2>
                <ProductList categoryId={category.id} />
            </div>
        </div>
    )
}

