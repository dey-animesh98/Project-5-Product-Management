const mongoose = require("mongoose")


let isValidRequestBody = function (body) {
    if (Object.keys(body).length === 0) return true;
    return false;
}

let isEmpty = function (value) {
    if (typeof value === 'undefined' || value === null) return true;
    if (typeof value === 'string' && value.trim().length === 0) return true;
    

    return false;
}

let isValidPhone = function (number) {
    let phoneRegex = /^[+91]{3}?[6789]{1}\d{9}$/;
    return phoneRegex.test(number);
}

let isValidEmail = function (email) {
    let emailRegex = /^([A-Za-z0-9._-]{2,}@[A-Za-z]{3,}[.]{1}[A-Za-z.]{2,6})+$/
    return emailRegex.test(email)
}

let isValidPassword = function (password) {
    let passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/
    return passwordRegex.test(password)
}

let isValidObjectId = function (ObjectId) {
    return mongoose.isValidObjectId(ObjectId)
}
let checkPincode = (pincode) => {
    let pincoderegex = /^[1-9]{1}?[0-9]{5}$/
    return pincoderegex.test(pincode)
}
let checkImage = (img) => {
    let imageRegex = /(jpeg|png|jpg)$/
    return imageRegex.test(img)
}
let stringCheck = (string) => {
    let stringreg = /^[#.a-zA-Z0-9\s,-]+$/
    return stringreg.test(string)
}

let numCheck = (num) => {
    let numCheck = /^[\0-9]*$/
    return numCheck.test(num)
}

 let anyObjectKeysEmpty = (value) =>{ 
    let obArr = Object.keys(value)
    let str = ''
    obArr.forEach(e=>{
        if(value.hasOwnProperty(e) && value[e].trim() == "") {
            str+=`${e} `
        }
    })

    str = str.trim()
    return str==""?false:str
 }


module.exports = {
    isValidRequestBody,
    isEmpty,
    isValidEmail,
    isValidPhone,
    isValidPassword,
    isValidObjectId,
    checkPincode,
    checkImage,
    stringCheck,
    numCheck,
    anyObjectKeysEmpty
}