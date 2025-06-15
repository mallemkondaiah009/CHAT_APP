import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    profilePic: {
        type: String,
        default: 'https://res.cloudinary.com/di0icte7g/image/upload/v1749980985/default_user_ok8ioh.jpg'
    },
},
    {
    timestamps: true,
    }
);

const User = mongoose.model('User', userSchema);
export default User