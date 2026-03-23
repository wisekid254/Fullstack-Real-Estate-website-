import User          from '../models/User.js'
import generateToken from '../utils/generateToken.js'
import ApiError      from '../utils/ApiError.js'

// POST /api/auth/register
export const register = async (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password)
    throw new ApiError('Please provide name, email and password', 400)

  const userExists = await User.findOne({ email })
  if (userExists) throw new ApiError('Email already registered', 400)

  const user = await User.create({ name, email, password })

  res.status(201).json({
    success: true,
    token: generateToken(user._id),
    user: {
      _id:    user._id,
      name:   user.name,
      email:  user.email,
      role:   user.role,
      avatar: user.avatar,
    },
  })
}

// POST /api/auth/login
export const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password)
    throw new ApiError('Please provide email and password', 400)

  const user = await User.findOne({ email }).select('+password')
  if (!user || !(await user.matchPassword(password)))
    throw new ApiError('Invalid email or password', 401)

  res.json({
    success: true,
    token: generateToken(user._id),
    user: {
      _id:    user._id,
      name:   user.name,
      email:  user.email,
      role:   user.role,
      avatar: user.avatar,
    },
  })
}

// GET /api/auth/me  (protected)
export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id)
  res.json({ success: true, user })
}