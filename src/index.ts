import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

const cookieParser = require('cookie-parser');

const UserController = require('./controllers/UserController');
const CategoryController = require('./controllers/CategoryController');
const PostController = require('./controllers/PostController');
const CommentController = require('./controllers/CommentController');
const AuthController = require('./controllers/AuthController');

const PORT = process.env.PORT;
const app = express();

// Enable Cookie Parser for JWT Authentication
app.use(cookieParser());

// Enable CORS for all requests, so that the client can send requests to the server
app.use(cors( {
    origin: 'http://localhost:4200',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
} ));

// Define body parser
app.use(bodyParser.urlencoded({ extended: false }));

// Parse body as JSON
app.use(bodyParser.json());

app.use("/user", UserController);
app.use("/category", CategoryController);
app.use("/post", PostController);
app.use("/comment", CommentController);
app.use("/auth", AuthController);

app.get("/", (req: any, res: any) => {
    res.data = {
        message: "Welcome to the Reddit Clone API!",
        payload: {}
    }
    res.status(200).send(res.data);
});

app.use((req: any, res: any, next: any) => {
    res.status(404).send ({
        message: "Invalid request path!",
        payload: {}
    });
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});