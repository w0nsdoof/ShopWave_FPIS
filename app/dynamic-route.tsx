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
    console.log('DynamicRouteFallback: handling route for', window.location.pathname)
    
    // Check if we're already on a path that contains a numeric ID
    const pathSegments = window.location.pathname.split('/')
    const pathId = pathSegments[pathSegments.length - 1]
    const isNumericPathId = /^\d+$/.test(pathId)
    const categoryPath = pathSegments.includes('categories') || pathSegments.includes('category')
    const productPath = pathSegments.includes('products') || pathSegments.includes('product')
    const orderPath = pathSegments.includes('orders') || pathSegments.includes('order')
    
    // If the URL already has a numeric ID, we can use that directly
    if (isNumericPathId) {
      console.log('Detected numeric ID in path:', pathId)
      
      if (categoryPath) {
        console.log('Handling category path for ID:', pathId)
        // Remove trailing slash if present
        const cleanPath = `/categories/${pathId}`.replace(/\/$/, '')
        if (window.location.pathname !== cleanPath) {
          router.replace(cleanPath)
        }
        return
      } else if (productPath) {
        console.log('Handling product path for ID:', pathId)
        router.replace(`/products/${pathId}`)
        return
      } else if (orderPath) {
        console.log('Handling order path for ID:', pathId)
        router.replace(`/orders/${pathId}`)
        return
      }
    }
    
    // Read the route parameters from the query string
    const id = searchParams.get('id')
    const orderId = searchParams.get('orderId')
    const slug = searchParams.get('slug')
    
    // Otherwise use query parameters
    if (id) {
      console.log('Using id from query param:', id)
      if (productPath) {
        router.replace(`/products/${id}`)
      } else if (categoryPath) {
        router.replace(`/categories/${id}`)
      }
    } else if (orderId) {
      console.log('Using orderId from query param:', orderId)
      router.replace(`/orders/${orderId}`)
    } else if (slug) {
      console.log('Using slug from query param:', slug)
      router.replace(`/${slug}`)
    }
  }, [router, searchParams])
  
  return <div>Loading...</div>
}

// Also export as default
export default DynamicRouteFallback
