"use client"

// This component handles client-side dynamic routing for static exports
// When the page is loaded, it will check the URL and perform client-side 
// navigation to the correct dynamic route

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export function DynamicRouteFallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    // Read the route parameters from the query string
    const id = searchParams.get('id')
    const orderId = searchParams.get('orderId')
    const slug = searchParams.get('slug')
    
    // Determine which route to navigate to based on available parameters
    if (id) {
      if (window.location.pathname.includes('/products')) {
        router.push(`/products/${id}`)
      } else if (window.location.pathname.includes('/categories')) {
        router.push(`/categories/${id}`)
      }
    } else if (orderId) {
      router.push(`/orders/${orderId}`)
    } else if (slug) {
      router.push(`/${slug}`)    }
  }, [router, searchParams])
  
  return <div>Loading...</div>
}

// Also export as default
export default DynamicRouteFallback
