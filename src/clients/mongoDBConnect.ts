import mongoose from "mongoose";

const { connection, set, connect } = mongoose;

const config = {
    autoIndex: false,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000,
}

connection
    .on("open", (stream) => console.info.bind(console, "Database connection: open"))
    .on("close", (stream) => console.info.bind(console, "Database connection: close"))
    .on(
        "disconnected",
        (stream) => console.info.bind(console, "Database connection: disconnecting")
    )
    .on("disconnected", () => {
        console.info.bind(console, "Database connection: disconnected");
    })
    .on(
        "reconnected",
        (stream) => console.info.bind(console, "Database connection: reconnected")
    )
    .on(
        "fullsetup",
        (stream) => console.info.bind(console, "Database connection: fullsetup")
    )
    .on("all", (stream) => console.info.bind(console, "Database connection: all"))
    .on("error", (stream) => console.error.bind(console, "MongoDB connection: error:"));

/**
 * Establish a automated connection to MongoDB Cloud
 * @param {Number} retries number of retries before quitting
 * @param {Number} time time (milliseconds) between attempts
 */

const mongoDBConnect = async (retries: number, time: number) => {
    let attemptNumber: number = 0;
    attemptNumber++;
    const connectionString = process.env.DB_CONNECT;
    if (connectionString) {
        if (attemptNumber < retries) {
            console.log(`Database Connection Attempt: ${attemptNumber}`);
            console.log("Connecting to MongoDB Cloud...");
            try {
                set("strictQuery", false);
                await connect(connectionString, config);
                console.log("MongoDB is connected.");
            } catch (error: any) {
                console.log("Error: " + error.message);
                console.log(
                    `MongoDB connection unsuccessful, retrying in ${time / 1000} seconds...`
                );
                setTimeout(mongoDBConnect, time);
            }
        } else {
            console.log("!!!Unable to connect to MongoDB Cloud, please restart the server!!!");
        }
    } else {
        console.log("MongoDB connection string not provided!!!");
    }
}

export default mongoDBConnect;