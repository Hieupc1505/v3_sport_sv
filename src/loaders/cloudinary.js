require('dotenv').config()
const env = require('../configs/env')
const { img } = env
const cloudinary = require('cloudinary').v2

cloudinary.config({
    cloud_name: img.CLOUDINARY_NAME,
    api_key: img.CLOUDINARY_API_KEY,
    api_secret: img.CLOUDINARY_API_SECRET,
    secure: true,
})

module.exports = cloudinary
