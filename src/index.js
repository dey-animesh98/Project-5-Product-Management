const express = require('express')
const bodyParser = require('body-parser')
const {default:mongoose} = require('mongoose')
const multer = require('multer')
const app = express()
const port = 3000;

const routes = require('./Routes/routes')

app.use(bodyParser.json())
app.use(multer().any())

mongoose.connect("mongodb+srv://animesh-dey98:Ir7ZHtxfwy24NFBc@cluster0.i6wv1.mongodb.net/proj-5",
    { useNewUrlParser: true })

    .then(() => console.log("MongoDB is Connected...🥳🎉🎈"))
    .catch((err) => console.log(err.message))

app.use('/', routes)

app.listen(port, () => {
    console.log(`Express app listening on port ${port}...🎧🙉🙉`);
})