import { Router } from 'express'
import { sendReminders } from '../controllers/cronController'

const router = Router()

router.post('/reminders', sendReminders)

export default router
