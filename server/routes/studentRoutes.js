import express from 'express';
import {
  getStudents,
  getStudent,
  getStudentDashboard,
  createStudent,
  deleteStudent
} from '../controllers/studentController.js';

const router = express.Router();

router.get('/', getStudents);
router.post('/', createStudent);
router.get('/:id', getStudent);
router.get('/:id/dashboard', getStudentDashboard);
router.delete('/:id', deleteStudent);

export default router;
