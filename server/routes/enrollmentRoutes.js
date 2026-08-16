import express from 'express';
import {
  getEnrollments,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment
} from '../controllers/enrollmentController.js';

const router = express.Router();

router.get('/', getEnrollments);
router.post('/', createEnrollment);
router.patch('/:id', updateEnrollment);
router.delete('/:id', deleteEnrollment);

export default router;
