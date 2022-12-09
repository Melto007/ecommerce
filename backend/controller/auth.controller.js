import User from '../model/user.schema'
import asyncHandler from '../services/asyncHandler'
import CustomError from '../utils/customError'

import cookiesOptions from '../utils/cookiesOption'

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