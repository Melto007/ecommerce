import Collection from '../models/collection.schema.js'
import asyncHandler from '../services/asyncHandler.js'
import CustomError from '../utils/CustomError.js'

/*****************************************************
 * @CreateCollection 
 * @Method POST
 * @Route http://localhost:4000/api/collection
 * @Description add collection
 * @Params name
 * @return success message
 *****************************************************/
export const createcollection = asyncHandler(async (req, res) => {
    const user = req.user

    if(!user) {
        throw new CustomError("Unauthorized User", 400)
    }

    const { name } = req.body

    if(!name) {
        throw new CustomError("fill all the fields", 400)
    }

    const collection = await Collection.findOne({ name })

    if(collection) {
        throw new CustomError("Collection already exists", 400)
    }

    await Collection.create({ name: name })
    
    res.status(200).json({
        success: true,
        message: "Collection created successfully"
    })
})

/*****************************************************
 * @UpdateCollection 
 * @Method Update
 * @Route http://localhost:4000/api/collection/:id
 * @Description update collection
 * @Params name
 * @return success message
 *****************************************************/
export const updateCollection = asyncHandler(async (req, res) => {
    const user = req.user

    if(!user) {
        throw new CustomError("Unauthorized User", 400)
    }

    const { id: collectionId } = req.params
    const { name } = req.body

    if(!name) {
        throw new CustomError("fill all the fields", 400)
    }

    const collection = await Collection.findByIdAndUpdate(
        collectionId,
        {
            name: name
        },
        {
            new: true,
            runValidators: true
        }
    )

    if(!collection) {
        throw new CustomError("Collection not exists", 400)
    }
    
    res.status(200).json({
        success: true,
        message: "Updated successfully"
    })
})

/*****************************************************
 * @DeleteCollection 
 * @Method delete
 * @Route http://localhost:4000/api/deletecollection
 * @Description delete collection
 * @Params - id
 * @return success message
 *****************************************************/
export const deleteCollection = asyncHandler(async (req, res) => {
    const user = req.user 

    if(!user) {
        throw new CustomError("Unauthorized User", 400)
    }
    const { id: collectionId } = req.query
    const collection = await Collection.findByIdAndDelete(collectionId)

    if(!collection) {
        throw new CustomError("Collection not found", 400)
    }
    
    res.status(200).json({
        success: true,
        message: 'collection deleted succesfully',
        collection
    })
})

/*****************************************************
 * @GetCollection 
 * @Method get
 * @Route http://localhost:4000/api/getcollection
 * @Description get collection
 * @Params - 
 * @return return all collection, success message
 *****************************************************/
export const fetchCollection = asyncHandler(async (req, res) => {
    const user = req.user

    if(!user) {
        throw new CustomError("Unauthorized User", 400)
    }

    const collection = await Collection.find()

    if(!collection) {
        throw new CustomError("Collections not found", 400)
    }
    
    res.status(200).json({
        success: true,
        collection
    })
})