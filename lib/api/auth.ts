import type { User, RegisterData } from "@/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Mock user data for development
const mockUserData: User = {
  id: 1,
  username: "testuser",
  email: "testuser@example.com",
  first_name: "Test",
  last_name: "User",
}

// Define a response type that includes success/error information
interface AuthResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function login(email: string, password: string): Promise<AuthResponse<{ token: string; refresh?: string; user: User }>> {
  try {
    // Attempt to login through the API
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      // Get the error message from the response if available
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.message || "Login failed. Please check your credentials."
      }
    }

    const data = await response.json()

    // Mock user data since the API doesn't return user details
    const userData: User = {
      id: 1,
      username: email.split("@")[0],
      email,
      first_name: "",
      last_name: "",
    }

    return {
      success: true,
      data: { 
        token: data.token || data.access || "mock-token", 
        refresh: data.refresh,
        user: userData 
      }
    }

  } catch (error) {
    console.error('Login error:', error)
    return {
      success: false,
      error: "Unable to connect to the server. Please try again later."
    }
  }
}

export async function register(data: RegisterData): Promise<AuthResponse<{ message: string }>> {
  try {
    // Attempt to register through the API
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      // Get the error message from the response if available
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.message || "Registration failed. Please try again."
      }
    }

    const responseData = await response.json()
    return {
      success: true,
      data: responseData
    }

  } catch (error) {
    console.error('Registration error:', error)
    return {
      success: false,
      error: "Unable to connect to the server. Please try again later."
    }
  }
}

export async function forgotPassword(email: string): Promise<AuthResponse<{ message: string }>> {
  try {
    // Attempt to send password reset email through the API
    const response = await fetch(`${API_URL}/auth/forgot_password/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    })

    if (!response.ok) {
      // Get the error message from the response if available
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.message || "Failed to send password reset email. Please try again."
      }
    }

    const responseData = await response.json()
    return {
      success: true,
      data: responseData
    }

  } catch (error) {
    console.error('Forgot password error:', error)
    return {
      success: false,
      error: "Unable to connect to the server. Please try again later."
    }
  }
}

export async function resetPassword(uid: string, token: string, password: string): Promise<AuthResponse<{ message: string }>> {
  try {
    // Attempt to reset the password through the API
    const response = await fetch(`${API_URL}/auth/reset_password/${uid}/${token}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    })

    if (!response.ok) {
      // Get the error message from the response if available
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.message || "Failed to reset password. Please try again."
      }
    }

    const responseData = await response.json()
    return {
      success: true,
      data: responseData
    }

  } catch (error) {
    console.error('Reset password error:', error)
    return {
      success: false,
      error: "Unable to connect to the server. Please try again later."
    }
  }
}

export async function logout(): Promise<AuthResponse<{ message: string }>> {
  try {
    // Attempt to log out via the API
    const response = await fetch(`${API_URL}/auth/logout/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    // If the endpoint doesn't exist (404) or other error, still consider it a success
    // since we're just clearing local data
    if (!response.ok && response.status !== 404) {
      // Get the error message from the response if available
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.message || "Logout failed. Please try again."
      }
    }

    // Return a successful logout response
    return {
      success: true,
      data: { message: "Logged out successfully" }
    }

  } catch (error) {
    console.error('Logout error:', error)
    // Even if there's an error, we'll still clear local data
    return {
      success: true,
      data: { message: "Logged out successfully" }
    }
  }
}
