import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Product name is required"],
            maxLength: [120, "Length of the product name must be less than 120 characters"]
        }
    },
    {
        timestamps: true
    }
)
export default mongoose.model('Product', productSchema)