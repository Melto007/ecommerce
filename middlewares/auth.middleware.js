import asyncHandler from '../services/asyncHandler.js'
import CustomError from '../utils/CustomError.js'
import jwt from 'jsonwebtoken'
import config from '../config/index.js'
import User from '../models/user.schema.js'

export const isLoggedIn = asyncHandler(async (req, _res, next) => {
    let token

    if(req.cookies.token || req.headers.authorization && req.headers.authorization.startsWith(`Bearer`)) {
        token = req.cookies.token || req.headers.authorization.split(" ")[1]
    }

    if(!token) {
        throw new CustomError("Not authorizated to access this router", 400)
    }

    try {
        const decodedJwtPayload = jwt.verify(token, config.JWT_SECRET)
        req.user = await User.findById(decodedJwtPayload._id, "name email role") // adding key user in req object
        next()
    } catch (error) {
        throw new CustomError("Not authorizated to access this router", 400)
    }
})