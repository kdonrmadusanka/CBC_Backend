import userSchema from "../Models/user.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cache from "../Utility/cache.js";


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

        cache.set(`userToken ${userFound.email}`, token, 3600);

        return res.status(201).json({ 
            savedUser,
            message: "New user is created",
            token: token
         });

    } catch(error) {
        console.log(`The error message is ${error}.`);
        return res.status(500).json({ message: 'An error occurred during registering new user' });
    } 
}


export const userLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const userFound = await userSchema.findOne({ email: email });

        if (!userFound) {
            return res.status(404).json({ message: 'Please register before login' });
        }

        const isMatch = await bcrypt.compare(password, userFound.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Please provide correct password' });
        }

        const cachedToken = cache.get(`userToken ${email}`);

        if(cachedToken){
            return res.status(200).json({ 
            message: 'User login successful',
            token: cachedToken 
            });
        }

        const token = jwt.sign({
            _id: userFound._id,
            id: userFound.id,
            firstName: userFound.firstName,
            lastName: userFound.lastName,
            isBlocked: userFound.isBlocked,
            type: userFound.type
        }, process.env.JWT_SECRET);

        return res.status(200).json({ 
            message: 'User login successful',
            token: token 
        });

    } catch (error) {
        console.error(`Login error: ${error}`);
        return res.status(500).json({ message: 'An error occurred during login' });
    }
};

export const userLogout = async (req, res) => {
    const { email } = req.body;

    try {
        // Remove the user's token from cache
        cache.del(`userToken ${email}`);
        return res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        console.error(`Logout error: ${error}`);
        return res.status(500).json({ message: 'An error occurred during logout' });
    }
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
        return res.status(500).json({ message: "An error occurred while getting all users" });
    }
}


export const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedUser = await userSchema.findOneAndDelete({ id: id });

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ message: `User with id ${id} deleted successfully.` });
    } catch (error) {
        console.error(`Error while deleting user: ${error}`);
        return res.status(500).json({ message: "An error occurred while deleting the user" });
    }
};


export const getUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await userSchema.findOne({ id: id });

        if (!user) {
            return res.status(404).json({ message: `User with id ${id} not found.` });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error(`Error while retrieving user: ${error}`);
        return res.status(500).json({ message: "An error occurred while fetching the user." });
    }
};


