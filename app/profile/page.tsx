"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Key, LogOut, RefreshCw, Calendar } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Updated schema without password fields
const profileSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }).optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { user, isLoading: authLoading, logout, refreshUserData, forgotPassword, updateProfile } = useAuth()
  
  // Use useEffect for navigation instead of doing it during render
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, authLoading, router])
  
  // Refresh user data on initial load
  useEffect(() => {
    if (user) {
      refreshUserData()
    }
  }, [])
  
  // Form should be initialized AFTER we know user data is available
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.first_name || "",
      lastName: user?.last_name || "",
      email: user?.email || "",
    },
    // This ensures form values are reset when user data changes
    values: user ? {
      firstName: user.first_name || "",
      lastName: user.last_name || "",
      email: user.email || "",
    } : undefined,
  })

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true)
    setProfileUpdateSuccess(false)

    try {
      const payload = {
        first_name: data.firstName,
        last_name: data.lastName,
      }
      
      const result = await updateProfile(payload)
      
      if (!result.success) {
        toast({
          title: "Update failed",
          description: result.error || "There was an error updating your profile. Please try again.",
          variant: "destructive",
        })
      } else {
        setProfileUpdateSuccess(true)
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        })
      }
    } catch (error) {
      toast({
        title: "Update failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestPasswordReset = async () => {
    if (!user?.email) return
    
    setIsLoading(true)
    setResetEmailSent(false)
    
    try {
      const result = await forgotPassword(user.email)
      
      if (!result.success) {
        toast({
          title: "Request failed",
          description: result.error || "Failed to send password reset email. Please try again.",
          variant: "destructive",
        })
      } else {
        setResetEmailSent(true)
        toast({
          title: "Email sent",
          description: "Password reset instructions have been sent to your email.",
        })
      }
    } catch (error) {
      toast({
        title: "Request failed",
        description: "An error occurred while processing your request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefreshProfile = async () => {
    setIsLoading(true)
    try {
      await refreshUserData()
      toast({
        title: "Profile refreshed",
        description: "Your profile information has been refreshed.",
      })
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Failed to refresh your profile information. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/")
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Skeleton className="h-10 w-48 mx-auto" />
            <Skeleton className="h-6 w-72 mx-auto mt-2" />
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center space-y-4">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <div className="text-center">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-40 mt-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Don't render the main content if user is null (useEffect will handle redirect)
  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground mt-2">Manage your account settings and preferences</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Profile Overview</CardTitle>
                <Button size="icon" variant="ghost" onClick={handleRefreshProfile} disabled={isLoading} title="Refresh profile data">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.first_name}+${user.last_name}`} />
                    <AvatarFallback>{user.first_name?.[0]}{user.last_name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">{user.first_name} {user.last_name}</h3>
                    <p className="text-muted-foreground">{user.email}</p>
                  </div>
                  
                  <div className="w-full space-y-2">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">{user.username}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                    {user.date_joined && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">Joined: {new Date(user.date_joined).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <Button variant="outline" className="w-full" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Settings */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent>
                {profileUpdateSuccess && (
                  <Alert className="mb-6 bg-green-50">
                    <AlertDescription className="text-green-800">
                      Your profile information has been successfully updated.
                    </AlertDescription>
                  </Alert>
                )}

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="your.email@example.com" {...field} disabled />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Saving changes..." : "Save Changes"}
                    </Button>
                  </form>
                </Form>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Password Management</h3>
                  {resetEmailSent && (
                    <Alert className="mb-4 bg-blue-50">
                      <AlertDescription className="text-blue-800">
                        Password reset link has been sent to your email address.
                      </AlertDescription>
                    </Alert>
                  )}
                  <p className="text-sm text-muted-foreground mb-4">
                    Need to reset your password? Click the button below to receive a password reset link via email.
                  </p>

                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleRequestPasswordReset}
                    disabled={isLoading}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Send Password Reset Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}