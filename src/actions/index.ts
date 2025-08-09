import { loginUser, logout, registerUser } from './auth'
import { loadProductsFromCart } from './cart'
import { createUpdateProduct, deleteProductImage, getProductBySlug, getProductsByPage } from './products'

export const server = {
  // actions

  // Auth
  loginUser,
  logout,
  registerUser,

  // Products
  getProductsByPage,
  getProductBySlug,

  // Cart
  loadProductsFromCart,

  // Admin
  // Products
  createUpdateProduct,
  deleteProductImage,
}
