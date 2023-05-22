import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoDBConnect from './clients/mongoDBConnect.js';
import helmet from "helmet";

// Env Variables

const port = process.env.PORT || 6000;
const origins = process.env.ORIGINS?.split(", ");

// App Configurations //

dotenv.config();
const app = express();
// app.disable("x-powered-by");

// Middlewares //

app.use(helmet())
app.use(cookieParser(process.env.COOKIE_PARSER_SECRET_KEY));
app.use(cors({
    origin: origins,
    credentials: true,
}));

// Database Connection //

// await mongoDBConnect(5, 5000);

// Routes //
app.get("/", (req, res) => {
    res.json("Hello, World!");
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
    console.log(`http://localhost${port}/`);
})
