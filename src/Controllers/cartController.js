const cartModel = require('../Models/cartModel');
const productModel = require('../Models/productModel')
const userModel = require("../Models/userModel");
const {
    isValidRequestBody,
    isEmpty,
    isValidObjectId
} = require("../Utilites/validation");

//======================================================🛒🔨🔧[CREATE CART]=================================================//
const createCart = async (req, res) => {
    try {

        let data = JSON.parse(JSON.stringify(req.body));
        if (isValidRequestBody(data))
            return res.status(400).send({ status: false, message: "Body cannot be empty" });

        let userId = req.params.userId
        if (!isValidObjectId(userId))
            return res.status(400).send({ status: false, message: "Invalid userId ID" })

        //getting token from req in auth    
        const tokenUserId = req.decodeToken.userId;
        let { productId, cartId, quantity } = data
        if (isEmpty(productId))
            return res.status(400).send({ status: false, message: "product required" })

        if (!quantity) {
            quantity = 1
        }
        quantity = Number(quantity)
        if (typeof quantity !== 'number')
            return res.status(400).send({ status: false, message: "quantity is number" })
        if (quantity < 1)
            return res.status(400).send({ status: false, message: "quantity cannot be less then 1" })
        if (!isValidObjectId(productId))
            return res.status(400).send({ status: false, message: "Invalid product ID" })
        if (cartId) {
            if (!isValidObjectId(cartId))
                return res.status(400).send({ status: false, message: "Invalid cart ID" })
        }

        //checking for valid user
        let validUser = await userModel.findOne({ _id: userId })
        if (!validUser) return res.status(404).send({ status: false, message: "User does not exists" })

        if (cartId) {
            var findCart = await cartModel.findOne({ _id: cartId })
            if (!findCart)
                return res.status(404).send({ status: false, message: "Cart does not exists" })
        }

        // user authorization    
        if (validUser._id.toString() !== tokenUserId)
            return res.status(403).send({ status: false, message: "Unauthorized access" });

        //searching for product    
        let validProduct = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!validProduct) return res.status(404).send({ status: false, message: "No products found or product has been deleted" })

        let validCart = await cartModel.findOne({ userId: userId })
        if (!validCart && findCart) {
            return res.status(403).send({ status: false, message: `Cart does not belong to ${validUser.fname} ${validUser.lname}` })
        }
        if (validCart) {
            if (cartId) {
                if (validCart._id.toString() != cartId)
                    return res.status(403).send({ status: false, message: `Cart does not belong to ${validUser.fname} ${validUser.lname}` })
            }
            let productIdCart = validCart.items
            let uptotal = validCart.totalPrice + (validProduct.price * Number(quantity))
            let proId = validProduct._id.toString()
            for (let i = 0; i < productIdCart.length; i++) {
                let productIdFromItem = productIdCart[i].productId.toString()

                //updates old product i.e QUANTITY & Total Price
                if (proId == productIdFromItem) {
                    let oldQuant = productIdCart[i].quantity
                    let newQuant = oldQuant + quantity
                    productIdCart[i].quantity = Number(newQuant)
                    validCart.totalPrice = Number(uptotal)
                    await validCart.save();
                    return res.status(201).send({ status: true, message: 'Success', data: validCart })
                }
            }
            //adds new product
            validCart.items.push({ productId: productId, quantity: Number(quantity) })
            let total = validCart.totalPrice + (validProduct.price * Number(quantity))
            validCart.totalPrice = Number(total)
            let count = validCart.totalItems
            validCart.totalItems = count + 1
            await validCart.save()
            return res.status(201).send({ status: true, message: 'Success', data: validCart })
        }

        // 1st time cart
        let calprice = validProduct.price * Number(quantity)
        let obj = {
            userId: userId,
            items: [{
                productId: productId,
                quantity: quantity
            }],
            totalPrice: calprice,
        }
        obj['totalItems'] = obj.items.length
        let result = await cartModel.create(obj)
        return res.status(201).send({ status: true, message: 'Success', data: result })
    }
    catch (err) {
        return res.status(500).send({ status: false, err: err.message });
    }
}

//======================================================🔄🛒🛒[UPDATE CART]===========================================================
const updateCart = async (req, res) => {
    try {
        let userId = req.params.userId
        if (!isValidObjectId(userId))
            return res.status(400).send({ status: false, message: "Invalid user ID" })

        let data = JSON.parse(JSON.stringify(req.body))
        if (isValidRequestBody(data))
            return res.status(400).send({ status: false, message: "Body cannot be empty" });

        let tokenUserId = req.decodeToken.userId
        let { cartId, productId, removeProduct } = data

        if (isEmpty(cartId))
            return res.status(400).send({ status: false, message: "cartId required" });
        if (!isValidObjectId(cartId))
            return res.status(400).send({ status: false, message: "Invalid cart ID" })
        if (isEmpty(productId))
            return res.status(400).send({ status: false, message: "productId required" });
        if (!isValidObjectId(productId))
            return res.status(400).send({ status: false, message: "Invalid product ID" })
        if (isEmpty(removeProduct))
            return res.status(400).send({ status: false, message: "removeProduct required" });

        removeProduct = parseInt(removeProduct)
        if (![1, 0].includes(removeProduct))
            return res.status(400).send({ status: false, message: "removeproduct can only be 0 or 1" })

        //Authorization
        if (userId !== tokenUserId)
            return res.status(403).send({ status: false, message: "Unauthorized access" });

        let validUser = await userModel.findById(userId).catch(e => null)
        if (!validUser) return res.status(404).send({ status: false, message: "User doesn't exits" });

        let validProduct = await productModel.findOne({ _id: productId, isDeleted: false }).catch(e => null)
        if (!validProduct) return res.status(404).send({ status: false, message: "product doesn't exits or has been deleted" });

        let validCart = await cartModel.findOne({ userId: userId }).catch(e => null)
        if (!validCart) return res.status(404).send({ status: false, message: "cart doesn't exists" });

        if (validCart._id != cartId)
            return res.status(403).send({ status: false, message: `Cart does not belong to ${validUser.fname} ${validUser.lname}` })
        //🔰🔺 real work is done below
        if (removeProduct == 0) {
            let itemsarr = validCart.items
            if (itemsarr.length == 0)
                return res.status(400).send({ status: false, message: "No products to remove cart is empty" })

            for (let i = 0; i < itemsarr.length; i++) {
                let productIdInitems = itemsarr[i].productId.toString()
                let quantity = itemsarr[i].quantity
                let index = i
                if (productIdInitems == productId) {
                    itemsarr.splice(index, 1)
                    let priceReduce = validCart.totalPrice - (validProduct.price * quantity)
                    validCart.totalPrice = Number(priceReduce);
                    let items = validCart.totalItems
                    validCart.totalItems = items - 1
                    await validCart.save()
                    return res.status(200).send({ status: true, message: 'Success', data: validCart })
                }
            }
            return res.status(404).send({ status: false, message: "No products found with given productid in cart" })
        }
        if (removeProduct == 1) {
            let itemsarr = validCart.items
            if (itemsarr.length == 0)
            return res.status(404).send({ status: false, message: "No products found to reduce with given productid in cart" })
           
            for (let i = 0; i < itemsarr.length; i++) {
                let quantity = itemsarr[i].quantity
                let productIdInitems = itemsarr[i].productId.toString()
                if (productId == productIdInitems) {
                    if (quantity == 1) {
                        let index = i
                        itemsarr.splice(index, 1)
                        let priceReduce = validCart.totalPrice - (validProduct.price * quantity)
                        validCart.totalPrice = Number(priceReduce);
                        let items = validCart.totalItems
                        validCart.totalItems = items - 1
                        await validCart.save();
                        return res.status(200).send({ status: true, message: 'Success', data: validCart })
                    }
                    
                    let priceReduce = validCart.totalPrice - validProduct.price
                    let newquant = quantity - 1
                    itemsarr[i].quantity = newquant
                    validCart.totalPrice = Number(priceReduce)
                    await validCart.save();
                    return res.status(200).send({ status: true, message: 'Success', data: validCart })
                }
            }
            return res.status(404).send({ status: false, message: "No products found with given productid in your cart" })

        }
    }
    catch (err) {
        return res.status(500).send({ err: err.message });
    }
}

//======================================================📢🧲🛒[GET CART]===============================================================

const getCart = async (req, res) => {
    try {
        let userId = req.params.userId
        if (!isValidObjectId(userId))
            return res.status(400).send({ status: false, message: "Invalid userId ID" })

        let validUser = await userModel.findOne({ _id: userId })
        if (!validUser) return res.status(404).send({ status: false, message: "User does not exists" })
        // user authorization    
        let tokenUserId = req.decodeToken.userId;
        if (validUser._id.toString() !== tokenUserId)
            return res.status(403).send({ status: false, message: `Unauthorized access` });

        let validCart = await cartModel.findOne({ userId: userId }).select({ "items._id": 0, __v: 0 })
        if (!validCart) return res.status(404).send({ status: false, message: "No cart found" })

        return res.status(200).send({ status: true, message: 'Success', data: validCart })
    }
    catch (err) {
        return res.status(500).send({ status: false, err: err.message });
    }
}
//====================================================💥❌🛒[DELETE  CART]===============================================================

const deleteCart = async (req, res) => {
    try {
        let userId = req.params.userId
        if (!isValidObjectId(userId))
            return res.status(400).send({ status: false, message: "Invalid userId ID" })

        let validUser = await userModel.findOne({ _id: userId })
        if (!validUser) return res.status(404).send({ status: false, message: "User does not exists" })

        let tokenUserId = req.decodeToken.userId;
        if (validUser._id.toString() !== tokenUserId)
            return res.status(403).send({ status: false, message: "Unauthorized access" });

        let validCart = await cartModel.findOne({ userId: userId })
        if (!validCart) return res.status(404).send({ status: false, message: "No cart found" })

        let empty = []
        validCart.items = empty
        validCart.totalPrice = 0;
        validCart.totalItems = 0;
        await validCart.save();
        return res.status(204).send({ status: true, message: 'Success' })
    }
    catch (err) {
        return res.status(500).send({ status: false, err: err.message });
    }
}
module.exports = { createCart, getCart, updateCart, deleteCart }