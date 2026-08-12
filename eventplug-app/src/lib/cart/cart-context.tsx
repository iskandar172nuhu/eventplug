"use client"

import * as React from "react"

export interface CartItem {
  rentalItemId: string
  name: string
  vendorId: string
  vendorName: string
  quantity: number
  unitPrice: number
  eventDate: string
  deliveryPreference: "delivery" | "pickup"
  deliveryCharge: number
  serviceLocation: string
}

interface CartContextValue {
  cartItems: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (rentalItemId: string) => void
  updateQuantity: (rentalItemId: string, quantity: number) => void
  clearCart: () => void
  cartTotal: number
}

const CartContext = React.createContext<CartContextValue | undefined>(undefined)

const CART_STORAGE_KEY = "ghana-events-cart"

function loadCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    if (!stored) return []
    return JSON.parse(stored) as CartItem[]
  } catch {
    return []
  }
}

function saveCartToStorage(items: CartItem[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = React.useState<CartItem[]>([])
  const [isHydrated, setIsHydrated] = React.useState(false)

  // Hydrate from localStorage on mount
  React.useEffect(() => {
    setCartItems(loadCartFromStorage())
    setIsHydrated(true)
  }, [])

  // Persist to localStorage whenever cart changes (after hydration)
  React.useEffect(() => {
    if (isHydrated) {
      saveCartToStorage(cartItems)
    }
  }, [cartItems, isHydrated])

  const addItem = React.useCallback((item: CartItem) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.rentalItemId === item.rentalItemId)
      if (existing) {
        // Update quantity if same item already in cart
        return prev.map((i) =>
          i.rentalItemId === item.rentalItemId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        )
      }
      return [...prev, item]
    })
  }, [])

  const removeItem = React.useCallback((rentalItemId: string) => {
    setCartItems((prev) => prev.filter((i) => i.rentalItemId !== rentalItemId))
  }, [])

  const updateQuantity = React.useCallback(
    (rentalItemId: string, quantity: number) => {
      if (quantity <= 0) {
        setCartItems((prev) => prev.filter((i) => i.rentalItemId !== rentalItemId))
        return
      }
      setCartItems((prev) =>
        prev.map((i) =>
          i.rentalItemId === rentalItemId ? { ...i, quantity } : i
        )
      )
    },
    []
  )

  const clearCart = React.useCallback(() => {
    setCartItems([])
  }, [])

  const cartTotal = React.useMemo(() => {
    return cartItems.reduce((total, item) => {
      const itemTotal = item.unitPrice * item.quantity
      const delivery =
        item.deliveryPreference === "delivery" ? item.deliveryCharge : 0
      return total + itemTotal + delivery
    }, 0)
  }, [cartItems])

  const value = React.useMemo<CartContextValue>(
    () => ({
      cartItems,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      cartTotal,
    }),
    [cartItems, addItem, removeItem, updateQuantity, clearCart, cartTotal]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const context = React.useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
