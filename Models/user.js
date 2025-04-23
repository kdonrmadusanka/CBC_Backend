import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    id: {
        type: String,
        require: true,
        unique: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        require: true,
    },
    firstName: {
        type: String,
        require: true
    },
    lastName: {
        type: String,
        require: true
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        default: 'customer'
    },
    profilePicture: {
        type: String,
        default: 'None'
    }
});

const User = mongoose.model('User', userSchema);

export default User;