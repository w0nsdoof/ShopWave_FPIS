import type { User, RegisterData } from "@/types"
import { apiFetch, getApiUrl, setAuthToken, clearAuthToken } from "./api-utils"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Define a response type that includes success/error information
interface AuthResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  validationErrors?: Record<string, string[]>;
}

export async function login(email: string, password: string): Promise<AuthResponse<{ token: string; refresh?: string; user: User }>> {
  try {
    const response = await fetch(getApiUrl("/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
      mode: "cors"
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.message || "Login failed. Please check your credentials."
      }
    }

    const data = await response.json()
    
    // Store token if available
    if (data.token || data.access) {
      const token = data.token || data.access;
      setAuthToken(token);
    }

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
    const response = await fetch(getApiUrl("/auth/register"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
      mode: "cors"
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      
      // Check if we have validation errors
      if (errorData.username || errorData.email) {
        return {
          success: false,
          error: "Validation failed",
          validationErrors: errorData
        }
      }
      
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
    const response = await fetch(getApiUrl("/auth/forgot_password/"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      credentials: "include",
      mode: "cors"
    });

    if (!response.ok) {
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
    const response = await fetch(getApiUrl(`/auth/reset_password/${uid}/${token}/`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
      credentials: "include",
      mode: "cors"
    });

    if (!response.ok) {
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
    const response = await fetch(getApiUrl("/auth/logout/"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      mode: "cors"
    });
    
    // Clear tokens regardless of response
    clearAuthToken();

    // If the endpoint doesn't exist (404) or other error, still consider it a success
    if (!response.ok && response.status !== 404) {
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

export async function getCurrentUser(): Promise<AuthResponse<User>> {
  try {
    const token = localStorage.getItem("token")
    
    if (!token) {
      return {
        success: false,
        error: "No authentication token found"
      }
    }
    
    // Fetch user data from the /auth/me endpoint
    // Using the original implementation without CORS-specific options
    const response = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.message || "Failed to retrieve user data."
      }
    }

    const userData = await response.json()
    
    return {
      success: true,
      data: userData
    }
  } catch (error) {
    console.error('Get current user error:', error)
    return {
      success: false,
      error: "Unable to connect to the server. Please try again later."
    }
  }
}

export async function updateProfile(data: Partial<User>): Promise<AuthResponse<User>> {
  try {
    const token = localStorage.getItem("token");
    
    if (!token) {
      return {
        success: false,
        error: "No authentication token found"
      };
    }
    
    const response = await fetch(getApiUrl("/auth/update_profile"), {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
      mode: "cors"
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.message || "Failed to update profile."
      }
    }

    const userData = await response.json()
    
    return {
      success: true,
      data: userData
    }
  } catch (error) {
    console.error('Update profile error:', error)
    return {
      success: false,
      error: "Unable to connect to the server. Please try again later."
    }
  }
}
