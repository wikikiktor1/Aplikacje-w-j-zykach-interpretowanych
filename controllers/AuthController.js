const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'change_this_secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'change_this_refresh_secret';

function generateAccessToken(user) {
  return jwt.sign({ userId: user._id, role: user.role }, ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
}
function generateRefreshToken(user) {
  return jwt.sign({ userId: user._id }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
}

exports.login = async (req, res) => {
  try {
    const { login, password } = req.body;
    if (!login || !password) return res.status(400).json({ message: 'login i password wymagane' });

    const user = await User.findOne({ username: login });
    if (!user) return res.status(401).json({ message: 'Niepoprawne dane logowania' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ message: 'Niepoprawne dane logowania' });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.json({ accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.refreshToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Refresh token wymagany' });

    let payload;
    try {
      payload = jwt.verify(token, REFRESH_TOKEN_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Nieprawidłowy token odświeżający' });
    }

    const user = await User.findById(payload.userId);
    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ message: 'Token odświeżający nieważny' });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.logout = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(400).json({ message: 'Brak użytkownika' });

    const user = await User.findById(userId);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
    res.json({ message: 'Wylogowano' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
    exports.register = async (req, res) => {
        try {
            const { login, password, role } = req.body;
            if (!login || !password || !role) {
                return res.status(400).json({ message: 'Wymagane: login, password, role' });
            }

            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);

            const newUser = new User({
                username: login,
                passwordHash: passwordHash,
                role: role
            });

            await newUser.save();
            res.status(201).json({ message: 'Użytkownik zarejestrowany' });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    exports.register = async (req, res) => {
        try {
            const { login, password, role } = req.body;
            if (!login || !password || !role) {
                return res.status(400).json({ message: 'Wymagane: login, password, role' });
            }

            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);

            const newUser = new User({
                username: login,
                passwordHash: passwordHash,
                role: role
            });

            await newUser.save();
            res.status(201).json({ message: 'Użytkownik zarejestrowany' });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
}

