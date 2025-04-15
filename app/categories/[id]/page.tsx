"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ChevronRight, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { getCategory, getCategorySubcategories, getCategoryProducts } from "@/lib/api/categories"
import ProductCard from "@/components/product-card"
import type { Category, Product } from "@/types"

export default function CategoryPage({ params }: { params: { id: string } }) {
  const [category, setCategory] = useState<Category | null>(null)
  const [subcategories, setSubcategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const categoryId = parseInt(params.id)
        
        // Fetch all data in parallel for better performance
        const [categoryData, subcategoriesData, productsData] = await Promise.all([
          getCategory(categoryId),
          getCategorySubcategories(categoryId),
          getCategoryProducts(categoryId)
        ])
        
        setCategory(categoryData)
        setSubcategories(subcategoriesData)
        setProducts(productsData)
      } catch (error) {
        console.error("Failed to fetch category data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategoryData()
  }, [params.id])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Category not found</h1>
          <Link href="/categories" className="text-primary hover:underline">
            Back to all categories
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/categories">Categories</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>{category.name}</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center mb-8 gap-4">
        <Link href="/categories" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to all categories
        </Link>
        <h1 className="text-3xl font-bold">{category.name}</h1>
      </div>

      {/* Subcategories */}
      {subcategories.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Subcategories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {subcategories.map((subcategory) => (
              <Card key={subcategory.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="py-4">
                  <Link href={`/categories/${subcategory.id}`}>
                    <CardTitle className="text-lg cursor-pointer hover:text-primary transition-colors">
                      {subcategory.name}
                    </CardTitle>
                  </Link>
                </CardHeader>
                <CardContent className="pt-0 pb-4">
                  <Link 
                    href={`/categories/${subcategory.id}`}
                    className="flex items-center justify-between text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <span>View products</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      <div>
        <h2 className="text-xl font-semibold mb-6">Products in {category.name}</h2>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-md bg-muted/20">
            <p className="text-muted-foreground">No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  )
}