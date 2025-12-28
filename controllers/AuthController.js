
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const { sendProblemDetails } = require('../utils/problemDetails');

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
        if (!login || !password) {
            return sendProblemDetails(res, {
                type: '/problems/validation-error',
                title: 'Błąd walidacji danych',
                status: StatusCodes.BAD_REQUEST,
                detail: 'login i password wymagane',
                extras: { invalid_params: [{ name: 'login' }, { name: 'password' }] },
                instance: req.originalUrl
            });
        }

        const user = await User.findOne({ username: login });
        if (!user) {
            return sendProblemDetails(res, {
                type: '/problems/authentication-failed',
                title: 'Niepoprawne dane logowania',
                status: StatusCodes.UNAUTHORIZED,
                detail: 'Niepoprawne dane logowania',
                instance: req.originalUrl
            });
        }

        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) {
            return sendProblemDetails(res, {
                type: '/problems/authentication-failed',
                title: 'Niepoprawne dane logowania',
                status: StatusCodes.UNAUTHORIZED,
                detail: 'Niepoprawne dane logowania',
                instance: req.originalUrl
            });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        user.refreshToken = refreshToken;
        await user.save();

        res.json({ accessToken, refreshToken });
    } catch (err) {
        sendProblemDetails(res, {
            type: '/problems/internal-server-error',
            title: 'Błąd serwera',
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            detail: err.message,
            instance: req.originalUrl
        });
    }
}

exports.refreshToken = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return sendProblemDetails(res, {
                type: '/problems/validation-error',
                title: 'Błąd walidacji danych',
                status: StatusCodes.BAD_REQUEST,
                detail: 'Refresh token wymagany',
                extras: { invalid_params: [{ name: 'token', reason: 'required' }] },
                instance: req.originalUrl
            });
        }

        let payload;
        try {
            payload = jwt.verify(token, REFRESH_TOKEN_SECRET);
        } catch (err) {
            return sendProblemDetails(res, {
                type: '/problems/invalid-token',
                title: 'Nieprawidłowy token odświeżający',
                status: StatusCodes.UNAUTHORIZED,
                detail: 'Nieprawidłowy token odświeżający',
                instance: req.originalUrl
            });
        }

        const user = await User.findById(payload.userId);
        if (!user || user.refreshToken !== token) {
            return sendProblemDetails(res, {
                type: '/problems/invalid-token',
                title: 'Token odświeżający nieważny',
                status: StatusCodes.UNAUTHORIZED,
                detail: 'Token odświeżający nieważny',
                instance: req.originalUrl
            });
        }

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);
        user.refreshToken = newRefreshToken;
        await user.save();

        res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch (err) {
        sendProblemDetails(res, {
            type: '/problems/internal-server-error',
            title: 'Błąd serwera',
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            detail: err.message,
            instance: req.originalUrl
        });
    }
}

exports.logout = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return sendProblemDetails(res, {
                type: '/problems/validation-error',
                title: 'Błąd walidacji danych',
                status: StatusCodes.BAD_REQUEST,
                detail: 'Brak użytkownika',
                instance: req.originalUrl
            });
        }

        const user = await User.findById(userId);
        if (user) {
            user.refreshToken = null;
            await user.save();
        }
        res.json({ message: 'Wylogowano' });
    } catch (err) {
        sendProblemDetails(res, {
            type: '/problems/internal-server-error',
            title: 'Błąd serwera',
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            detail: err.message,
            instance: req.originalUrl
        });
    }
}

exports.register = async (req, res) => {
    try {
        const { login, password, role } = req.body;
        if (!login || !password || !role) {
            return sendProblemDetails(res, {
                type: '/problems/validation-error',
                title: 'Błąd walidacji danych',
                status: StatusCodes.BAD_REQUEST,
                detail: 'Wymagane: login, password, role',
                extras: { invalid_params: [{ name: 'login' }, { name: 'password' }, { name: 'role' }] },
                instance: req.originalUrl
            });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = new User({
            username: login,
            passwordHash: passwordHash,
            role: role
        });

        await newUser.save();
        res.status(StatusCodes.CREATED).json({ message: 'Użytkownik zarejestrowany' });
    } catch (err) {
        sendProblemDetails(res, {
            type: '/problems/internal-server-error',
            title: 'Błąd serwera',
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            detail: err.message,
            instance: req.originalUrl
        });
    }
}
