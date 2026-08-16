import Student from '../models/Student.js';
import Enrollment from '../models/Enrollment.js';
import { validateObjectId } from '../middleware/validation.js';

// Get all students
export const getStudents = async (req, res, next) => {
  try {
    const { search } = req.query;
    const storeId = req.store._id;

    const query = { store: storeId };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await Student.find(query).sort({ createdAt: -1 });
    
    // Get enrollment counts for each student
    const studentsWithStats = await Promise.all(
      students.map(async (student) => {
        const totalEnrollments = await Enrollment.countDocuments({ 
          student: student._id, 
          store: storeId 
        });
        
        const completed = await Enrollment.countDocuments({ 
          student: student._id, 
          store: storeId, 
          status: 'Completed' 
        });
        
        const inProgress = await Enrollment.countDocuments({ 
          student: student._id, 
          store: storeId, 
          status: 'In Progress' 
        });

        return {
          ...student.toObject(),
          enrollmentStats: {
            totalEnrollments,
            completed,
            inProgress
          }
        };
      })
    );

    res.json(studentsWithStats);
  } catch (error) {
    next(error);
  }
};

// Get single student
export const getStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    validateObjectId(id, 'Student ID');

    const student = await Student.findOne({ 
      _id: id, 
      store: req.store._id 
    });

    if (!student) {
      return res.status(404).json({ 
        error: 'Not found', 
        message: 'Student not found' 
      });
    }

    res.json(student);
  } catch (error) {
    next(error);
  }
};

// Get student dashboard
export const getStudentDashboard = async (req, res, next) => {
  try {
    const { id } = req.params;
    validateObjectId(id, 'Student ID');

    const student = await Student.findOne({ 
      _id: id, 
      store: req.store._id 
    });

    if (!student) {
      return res.status(404).json({ 
        error: 'Not found', 
        message: 'Student not found' 
      });
    }

    // Get enrollment statistics
    const totalEnrollments = await Enrollment.countDocuments({ 
      student: id, 
      store: req.store._id 
    });
    
    const completed = await Enrollment.countDocuments({ 
      student: id, 
      store: req.store._id, 
      status: 'Completed' 
    });
    
    const inProgress = await Enrollment.countDocuments({ 
      student: id, 
      store: req.store._id, 
      status: 'In Progress' 
    });

    // Get enrollments with course details
    const enrollments = await Enrollment.find({ 
      student: id, 
      store: req.store._id 
    })
      .populate('course')
      .sort({ enrollmentDate: -1 });

    res.json({
      student,
      stats: {
        totalEnrollments,
        completed,
        inProgress
      },
      enrollments
    });
  } catch (error) {
    next(error);
  }
};

// Create student
export const createStudent = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        message: 'Name and email are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        message: 'Please enter a valid email address' 
      });
    }

    const student = await Student.create({
      store: req.store._id,
      name,
      email
    });

    res.status(201).json(student);
  } catch (error) {
    next(error);
  }
};

// Delete student
export const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    validateObjectId(id, 'Student ID');

    // Find student and verify ownership
    const student = await Student.findOne({ 
      _id: id, 
      store: req.store._id 
    });

    if (!student) {
      return res.status(404).json({ 
        error: 'Not found', 
        message: 'Student not found' 
      });
    }

    // Check if student has enrollments
    const enrollmentCount = await Enrollment.countDocuments({ 
      student: id, 
      store: req.store._id 
    });

    if (enrollmentCount > 0) {
      // CASCADE DELETE: Remove all enrollments when deleting student
      await Enrollment.deleteMany({ 
        student: id, 
        store: req.store._id 
      });
    }

    // Delete the student
    await Student.findByIdAndDelete(id);

    res.json({ 
      message: 'Student deleted successfully',
      deletedEnrollments: enrollmentCount
    });
  } catch (error) {
    next(error);
  }
};
