"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Slider } from "@/components/ui/slider"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ChevronDown, ChevronRight } from "lucide-react"
import { getCategories, getCategorySubcategories } from "@/lib/api/categories"
import { getProducts } from "@/lib/api/products"
import { type Category, type Product } from "@/types"

export default function ProductFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [categories, setCategories] = useState<Category[]>([])
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({})
  const [subcategories, setSubcategories] = useState<Record<number, Category[]>>({})
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>(
    searchParams.getAll("category").map(Number) || []
  )
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<number[]>(
    searchParams.getAll("subcategory").map(Number) || []
  )
  
  // Price range state
  const [priceRangeLimits, setPriceRangeLimits] = useState<{min: number, max: number}>({min: 0, max: 1000})
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(searchParams.get("minPrice")) || 0,
    Number(searchParams.get("maxPrice")) || 1000,
  ])
  const [priceMin, setPriceMin] = useState<string>(searchParams.get("minPrice") || "0")
  const [priceMax, setPriceMax] = useState<string>(searchParams.get("maxPrice") || "1000")
  const [sortBy, setSortBy] = useState<string>(searchParams.get("sortBy") || "newest")
  const [isInitialized, setIsInitialized] = useState(false)

  // Fetch all parent categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories()
        // Filter to get only parent categories (those with parent === null)
        const parentCategories = data.filter((cat: Category) => cat.parent === null)
        setCategories(parentCategories)
      } catch (error) {
        console.error("Failed to fetch categories:", error)
      }
    }

    fetchCategories()
  }, [])
  
  // Fetch products to determine price range
  useEffect(() => {
    const fetchProductPriceRange = async () => {
      try {
        // Fetch all products to determine the price range
        const products = await getProducts({})
        
        if (products.length > 0) {
          // Find min and max prices from all products
          let minPrice = Infinity
          let maxPrice = 0
          
          products.forEach((product: Product) => {
            const price = parseFloat(product.price)
            if (price < minPrice) minPrice = price
            if (price > maxPrice) maxPrice = price
          })
          
          // Round down min price and round up max price for better UX
          minPrice = Math.floor(minPrice)
          maxPrice = Math.ceil(maxPrice)
          
          // Add a small buffer to max price (10% more)
          maxPrice = Math.ceil(maxPrice * 1.1)
          
          // Update price range limits
          setPriceRangeLimits({min: minPrice, max: maxPrice})
          
          // Initialize price range values if not set by URL params
          const urlMinPrice = searchParams.get("minPrice")
          const urlMaxPrice = searchParams.get("maxPrice")
          
          if (!urlMinPrice || !urlMaxPrice) {
            setPriceRange([minPrice, maxPrice])
            setPriceMin(minPrice.toString())
            setPriceMax(maxPrice.toString())
          } else {
            // Use URL params but ensure they're within the actual price range
            const min = Math.max(minPrice, Number(urlMinPrice))
            const max = Math.min(maxPrice, Number(urlMaxPrice))
            setPriceRange([min, max])
            setPriceMin(min.toString())
            setPriceMax(max.toString())
          }
          
          setIsInitialized(true)
        }
      } catch (error) {
        console.error("Failed to fetch products for price range:", error)
      }
    }
    
    fetchProductPriceRange()
  }, [searchParams])

  // Fetch subcategories when a category is expanded
  const fetchSubcategories = async (categoryId: number) => {
    if (subcategories[categoryId]) return; // Already loaded

    try {
      const data = await getCategorySubcategories(categoryId)
      setSubcategories(prev => ({
        ...prev,
        [categoryId]: data
      }))
    } catch (error) {
      console.error(`Failed to fetch subcategories for category ${categoryId}:`, error)
    }
  }

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
    
    if (!expandedCategories[categoryId]) {
      fetchSubcategories(categoryId)
    }
  }

  const handleCategoryChange = (categoryId: number, checked: boolean | "indeterminate") => {
    let newSelectedCategories = [...selectedCategoryIds]
    
    if (checked === true && !newSelectedCategories.includes(categoryId)) {
      newSelectedCategories.push(categoryId)
    } else if (checked === false) {
      newSelectedCategories = newSelectedCategories.filter(id => id !== categoryId)
    }
    
    setSelectedCategoryIds(newSelectedCategories)
    
    // If any subcategories of this category are selected, deselect them when unchecking category
    if (checked === false) {
      const categorySubcats = subcategories[categoryId] || []
      const subcatIds = categorySubcats.map(subcat => subcat.id)
      setSelectedSubcategoryIds(prev => 
        prev.filter(id => !subcatIds.includes(id))
      )
    }
  }
  
  const handleSubcategoryChange = (subcategoryId: number, checked: boolean | "indeterminate") => {
    let newSelectedSubcategories = [...selectedSubcategoryIds]
    
    if (checked === true && !newSelectedSubcategories.includes(subcategoryId)) {
      newSelectedSubcategories.push(subcategoryId)
    } else if (checked === false) {
      newSelectedSubcategories = newSelectedSubcategories.filter(id => id !== subcategoryId)
    }
    
    setSelectedSubcategoryIds(newSelectedSubcategories)
  }

  const handlePriceInputChange = (minOrMax: 'min' | 'max', value: string) => {
    if (value === '' || /^\d+$/.test(value)) {
      const numValue = value === '' ? '0' : value
      if (minOrMax === 'min') {
        setPriceMin(numValue)
        setPriceRange([parseInt(numValue), priceRange[1]])
      } else {
        setPriceMax(numValue)
        setPriceRange([priceRange[0], parseInt(numValue)])
      }
    }
  }

  const applyFilters = () => {
    const params = new URLSearchParams()

    // Add selected categories
    selectedCategoryIds.forEach(id => {
      params.append("category", id.toString())
    })

    // Add selected subcategories
    selectedSubcategoryIds.forEach(id => {
      params.append("subcategory", id.toString())
    })

    // Add price range
    params.set("minPrice", priceRange[0].toString())
    params.set("maxPrice", priceRange[1].toString())
    
    // Add sort option
    params.set("sortBy", sortBy)

    router.push(`/products?${params.toString()}`)
  }

  const resetFilters = () => {
    setSelectedCategoryIds([])
    setSelectedSubcategoryIds([])
    setPriceRange([priceRangeLimits.min, priceRangeLimits.max])
    setPriceMin(priceRangeLimits.min.toString())
    setPriceMax(priceRangeLimits.max.toString())
    setSortBy("newest")
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
            <div className="space-y-1 max-h-[300px] overflow-y-auto pr-2">
              {categories.map((category) => (
                <div key={category.id} className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={selectedCategoryIds.includes(category.id)}
                      onCheckedChange={(checked) => handleCategoryChange(category.id, checked)}
                    />
                    <label
                      htmlFor={`category-${category.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1"
                    >
                      {category.name}
                    </label>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => toggleCategory(category.id)}
                    >
                      {expandedCategories[category.id] ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  {/* Subcategories */}
                  {expandedCategories[category.id] && (
                    <div className="pl-6 space-y-1 border-l ml-2 mt-1">
                      {subcategories[category.id]?.length > 0 ? (
                        subcategories[category.id].map(subcategory => (
                          <div key={subcategory.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`subcategory-${subcategory.id}`}
                              checked={selectedSubcategoryIds.includes(subcategory.id)}
                              onCheckedChange={(checked) => handleSubcategoryChange(subcategory.id, checked)}
                            />
                            <label
                              htmlFor={`subcategory-${subcategory.id}`}
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {subcategory.name}
                            </label>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-muted-foreground py-1">
                          {subcategories[category.id] === undefined ? "Loading..." : "No subcategories"}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price">
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              {isInitialized && (
                <Slider
                  min={priceRangeLimits.min}
                  max={priceRangeLimits.max}
                  step={1}
                  value={priceRange}
                  onValueChange={(value) => {
                    setPriceRange(value as [number, number])
                    setPriceMin(value[0].toString())
                    setPriceMax(value[1].toString())
                  }}
                  className="my-6"
                />
              )}
              <div className="flex items-center space-x-4">
                <div className="grid grid-cols-3 items-center gap-2">
                  <Label htmlFor="price-min">Min $</Label>
                  <Input
                    id="price-min"
                    className="col-span-2"
                    value={priceMin}
                    onChange={e => handlePriceInputChange('min', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-2">
                  <Label htmlFor="price-max">Max $</Label>
                  <Input
                    id="price-max"
                    className="col-span-2"
                    value={priceMax}
                    onChange={e => handlePriceInputChange('max', e.target.value)}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Price range: ${priceRangeLimits.min} - ${priceRangeLimits.max}
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="sort">
          <AccordionTrigger>Sort By</AccordionTrigger>
          <AccordionContent>
            <RadioGroup 
              value={sortBy} 
              onValueChange={setSortBy}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="newest" id="sort-newest" />
                <Label htmlFor="sort-newest">Newest First</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="price_asc" id="sort-price-asc" />
                <Label htmlFor="sort-price-asc">Price: Low to High</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="price_desc" id="sort-price-desc" />
                <Label htmlFor="sort-price-desc">Price: High to Low</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="name_asc" id="sort-name-asc" />
                <Label htmlFor="sort-name-asc">Name: A to Z</Label>
              </div>
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button className="w-full" onClick={applyFilters}>
        Apply Filters
      </Button>
    </div>
  )
}

