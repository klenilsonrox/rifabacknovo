import mongoose from "mongoose"

const mongo_URI=`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@rifa.dp3zrzy.mongodb.net/`

export async function connectDB(){
    try {
        await mongoose.connect(mongo_URI)
        console.log(`conectado ao banco de dados com sucesso!`)
    } catch (error) {
        console.log(error)
    }
}