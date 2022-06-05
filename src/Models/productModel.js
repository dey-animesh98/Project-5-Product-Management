const mongoose = require('mongoose')

const productSchema = new mongoose.Schema(
    {
    title:  { 
        type: String, 
        required: true, 
        trim: true,  
        unique:true 
    },
    description: { 
        type: String, 
        required: true, 
        trim: true
    },
    price: {
        type:Number,  //valid number/decimal
        required: true,
        trim: true 
    },           
    currencyId: { 
        type: String,  //INR
        required: true, 
        trim: true
    },    
    currencyFormat: { 
        type: String, //Rupee symbol
        required: true, 
        trim: true
    }, 
    isFreeShipping: {
        type:Boolean, 
        default: false,
        // trim:true
    },
    productImage: { 
        type: String, // s3 link
        required: true, 
        trim: true
    },   
    style: { 
        type: String, 
        trim: true
    },
    availableSizes: [{ 
        type:String, 
        trim:true,
        enum:["S", "XS","M","X", "L","XXL", "XL"] //array of string, at least one size,
        }], 
    installments: {
        type:Number,
        trim: true 
    },
    deletedAt: {
        type:Date
    }, 
    isDeleted: {
        type:Boolean, 
        default: false
    }
    },{timestamps:true}
)

module.exports = mongoose.model('Product',productSchema)