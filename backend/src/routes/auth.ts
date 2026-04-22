import { Router } from 'express'
import { login, logout, me, register, updateProfile } from '../controllers/authController'
import { authenticate } from '../middleware/auth'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.post('/logout', authenticate, logout)
router.get('/me', authenticate, me)
router.patch('/profile', authenticate, updateProfile)

export default router
