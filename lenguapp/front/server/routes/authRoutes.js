const express= require("express")
const router = express.Router()
const fs = require('fs');
const bcrypt = require("bcrypt")

const mongoose = require("mongoose")
const db = require("../config/database")
const UserModel = require("../models/user")

router.post("/hash",  (req,res) => {
    saltRounds = 10;
    password = req.body.password
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(password, salt);
    res.send(hash)
})

router.post("/tanks", async(req,res) => {
    const {name} = req.body
    // create model
    Tank = db.model("Tank",new mongoose.Schema({ name: String , size : String }))
    try{
        //then search
        selected = await Tank.find({name : name}) 
        if(selected){
            resp = selected
        }
    }catch (e) {
        resp = {message : "no no such tank"}
    }

    res.send(resp)
})
/*USER ROUTES*/
router.post("/login", async(req,res) => {
    //if first connexion no cookie , give him cookie
    
    const {password,email} = req.body
    msg = "password and email required"
    if( password && email){
        // find if email already exist
        // get user  database
        User = db.model("users",UserModel)

        selected = await User.findOne({email : email})
        if( selected != null) {
            console.log(selected)
            pass =  await bcrypt.compare(password,selected["password"])
            if (pass) {
                msg = "accès à la plateforme"
                //GENERATE TOKEN HERE
            }
            else {
                msg = "wrong password or mail"
            }
        }
        else {
            msg = "no user found please register"
        }
        
    }
    //cookie attached to user (act like a token)
   
    res.send(msg)
})

router.post("/register", async(req,res) => {
    console.log("attempt to register")
    const {username, password , email} = req.body
    subscribe = false

    User = db.model("Users",UserModel)

    if(username && password && email) {
        new_user = await User.find({email:email})
        //si pas d'users
        if(new_user.length == 0){
            try {
                //hashing
                saltRounds = 10;
                const salt = bcrypt.genSaltSync(saltRounds);
                hashed_pass =  bcrypt.hashSync(password,salt);
                let new_user_info = 
                {
                    email : email,
                    password : hashed_pass,
                    username : username
                }
                await User.create(new_user_info)
                //vérification
                users = await User.find()
                console.log(users)
                if(users.length == 0){
                    console.log("not subbed")
                }
                else {
                    subscribe = true
                }
            }
            catch (e) {
                console.log(e)
            }
        }
    }
    if(subscribe){
        msg = `${username} subscribed succesfully`
    }
    else {
        msg = `${username} not subscribed`
    }
    res.send(msg)
})



module.exports = router