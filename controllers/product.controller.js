import formidable from 'formidable'
import Product from '../model/product.schema.js'
import asyncHandler from '../services/asyncHandler.js'
import { s3FileUpload, s3FileDelete } from '../services/imageUpload.js'
import fs from 'fs'
import Mongoose from 'mongoose' // Mongoose is a object it allows to get id's
import config from '../config/index.js'
import CustomError from '../utils/customError.js'

/*************************************************************
 * @CreateProduct
 * @Method POST
 * @Route http://localhost:5000/api/product
 * @description create product
 * @parameters 
 * @return product object
 ************************************************************/
export const createProduct = asyncHandler(async (req, res) => {
    const form = formidable({
        multiples: true,
        keepExtensions: true // .png, .jpg etc if not it will return false
    })

    form.parse(req, async function (error, fields, files) {
        try {
            if(error) {
                throw new CustomError(error.message || "Failed to upload a file", 400)
            }

            let productId = new Mongoose.Types.ObjectId().toHexString() // generate custom bson id
            console.log(fields, files)
            
            if(!fields.name || !fields.price || !fields.description || !fields.stock || !fields.sold) {
                throw new CustomError("Fill all the fields", 400)
            }

            let imgArrayResp = Promise.all(
                Object.keys(files).map(async (fileKey, index) => {
                    const element = files[fileKey]
                    console.log(element)

                    const data = fs.readFileSync(element.filepath)
                    console.log(data)

                    const upload = await s3FileUpload({
                        bucketName: config.S3_BUCKET_NAME,
                        body: data,
                        contentType: element.mimetype,
                        key: `products/${productId}/photo_${index + 1}.png`
                    })
                    return {
                        secure_url: upload.Location
                    }
                })
            )

            const imgArray = await imgArrayResp

            const product = await Product.create({
                _id: productId,
                photos: imgArray,
                ...fields
            })

            if(!product) {
                throw new CustomError("product was not created", 400)
            }

            res.status(200).json({
                success: true,
                product
            })

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || "product was not created"
            })
        }
    })
})

/*************************************************************
 * @GET_ALL_PRODUCT
 * @Method GET
 * @Route http://localhost:5000/api/product
 * @description get products
 * @parameters -
 * @return product object
 ************************************************************/
export const getAllProducts = asyncHandler(async (_req, res) => {
    const products = await Product.find()

    if(!products) {
        throw new CustomError("Product not found", 400)
    }

    res.status(200).json({
        success: true,
        products
    })
})

/*************************************************************
 * @GET_PRODUCT
 * @Method GET
 * @Route http://localhost:5000/api/product
 * @description get product
 * @parameters -
 * @return product object
 ************************************************************/
export const getProductId = asyncHandler(async(req, res) => {
    const { id: productId } = req.params

    const product = await Product.findById(productId)

    if(!product) {
        throw new CustomError("Product not found", 400)
    }

    res.status(200).json({
        success: true,
        product
    })
})