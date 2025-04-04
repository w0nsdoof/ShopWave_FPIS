"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getCategories } from "@/lib/api/categories"
import type { Category } from "@/types"

export default function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories()
        // Only get parent categories (those with no parent_id)
        const parentCategories = data.filter((category: { parent_id: any }) => !category.parent_id)
        setCategories(parentCategories.slice(0, 6)) // Limit to 6 categories
      } catch (error) {
        console.error("Failed to fetch categories:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="aspect-square rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/categories/${category.id}`}
          className="group aspect-square relative rounded-lg overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div
            className="absolute inset-0 bg-[url('/placeholder.svg?height=200&width=200')]"
            style={{ backgroundSize: "cover", backgroundPosition: "center" }}
          />
          <div className="absolute inset-0 flex items-end p-4">
            <h3 className="text-white font-medium group-hover:underline">{category.name}</h3>
          </div>
        </Link>
      ))}
    </div>
  )
}

