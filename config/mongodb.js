const dotenv = require("dotenv")
const mongoose = require('mongoose');

   const connectDB =  async () => {
    try {
    
        await  mongoose.connect(`${process.env.MONGODB_URL}/${process.env.DB_NAME }`).then(console.log("Database is connected"));
//  ${process.env.DB_NAME }
    } catch (error) {
        console.error(" MONGODB CONNECTION ERROR:", error);
        throw error
        
    }
 }

module.exports = { connectDB };