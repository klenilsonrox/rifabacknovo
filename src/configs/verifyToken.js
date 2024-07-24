import jwt from 'jsonwebtoken';


export function verifyToken(token){
    const decoded = jwt.verify(token, process.env.SECRET_KEY)
    return decoded
}