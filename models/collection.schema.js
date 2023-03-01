import mongoose from 'mongoose'

const collectionSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Category name is required"],
            maxLength: [120, "Length of the category name must be less than 120 characters"]
        }
    },
    {
        timestamps: true
    }
)
export default mongoose.model("Collection", collectionSchema)