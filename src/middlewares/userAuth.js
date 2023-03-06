import jwt from "jsonwebtoken";

//Validate user request for valid user
export const validateUser = (req, res, next) => {
    const token = req.headers?.authorization;
    if (token) {
        jwt.verify(token, process.env.EncryptionKEY, (err, decoded) => {
            if (err) return res.status(401).send({ "message": "Unauthorized access" })
            req.user = decoded;
            next();
        });
    } else {
        return res.status(401).send({ "message": "Unauthorized access" })
    }
}