import { z } from 'astro:schema'
import { defineAction } from 'astro:actions'
import { db, eq, Product, ProductImage } from 'astro:db'
import { getSession } from 'auth-astro/server'
import { v4 as UUID } from 'uuid'

export const createUpdateProduct = defineAction({
  accept: 'form',
  input: z.object({
    id: z.string().optional(),
    description: z.string(),
    gender: z.string(),
    price: z.number(),
    sizes: z.string(),
    slug: z.string(),
    stock: z.number(),
    tags: z.string(),
    title: z.string(),
    type: z.string(),

    // TODO: Add image
  }),
  handler: async (form, { request }) => {
    const session = await getSession(request)

    const user = session?.user
    if (!user) {
      throw new Error('Unauthorized')
    }

    // TODO controlar si el usuario tiene permisos, o hacerlo en el middleware

    const { id = UUID(), ...rest } = form

    rest.slug = rest.slug.toLowerCase().replaceAll(' ', '-').trim()

    const product = {
      id,
      // user: user.id!,
      user: user.id!,
      ...rest,
    }

    await db.update(Product).set(product).where(eq(Product.id, id))

    return product
  },
})
