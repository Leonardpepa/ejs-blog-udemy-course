
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const _ = require("lodash");
const { isEmpty } = require("lodash");

const homeStartingContent =
  "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent =
  "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent =
  "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

  const app = express();

  app.use(express.static("public"));
  app.set('view engine', 'ejs');
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  
  app.use(session({
    secret: "Secret",
    resave: false,
    saveUninitialized: false
  }));
  
  app.use(passport.initialize());
  app.use(passport.session());
  
  mongoose.connect("mongodb://localhost:27017/blogDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  mongoose.set("useCreateIndex", true);
  
  const userSchema = new mongoose.Schema ({
    email: String,
    password: String,
  });
  
  userSchema.plugin(passportLocalMongoose);
  
  const User = new mongoose.model("User", userSchema);
  
  passport.use(User.createStrategy());
  
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

postsSchema = mongoose.Schema({
  title: String,
  content: String,
  username: String,
  userId: String
});


const Post = mongoose.model("Post", postsSchema);

app.get("/", (req, res) => {

  if(req.isUnauthenticated()){
    res.redirect("/login");
  }
  else{
    Post.find({}, (err, postsFound) => {
      if (err) {
        console.log("an error occured");
      } else {
        res.render("home", {
          homeStartingContent: homeStartingContent,
          posts: postsFound,
        });
      }
    });
  }

});

app.get("/about", (req, res) => {
  if(req.isUnauthenticated()){
    res.redirect("/login");
  }
  else{
    res.render("about", { aboutContent: aboutContent });
  }
});

app.get("/contact", (req, res) => {
  if(req.isUnauthenticated()){
    res.redirect("/login");
  }
  else{
    res.render("contact", { contactContent: contactContent });
  }
});

app.get("/compose", (req, res) => {
  if(req.isUnauthenticated()){
    res.redirect("/login");
  }
  else{
    res.render("compose");
  }
});

app.post("/compose", (req, res) => {
  if(req.isUnauthenticated()){
    res.redirect("/login");
  }
  else{
    const post = new Post({
      title: req.body.postTitle,
      content: req.body.postArea,
      username: req.user.username,
      userId: req.user._id
    });
  
    post.save();
    res.redirect("/");
  }
});

app.get("/posts/:_id", (req, res) => {
  if(req.isUnauthenticated()){
    res.redirect("/login");
  }
  else{
    const post_id = _.lowerCase(req.params._id);
    Post.find({}, (err, postsFound) => {
      if (err) {
        console.log("an error has occured");
      } else {
        postsFound.forEach((post) => {
          const postFound_id = _.lowerCase(post._id);
          if (postFound_id === post_id) {
            res.render("post", {
              title: post.title,
              content: post.content,
              id: req.params._id,
              username: post.username,
              loggedUser: req.user
            });
          }
        });
      }
    });
  }
});

app.post("/delete/:_id", (req, res) => {
  if(req.isUnauthenticated()){
    res.redirect("/login");
  }
  else{
    Post.deleteOne({ _id: req.params._id }, (err, foundPost) => {
      if (err) {
        console.log("an error ocured deleting the post");
      } else {
        console.log("post successfuly deleted");
        res.redirect("/");
      }
    });
  }
});

app.get("/search", (req, res) => {
    res.render("search");
});

app.post("/search", (req, res) => {
  User.find({username: req.body.email}, (err, usersFound) => {
    if(!err && !isEmpty(usersFound)){
      Post.find({username: req.body.email}, (err, postsFound) => {
        if(err){
          console.log(err);
        }else{
          res.render("profile", {posts: postsFound, username: req.body.email});
        }
      });
    }
    else{
      res.render("profile", {posts: [], username: "NO USER WITH THIS EMAIL"});
    }
  });
});

app.get("/profile", (req, res) => {
  if(req.isUnauthenticated()){
    res.redirect("/login");
  }
  else{
    Post.find({userId: req.user._id}, (err, postsFound) => {
      if(err){
        console.log(err);
      }else{
        res.render("profile", {posts: postsFound, username: req.user.username});
      }
    });
  }
}); 

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/logout", (req, res) => {
  req.logOut();
  res.redirect("login");
});



app.get("/register", function(req, res){
  res.render("register", {error: ""});
});


app.post("/register", function(req, res){
  if(req.body.password === req.body.confirm_password){
    User.register({username: req.body.username}, req.body.password, function(err, user){ 
      passport.authenticate("local")(req, res, function(){
          res.redirect("/");
        });
      
    });
  }else{
    res.render("register", {error: "Passwords should match"});
  }
});

app.post("/login", function(req, res){

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/");
      });
    }
  });

});


app.listen(3000, function () {
  console.log("Server started on port 3000");
});
