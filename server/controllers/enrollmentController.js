import Enrollment from '../models/Enrollment.js';
import Student from '../models/Student.js';
import Course from '../models/Course.js';
import { validateObjectId } from '../middleware/validation.js';

// Get all enrollments
export const getEnrollments = async (req, res, next) => {
  try {
    const { status, studentId, courseId } = req.query;
    const storeId = req.store._id;

    const query = { store: storeId };
    
    if (status) {
      query.status = status;
    }
    
    if (studentId) {
      validateObjectId(studentId, 'Student ID');
      query.student = studentId;
    }
    
    if (courseId) {
      validateObjectId(courseId, 'Course ID');
      query.course = courseId;
    }

    const enrollments = await Enrollment.find(query)
      .populate('student', 'name email')
      .populate('course', 'title category instructorName')
      .sort({ enrollmentDate: -1 });

    res.json(enrollments);
  } catch (error) {
    next(error);
  }
};

// Create enrollment
export const createEnrollment = async (req, res, next) => {
  try {
    const { studentId, courseId, status } = req.body;
    const storeId = req.store._id;

    // Validate required fields
    if (!studentId || !courseId) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        message: 'Student and course are required' 
      });
    }

    // Validate ObjectIds
    validateObjectId(studentId, 'Student ID');
    validateObjectId(courseId, 'Course ID');

    // Verify student exists and belongs to this store
    const student = await Student.findOne({ 
      _id: studentId, 
      store: storeId 
    });
    
    if (!student) {
      return res.status(404).json({ 
        error: 'Not found', 
        message: 'Student not found' 
      });
    }

    // Verify course exists and belongs to this store
    const course = await Course.findOne({ 
      _id: courseId, 
      store: storeId 
    });
    
    if (!course) {
      return res.status(404).json({ 
        error: 'Not found', 
        message: 'Course not found' 
      });
    }

    // Check for duplicate enrollment (frontend validation backup)
    const existingEnrollment = await Enrollment.findOne({
      store: storeId,
      student: studentId,
      course: courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({ 
        error: 'Duplicate enrollment', 
        message: 'This student is already enrolled in this course.' 
      });
    }

    // Validate status if provided
    if (status && !['In Progress', 'Completed'].includes(status)) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        message: 'Status must be either "In Progress" or "Completed"' 
      });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      store: storeId,
      student: studentId,
      course: courseId,
      status: status || 'In Progress',
      enrollmentDate: new Date()
    });

    // Populate for response
    await enrollment.populate('student', 'name email');
    await enrollment.populate('course', 'title category instructorName');

    res.status(201).json(enrollment);
  } catch (error) {
    // MongoDB will throw duplicate key error if compound index catches it
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: 'Duplicate enrollment', 
        message: 'This student is already enrolled in this course.' 
      });
    }
    next(error);
  }
};

// Update enrollment status
export const updateEnrollment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    validateObjectId(id, 'Enrollment ID');

    if (!status) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        message: 'Status is required' 
      });
    }

    if (!['In Progress', 'Completed'].includes(status)) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        message: 'Status must be either "In Progress" or "Completed"' 
      });
    }

    const enrollment = await Enrollment.findOneAndUpdate(
      { _id: id, store: req.store._id },
      { status },
      { new: true }
    )
      .populate('student', 'name email')
      .populate('course', 'title category instructorName');

    if (!enrollment) {
      return res.status(404).json({ 
        error: 'Not found', 
        message: 'Enrollment not found' 
      });
    }

    res.json(enrollment);
  } catch (error) {
    next(error);
  }
};

// Delete enrollment
export const deleteEnrollment = async (req, res, next) => {
  try {
    const { id } = req.params;
    validateObjectId(id, 'Enrollment ID');

    const enrollment = await Enrollment.findOneAndDelete({ 
      _id: id, 
      store: req.store._id 
    });

    if (!enrollment) {
      return res.status(404).json({ 
        error: 'Not found', 
        message: 'Enrollment not found' 
      });
    }

    res.json({ 
      message: 'Enrollment deleted successfully' 
    });
  } catch (error) {
    next(error);
  }
};
