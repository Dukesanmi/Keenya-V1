const mongoose = require('mongoose');
require('dotenv').config();
const connectionString = process.env['DATABASE_URL'];

//console.log(connectionString);
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            //useFindAndModify: false
        })

        console.log(`mongoDB Connected: ${conn.connection.host}`);
    } catch (err) { 
        console.error(err);
        process.exit(1)
    }
}

module.exports = connectDB;