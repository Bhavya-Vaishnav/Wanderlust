const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");


const sessionOptions={
      secret:"mysupersecret",
      resave:false,
      saveUninitialized:true,
      cookie:{
        expires:Date.now() + 1000*60*60*24*7,
        httpOnly:true,
        maxAge:1000*60*60*24*7
}}

app.use(session(sessionOptions));
app.use(flash());

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/Wanderlust";

async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("Connected to DB");
}

main().catch((err) => {
  console.error(err);
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to Our Website:)");
});

app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  next();
})

app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);


// 404 route (Ensure this is the last route)
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not Found!"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong :(" } = err;
  res
    .status(statusCode)
    .render("error", { err: { status: statusCode, message } });
});

// Server listening
app.listen("8080", () => {
  console.log("Server is listening on port 8080");
});
