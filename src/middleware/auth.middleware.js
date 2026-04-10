import jwt from 'jsonwebtoken';


function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    console.log('Authorization header:', authHeader);
    const token = authHeader.split(' ')[1];

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user info to request object
        console.log('Decoded token:', decoded);
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(403).json({ message: 'Invalid token' });
    }
}

function requireRole(role) {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        }
        next();
    };
}

const authMiddlewareModule = {
    authMiddleware,
    requireRole
}

export default authMiddlewareModule;