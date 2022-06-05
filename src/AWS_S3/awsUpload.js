const aws = require("aws-sdk")

aws.config.update({
    accessKeyId: "AKIAY3L35MCRUJ6WPO6J",
    secretAccessKey: "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",
    region: "ap-south-1"
})
// this function will upload file to aws and return the link
let uploadFile= async ( file) =>{
    return new Promise( function(resolve, reject) {
     let s3= new aws.S3({apiVersion: '2006-03-01'});
     var uploadParams= {
         ACL: "public-read",
         Bucket: "classroom-training-bucket",  //HERE
         Key: "ani/" + file.originalname, //HERE 
         Body: file.buffer
     }
 
 
     s3.upload( uploadParams, function (err, data ){
         if(err) {
             return reject({"error": err})
         }
         console.log("file uploaded succesfully")
         return resolve(data.Location)
     })
    })
 }

module.exports = { uploadFile }