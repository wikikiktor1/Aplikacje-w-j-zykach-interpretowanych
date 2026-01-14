const jwt = require('jsonwebtoken');
const User = require('../models/User');

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'change_this_secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'change_this_refresh_secret';

function getTokenFromHeader(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2) return null;
  const scheme = parts[0];
  const token = parts[1];
  if (/^Bearer$/i.test(scheme)) return token;
  return null;
}

exports.authenticate = async (req, res, next) => {
  const token = getTokenFromHeader(req);
  if (!token) return res.status(401).json({ message: 'Token missing' });
  try {
    const payload = jwt.verify(token, ACCESS_TOKEN_SECRET);
    req.user = { id: payload.userId, role: payload.role, email: payload.email };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

exports.authorize = (...roles) => {
  return async (req, res, next) => {
    const token = getTokenFromHeader(req);
    if (!token) return res.status(401).json({ message: 'Token missing' });
    try {
      const payload = jwt.verify(token, ACCESS_TOKEN_SECRET);
      req.user = { id: payload.userId, role: payload.role, email: payload.email };
      if (roles && roles.length > 0 && !roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Brak uprawnień' });
      }
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  }
}

