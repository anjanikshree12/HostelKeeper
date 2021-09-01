const express = require("express"); //app.js
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const router = express.Router();
const session = require("express-session");
const customId = require("custom-id");
const { request } = require("http");

// var multer = require('multer');
// var fs = require('fs');
// var storage = multer.diskStorage({
//   destination: './public/images/uploads/',
//   filename: (req, file, cb) => {
//     return cb(null, '$(file.fieldname)_${Date.now()}${path.extname(req.files["image"][0].filename)}')
//   //   cb(null, file.fieldname + '-' + Date.now()
//   // +  path.extname(file.originalname));
//   }
// });
//
// var upload = multer({
//   storage: storage
// });

var guser = "";
var u_username = "";
var a_username = "";
var idfordeletion = "";

app.use(express.json());
app.post('/user', (req, res) => {
  User.create({
    username: req.body.username,
    password: req.body.password,
  }).then(user => res.json(user));
});
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
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

mongoose.connect("mongodb://localhost:27017/HostelKeeperDB", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});


const requestschema = {
  username: String,
  date: String,
  checkin: String,
  checkout: String,
  worktype: String,
}

//request model

const Request = new mongoose.model("Request", requestschema);
module.exports = mongoose.model('request', requestschema, 'request');

//customer schema

const customerSchema = {
  email: String,
  contact: Number,
  password: String,
  name: String,
  address: String,
  request: Array
};

//customer model

const Customer = new mongoose.model("Customer", customerSchema);

// admin schema

const adminSchema = {
  name: String,
  email: String,
  contact: Number,
  city: String,
  password: String
};

//admin model

const Admin = new mongoose.model("Admin", adminSchema);

//hostelkeepers schema
const hostelkeepersschema = {
  name: String,
  contact: Number,
  address: String,
  idtype: String,
  hkrequests: Array
};

//hostelkeepers model

const Hostelkeepers = new mongoose.model("Hostelkeepers", hostelkeepersschema);

app.use(express.static("public"));

app.get("/", function (req, res) {
  res.render("home");
})

app.post("/register", function (req, res) {
  const newCustomer = new Customer({
    email: req.body.username,
    contact: req.body.contact,
    password: req.body.password,
    name: req.body.name,
    address: req.body.address,
    // request:[]
  });


  newCustomer.save(function (err) {
    if (err) {
      console.log("Didn't saved");
    } else {
      console.log('user registered');
      res.redirect("/");
    }
  });
});


app.post("/login", function (req, res) {
  u_username = req.body.username;
  const password = req.body.password;
  Customer.findOne({ email: u_username }, function (err, foundCustomer) {
    if (err) {
      console.log(err);
    } else {
      if (foundCustomer) {
        if (foundCustomer.password === password) {
          Customer.findOne({email : u_username}, function (err, data) {
            if (data !== null) {
              console.log(data);
              res.render("second", { requests: data.request, user: data });
            }
            else {
              console.log("there is a error");
            }
          });
        }
      }
    }
  });
});


app.post("/adminr", function (req, res) {
  // console.log("Hello")
  const newAdmin = new Admin({

    name: req.body.name,
    email: req.body.username,
    contact: req.body.contact,
    city: req.body.city,
    password: req.body.password
  });

  newAdmin.save(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/");
      // console.log('admin registered');
    }
  });
});

app.post("/adminl", function (req, res) {
  a_username = req.body.username;
  const password = req.body.password;
  //console.log(username,password);
  Admin.findOne({ email: a_username }, function (err, foundAdmin) {
    if (err) {
      console.log(err);
    } else {
      if (foundAdmin) {
        if (foundAdmin.password === password) {
          Request.find({}, function (err, data) {
            res.render("admin", { requests: data });
          });
        }
        else{
          console.log(err);
        }
      }
      else{
        console.log("admin not found!")
      }
    }
  });
});

app.post("/requestsinput", function (req, res) {

  // console.log(req.body);
  const newrequest = new Request({
    username: req.body.username,
    date: req.body.date,
    checkin: req.body.checkin,
    checkout: req.body.checkout,
    worktype: req.body.worktype
  });
  guser = req.body.username;
  Customer.findOne({ email: guser }, function (err, user) {
    user.request.push(newrequest);
    // console.log("req added->" + newrequest);
    // idfordeletion = newrequest._id;
    user.save();
  });
  // Hostelkeepers.find({},function(err,hk){
  //   hk.hkrequests.push(newrequest);
  //   hk.save();
  // });
  newrequest.save(function (err) {
    if (err) {
      console.log("Didn't saved");
    } else {
      res.redirect("profile");
    }
  });

});

app.post("/hkID", function(req,res){

  const newhostelkeeper = new Hostelkeepers({
    name: req.body.name,
    contact: req.body.contact,
    address: req.body.address,
    idtype: req.body.idtype,
  });
  // Hostelkeepers.find({},function(err,hk){
  //   hk.hkrequests.push(newrequest);
  //   hk.save();
  // });
  newhostelkeeper.save(function (err) {
    if (err) {
      console.log("Didn't saved");
    } else {
      res.redirect("allot");
    }
  });
});



app.get("/admindashboard", function (req, res) {
  Request.find({}, function (err, data) {
    res.render("admin", { requests: data });
  });
});

app.get("/allot", function (req, res) {
 Hostelkeepers.find({}, function (err, data) {
    res.render("allot", { workers: data });
  });
});

app.get("/complaints", function (req, res) {
  Request.find({}, function (err, data) {
    res.render("complaints", { requests: data });
  });
});


app.get("/registerstudents", function (req, res) {
  Request.find({}, function (err, data) {
    res.render("registerstudents", { requests: data });
  });
});
app.get("/registerhostelkeeper", function (req, res) {
  Request.find({}, function (err, data) {
    res.render("registerhostelkeeper", { requests: data });
  });
});

app.get("/requests", function (req, res) {

  Customer.findOne({email : u_username}, function (err, data) {
    if (data !== null) {
      // console.log(data);
      res.render("requests", { requests: data.request, user: data });
    }
    else {
      console.log("there is a error");
    }
  });

});

app.get("/userrequests", function(req,res){

  Request.find({}, function(err,data){
    if (data !== null) {
      res.render("userrequests", { requests: data });
    }
    else {
      console.log("there is a error");
    }
  });
});

app.get("/userdashboard", function (req, res) {
  const emailtobeused = u_username;
  Customer.findOne({email : emailtobeused}, function (err, data) {
    if (data !== null) {
      // console.log(data);
      res.render("second", { requests: data.request, user: data });
    }
    else {
      console.log("there is a error");
    }
  });

  });

app.get('/feedback', (req, res) => {
  Customer.findOne({email : u_username}, function (err, data) {
    if (data !== null) {
      // console.log(data);
      res.render("feedback", { requests: data.request, user: data });
    }
    else {
      console.log("there is a error");
    }
  });
});

app.post("/deletereq", function (req, res) {
  const checkedItemId = req.body.checkbox;

  Customer.findByIdAndRemove(checkedItemId, function (err) {
    if (!err) {
      console.log("Successfully deleted item.");
      res.redirect("/profile");
    }
  });
});


app.get("/profile", function (req, res) {
  const usernameprof = u_username;
  Customer.findOne({ email: usernameprof }, function (err, data) {
    if (data !== null) {
      // console.log(data);
      res.render("profile", { requests: data.request, user: data });
    }
    else {
      console.log("there is a error");
    }
  });
});


app.get("/Logout", function (req, res) {
  res.redirect("/");
});
// app.get("/second", function (req, res) {
//   Customer.find({}, function (err, data) {
//     res.render("second", { requests: data.request });
//   });
// });
app.listen(3000, function () {
  console.log("Server started on port 3000");
});
