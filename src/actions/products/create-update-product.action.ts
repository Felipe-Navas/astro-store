import { z } from 'astro:schema'
import { defineAction } from 'astro:actions'
import { db, eq, Product, ProductImage } from 'astro:db'
import { getSession } from 'auth-astro/server'
import { v4 as UUID } from 'uuid'
import { ImageUpload } from '@/utils/image-upload'

const MAX_FILE_SIZE = 5_000_000 // 5MB
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/svg+xml',
]

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

    imageFiles: z
      .array(
        z
          .instanceof(File)
          .refine((file) => file.size <= MAX_FILE_SIZE, 'Max image size 5MB')
          .refine((file) => {
            if (file.size === 0) return true

            return ACCEPTED_IMAGE_TYPES.includes(file.type)
          }, `Only (${ACCEPTED_IMAGE_TYPES.join(', ')}) files are allowed`)
      )
      .optional(),
  }),
  handler: async (form, { request }) => {
    const session = await getSession(request)

    const user = session?.user
    if (!user) {
      throw new Error('Unauthorized')
    }

    // TODO controlar si el usuario tiene permisos, o hacerlo en el middleware

    const { id = UUID(), imageFiles, ...rest } = form

    rest.slug = rest.slug.toLowerCase().replaceAll(' ', '-').trim()

    const product = {
      id,
      // user: user.id!,
      user: user.id!,
      ...rest,
    }

    const queries: any = []

    if (!form.id) {
      queries.push(db.insert(Product).values(product))
    } else {
      queries.push(db.update(Product).set(product).where(eq(Product.id, id)))
    }

    // imageFiles?.forEach(async (imageFile) => {
    //   if (imageFile.size <= 0) return

    //   const url = await ImageUpload.upload(imageFile)
    // })

    // Better way to do the upload images to run in parallel
    let secureUrls: string[] = []
    if (
      form.imageFiles &&
      form.imageFiles.length > 0 &&
      form.imageFiles[0].size > 0
    ) {
      const urls = await Promise.all(
        form.imageFiles.map((file) => ImageUpload.upload(file))
      )

      secureUrls.push(...urls)
    }

    secureUrls.forEach((imageUrl) => {
      const imageObj = {
        id: UUID(),
        image: imageUrl,
        productId: product.id,
      }

      queries.push(db.insert(ProductImage).values(imageObj))
    })

    await db.batch(queries)

    return product
  },
})
