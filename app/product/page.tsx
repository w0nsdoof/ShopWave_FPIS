import { Suspense } from 'react'
import ClientProductPage from './client-page'

export default function ProductPage() {
  // Server component that can be statically generated
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientProductPage />
    </Suspense>
  )
}
