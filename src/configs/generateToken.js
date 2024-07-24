import jwt from 'jsonwebtoken';

export async function generateToken(user){
    const token = jwt.sign(
        { userId: user._id, email: user.email, isAdmin: user.isAdmin, image:user.image,imageName:user.imageName },
        process.env.SECRET_KEY, 
        { expiresIn: '7d' }
    );
    return token
}