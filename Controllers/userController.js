import userSchema from "../Models/user.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const createUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await userSchema.findOne({ email });

        if (existingUser) {
            return res.status(409).json({ message: "The user alread exists" });
        }

        const latestUser = await userSchema.find().sort({ _id: -1 }).limit(1);

        let id;
        if (!latestUser || latestUser.length == 0) {
            id = 'U-0001';
        } else {
            const currentId = latestUser[0].id;
            let number = currentId.replace('U-','');
            number = (parseInt(number, 10) + 1).toString().padStart(4, '0');
            id = "U-" + number;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        req.body.password = hashedPassword;

        const newUser = new userSchema({
            ...req.body,
            id: id
        });

        const savedUser = await newUser.save();

        const userFound = await userSchema.findOne({ id: id });

        const token = jwt.sign({
            _id : userFound._id,
            id: userFound.id,
            firstName: userFound.firstName,
            lastName: userFound.lastName,
            isBlocked: userFound.isBlocked,
            type: userFound.type
        }, process.env.JWT_SECRET
    );

        res.status(201).json({ 
            savedUser,
            message: "New user is created",
            token: token
         });

    } catch(error) {
        console.log(`The error message is ${error}.`);
    }
    
}

export const userLogin = async (req, res) => {
    const { email, password } = req.body;
    
    const userFound = await userSchema.findOne({ email: email });

    if (!userFound || userFound.length == 0) {
        return res.status(404).json({ message: 'Please register before login' });
    }

    const isMatch = await bcrypt.compare(password, userFound.password);

    if ( !isMatch ) {
        return res.status(401).json({ message: 'Please provide correct password' });
    }

    const token = jwt.sign({
        _id : userFound._id,
        id: userFound.id,
        firstName: userFound.firstName,
        lastName: userFound.lastName,
        isBlocked: userFound.isBlocked,
        type: userFound.type
    }, process.env.JWT_SECRET);

    return res.status(200).json({ 
        'message': 'User login succesful',
        token: token
     });
}

export const getAllUser = async (req, res) => {
    try{
        const allStudents = await userSchema.find();

        if (!allStudents) {
            return res.status(200).json({message: 'There are no students registered'});
        }

        return res.json(allStudents);

    } catch (error) {
        console.log(`The error message is ${error}.`);
    }
}
