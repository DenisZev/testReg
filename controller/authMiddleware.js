const authMiddleware = {
    requireAuth: function(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        next();
    },
    // Проверка, что пользователь является администратором
    requireAdmin: function(req, res, next) {
        if (req.isAuthenticated() && req.user.role === 'Admin') {
            return next();
        }
        res.status(403).send('Доступ запрещен');
    }
};

module.exports = authMiddleware;
