import type { CartItem } from '@/interfaces'
import { defineAction } from 'astro:actions'
import { db, eq, inArray, Product, ProductImage } from 'astro:db'
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

    // Load products
    const productIds = cart.map((item) => item.productId)

    const dbProducts = await db
      .select()
      .from(Product)
      .innerJoin(ProductImage, eq(Product.id, ProductImage.productId))
      .where(inArray(Product.id, productIds))

    return cart.map((item) => {
      const dbProduct = dbProducts.find((p) => p.Product.id === item.productId)
      if (!dbProduct) {
        return {
          productId: item.productId,
          title: 'Producto no encontrado',
          size: item.size,
          quantity: item.quantity,
          image: 'https://astrostore.dev/images/products/default.jpg',
          price: 0,
          slug: 'product-not-found',
        }
        // throw new Error(`Product with id ${item.productId} not found`)
        console.error(`Product with id ${item.productId} not found`)
        // TODO: Ver como hacer que cuando me quede sin stock, o el producto no exista mostrar un mensaje al usuario
      }

      const { title, price, slug } = dbProduct.Product
      const image = dbProduct.ProductImage.image

      return {
        productId: item.productId,
        title,
        size: item.size,
        quantity: item.quantity,
        image: image.startsWith('http')
          ? image
          : `${import.meta.env.PUBLIC_URL}/images/products/${image}`,
        price,
        slug,
      }
    })
  },
})
