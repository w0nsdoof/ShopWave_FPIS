import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Users, Award, TrendingUp, Mail } from "lucide-react"

export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            {/* Hero Section */}
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold mb-4">About ShopWave</h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                    We're on a mission to make quality products accessible to everyone at affordable prices.
                </p>
            </div>

            {/* Our Story */}
            <section className="mb-20">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold mb-6">Our Story</h2>
                        <div className="space-y-4 text-muted-foreground">
                            <p>
                                ShopWave was founded in 2020 with a simple idea: make quality products accessible to everyone at fair
                                prices. What started as a small online shop has grown into a trusted e-commerce destination for
                                thousands of customers.
                            </p>
                            <p>
                                Our journey began when our founders, experienced retail professionals, noticed a gap in the market. They
                                saw that customers were often forced to choose between quality and affordability. ShopWave was
                                created to bridge this gap, offering premium products without the premium price tag.
                            </p>
                            <p>
                                Today, we continue to expand our product range while maintaining our commitment to quality,
                                affordability, and exceptional customer service. We're proud of how far we've come, but we're even more
                                excited about where we're going.
                            </p>
                        </div>
                    </div>
                    <div className="relative h-[400px] rounded-lg overflow-hidden">
                        <Image
                            src="/placeholder.svg?height=800&width=600&text=Our+Story"
                            alt="Our story"
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>
            </section>

            {/* Our Values */}
            <section className="mb-20">
                <h2 className="text-3xl font-bold mb-10 text-center">Our Values</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-primary mb-4">
                                <CheckCircle size={48} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Quality</h3>
                            <p className="text-muted-foreground">
                                We never compromise on quality. Every product in our catalog undergoes rigorous testing and quality
                                checks.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-primary mb-4">
                                <Users size={48} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Customer First</h3>
                            <p className="text-muted-foreground">
                                Our customers are at the heart of everything we do. We're committed to providing exceptional service and
                                support.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-primary mb-4">
                                <Award size={48} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Integrity</h3>
                            <p className="text-muted-foreground">
                                We operate with honesty and transparency in all our dealings with customers, partners, and employees.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Our Team */}
            <section className="mb-20">
                <h2 className="text-3xl font-bold mb-4 text-center">Meet Our Team</h2>
                <p className="text-center text-muted-foreground mb-10 max-w-3xl mx-auto">
                    ShopWave is a student team project developed for the Field Project of Information System course.
                </p>
                <div className="grid md:grid-cols-5 gap-6">
                    {[
                        { name: "Kuat Ayaulym", role: "Project Manager", image: "Kuat+Ayaulym" },
                        { name: "Orynbassar Nurlybek", role: "Frontend Developer", image: "Orynbassar+Nurlybek" },
                        { name: "Tolegenov Ernur", role: "PM Assistant", image: "Tolegenov+Ernur" },
                        { name: "Zhumabayev Askar", role: "Fullstack Developer", image: "Zhumabayev+Askar" },
                        { name: "Zhilikbay Arman", role: "Team Member", image: "Zhilikbay+Arman" },
                    ].map((member, index) => (
                        <div key={index} className="text-center">
                            <div className="relative h-64 mb-4 rounded-lg overflow-hidden">
                                <Image
                                    src={`/placeholder.svg?height=300&width=300&text=${member.name}`}
                                    alt={member.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <h3 className="font-bold text-lg">{member.name}</h3>
                            <p className="text-muted-foreground">{member.role}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Growth Stats */}
            <section className="mb-20 bg-muted rounded-lg p-10">
                <h2 className="text-3xl font-bold mb-10 text-center">Our Growth</h2>
                <div className="grid md:grid-cols-3 gap-8 text-center">
                    <div>
                        <div className="text-primary mb-2">
                            <TrendingUp size={36} className="mx-auto" />
                        </div>
                        <div className="text-4xl font-bold mb-2">10,000+</div>
                        <p className="text-muted-foreground">Happy Customers</p>
                    </div>

                    <div>
                        <div className="text-primary mb-2">
                            <TrendingUp size={36} className="mx-auto" />
                        </div>
                        <div className="text-4xl font-bold mb-2">5,000+</div>
                        <p className="text-muted-foreground">Products Sold</p>
                    </div>

                    <div>
                        <div className="text-primary mb-2">
                            <TrendingUp size={36} className="mx-auto" />
                        </div>
                        <div className="text-4xl font-bold mb-2">15+</div>
                        <p className="text-muted-foreground">Countries Served</p>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Shop with Us?</h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Discover our wide range of high-quality products at unbeatable prices.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" asChild>
                        <Link href="/products">Shop Now</Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                        <Link href="/contact">
                            <Mail className="mr-2 h-4 w-4" />
                            Contact Us
                        </Link>
                    </Button>
                </div>
            </section>
        </div>
    )
}

