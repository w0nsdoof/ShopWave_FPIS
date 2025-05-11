"use client"

import { useParams, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CategoryPage } from './page'
import DynamicRouteFallback from '../../dynamic-route'

export default function ClientCategoryPage() {
  const params = useParams()
  const pathname = usePathname()
  const [categoryId, setCategoryId] = useState<string | null>(null)
  
  // Extract the category ID from the URL if not available in params
  useEffect(() => {
    if (!params?.id) {
      // Try to extract from pathname
      const matches = pathname.match(/\/categories\/(\d+)/)
      if (matches && matches[1]) {
        console.log('Extracted category ID from pathname:', matches[1])
        setCategoryId(matches[1])
      }
    }
  }, [params, pathname])
  
  const id = params?.id || categoryId
  
  // If we have an ID, render the CategoryPage component
  if (id) {
    console.log('Rendering CategoryPage with id:', id)
    return <CategoryPage params={{ id: id as string }} />
  }
  
  // Otherwise use the fallback handler
  console.log('No category ID found, using fallback')
  return <DynamicRouteFallback />
}
