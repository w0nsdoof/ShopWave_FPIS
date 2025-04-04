"use client"

import { useState, useEffect, type FormEvent } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ShoppingCart, Heart, User, Search, Menu, X, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { useCart } from "@/hooks/use-cart"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const { cartItems } = useCart()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
      <header
          className={`sticky top-0 z-50 w-full transition-all duration-200 ${
              isScrolled ? "bg-background/95 backdrop-blur-sm shadow-sm" : "bg-background"
          }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <button className="mr-2 md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <Link href="/" className="text-xl font-bold">
                Front Store
              </Link>
            </div>

            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-sm font-medium hover:text-primary">
                Home
              </Link>
              <Link href="/products" className="text-sm font-medium hover:text-primary">
                Products
              </Link>
              <Link href="/categories" className="text-sm font-medium hover:text-primary">
                Categories
              </Link>
              <Link href="/about" className="text-sm font-medium hover:text-primary">
                About
              </Link>
              <Link href="/contact" className="text-sm font-medium hover:text-primary">
                Contact
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <div className="hidden md:block relative">
                <form onSubmit={handleSearchSubmit}>
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                      type="search"
                      placeholder="Search products..."
                      className="w-[200px] pl-8 md:w-[300px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </form>
              </div>

              <Link href="/wishlist">
                <Button variant="ghost" size="icon" aria-label="Wishlist">
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>

              <Link href="/cart">
                <Button variant="ghost" size="icon" aria-label="Cart" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItems.length > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
                        {cartItems.length}
                      </Badge>
                  )}
                </Button>
              </Link>

              {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="User menu">
                        <User className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href="/profile">My Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/orders">My Orders</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/wishlist">My Wishlist</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout} className="text-destructive">
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
              ) : (
                  <Link href="/auth/login">
                    <Button variant="outline" size="sm">
                      Login
                    </Button>
                  </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
            <div className="md:hidden border-t">
              <div className="container mx-auto px-4 py-3">
                <form onSubmit={handleSearchSubmit} className="relative mb-3">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                      type="search"
                      placeholder="Search products..."
                      className="w-full pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </form>
                <nav className="flex flex-col space-y-3">
                  <Link href="/" className="text-sm font-medium py-2 hover:text-primary">
                    Home
                  </Link>
                  <Link href="/products" className="text-sm font-medium py-2 hover:text-primary">
                    Products
                  </Link>
                  <Link href="/categories" className="text-sm font-medium py-2 hover:text-primary">
                    Categories
                  </Link>
                  <Link href="/about" className="text-sm font-medium py-2 hover:text-primary">
                    About
                  </Link>
                  <Link href="/contact" className="text-sm font-medium py-2 hover:text-primary">
                    Contact
                  </Link>
                </nav>
              </div>
            </div>
        )}
      </header>
  )
}

