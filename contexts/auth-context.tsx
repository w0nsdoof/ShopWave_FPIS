"use client"

import { createContext, useState, useEffect, type ReactNode } from "react"
import { login as apiLogin, register as apiRegister, logout as apiLogout, getCurrentUser } from "@/lib/api/auth"
import type { User, RegisterData } from "@/types"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<{ success: boolean; validationErrors?: Record<string, string[]> }>
  logout: () => Promise<void>
  refreshUserData: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  register: async () => ({ success: false }),
  logout: async () => {},
  refreshUserData: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUserData = async () => {
    try {
      const userResponse = await getCurrentUser()
      if (userResponse.success && userResponse.data) {
        setUser(userResponse.data)
        localStorage.setItem("user", JSON.stringify(userResponse.data))
        return true
      }
      return false
    } catch (error) {
      console.error("Error fetching user data:", error)
      return false
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is already logged in
        const token = localStorage.getItem("token")
        
        if (token) {
          // Try to fetch fresh user data from API
          const success = await fetchUserData()
          
          // If API call fails, fallback to stored user data
          if (!success) {
            const userData = localStorage.getItem("user")
            if (userData) {
              setUser(JSON.parse(userData))
            }
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const refreshUserData = async () => {
    setIsLoading(true)
    await fetchUserData()
    setIsLoading(false)
  }

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
    
    // Fetch fresh user data from the API
    await fetchUserData()
  }

  const register = async (data: RegisterData) => {
    const response = await apiRegister(data)
    
    if (!response.success) {
      if (response.validationErrors) {
        // Return the validation errors to be handled in the registration form
        return { 
          success: false, 
          validationErrors: response.validationErrors 
        }
      }
      throw new Error(response.error || "Registration failed. Please try again.")
    }
    
    return { success: true }
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

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  )
}

