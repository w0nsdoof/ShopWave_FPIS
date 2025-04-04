import { Suspense } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import FeaturedProducts from "@/components/featured-products"
import CategoryList from "@/components/category-list"
import HeroSection from "@/components/hero-section"
import ProductSkeleton from "@/components/product-skeleton"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <HeroSection />

      <section className="my-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Shop by Category</h2>
          <Link href="/categories" className="text-primary flex items-center">
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <CategoryList />
      </section>

      <section className="my-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <Link href="/products" className="text-primary flex items-center">
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <Suspense fallback={<ProductSkeleton count={4} />}>
          <FeaturedProducts />
        </Suspense>
      </section>

      <section className="my-12 bg-muted rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Join Our Newsletter</h2>
        <p className="mb-6 max-w-md mx-auto">Stay updated with the latest products, exclusive offers, and discounts.</p>
        <div className="flex max-w-md mx-auto">
          <input
            type="email"
            placeholder="Your email address"
            className="flex-1 px-4 py-2 rounded-l-md border border-input"
          />
          <Button className="rounded-l-none">Subscribe</Button>
        </div>
      </section>
    </div>
  )
}

