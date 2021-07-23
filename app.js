 const express = require("express"); //app.js
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const router = express.Router();
// const DB = "mongodb+srv://dbShashwat:<password>@cluster0.p0nn2.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";



app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true
}));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, 'node_modules')));

mongoose.connect("mongodb://localhost:27017/customerDB",{useNewUrlParser:true,
                     useCreateIndex:true,
                     useUnifiedTopology:true,
                     useFindAndModify:false});

const customerSchema = {
  email:String,
  contact:Number,
  password:String
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
    password:req.body.password
  });

  newCustomer.save(function(err){
    if(err)
    {
      console.log("Didn't saved");
    }else {
      res.render("second");
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
          res.render("second");
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
  res.render("registerstudents");
});
app.get("/registerhostelkeeper",function(req,res){
  res.render("registerhostelkeeper");
});

app.get("/requests",function(req,res){
  res.render("requests");
});
app.get("/userdashboard",function(req,res){
  res.render("second")
})
app.get('/feedback', (req, res) => {
    res.render('feedback');
   });

app.get("/profile",function(req,res){
  res.render("profile");
});
app.get("/Logout",function(req,res){
  res.render("home");
});
app.get("/second",function(req,res){
  res.render("second");
});
app.listen(3000,function(){
    console.log("Server started on port 3000");
});
