import Collection from '../model/collection.schema.js'
import asyncHandler from '../services/asyncHandler'
import CustomError from '../utlils/customError'

/*************************************************************
 * @Create_Collection
 * @Method POST
 * @Route http://localhost:5000/api/collection
 * @description User create collections
 * @parameters name
 * @return success message, collections object
 ************************************************************/
export const createCollection = asyncHandler(async (req, res) => {
    const { name } = req.body

    if(!name) {
        throw new CustomError("Name field is required", 400)
    }

    const collection = await Collection.create({
        name
    })

    res.status(200).json({
        success: true,
        message: "collection created successfully",
        collection
    })
})

/*************************************************************
 * @Update_Collection
 * @Method POST
 * @Route http://localhost:5000/api/updatecollection
 * @description User update collections
 * @parameters name
 * @return success message, collections object
 ************************************************************/
export const updateCollection = asyncHandler(async () => {
    const { id: collectionID } = req.params
    const { name } = req.body

    if(!name) {
        throw new CustomError('Name field is required', 400)
    }

    const updatedCollection = await Collection.findByIdAndUpdate(
        collectionID,
        {
            name
        },
        {
            new: true, // it will return the newly updated value
            runValidators: true
        }
    )

    if(!updatedCollection) {
        throw new CustomError('Collection not found', 400)
    }
    
    res.status(200).json({
        success: true,
        message: "Successfully updated",
        updatedCollection
    })
})