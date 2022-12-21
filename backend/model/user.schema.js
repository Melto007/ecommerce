import mongoose from 'mongoose'
import AuthRoles from '../utlils/authRoles'
import bcrypt from 'bcryptjs'
import JWT from 'jsonwebtoken'
import crypto from 'crypto'
import config from '../config/index'

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "name is required"],
            maxLength: [50, "name must be length of less than 50"]
        },
        email: {
            type: String,
            required: [true, "email is required"],
            unique: true
        },
        password: {
            type: String,
            required: [true, "password is required"],
            minLength: [8, "password must be at least 8 characters"],
            select: false
        },
        role: {
            type: String,
            enum: Object.values(AuthRoles),
            default: AuthRoles.USER
        },
        forgotPasswordToken: String,
        forgotPasswordExpiry: Date,
    },
    {
        timestamps: true
    }
)

userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.method = {
    comparePassword: async function(enteredPassword) {
        return await bcrypt.hash(enteredPassword, this.password)
    },

    getJwtToken: function() {
        return JWT.sign(
            {
                _id: this._id,
                role: this.role
            },
            config.JWT_SECRET,
            {
                expiresIn: config.JWT_EXPIRY
            }
        )
    },

    generateForgotPasswordToken: function() {
        const forgotToken = randomBytes(20).toString('hex')
        this.forgotPasswordToken = crypto.createHash("sha256").update(forgotToken).digest("hex")
        this.forgotPasswordExpiry = new Date(Date.now() + 20 * 60 * 1000)
        return forgotToken
    }
}

export default mongoose.model('User', userSchema)