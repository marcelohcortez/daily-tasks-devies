import { Router } from 'express'
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/tasksController'
import { exportPdf } from '../controllers/exportController'
import { authenticate } from '../middleware/auth'

const router = Router()

router.use(authenticate)

// Export must come before /:id to avoid route shadowing
router.get('/export/pdf', exportPdf)

router.get('/', getTasks)
router.post('/', createTask)
router.patch('/:id', updateTask)
router.delete('/:id', deleteTask)

export default router
