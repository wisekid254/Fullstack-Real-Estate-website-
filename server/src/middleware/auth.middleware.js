import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import ApiError from '../utils/ApiError.js'

export const protect = async (req, res, next) => {
  let token

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) throw new ApiError('Not authorised — no token', 401)

  const decoded = jwt.verify(token, process.env.JWT_SECRET)
  req.user = await User.findById(decoded.id).select('-password')

  if (!req.user) throw new ApiError('User no longer exists', 401)

  next()
}

export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    throw new ApiError('Admin access required', 403)
  }
  next()
}