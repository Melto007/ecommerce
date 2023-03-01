import mongoose from "mongoose";
import AuthRoles from "../utils/AuthRoles";
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema(
    {
        user: {
            type: String,
            required: [true, "Name is required"],
            maxLength: [50, "Name must be less than 50 characters"]
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minLength: [8, "Password must have minimum length of 8 characters"],
            select: false
        },
        role: {
            type: String,
            enum: Object.values(AuthRoles),
            default: AuthRoles.USER
        },
        forgotPasswordToken: String,
        forgotPasswordExpiry: Date
    },
    {
        timestamps: true
    }
)

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next()
    this.password = bcrypt.hash(this.password, 10)
    next()
})

export default mongoose.model("User", userSchema)