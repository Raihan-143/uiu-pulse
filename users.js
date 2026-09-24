const express = require("express");
const router = express.Router();

const User = require("../models/User");


// Save Firebase user to MongoDB
router.post("/register", async (req, res) => {

    try {

        const { firebaseUID, name, email } = req.body;


        if(!firebaseUID || !email){

            return res.status(400).json({
                message:"Missing user information"
            });

        }


        const existingUser = await User.findOne({
            firebaseUID: firebaseUID
        });


        if(existingUser){

            return res.status(200).json({

                message:"User already exists",
                user:existingUser

            });

        }


        const user = await User.create({

            firebaseUID,
            name,
            email,
            role:"student"

        });


        res.status(201).json({

            message:"User saved successfully",
            user

        });


    } catch(error){

        res.status(500).json({

            error:error.message

        });

    }

});


module.exports = router;