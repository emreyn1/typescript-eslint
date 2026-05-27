"use client"

import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"
import type { Product } from "@/lib/data/products"

export interface CartItem {
  product: Product
  quantity: number
  selectedSize: number // ml
  priceAtSelection: number
}

interface CartState {
  items: CartItem[]
}

type CartAction =
  | { type: "ADD_ITEM"; product: Product; size: number; price: number }
  | { type: "REMOVE_ITEM"; productId: string; size: number }
  | { type: "UPDATE_QUANTITY"; productId: string; size: number; quantity: number }
  | { type: "CLEAR_CART" }
  | { type: "HYDRATE"; items: CartItem[] }

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find(
        (item) => item.product.id === action.product.id && item.selectedSize === action.size
      )
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.product.id === action.product.id && item.selectedSize === action.size
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        }
      }
      return {
        items: [
          ...state.items,
          { product: action.product, quantity: 1, selectedSize: action.size, priceAtSelection: action.price },
        ],
      }
    }
    case "REMOVE_ITEM":
      return {
        items: state.items.filter(
          (item) => !(item.product.id === action.productId && item.selectedSize === action.size)
        ),
      }
    case "UPDATE_QUANTITY": {
      if (action.quantity <= 0) {
        return {
          items: state.items.filter(
            (item) => !(item.product.id === action.productId && item.selectedSize === action.size)
          ),
        }
      }
      return {
        items: state.items.map((item) =>
          item.product.id === action.productId && item.selectedSize === action.size
            ? { ...item, quantity: action.quantity }
            : item
        ),
      }
    }
    case "CLEAR_CART":
      return { items: [] }
    case "HYDRATE":
      return { items: action.items }
    default:
      return state
  }
}

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product, size: number, price: number) => void
  removeItem: (productId: string, size: number) => void
  updateQuantity: (productId: string, size: number, quantity: number) => void
  clearCart: () => void
  itemCount: number
  subtotal: number
  shipping: number
  tax: number
  total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = "AllianceAroma-cart"
const FREE_SHIPPING_THRESHOLD = 200
const TAX_RATE = 0.05
const SHIPPING_COST = 25

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] })

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          dispatch({ type: "HYDRATE", items: parsed })
        }
      }
    } catch {
      // ignore
    }
  }, [])

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items))
    } catch {
      // ignore
    }
  }, [state.items])

  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = state.items.reduce((sum, item) => sum + item.priceAtSelection * item.quantity, 0)
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const tax = subtotal * TAX_RATE
  const total = subtotal + shipping + tax

  const value: CartContextType = {
    items: state.items,
    addItem: (product, size, price) => dispatch({ type: "ADD_ITEM", product, size, price }),
    removeItem: (productId, size) => dispatch({ type: "REMOVE_ITEM", productId, size }),
    updateQuantity: (productId, size, quantity) => dispatch({ type: "UPDATE_QUANTITY", productId, size, quantity }),
    clearCart: () => dispatch({ type: "CLEAR_CART" }),
    itemCount,
    subtotal,
    shipping,
    tax,
    total,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
