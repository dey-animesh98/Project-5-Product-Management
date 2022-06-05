const jwt = require("jsonwebtoken");
const { loginUser } = require("../Controllers/userController");

//Authentication & Authorization

const mid1 = async function (req, res, next) {
  try {
    let token = req.headers.authorization
    if (!token) return res.status(401).send({ status: false, msg: "JWT Token must be present" });
    let splittoken = token.split(' ')
    // decoding token  
     jwt.verify(splittoken[1], "UrAnIuM#GrOuP@19", (err, decode) => {
      if (err) {
        return res.status(401).send({
          status: false,
          message: err.message
        })
      } else {
        req.decodeToken = decode
        next()
      }
    })
  }
  catch (err) {
    return res.status(500).send({ msg: "Error", error: err.message })
  }
}

module.exports.mid1 = mid1