"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Slider } from "@/components/ui/slider"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { getCategories } from "@/lib/api/categories"
import type { Category } from "@/types"

export default function ProductFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get("category"))
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number.parseInt(searchParams.get("minPrice") || "0"),
    Number.parseInt(searchParams.get("maxPrice") || "1000"),
  ])
  const [sortBy, setSortBy] = useState<string>(searchParams.get("sortBy") || "price_asc")

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch (error) {
        console.error("Failed to fetch categories:", error)
      }
    }

    fetchCategories()
  }, [])

  const applyFilters = () => {
    const params = new URLSearchParams()

    if (selectedCategory) {
      params.set("category", selectedCategory)
    }

    params.set("minPrice", priceRange[0].toString())
    params.set("maxPrice", priceRange[1].toString())
    params.set("sortBy", sortBy)

    router.push(`/products?${params.toString()}`)
  }

  const resetFilters = () => {
    setSelectedCategory(null)
    setPriceRange([0, 1000])
    setSortBy("price_asc")
    router.push("/products")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Filters</h2>
        <Button variant="ghost" size="sm" onClick={resetFilters}>
          Reset
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={["categories", "price", "sort"]}>
        <AccordionItem value="categories">
          <AccordionTrigger>Categories</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={selectedCategory === category.id.toString()}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedCategory(category.id.toString())
                      } else {
                        setSelectedCategory(null)
                      }
                    }}
                  />
                  <label
                    htmlFor={`category-${category.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {category.name}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price">
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider
                defaultValue={priceRange}
                min={0}
                max={1000}
                step={10}
                value={priceRange}
                onValueChange={(value) => setPriceRange(value as [number, number])}
              />
              <div className="flex items-center justify-between">
                <span className="text-sm">${priceRange[0]}</span>
                <span className="text-sm">${priceRange[1]}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="sort">
          <AccordionTrigger>Sort By</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sort-price-asc"
                  checked={sortBy === "price_asc"}
                  onCheckedChange={(checked) => {
                    if (checked) setSortBy("price_asc")
                  }}
                />
                <label
                  htmlFor="sort-price-asc"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Price: Low to High
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sort-price-desc"
                  checked={sortBy === "price_desc"}
                  onCheckedChange={(checked) => {
                    if (checked) setSortBy("price_desc")
                  }}
                />
                <label
                  htmlFor="sort-price-desc"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Price: High to Low
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sort-newest"
                  checked={sortBy === "newest"}
                  onCheckedChange={(checked) => {
                    if (checked) setSortBy("newest")
                  }}
                />
                <label
                  htmlFor="sort-newest"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Newest First
                </label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button className="w-full" onClick={applyFilters}>
        Apply Filters
      </Button>
    </div>
  )
}

