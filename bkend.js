const dotenv= require('dotenv')
dotenv.config()
const express = require("express");
const bodyParser = require("body-parser");
const { Configuration, OpenAIApi } = require("openai");

const mongoose=require('mongoose');
const MongoClient = require('mongodb').MongoClient;
const session = require('express-session')
const User=require(__dirname+'/model/schema/userSchema.js')
const bcrypt=require('bcrypt');
const dbName = 'uplabs';
const API_KEY=process.env.API_KEY; 
const url=process.env.mongo;
const client=new MongoClient(url);
const jwt=require('jsonwebtoken');
const cookie=require('cookie');
const cookieparser=require('cookie-parser');
const app = express();
app.set('view-engine', 'ejs') 
app.use(express.static(__dirname + '/public/java_script'));
app.use(express.static(__dirname + '/public/images'));
app.use(express.static(__dirname + '/public/CSS'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cookieparser())
app.use((req, res, next) => { 
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  next();
});

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    if (req.path === '/login') {
      console.log("func wrkng")
      return res.redirect('/');
    }
  }
  else{
    next();
  }
};

function notauthenticated(req, res, next) {
  if (!req.cookies || !req.cookies.token) {
    return res.redirect('/login');
  }
  else{ next();}
}

app.get('/login',verifyToken, (req, res) => {
  res.render('loginpage.ejs');
});
app.post('/login',async(req,res)=>{
  const dbe = client.db(dbName).collection('user_data');
    const usermail=req.body.email;
    const userpass=req.body.password;
    try{
     const isit=await dbe.findOne({email:usermail})
     if (isit) {
      const hashedpass=isit.password;
      await bcrypt.compare(userpass,hashedpass).then((result2)=>{
        if(!result2){
          res.render("loginpage.ejs",{errorMessagess:"Invalid Username/Password"})
          return;
        }
        else{
        const username=isit.name;
        const token =jwt.sign({id:isit._id,username:username},'mysecretkey');
        res.cookie('token', token,'cookieName=cookieValue; SameSite=None; Secure',{ expires: new Date(Date.now() + 86400000), httpOnly: true });
        req.cookie=token;
        return res.redirect("/");
        }
      })
    }
    else {
       const errorMessagess="No user Found Please Register!"
       res.render("loginpage.ejs",{errorMessagess})
       return
    }
  }
    catch(e){
      console.error('Error:', e);
      res.redirect("/login")
    }
})

app.get('/api/key', (req, res) => {
  const apiKey = process.env.API_KEY;
  res.send({ apiKey });
});

app.get('/register',verifyToken, (req, res) => {
  res.render('reg_page.ejs')
})

app.post('/register',verifyToken,async (req,res)=>{
  const db = client.db(dbName).collection('user_data');
  const username=req.body.name;
  const useremail=req.body.email;
  const userpassword=req.body.password;
    if(username!=" " && userpassword.length>=6 && useremail!=" "){
      if(await db.findOne({email:useremail})){
        errorMessagess="MAIL IS ALREADY REGISTERED!!";
        res.render("loginpage.ejs",{errorMessagess})
        return 
      }
      const newUser = new User({
        name: username,
        email: useremail,
        password: await bcrypt.hash(userpassword,10)
      });
       db.insertOne(newUser).then(isit => {
        res.redirect('/login')
      })
      .catch(err => {
        console.error('Error Registering User:', err);
      })
    } 
    else{
      if(userpassword.length<=6){
      errorMessagess="Password must  be atleast 6 characters long";
      res.render("reg_page.ejs",{errorMessagess})
      }
    }
})


  app.get('/',(req,res) => {
    const token = req.cookies.token;
    if(token){
    const secret= 'mysecretkey';
    jwt.verify(token,secret, (err, decodedToken) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Token verification failed' });
      } else {
        const { username } = decodedToken;
        res.render('index.ejs', { user: username, apiKey: API_KEY  });
      }
    });
  }
  else{
    res.render('index.ejs');
  }
  })

  app.get("/logout",(req,res)=>{
    res.clearCookie('token');
    res.redirect('login');
  })

app.listen(3000);
