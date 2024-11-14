import express from "express";
import bodyParser from "body-parser";
import routes from "./routes/index.js";
import MongoStore from "connect-mongo";
import session from "express-session";
import passport from "passport";
import flash from "connect-flash";
import { connect } from "mongoose";
import dotenv from "dotenv";
import errorHandler from "./lib/errorHandler.js";
import multer from "multer";
import path from "path";
import { addTask } from "./controllers/index.js";

dotenv.config();
const app = express();
//_______________________________________________________

//DATABASE
import mongoose from "mongoose";
mongoose.connect(process.env.DB_STRING, { useNewUrlParser: true })
    .then(() => {
        console.log("Connection to the database is established");
    })
    .catch(err => {console.log("Database connection error: ", err)})

//_______________________________________________________
//VIEW ENGINE
app.set("view engine", "ejs");

//_______________________________________________________
//STORAGE
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/uploads'); 
    },
    filename: (req, file, cb) => {
        const fileName = Date.now() + path.extname(file.originalname);
        cb(null, fileName);
    }
});

const upload = multer({ storage });
//_______________________________________________________
//MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(bodyParser.text());

// SESSIONS SETUP
const store = MongoStore.create({ mongoUrl: process.env.DB_STRING, collectionName: "sessions"});

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    store: store
}))

//FLASH
app.use(flash());

//PASSPORT AUTHENTICATION
import "./config/passport.js";
app.use(passport.initialize());
app.use(passport.session());

//ROUTES  
app.use(routes);
app.post("/my-tasks/add", upload.single('image'), addTask);

//ERROR HANDLER
app.use(errorHandler);

//404
app.use((req, res) => {
    res.status(404).render("404.ejs");
})

//SERVER
app.listen(process.env.PORT || 6000, () => {
    const PORT = process.env.PORT || 6000
    console.log(`App is listening on PORT ${PORT}`);
});


