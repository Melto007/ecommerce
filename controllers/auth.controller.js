import User from '../models/user.schema.js'
import CustomError from '../utils/CustomError.js'
import asyncHandler from '../services/asyncHandler.js'
import cookiesOptions from '../utils/CookiesOptions.js'
import mailHelper from '../utils/MailHelper.js'
import crypto from 'crypto'

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
        name,
        email,
        password
    })

    const token = user.getJwtToken()
    user.password = undefined
    res.cookie("token", token, cookiesOptions)
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
        throw new CustomError("Invalid Credentials - pass", 400)
    }

    const token = user.getJwtToken()
    user.password = undefined
    res.cookie("token", token, cookiesOptions)
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
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })
    res.status(200).json({
        success: true,
        message: "Logged out"
    })
})

/**************************************************
*  @ForgotPassword
*  @Method POST
*  @Route http://localhost:4000/api/auth/password/forgot 
*  @Description User Forgot password
*  @Params - email
*  @return change password link to mail
***************************************************/
export const forgotpassword = asyncHandler(async (req, res) => {
    const { email } = req.body

    if(!email) {
        throw new CustomError("Email field is required", 400)
    }

    const user = await User.findOne({email})

    if(!user) {
        throw new CustomError("User not found", 400)
    }
    
    const resetToken = user.generateForgotPasswordToken()

    await user.save({ validateBeforeSave: false })

    const resetUrl = `${req.protocol}://${req.get("host")}/api/auth/password/reset/${resetToken}`

    const text = `Your password reset url is
    \n\n ${resetUrl}\n\n
    `

    try {
        await mailHelper({
            email: user.email,
            subject: "Reset password",
            text: text
        })
        res.status(200).json({
            success: true,
            message: 'reset password link send to your mail'
        })
    } catch (error) {
        user.forgotPasswordToken = undefined
        user.forgotPasswordExpiry = undefined
        await user.save({ validateBeforeSave: false })

        throw new CustomError('Reset password is failed', 400)
    }
})

/**************************************************
*  @RestPassword
*  @Method POST
*  @Route http://localhost:4000/api/auth/password/reset/:resetToken 
*  @Description User resetpassword
*  @Params - password, confirm password
*  @return token, success message
***************************************************/
export const resetPassword = asyncHandler(async (req, res) => {
    const { token: resetToken } = req.params
    const { password, confirmPassword } = req.body

    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    const user = await User.findOne({
        forgotPasswordToken: resetPasswordToken,
        forgotPasswordExpiry: {$gt: Date.now()}
    })

    if(!user) {
        throw new CustomError("Password token is invalid or expired", 400)
    }

    if(password !== confirmPassword) {
        throw new CustomError("Password and ConfirmPassword must be same", 400)
    }

    user.password = password
    user.forgotPasswordToken = undefined
    user.forgotPasswordExpiry = undefined

    await user.save()

    const token = user.getJwtToken()
    user.password = undefined
    res.cookie("token", token, cookiesOptions)
    res.status(200).json({
        success: true,
        token
    })
})

/******************************************************
*  @ChangePassword
*  @Method POST
*  @Route http://localhost:4000/api/auth/password/changepassword 
*  @Description User change password after login
*  @Params - password, confirm password
*  @return token, success message
*******************************************************/
export const changePassword = asyncHandler(async (req, res) => {
    const user = req.user
    const { password, confirmPassword } = req.body

    if(!user) {
        throw new CustomError('Unauthorized User', 400)
    }

    if(!password && !confirmPassword) {
        throw new CustomError("fill all the fields", 400)
    }

    if(password !== confirmPassword) {
        throw new CustomError("password and confirm password must be same", 400)
    }

    const findUser = await User.findOne({ email: user.email }).select("+password")

    if(!findUser) {
        throw new CustomError('Unauthorized User', 400)
    }

    findUser.password = password
    await findUser.save({ validateBeforeSave: false })

    const token = findUser.getJwtToken()
    findUser.password = undefined
    res.cookie("token", token, cookiesOptions)

    res.status(200).json({
        success: true,
        token,
        findUser
    })
})