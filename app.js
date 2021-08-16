const express = require("express"); //app.js
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const router = express.Router();
const session = require("express-session");
const expressValidator = require("express-validator");
const message = require("express-messages");
const customId = require("custom-id");

var guser = "";

app.use(express.json());
app.post('/user', (req, res) => {
  User.create({
    username: req.body.username,
    password: req.body.password,
  }).then(user => res.json(user));
});
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true
}));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, 'node_modules')));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))
 //Express messages middleware

 app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

mongoose.connect("mongodb://localhost:27017/HostelKeeperDB",{useNewUrlParser:true,
                     useCreateIndex:true,
                     useUnifiedTopology:true,
                     useFindAndModify:false});

const requestschema = {
  username:String,
  date:String,
  checkin:String,
  checkout:String,
  worktype:String

}
const Request = new mongoose.model("Request", requestschema);
module.exports = mongoose.model('request', requestschema, 'request');

const customerSchema = {
  email:String,
  contact:Number,
  password:String,
  name:String,
  address:String,
  request :Array
};
const Customer = new mongoose.model("Customer",customerSchema);


const adminSchema = {
  name:String,
  email:String,
  contact:Number,
  city:String,
  password:String
};
const Admin = new mongoose.model("Admin",adminSchema);

app.use(express.static("public"));

app.get("/", function(req,res){
  res.render("home");
})

app.post("/register",function(req,res){
  const newCustomer = new Customer({
    email:req.body.username,
    contact:req.body.contact,
    password:req.body.password,
    name:req.body.name,
    address:req.body.address,
    request:[]
  });

  newCustomer.save(function(err){
    if(err)
    {
      console.log("Didn't saved");
    }else {
        Request.find({}, function(err, data) {
      res.render("second", {requests:data});
  });
  }
});
});


app.post("/login", function(req,res){
  const username = req.body.username;
  const password = req.body.password;
  Customer.findOne({email:username},function(err,foundCustomer){
    if(err){
      console.log(err);
    }else{
      if(foundCustomer){
        if(foundCustomer.password === password){
          Request.find({}, function(err, data) {
        res.render("second", {requests:data});
    });
        }
      }
    }
  });
});


app.post("/adminr",function(req,res){
  console.log("Hello")
  const newAdmin = new Admin({

    name: req.body.name,
    email: req.body.username,
    contact: req.body.contact,
    city: req.body.city,
    password: req.body.password
  });

  newAdmin.save(function(err){
    if(err)
    {
      console.log(err);
    }else {
      res.render("admin");
    }
  });
});

app.post("/adminl", function(req,res){
  const username = req.body.username;
  const password = req.body.password;
  //console.log(username,password);
  Admin.findOne({email:username},function(err,foundAdmin){
    if(err){
      console.log(err);
    }else{
      if(foundAdmin){
        if(foundAdmin.password === password){
          res.render("admin");
        }
      }
    }
  });
});

app.post("/requestsinput", function(req,res){

   // console.log(req.body);
  const newrequest = new Request({
    username:req.body.username,
    date:req.body.date,
    checkin:req.body.checkin,
    checkout:req.body.checkout,
    worktype:req.body.worktype
  });
  guser = req.body.username;
  Customer.findOne({email:guser},function(err,user){
    user.request.push(newrequest);
    console.log("req added->"+newrequest);
    user.save();
  })
 // var errors = req.validationErrors();

 // if(errors)
 //   console.log("errors");
 newrequest.save(function(err){
   if(err)
   {
     console.log("Didn't saved");
   }else {
     res.redirect("profile")
      }
 });


});

app.get("/admindashboard",function(req,res){
  res.render("admin");
});

app.get("/allot",function(req,res){
  res.render("allot");
});

app.get("/complaints",function(req,res){
  res.render("complaints");
});

app.get("/suggestions", (req, res) => {
    res.render('suggestions');
   });

app.get("/registerstudents",function(req,res){
  Request.find({}, function(err, data) {
res.render("second", {requests:data});
});
});
app.get("/registerhostelkeeper",function(req,res){
  res.render("registerhostelkeeper");
});

app.get("/requests",function(req,res){
  Request.find({}, function(err, data) {
res.render("requests", {requests:data});
});
});
app.get("/userdashboard",function(req,res){
  Request.find({}, function(err, data) {
res.render("second", {requests:data});
});

})
app.get('/feedback', (req, res) => {
  Request.find({}, function(err, data) {
res.render("feedback", {requests:data});
});
   });

app.get("/profile",function(req,res){
 const username = guser;
  console.log("guser-> "+guser);
  Customer.findOne({email:username}, function(err, data) {
    if (data!==null) {
console.log(data);
      res.render("profile", {requests:data.request,user:data});
    }
   });
  });

app.get("/Logout",function(req,res){
  res.render("home");
});
app.get("/second",function(req,res){
  Request.find({}, function(err, data) {
res.render("second", {requests:data});
});
});
app.listen(3000,function(){
    console.log("Server started on port 3000");
});
