import User    from '../models/User.js'
import Listing from '../models/Listing.js'
import ApiError from '../utils/ApiError.js'

// GET /api/users/me
export const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id).populate('savedListings')
  res.json({ success: true, user })
}

// PUT /api/users/me
export const updateProfile = async (req, res) => {
  const { name, phone } = req.body
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone },
    { new: true, runValidators: true }
  )
  res.json({ success: true, user })
}

// POST /api/users/save/:listingId
export const saveListing = async (req, res) => {
  const user = await User.findById(req.user._id)
  const { listingId } = req.params

  const listing = await Listing.findById(listingId)
  if (!listing) throw new ApiError('Listing not found', 404)

  const alreadySaved = user.savedListings.includes(listingId)

  if (alreadySaved) {
    // Unsave
    user.savedListings = user.savedListings.filter(
      (id) => id.toString() !== listingId
    )
    await user.save()
    return res.json({ success: true, saved: false, message: 'Removed from saved' })
  }

  // Save
  user.savedListings.push(listingId)
  await user.save()
  res.json({ success: true, saved: true, message: 'Property saved' })
}

// GET /api/users/saved
export const getSavedListings = async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate({
      path: 'savedListings',
      populate: { path: 'agent', select: 'name email avatar' },
    })
  res.json({ success: true, listings: user.savedListings })
}

// PUT /api/users/change-password
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body
  const user = await User.findById(req.user._id).select('+password')

  const isMatch = await user.matchPassword(currentPassword)
  if (isMatch === false) throw new ApiError('Current password is incorrect', 400)

  user.password = newPassword
  await user.save()

  res.json({ success: true, message: 'Password updated' })
}