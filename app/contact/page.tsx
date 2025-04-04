"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/components/ui/use-toast"

const contactFormSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    subject: z.string().min(5, { message: "Subject must be at least 5 characters" }),
    message: z.string().min(10, { message: "Message must be at least 10 characters" }),
})

type ContactFormValues = z.infer<typeof contactFormSchema>

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { toast } = useToast()

    const form = useForm<ContactFormValues>({
        resolver: zodResolver(contactFormSchema),
        defaultValues: {
            name: "",
            email: "",
            subject: "",
            message: "",
        },
    })

    const onSubmit = async (data: ContactFormValues) => {
        setIsSubmitting(true)

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // In a real app, you would send the data to your API
        console.log("Form data:", data)

        toast({
            title: "Message sent",
            description: "We've received your message and will get back to you soon.",
        })

        form.reset()
        setIsSubmitting(false)
    }

    return (
        <div className="container mx-auto px-4 py-12">
            {/* Hero Section */}
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                    Have questions or feedback? We'd love to hear from you. Our team is always here to help.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
                {/* Contact Information */}
                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-start space-x-4">
                                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                                <div>
                                    <h3 className="font-medium">Our Address</h3>
                                    <p className="text-muted-foreground">123 Shopping Street, Retail City, 10001</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-start space-x-4">
                                <Phone className="h-5 w-5 text-primary mt-0.5" />
                                <div>
                                    <h3 className="font-medium">Phone</h3>
                                    <p className="text-muted-foreground">+1 (555) 123-4567</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-start space-x-4">
                                <Mail className="h-5 w-5 text-primary mt-0.5" />
                                <div>
                                    <h3 className="font-medium">Email</h3>
                                    <p className="text-muted-foreground">info@frontstore.com</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-start space-x-4">
                                <Clock className="h-5 w-5 text-primary mt-0.5" />
                                <div>
                                    <h3 className="font-medium">Business Hours</h3>
                                    <p className="text-muted-foreground">Monday - Friday: 9am - 5pm</p>
                                    <p className="text-muted-foreground">Saturday: 10am - 4pm</p>
                                    <p className="text-muted-foreground">Sunday: Closed</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Contact Form */}
                <div className="md:col-span-2">
                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>

                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Your name" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="your.email@example.com" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="subject"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Subject</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="What is this regarding?" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="message"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Message</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="How can we help you?" className="min-h-[150px]" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            "Sending..."
                                        ) : (
                                            <>
                                                <Send className="mr-2 h-4 w-4" /> Send Message
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Map Section */}
            <section className="mb-16">
                <h2 className="text-2xl font-bold mb-6">Find Us</h2>
                <div className="h-[400px] bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">
                        Map would be embedded here. In a real application, you would integrate with Google Maps or another map
                        provider.
                    </p>
                </div>
            </section>

            {/* FAQ Section */}
            <section>
                <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    {[
                        {
                            question: "What are your shipping options?",
                            answer:
                                "We offer standard shipping (3-5 business days), express shipping (1-2 business days), and same-day delivery in select areas.",
                        },
                        {
                            question: "How can I track my order?",
                            answer:
                                "Once your order ships, you'll receive a tracking number via email. You can also view your order status in your account dashboard.",
                        },
                        {
                            question: "What is your return policy?",
                            answer:
                                "We offer a 30-day return policy for most items. Products must be in original condition with tags attached.",
                        },
                        {
                            question: "Do you ship internationally?",
                            answer: "Yes, we ship to over 15 countries worldwide. Shipping times and costs vary by location.",
                        },
                    ].map((faq, index) => (
                        <Card key={index}>
                            <CardContent className="pt-6">
                                <h3 className="font-bold mb-2">{faq.question}</h3>
                                <p className="text-muted-foreground">{faq.answer}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    )
}

