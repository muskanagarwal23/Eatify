const jwt = require("jsonwebtoken");

exports.auth = (req,res,next) => {
    //console.log("HEADERS:", req.headers);
    const header = req.headers.authorization;
    console.log("JWT SECRET (MIDDLEWARE):", process.env.JWT_SECRET);

    if(!header) {
        return res.status(401).json({message: "No Token"});
    }

    const token = header.startsWith("Bearer ")
    ? header.slice(7).trim()
    : header.trim();

    try{
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        console.log("DECODED USER:", req.user);
        next();
    } catch{
        res.status(401).json({mesaage:"Invalid token"});
    }
};

exports.allowRoles = (...roles) => {
    return (req,res,next) => {
        if(!roles.includes(req.user.role)) {
            return res.status(403).json({message:"Forbidden"});
        }
        next();
    };
};
