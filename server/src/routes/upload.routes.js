import { Router }  from 'express'
import upload      from '../middleware/upload.middleware.js'
import { protect } from '../middleware/auth.middleware.js'
import cloudinary  from '../config/cloudinary.js'
import ApiError    from '../utils/ApiError.js'

const router = Router()

router.post('/', protect, upload.array('images', 5), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new ApiError('No files uploaded', 400)
  }
  const images = req.files.map((file) => ({
    url:      file.path,
    publicId: file.filename,
  }))
  res.json({ success: true, images })
})

router.delete('/:publicId', protect, async (req, res) => {
  await cloudinary.uploader.destroy(`nesthaven/${req.params.publicId}`)
  res.json({ success: true, message: 'Image deleted' })
})

export default router