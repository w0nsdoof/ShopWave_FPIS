"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Slider } from "@/components/ui/slider"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { getProducts } from "@/lib/api/products"
import { type Product } from "@/types"

export default function ProductFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Price range state
  const [priceRangeLimits, setPriceRangeLimits] = useState<{min: number, max: number}>({min: 0, max: 1000})
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(searchParams.get("minPrice")) || 0,
    Number(searchParams.get("maxPrice")) || 1000,
  ])
  const [priceMin, setPriceMin] = useState<string>(searchParams.get("minPrice") || "0")
  const [priceMax, setPriceMax] = useState<string>(searchParams.get("maxPrice") || "1000")
  const [sortBy, setSortBy] = useState<string>(searchParams.get("sortBy") || "price_asc") // Changed default from "newest" to "price_asc"
  const [isInitialized, setIsInitialized] = useState(false)
  
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

    // Add price range
    params.set("minPrice", priceRange[0].toString())
    params.set("maxPrice", priceRange[1].toString())
    
    // Add sort option
    params.set("sortBy", sortBy)

    router.push(`/products?${params.toString()}`)
  }

  const resetFilters = () => {
    setPriceRange([priceRangeLimits.min, priceRangeLimits.max])
    setPriceMin(priceRangeLimits.min.toString())
    setPriceMax(priceRangeLimits.max.toString())
    setSortBy("price_asc") // Changed from "newest" to "price_asc"
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

      <Accordion type="multiple" defaultValue={["price", "sort"]}>
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

