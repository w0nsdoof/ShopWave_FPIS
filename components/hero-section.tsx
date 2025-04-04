import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HeroSection() {
  return (
    <section className="relative bg-muted rounded-lg overflow-hidden">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Shop the Latest Trends</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Discover our wide range of products at unbeatable prices. Quality meets affordability at Front Store.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" asChild>
              <Link href="/products">Shop Now</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/categories">Browse Categories</Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 -z-10 bg-[url('/placeholder.svg?height=600&width=1200')] bg-cover bg-center opacity-20" />
    </section>
  )
}

