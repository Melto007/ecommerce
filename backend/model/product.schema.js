import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please provide a product name"],
            trim: true,
            maxLength: [120, "Product name should be maxlength of 120 characters"]
        },
        price: {
            type: Number,
            required: [true, "Please provide a price of a product"],
            maxLength: [5, "Price of the product should be maxlength of 5 digits"]
        },
        description: {
            type: String
        },
        photos: [
            {
                secure_url: {
                    type: String,
                    required: true
                }
            }
        ],
        stock: {
            type: Number,
            default: 0
        },
        sold: {
            type: String,
            default: 0
        },
        collectionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Collection"
        }
    },
    {
        timestamps: true
    }
)
export default mongoose.model('Product', productSchema)