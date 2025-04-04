"use client"

import { useEffect, useState } from "react"
import { Star, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { getReviews, createReview } from "@/lib/api/reviews"
import type { Review } from "@/types"

interface ProductReviewsProps {
  productId: number
}

const reviewSchema = z.object({
  rating: z.number().min(1).max(10),
  comment: z.string().min(3, { message: "Comment must be at least 3 characters" }),
})

type ReviewFormValues = z.infer<typeof reviewSchema>

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedRating, setSelectedRating] = useState(0)
  const { user } = useAuth()
  const { toast } = useToast()

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: "",
    },
  })

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true)
      try {
        const data = await getReviews(productId)
        setReviews(data)
      } catch (error) {
        console.error("Failed to fetch reviews:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [productId])

  const onSubmit = async (data: ReviewFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to submit a review.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const newReview = await createReview(productId, {
        rating: data.rating,
        comment: data.comment,
      })

      setReviews([newReview, ...reviews])
      setIsDialogOpen(false)
      form.reset()
      setSelectedRating(0)

      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse w-1/4" />
            </div>
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Customer Reviews</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Write a Review</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Write a Review</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-1">
                          {[...Array(10)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-6 w-6 cursor-pointer ${
                                i < selectedRating ? "fill-primary text-primary" : "text-muted-foreground"
                              }`}
                              onClick={() => {
                                setSelectedRating(i + 1)
                                field.onChange(i + 1)
                              }}
                            />
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comment</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Share your thoughts about this product..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-8 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
          <p className="text-muted-foreground mb-4">Be the first to review this product</p>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Write a Review</Button>
            </DialogTrigger>
          </Dialog>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <div className="font-medium">User {review.user}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex mb-2">
                {[...Array(10)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < review.rating ? "fill-primary text-primary" : "text-muted-foreground"}`}
                  />
                ))}
                <span className="ml-2 text-sm font-medium">{review.rating}/10</span>
              </div>

              <p className="text-muted-foreground">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

