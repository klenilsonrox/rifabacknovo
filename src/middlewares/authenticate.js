import jwt from 'jsonwebtoken';
import { verifyToken } from '../configs/verifyToken.js';

export const isAuthenticated = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        return res.status(401).json({ message: 'Não autenticado' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Não autenticado' });
    }

    let decodedToken;
    try {
        decodedToken = verifyToken(token)
    } catch (err) {
        return res.status(401).json({ message: 'Não autenticado' });
    }

    if (!decodedToken) {
        return res.status(401).json({ message: 'Não autenticado' });
    }

    req.userId = decodedToken.userId;
    req.isAdmin = decodedToken.isAdmin;
    req.name = decodedToken.name
    req.image = decodedToken.image
    req.imageName=decodedToken.imageName
    next();
};
