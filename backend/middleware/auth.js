const jwt= require("jsonwebtoken");
function authenticateToken(req, res, next){
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if(!token){
        return res.status(401).json({
            error:"Token nije poslan!"
        });
    }
    try{
        const user = jwt.verify(token, process.env.JWT_SECRET);
        req.user = user;
        next();
    }
    catch(error){
        return res.status(403).json({
            error: "Neispravan token!"
        });
    }
}
module.exports = authenticateToken;