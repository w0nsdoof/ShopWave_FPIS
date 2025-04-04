"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { getOrders, cancelOrder } from "@/lib/api/orders"
import type { Order } from "@/types"

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true)
      try {
        const data = await getOrders()
        setOrders(data)
      } catch (error) {
        console.error("Failed to fetch orders:", error)
        toast({
          title: "Error",
          description: "Failed to load your orders. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [toast])

  const handleCancelOrder = async (orderId: number) => {
    setCancellingOrderId(orderId)
    try {
      const updatedOrder = await cancelOrder(orderId)

      setOrders(orders.map((order) => (order.id === orderId ? updatedOrder : order)))

      toast({
        title: "Order cancelled",
        description: "Your order has been cancelled successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setCancellingOrderId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Orders</h1>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Orders</h1>
        <div className="text-center py-12 border rounded-lg">
          <Package className="h-12 w-12 mx-auto text-muted-foreground" />
          <h2 className="text-xl font-semibold mt-4 mb-2">No orders yet</h2>
          <p className="text-muted-foreground mb-6">You haven&apos;t placed any orders yet.</p>
          <Button asChild>
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Orders</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="border rounded-lg overflow-hidden">
            <div className="bg-muted px-6 py-4 flex justify-between items-center">
              <div>
                <div className="text-sm text-muted-foreground">
                  Order #{order.id} • {new Date(order.created_at).toLocaleDateString()}
                </div>
                <div className="font-medium">
                  Status:{" "}
                  <span
                    className={`${
                      order.order_status === "pending"
                        ? "text-yellow-600"
                        : order.order_status === "completed"
                          ? "text-green-600"
                          : order.order_status === "cancelled"
                            ? "text-red-600"
                            : ""
                    }`}
                  >
                    {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">${Number(order.total_amount).toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">
                  {order.total_items} {order.total_items === 1 ? "item" : "items"}
                </div>
              </div>
            </div>

            <div className="p-6">
              <h3 className="font-semibold mb-4">Order Items</h3>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="font-medium">{item.product.name}</div>
                      <div className="text-sm text-muted-foreground">Qty: {item.quantity}</div>
                    </div>
                    <div className="font-medium">${Number(item.product.price).toFixed(2)}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-between">
                <Link href={`/orders/${order.id}`}>
                  <Button variant="outline">View Details</Button>
                </Link>

                {order.order_status === "pending" && (
                  <Button
                    variant="destructive"
                    onClick={() => handleCancelOrder(order.id)}
                    disabled={cancellingOrderId === order.id}
                  >
                    {cancellingOrderId === order.id ? "Cancelling..." : "Cancel Order"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

