require("dotenv").config();
const express=require("express");
const app=express();
const cors=require("cors");
// const PORT=6005;
const googleRouter=express.Router()
const session=require("express-session")
const passport=require("passport")
const OAuth2Strategy=require("passport-google-oauth2").Strategy;

const clientId="1012755852074-2kobqqfjr34kd4lfjvr9hf18rifagqpi.apps.googleusercontent.com"

const clientSecret="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"
const {GoogleModel}=require("../models/Google")

// require("./db/connection")
//origin,methods,etc are required for google authentication
// googleRouter.use(cors({
//     origin:"http://localhost:3000",
//     methods:"GET,POST,PUT,DELETE",
//     credentials:true
// }))

// app.use(express.json());


// set up session
// use of this is, when clicking on signin with google,
// is to create an session id in encrypted form,
// for validating the user and getting the data of the user
googleRouter.use(session({
    secret:"1kdhfkh994unof04p9djojdndf93",
    resave:false,
    saveUninitialized:true
}))
// app.get("/",(req,res)=>{
//     res.status(200).json("loginwithgoogle server starts")
// })

//setup passport
googleRouter.use(passport.initialize())
googleRouter.use(passport.session())

passport.use(
    new OAuth2Strategy({
        clientID:clientId,
        clientSecret:clientSecret,
        callbackURL:"/auth/google/callback",
        scope:["profile","email"]
    },
    async(accessToken,refreshToken,profile,done)=>{
        console.log("profile",profile)
        console.log("accessToken",accessToken)
        // console.log("refreshToken",refreshToken)
        try {
            let user=await GoogleModel.findOne({googleId:profile.id}) //getting google id from profile id
            

            if(!user){
                user=new GoogleModel({
                    googleId:profile.id,
                    displayName:profile.displayName,
                    email:profile.emails[0].value,
                    image:profile.photos[0].value
                })
                await user.save()

                console.log(user)
                console.log(user.displayName)
            }

            
            
            return done(null,user)
        } catch (error) {
            return done(error,null)
        }
    })
)
//if you do not do this serialize and deserialize it will show you an error
passport.serializeUser((user,done)=>{
    done(null,user)
})

passport.deserializeUser((user,done)=>{
    done(null,user)
})

//initialize google oauth login

googleRouter.get("/auth/google",passport.authenticate("google",{scope:["profile","email"]}))

googleRouter.get("/auth/google/callback",passport.authenticate("google",{
    successRedirect:"http://localhost:3000/dashboard",
    failureRedirect:"http://localhost:3000/login"
}))

googleRouter.get("/login/success",async(req,res)=>{
    // console.log("login is success for loginwithGoogle",req.user)

    if(req.user){
        res.status(200).json({msg:"user-login",user:req.user})
        
    }else{
        res.status(400).json({msg:"not authorized for request user"})
    }
})

googleRouter.get("/logout",(req,res,next)=>{
    req.logout(function(err){
        if(err){
            return next(err)
        }
        res.redirect("http://localhost:3000")
    })
})

module.exports={
    googleRouter
}