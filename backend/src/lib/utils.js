import jwt from 'jsonwebtoken';

export const generateToken = (userId, res) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {
        expiresIn: '7d', // Token expires in 7 days
    });
    res.cookie('jwt',token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
        secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
        sameSite: 'strict', // Helps prevent CSRF attacks
    });

    return token;
}