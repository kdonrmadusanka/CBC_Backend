import jwt from 'jsonwebtoken';

const checkRole = (requiredRole) => {
    return (req, res, next) => {
        const token = req.headers.authorization?.split(' ')[1];

        if(!token){
            return res.status(401).json({ message: "Please Login" });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if(!decoded || decoded.type != requiredRole) {
                return res.status(403).json({ message: "Access Denied" });
            }

            req.user = decoded;

            next();
        } catch (error) {
            console.log(`The error message is ${error}.`);
            return res.status(400).json({ message: "Invalid Token" });
        }
    }
}

export default checkRole;