import { Router } from 'express'
import {
  getProfile, updateProfile,
  saveListing, getSavedListings,
  changePassword,
} from '../controllers/user.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = Router()

router.use(protect) // all user routes require auth

router.get('/me',            getProfile)
router.put('/me',            updateProfile)
router.get('/saved',         getSavedListings)
router.post('/save/:listingId', saveListing)
router.put('/change-password',  changePassword)

export default router