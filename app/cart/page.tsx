"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/use-cart"
import { createOrderFromCart } from "@/lib/api/orders"
import { MessageModal } from "@/components/ui/message-modal"

export default function CartPage() {
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    title: string
    description: string | React.ReactNode
  }>({
    isOpen: false,
    title: "",
    description: "",
  })

  const { cartItems, updateCartItem, removeFromCart, isLoading } = useCart()

  console.log('Cart Items:', cartItems)
  console.log('Is Loading:', isLoading)

  const subtotal = cartItems.reduce((total, item) => {
    return total + Number(item.product.price) * item.quantity
  }, 0)

  const showMessage = (title: string, description: string | React.ReactNode) => {
    console.log('Showing message:', { title, description })
    setModalState({
      isOpen: true,
      title,
      description,
    })
  }

  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return

    try {
      await updateCartItem(itemId, newQuantity)
    } catch (error) {
      showMessage("Error", "Failed to update cart. Please try again.")
    }
  }

  const handleRemoveItem = async (itemId: number) => {
    try {
      await removeFromCart(itemId)
      showMessage("Success", "The item has been removed from your cart.")
    } catch (error) {
      showMessage("Error", "Failed to remove item. Please try again.")
    }
  }

  const handleCheckout = async () => {
    setIsCheckingOut(true)
    try {
      const response = await createOrderFromCart()
      console.log('Checkout response:', response)

      if (response.payment_url) {
        // Show success message first
        showMessage(
          "Order Created",
          <div className="space-y-4">
            <p>We've sent a payment confirmation to your email.</p>
            <p className="text-sm text-muted-foreground">
              For testing purposes, you can use this payment URL:{" "}
              <a 
                href={response.payment_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {response.payment_url}
              </a>
            </p>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  // Clear cart only when user clicks View Order
                  Promise.all(cartItems.map(item => removeFromCart(item.id)))
                    .catch(error => console.error('Error clearing cart:', error))
                  window.location.href = `/orders/${response.order.id}`
                }}
              >
                View Order #{response.order.id}
              </Button>
            </div>
          </div>
        )
      } else {
        showMessage(
          "Order created", 
          <div className="space-y-4">
            <p>Your order has been created successfully.</p>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  // Clear cart only when user clicks View Order
                  Promise.all(cartItems.map(item => removeFromCart(item.id)))
                    .catch(error => console.error('Error clearing cart:', error))
                  window.location.href = `/orders/${response.order.id}`
                }}
              >
                View Order #{response.order.id}
              </Button>
            </div>
          </div>
        )
      }
    } catch (error) {
      console.error('Checkout error:', error)
      showMessage("Checkout failed", "There was an error processing your order. Please try again.")
    } finally {
      setIsCheckingOut(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        <div className="text-center py-12 border rounded-lg">
          <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground" />
          <h2 className="text-xl font-semibold mt-4 mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Looks like you haven&apos;t added any products to your cart yet.</p>
          <Button asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <MessageModal
        isOpen={modalState.isOpen}
        onClose={() => {
          console.log('Closing modal')
          setModalState(prev => ({ ...prev, isOpen: false }))
        }}
        title={modalState.title}
        description={modalState.description}
        duration={10000}
      />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted px-6 py-4">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-2 text-center">Price</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>
              </div>

              <div className="divide-y">
                {cartItems.map((item) => (
                  <div key={item.id} className="px-6 py-4">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-6">
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-16 bg-muted rounded">
                            <Image
                              src={
                                item.product.image 
                                  ? (item.product.image.startsWith('http') ? item.product.image : `/api/media${item.product.image}`)
                                  : `/placeholder.svg?height=64&width=64&text=${encodeURIComponent(item.product.name)}`
                              }
                              alt={item.product.name}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                          <div>
                            <h3 className="font-medium">{item.product.name}</h3>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-sm text-red-500 flex items-center mt-1"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="col-span-2 text-center">${Number(item.product.price).toFixed(2)}</div>

                      <div className="col-span-2">
                        <div className="flex items-center justify-center">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="mx-2 w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="col-span-2 text-right font-medium">
                        ${(Number(item.product.price) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>Free</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </div>

              <Button className="w-full" size="lg" onClick={handleCheckout} disabled={isCheckingOut}>
                {isCheckingOut ? "Processing..." : "Checkout"}
              </Button>

              <div className="mt-4 text-center">
                <Link href="/products" className="text-sm text-primary hover:underline">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

