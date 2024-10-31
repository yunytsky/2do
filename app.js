const express = require("express");
const bodyParser = require("body-parser");
const routes = require("./routes/index");
const MongoStore = require("connect-mongo");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");
const errorHandler = require("./lib/errorHandler");
const { connect } = require("mongoose");
const { use } = require("express/lib/application");

require("dotenv").config();

const app = express();
//_______________________________________________________

//DATABASE
// const mongoose = require("mongoose");
// mongoose.connect(process.env.DB_STRING, { useNewUrlParser: true })
//     .then(() => {
//         console.log("Connection to the database is established");
//     })
//     .catch(err => {console.log("Database connection error: ", err)})

//_______________________________________________________
//VIEW ENGINE
app.set("view engine", "ejs");
//_______________________________________________________
//MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static("public"));
app.use(bodyParser.text());

//SESSIONS SETUP
// const store = MongoStore.create({ mongoUrl: process.env.DB_STRING, collectionName: "sessions"});

// app.use(session({
//     secret: process.env.SECRET,
//     resave: false,
//     saveUninitialized: true,
//     store: store
// }))

//FLASH
app.use(flash());

//PASSPORT AUTHENTICATION
// require("./config/passport");
// app.use(passport.initialize());
// app.use(passport.session());

//ROUTES  
app.use(routes);

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

