import userSchema from "../Models/user.js";

export const createUser = async (req, res) => {
    const { email, password, role } = req.body;
    try {
        const existingUser = await userSchema.findOne({ email });

        if (existingUser) {
            return res.json({ message: "The user alread exists" });
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

        const newUser = new userSchema({
            ...req.body,
            id: id
        });

        const savedUser = await newUser.save();

        res.status(201).json({ 
            savedUser,
            message: "New user is created"
         });

    } catch(error) {
        console.log(`The error message is ${error}.`);
    }
}
