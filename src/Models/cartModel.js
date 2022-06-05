const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

const cartSchema = new mongoose.Schema({

    userId: {
        type: ObjectId,
        ref: 'User',
        required: true,
        trim: true,
        unique: true
    },
    items: [{
        productId: {
            type: ObjectId,
            ref: 'Product',
            required: true,
            trim: true
        },

        quantity: {
            type: Number,
            required: true,
            trim: true,
            min: 1
        },
        _id: false
    }],
    totalPrice: {
        type: Number,
        required: true,
        trim: true,
    },           // comment: "Holds total price of all the items in the cart"

    totalItems: {
        type: Number,
        required: true,
        trim: true,
    },          //comment: "Holds total number of items in the cart"
}, { timestamps: true })

module.exports = mongoose.model('Cart', cartSchema)