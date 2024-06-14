import mongoose from "mongoose";
import colors from "colors";

export const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.DATABASE_URL)
        const url = `${connection.connection.host}/${connection.connection.port}`
        console.log(colors.magenta.bold(`MongoDB connected: ${url}`));
    } catch (error) {
        console.log(colors.red.bold(`Error en conectar a MongoDB: ${error.message}`));
        process.exit(1);

    }
}
