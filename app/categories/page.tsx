"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCategories } from "@/lib/api/categories"
import type { Category } from "@/types"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch (error) {
        console.error("Failed to fetch categories:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Group categories by parent_id
  const parentCategories = categories.filter(category => !category.parent_id)
  const subcategories = categories.filter(category => category.parent_id)

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Categories</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-4 bg-muted rounded w-1/2" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Categories</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {parentCategories.map((category) => {
          const categorySubcategories = subcategories.filter(
            sub => sub.parent_id === category.id
          )

          return (
            <Card key={category.id}>
              <CardHeader>
                <CardTitle>{category.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categorySubcategories.length > 0 ? (
                    categorySubcategories.map((subcategory) => (
                      <Link
                        key={subcategory.id}
                        href={`/categories/${subcategory.id}`}
                        className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors"
                      >
                        <span>{subcategory.name}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    ))
                  ) : (
                    <Link
                      href={`/categories/${category.id}`}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors"
                    >
                      <span>View all products</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

