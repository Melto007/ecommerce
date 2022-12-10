import User from '../model/user.schema'
import asyncHandler from '../services/asyncHandler'
import CustomError from '../utils/customError'

import cookiesOptions from '../utils/cookiesOption'
import mailHelper from '../utlils/mailHelper'
import crypto from 'crypto'
import JWT from 'jsonwebtoken'
import config from '../config/index.js'

/************************************************************
 * @SIGNUP 
 * @Method POST
 * @route http://localhost:4000/api/auth/signup
 * @description User sign controller for creating a new user
 * @parameters name, email, password
 * @return User Object
*************************************************************/

export const signUp = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body

    if(!name || !email || !password) {
       throw new CustomError("Please fill all the fields", 400) 
    }

    const userExists = await User.findOne({ email })

    if(userExists) {
        throw new CustomError("User is already exits", 400)
    }

    const user = await User.create(
        name,
        email,
        password
    )
    
    const token = user.getJwtToken()
    user.password = undefined

    res.cookie("token", token, cookiesOptions)

    res.status(200).json(
        {
            success: true,
            token,
            user
        }
    )
})

/************************************************************
 * @LOGIN
 * @Method GET
 * @route http://localhost:4000/api/auth/login
 * @description User login controller for login 
 * @parameters email, password
 * @return User Object
*************************************************************/
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    if(!email || !password) {
        throw new CustomError("All field are required", 400)
    }

    const user = await User.findOne({ email }).select("+password")

    if(!user) {
        throw new CustomError("Invalid Credential", 400)
    }

    const isPasswordMatched = await user.comparePassword(password)

    if(isPasswordMatched) {
        const token = user.getJwtToken()
        user.password = undefined
        res.cookie("token", token, cookiesOptions)
        return res.status(200).json({
            success: true,
            token,
            user
        })
    }

    throw new CustomError("Your Password is incorrect", 400)
})

/************************************************************
 * @LOGOUT
 * @Method GET
 * @route http://localhost:4000/api/auth/logout
 * @description User logout by clearing cookies
 * @parameters -
 * @return Success message
*************************************************************/
export const logout = asyncHandler(async (_req, res) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })
    res.status(200).json({
        success: true,
        message: "Logged Out"
    })
})

/************************************************************
 * @FORGOT_PASSWORD
 * @Method POST
 * @route http://localhost:4000/api/auth/password/forgot
 * @description User forgot password
 * @parameters email 
 * @return success message - email send
*************************************************************/
export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body

    if(!email) {
        throw new CustomError("Email required", 400)
    }

    const user = await User.findOne({ email })
    if(!user) {
        throw new CustomError("User not exits", 400)
    }

    const resetToken = user.generateForgotPasswordToken()
    await user.save({ validateBeforeSave: false })

    const resetUrl = 
    `${req.protocol}://${req.get("host")}/api/auth/password/reset/${resetToken}`

    const text = `Your password reset link is \n\n ${resetToken}`

    try {
        await mailHelper({
            email: user.email,
            subject: 'Password reset email for website',
            text: text
        })
        res.status(200).json({
            success: true,
            message: 'Password reset link send to your email address'
        })
    } catch (error) {
        user.forgotPasswordToken = undefined
        user.forgotPasswordExpiry = undefined
        user.save()
        throw new CustomError(error.message || "Something went wrong please try again later", 400)
    }
})

/************************************************************
 * @RESET_PASSWORD
 * @Method POST
 * @route http://localhost:4000/api/auth/password/reset/:resetToken
 * @description User reset password
 * @parameters token from url, password, confirm password 
 * @return success message
*************************************************************/
export const resetPassword = asyncHandler(async (req, res) => {
    const { token: resetToken } = req.params
    const { password, confirmPassword } = req.body

    const resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")

    const user = await User.findOne({
        forgotPasswordToken: resetPasswordToken,
        forgotPasswordExpiry: {$gt: Date.now()}
    })

    if(!user) {
        throw new CustomError("Your token is invalid or expired", 400)
    }

    if(password !== confirmPassword) {
        throw new CustomError("Your Password and Confirm Password is does not match", 400)
    }

    user.password = password
    user.forgotPasswordToken = undefined
    user.forgotPasswordExpiry = undefined

    await user.save({ validateBeforeSave: false })

    const token = user.getJwtToken()
    user.password = undefined
    res.cookies("token", token, cookiesOptions)

    res.status(200).json({
        success: true,
        user,
        message: "Password Change successfully" 
    })
})

/************************************************************
 * @CHANGE_PASSWORD
 * @Method POST
 * @route http://localhost:4000/api/auth/password/changepassword
 * @description User change password
 * @parameters token from headers, password, confirm password 
 * @return success message
*************************************************************/
export const changePassword = asyncHandler(async (req, res)) => {
    const { headToken } = req.headers
    const { password, confirmPassword } = req.body
    const { token } = req.cookies

    if(password !== confirmPassword) {
        throw new CustomError("Password and Confim Password are not matching")
    }

    const data = JWT.verify(headToken, config.JWT_SECRET)
    const userID = data._id

    const user = await User.findOne({ _id })
    
    if(!user) {
        throw new CustomError("User not exists", 400)
    }

    user.password = password
    await user.save({ validateBeforeSave: false })

    const newToken = user.getJwtToken()
    user.password = undefined
    res.cookie("token", newToken, cookiesOptions)

    res.status(200).json({
        success: true,
        user,
        message: "Password changes successfully"
    })
}