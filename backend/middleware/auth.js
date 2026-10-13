const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/apiResponse');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 'Not authorized to access this route', 401);
  }

  try {
    const secret = process.env.JWT_SECRET || 'projectpulse_jwt_secret_key_2024_super_secure';
    const decoded = jwt.verify(token, secret);
    req.user = await User.findById(decoded.id);
    
    if (!req.user || !req.user.isActive) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    
    next();
  } catch (err) {
    return errorResponse(res, 'Not authorized to access this route', 401);
  }
};
