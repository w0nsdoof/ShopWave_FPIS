"use client"

import { createContext, useState, useEffect, type ReactNode } from "react"
import { login as apiLogin, register as apiRegister, logout as apiLogout } from "@/lib/api/auth"
import type { User, RegisterData } from "@/types"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is already logged in
        const userData = localStorage.getItem("user")
        if (userData) {
          setUser(JSON.parse(userData))
        }
      } catch (error) {
        console.error("Auth check failed:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const response = await apiLogin(email, password)
    
    if (!response.success) {
      throw new Error(response.error || "Login failed. Please check your credentials.")
    }
    
    if (!response.data) {
      throw new Error("Login response is missing data.")
    }
    
    setUser(response.data.user)
    localStorage.setItem("user", JSON.stringify(response.data.user))
    
    // Store token if available
    if (response.data.token) {
      localStorage.setItem("token", response.data.token)
    }
    
    // Store refresh token if available
    if (response.data.refresh) {
      localStorage.setItem("refreshToken", response.data.refresh)
    }
  }

  const register = async (data: RegisterData) => {
    const response = await apiRegister(data)
    
    if (!response.success) {
      throw new Error(response.error || "Registration failed. Please try again.")
    }
  }

  const logout = async () => {
    const response = await apiLogout()
    
    if (!response.success) {
      throw new Error(response.error || "Logout failed. Please try again.")
    }
    
    setUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    localStorage.removeItem("refreshToken")
  }

  return <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>{children}</AuthContext.Provider>
}

