import mongoose from "mongoose";
import app from './app.js'
import config from './config/index.js'

(async () => {
    try {
        await mongoose.connect(config.MONGODB_URL)
        console.log("DB is connected successfully")

        app.on('error', (error) => {
            console.log("ERROR ", error)
            throw error
        })

        const onListening = () => {
            console.log(`APP is running on PORT ${config.PORT}`)
        }

        app.listen(config.PORT, onListening)
    } catch (error) {
        console.log("ERROR ", error)
        throw error
    }
})()