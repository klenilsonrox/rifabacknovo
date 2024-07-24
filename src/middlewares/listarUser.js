export const mostrarUser = (req, res, next) => {
    if (req.isAdmin) {
        return res.status(403).json({ message: 'Acesso negado, você nao é admin' });
    }

    next();
};
