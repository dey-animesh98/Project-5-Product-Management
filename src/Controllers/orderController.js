const cartModel = require('../Models/cartModel');
const productModel = require('../Models/productModel')
const userModel = require("../Models/userModel");
const orderModel = require("../Models/orderModel")
const { isValidRequestBody, isValidObjectId, isEmpty } = require("../Utilites/validation");


//--------------------------Create Order--------------------------------------------------------//
const createOrder = async (req, res) => {
    try {
        const userId = req.params.userId
        if (!isValidObjectId(userId))
            return res.status(400).send({ status: false, message: "Invalid userId ID" })

        const data = req.body
        if (isValidRequestBody(data))
            return res.status(400).send({ status: false, message: "Empty request body" });

        const { cartId } = data
        if (isEmpty(cartId)) return res.status(400).send({ status: false, message: "cart ID required" })
        if (!isValidObjectId(cartId))
            return res.status(400).send({ status: false, message: "Invalid cart ID" })

        const findUser = await userModel.findOne({ _id: userId })
        if (!findUser) return res.status(404).send({ status: false, message: "User does not exists" })

        const tokenUserId = req.decodeToken.userId;
        if (tokenUserId !== findUser._id.toString())
            return res.status(403).send({ status: false, message: "Unauthorized access" });

        const findCart = await cartModel.findOne({ userId: userId })
        if (!findCart) return res.status(404).send({ status: false, message: "No cart found" })
        if (findCart.items.length === 0) return res.status(400).send({ status: false, message: "No Items in cart" })
        if (cartId !== findCart._id.toString()) {
            return res.status(403).send({ status: false, message: `Cart does not belong to ${findUser.fname} ${findUser.lname}` })
        }

        let totalQ = 0
        let cartItems = findCart.items
        let productId = []
        for (let i = 0; i < cartItems.length; i++) {
            totalQ += cartItems[i].quantity
            productId.push(cartItems[i].productId.toString());
        }
        let validProduct = await productModel.findOne({ _id: { $in: productId }, isDeleted: true })
        if (validProduct) return res.status(404).send({ status: false, message: `Product not found  or has been deleted` })

        const orderDetails = {}
        orderDetails['userId'] = userId
        orderDetails['items'] = cartItems
        orderDetails['totalPrice'] = findCart.totalPrice
        orderDetails['totalItems'] = cartItems.length
        orderDetails['totalQuantity'] = totalQ

        //Change in cart model
        findCart.items = []
        findCart.totalItems = 0
        findCart.totalPrice = 0

        await findCart.save()
        const getOrder = await orderModel.create(orderDetails)
        if (!getOrder) return res.status(400).send({ status: false, message: "Order not Placed" })

        let obj = {
            userId: getOrder.userId,
            items: getOrder.items,
            totalPrice: getOrder.totalPrice,
            totalItems: getOrder.totalItems,
            totalQuantity: getOrder.totalQuantity,
            cancellable: true,
            status: "pending",
            _id: getOrder._id,
            createdAt: getOrder.createdAt,
            updatedAt: getOrder.updatedAt
        }

        return res.status(201).send({ status: true, message: "Success", data: obj })

    } catch (err) {
        return res.status(500).send({ status: false, err: err.message });
    }
}

//Update Order details
const updateOrder = async (req, res) => {
    try {
        const userId = req.params.userId
        if (!isValidObjectId(userId))
            return res.status(400).send({ status: false, message: "Invalid userId ID" })

        const data = req.body
        if (isValidRequestBody(data))
            return res.status(400).send({ status: false, message: "Empty request body" })

        const { orderId, status } = data
        if (isEmpty(orderId)) return res.status(400).send({ status: false, message: "Order Id required" })
        if (isEmpty(status)) return res.status(400).send({ status: false, message: "please enter status." })

        if (!isValidObjectId(orderId))
            return res.status(400).send({ status: false, message: "Invalid order ID" })

        const validUser = await userModel.findOne({ _id: userId })
        if (!validUser) return res.status(404).send({ status: false, message: "User does not exists" })

        const tokenUserId = req.decodeToken.userId;
        if (tokenUserId !== validUser._id.toString())
            return res.status(403).send({ status: false, message: "Unauthorized access" })

        const validOrder = await orderModel.findOne({ _id: orderId })
        if (!validOrder) return res.status(404).send({ status: false, message: "Order does not exists" })

        if (userId !== validOrder.userId.toString())
            return res.status(403).send({ status: false, message: `Order does not belong to ${validUser.fname} ${validUser.lname}` })

        if (['pending', 'completed', 'cancelled'].indexOf(status) === -1)
            return res.status(400).send({ status: false, message: `Order status should be 'pending', 'completed', 'cancelled' ` })

        if (validOrder.status == 'cancelled')
            return res.status(400).send({ status: false, message: "This order is already cancelled" })

        if (validOrder.status == 'completed' && status == 'pending')
            return res.status(400).send({ status: false, message: "This order is already completed" })

        if (status == 'cancelled') {
            if (validOrder.cancellable == false)
                return res.status(400).send({ status: false, message: "This order is not cancellable." })
        }

        validOrder.status = status
        await validOrder.save()
        return res.status(200).send({ status: true, message: `Success`, data: validOrder })
    } catch (err) {
        return res.status(500).send({ status: false, err: err.message });
    }
}

module.exports = { createOrder, updateOrder }

