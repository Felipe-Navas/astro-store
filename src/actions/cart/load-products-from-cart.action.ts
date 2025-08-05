import type { CartItem } from '@/interfaces'
import { defineAction } from 'astro:actions'
import { db, eq, Product, ProductImage } from 'astro:db'
import { z } from 'astro:schema'

export const loadProductsFromCart = defineAction({
  accept: 'json',

  // * Este codigo se usaba cuando daba error o que la cookie esta undefined
  // input: z.array(
  //   z.object({
  //     productId: z.string(),
  //     size: z.string(),
  //     quantity: z.number(),
  //   })
  // ),
  // handler: async (cart, { cookies }) => {
  handler: async (_, { cookies }) => {
    const cart = JSON.parse(cookies.get('cart')?.value ?? '[]') as CartItem[]

    if (cart.length === 0) return []

    return cart
  },
})
