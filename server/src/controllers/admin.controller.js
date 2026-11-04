import User    from '../models/User.js'
import Listing from '../models/Listing.js'
import Inquiry from '../models/Inquiry.js'
import ApiError from '../utils/ApiError.js'

// GET /api/admin/stats
export const getStats = async (req, res) => {
  const [totalListings, totalUsers, totalInquiries, featuredListings] =
    await Promise.all([
      Listing.countDocuments(),
      User.countDocuments(),
      Inquiry.countDocuments(),
      Listing.countDocuments({ featured: true }),
    ])

  const listingsByType = await Listing.aggregate([
    { $group: { _id: '$type', count: { $sum: 1 } } },
  ])

  const listingsByCategory = await Listing.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ])

  res.json({
    success: true,
    stats: {
      totalListings,
      totalUsers,
      totalInquiries,
      featuredListings,
      listingsByType,
      listingsByCategory,
    },
  })
}

// GET /api/admin/listings
export const getAllListings = async (req, res) => {
  const { page = 1, limit = 10, type, status, search } = req.query
  const filter = {}
  if (type)   filter.type   = type
  if (status) filter.status = status
  if (search) filter.$text  = { $search: search }

  const total    = await Listing.countDocuments(filter)
  const listings = await Listing.find(filter)
    .populate('agent', 'name email')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(Number(limit))

  res.json({ success: true, total, pages: Math.ceil(total / limit), listings })
}

// PUT /api/admin/listings/:id
export const adminUpdateListing = async (req, res) => {
  const listing = await Listing.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  })
  if (!listing) throw new ApiError('Listing not found', 404)
  res.json({ success: true, listing })
}

// DELETE /api/admin/listings/:id
export const adminDeleteListing = async (req, res) => {
  const listing = await Listing.findByIdAndDelete(req.params.id)
  if (!listing) throw new ApiError('Listing not found', 404)
  res.json({ success: true, message: 'Listing deleted' })
}

// GET /api/admin/users
export const getAllUsers = async (req, res) => {
  const { page = 1, limit = 10 } = req.query
  const total = await User.countDocuments()
  const users = await User.find()
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(Number(limit))

  res.json({ success: true, total, users })
}

// PUT /api/admin/users/:id
export const updateUserRole = async (req, res) => {
  const { role } = req.body
  const user = await User.findByIdAndUpdate(
    req.params.id, { role }, { new: true }
  )
  if (!user) throw new ApiError('User not found', 404)
  res.json({ success: true, user })
}

// DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) throw new ApiError('User not found', 404)
  if (user.role === 'admin') throw new ApiError('Cannot delete an admin account', 403)
  await user.deleteOne()
  res.json({ success: true, message: 'User deleted' })
}

// GET /api/admin/inquiries
export const getAllInquiries = async (req, res) => {
  const { page = 1, limit = 10 } = req.query
  const total     = await Inquiry.countDocuments()
  const inquiries = await Inquiry.find()
    .populate('listing', 'title images location')
    .populate('agent',   'name email')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(Number(limit))

  res.json({ success: true, total, inquiries })
}

// PUT /api/admin/inquiries/:id/read
export const markInquiryRead = async (req, res) => {
  const inquiry = await Inquiry.findByIdAndUpdate(
    req.params.id, { read: true }, { new: true }
  )
  if (!inquiry) throw new ApiError('Inquiry not found', 404)
  res.json({ success: true, inquiry })
}