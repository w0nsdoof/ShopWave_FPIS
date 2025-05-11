"use client"

import { useEffect, useState } from "react"
import { CategoryPage } from '../[id]/page'
import { getCategory, getCategorySubcategories, getCategoryProducts } from "@/lib/api/categories"
import { Loader2 } from "lucide-react"

export default function Category19Page() {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  
  useEffect(() => {
    const validateCategory = async () => {
      try {
        console.log('Checking category 19 data')
        const categoryData = await getCategory(19)
        console.log('Category 19 data:', categoryData)
        
        const subcategories = await getCategorySubcategories(19)
        console.log('Category 19 subcategories:', subcategories)
        
        const products = await getCategoryProducts(19)
        console.log('Category 19 products:', products)
        
        // If we got here without errors, the data exists
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching category 19:', error)
        setHasError(true)
        setErrorMessage(error instanceof Error ? error.message : String(error))
        setIsLoading(false)
      }
    }
    
    validateCategory()
  }, [])
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p>Checking category 19 data...</p>
        </div>
      </div>
    )
  }
  
  if (hasError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center bg-red-50 p-8 rounded-lg border border-red-200">
          <h1 className="text-2xl font-bold mb-4 text-red-700">Error Loading Category</h1>
          <p className="text-red-600 mb-4">{errorMessage}</p>
          <p className="text-gray-600">
            This special diagnostic page for category ID 19 detected an error. 
            Please check the console for more details.
          </p>
        </div>
      </div>
    )
  }
  
  // If we got here, the category exists, render the regular category page
  return <CategoryPage params={{ id: "19" }} />
}
