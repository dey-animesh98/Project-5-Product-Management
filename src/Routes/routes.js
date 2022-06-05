const express = require("express");
const router = express.Router()
const mid = require('../Middlewares/auth')

const userController = require('../Controllers/userController')
const productController = require('../Controllers/productController')
const cartController = require('../Controllers/cartController')
const orderController = require('../Controllers/orderController')

//user routes
router.post('/register', userController.createUser)
router.post('/login', userController.loginUser)
router.get('/user/:userId/profile', mid.mid1, userController.getUserProfile)
router.put('/user/:userId/profile', mid.mid1, userController.updateUser)

//product api
router.post('/products', productController.createProduct)
router.get('/products', productController.getProduct)
router.get('/products/:productId', productController.productByid)
router.put('/products/:productId', productController.updateProduct)
router.delete('/products/:productId', productController.deleteByid)

//createcart
router.post('/users/:userId/cart', mid.mid1, cartController.createCart)
router.get('/users/:userId/cart', mid.mid1, cartController.getCart)
router.put('/users/:userId/cart', mid.mid1, cartController.updateCart)
router.delete('/users/:userId/cart', mid.mid1, cartController.deleteCart)

//createOrder
router.post('/users/:userId/orders', mid.mid1, orderController.createOrder)
router.put('/users/:userId/orders', mid.mid1, orderController.updateOrder)

module.exports = router