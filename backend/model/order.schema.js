import mongoose from 'mongoose'
import Order from '../utlils/order'

const orderSchema = new mongoose.Schema(
    {
        products: {
            type: [
                {
                    productId: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "Product",
                        required: true
                    }
                }
            ]
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        phoneNumber: {
            type: Number,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        coupon: String,
        transationId: String,
        status: {
            type: Boolean,
            enum: Object.values(Order),
            default: Order.ORDERED
        }
        // paymentMethod: UPI, CreditCard or Wallet, COD
    }
)

export default mongoose.model('Order', orderSchema)