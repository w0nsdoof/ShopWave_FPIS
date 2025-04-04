"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface SearchBarProps {
    className?: string
    placeholder?: string
    buttonText?: string
    showButton?: boolean
}

export default function SearchBar({
                                      className = "",
                                      placeholder = "Search products...",
                                      buttonText = "Search",
                                      showButton = false,
                                  }: SearchBarProps) {
    const [query, setQuery] = useState("")
    const router = useRouter()

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query.trim())}`)
        }
    }

    return (
        <form onSubmit={handleSubmit} className={`relative flex w-full ${className}`}>
            <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder={placeholder}
                    className="w-full pl-8"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>
            {showButton && (
                <Button type="submit" className="ml-2">
                    {buttonText}
                </Button>
            )}
        </form>
    )
}

