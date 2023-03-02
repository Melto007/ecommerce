import User from '../controllers/auth.controller.js'
import CustomError from '../utils/CustomError.js'
import asyncHandler from '../services/asyncHandler.js'
import cookiesOptions from '../utils/CookiesOptions.js'

/**************************************************
*  @Signup
*  @Method POST
*  @Route http://localhost:4000/api/auth/signup 
*  @Description User signup for creating new user
*  @Params name, email, password
*  @return user object
***************************************************/
export const signup = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body

    if(!name || !email || !password) {
        throw new CustomError("fill all the fields", 400)
    }

    const existingUser = await User.findOne({ email })

    if(existingUser) {
        throw new CustomError("User already exists", 400)
    }

    const user = await User.create({
        name: name,
        email: email,
        password: password
    })

    const token = user.getJwtToken()
    user.password = undefined
    res.cookies("token", token, cookiesOptions)
    res.status(200).json({
        success: true,
        token,
        user
    })
})

/**************************************************
*  @LogIn
*  @Method GET
*  @Route http://localhost:4000/api/auth/login 
*  @Description User signIn for logging user
*  @Params email, password
*  @return user object
***************************************************/
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    if(!email || !password) {
        throw new CustomError("fill all the fields", 400)
    }

    const user = await User.findOne({ email }).select("+password")

    if(!user) {
        throw new CustomError("Invalid Credientials", 400)
    }

    const isPasswordMatches = await user.comparePassword(password)

    if(!isPasswordMatches) {
        throw new CustomError("Invalid Credentials", 400)
    }

    const token = user.getJwtToken()
    user.password = undefined
    res.cookies("token", token, cookiesOptions)
    res.status(200).json({
        success: true,
        token,
        user
    })
})

/**************************************************
*  @Logout
*  @Method GET
*  @Route http://localhost:4000/api/auth/logut 
*  @Description User logut 
*  @Params -
*  @return logout message
***************************************************/
export const logout = asyncHandler(async (_req, res) => {
    res.cookies("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })
    res.status(200).json({
        success: true,
        message: "Logged out"
    })
})