import mongoose from "mongoose";

const dbconnection = async (DBURL: string) => {
  try {
    const options = {
      dbName: process.env.DBNAME,
    };

    const connectionResult = await mongoose.connect(DBURL, options);
    console.log(
      `Connecting to database: ${
        connectionResult.connections[0].name
      } at ${new Date().toUTCString()}`
    );
  } catch (err) {
    console.log(err);
  }
};

export default dbconnection;
