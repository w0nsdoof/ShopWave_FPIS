"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { format } from "date-fns"
import { ArrowLeft, Clock, CreditCard, Package, XCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface OrderItem {
  id: number
  product: {
    id: number
    name: string
    description: string
    price: string
    stock_quantity: number
    category: number
    category_name: string
    created_at: string
    updated_at: string
  }
  quantity: number
  price: string
  subtotal: number
  created_at: string
  updated_at: string
  is_in_stock: boolean
}

interface Payment {
  id: number
  order: number
  amount: string
  payment_method: string
  status: string
  unique_token: string
  expiration_time: string
  is_expired: boolean
  time_remaining: string
}

interface Order {
  id: number
  user: number
  order_status: string
  total_amount: string
  items: OrderItem[]
  total_items: number
  created_at: string
  updated_at: string
  payment: Payment
  status_display: string
  is_cancelable: boolean
}

export default function OrderPage() {
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('Authentication token not found')
        }

        const response = await fetch(`http://localhost/api/orders/${params.orderId}/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Authentication failed. Please login again.')
          }
          throw new Error('Failed to fetch order')
        }
        
        const data = await response.json()
        setOrder(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrder()
  }, [params.orderId])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error Loading Order</h2>
          <p className="text-muted-foreground mb-4">{error || 'Order not found'}</p>
          <Button asChild>
            <Link href="/orders">Back to Orders</Link>
          </Button>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'processing': 'bg-blue-100 text-blue-800'
    }
    return statusColors[status.toLowerCase() as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/orders" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Order #{order.id}</h1>
            <p className="text-muted-foreground">
              Placed on {format(new Date(order.created_at), 'MMMM d, yyyy')}
            </p>
          </div>
          <Badge className={`${getStatusBadge(order.order_status)} text-sm font-medium px-3 py-1`}>
            {order.status_display}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Order Items</h2>
            <div className="space-y-6">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 pb-6 border-b last:border-0">
                  <div className="relative w-24 h-24 bg-muted rounded">
                    <Image
                      src={`/placeholder.svg?height=96&width=96&text=${encodeURIComponent(item.product.name)}`}
                      alt={item.product.name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{item.product.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Quantity:</span> {item.quantity}
                      </div>
                      <div className="font-medium">${Number(item.price).toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Items ({order.total_items})</span>
                <span>${Number(order.total_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>Free</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${Number(order.total_amount).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <span>{order.payment.payment_method}</span>
              </div>
              {order.payment.is_expired ? (
                <div className="flex items-center gap-2 text-red-600">
                  <Clock className="h-5 w-5" />
                  <span>Payment Link Expired</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-yellow-600">
                  <Clock className="h-5 w-5" />
                  <span>Payment Link Expires in: {order.payment.time_remaining.split(':').slice(1, 3).join(':').split('.')[0]}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 