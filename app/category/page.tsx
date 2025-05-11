import { Suspense } from 'react'
import ClientCategoryPage from './client-page'

export default function CategoryPage() {
  // Server component that can be statically generated
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientCategoryPage />
    </Suspense>
  )
}
