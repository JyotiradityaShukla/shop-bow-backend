const authService = require('../services/authService');
const { generateToken } = require('../utils/jwt');

const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields are required' });
    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const existing = await authService.findUserByEmail(email);
    if (existing)
      return res.status(409).json({ message: 'Email already registered' });

    const user = await authService.createUser(name, email, password);
    const token = generateToken({ id: user.id, name: user.name, email: user.email });

    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });

    const user = await authService.findUserByEmail(email);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await authService.comparePassword(password, user.password_hash);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const { password_hash: _, ...safeUser } = user;
    const token = generateToken({ id: user.id, name: user.name, email: user.email });

    res.json({ user: safeUser, token });
  } catch (err) {
    next(err);
  }
};

const me = (req, res) => res.json({ user: req.user });

module.exports = { signup, login, me };
