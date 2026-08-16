import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { validateObjectId } from '../middleware/validation.js';

// Get all courses for authenticated store
export const getCourses = async (req, res, next) => {
  try {
    const { search, status, category } = req.query;
    const storeId = req.store._id;

    // Build query
    const query = { store: storeId };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { instructorName: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (category) {
      query.category = category;
    }

    const courses = await Course.find(query).sort({ createdAt: -1 });
    
    res.json(courses);
  } catch (error) {
    next(error);
  }
};

// Get single course
export const getCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    validateObjectId(id, 'Course ID');

    const course = await Course.findOne({ 
      _id: id, 
      store: req.store._id 
    });

    if (!course) {
      return res.status(404).json({ 
        error: 'Not found', 
        message: 'Course not found' 
      });
    }

    // Get enrollment statistics
    const totalEnrolled = await Enrollment.countDocuments({ 
      course: id, 
      store: req.store._id 
    });
    
    const completed = await Enrollment.countDocuments({ 
      course: id, 
      store: req.store._id, 
      status: 'Completed' 
    });
    
    const inProgress = await Enrollment.countDocuments({ 
      course: id, 
      store: req.store._id, 
      status: 'In Progress' 
    });

    res.json({
      ...course.toObject(),
      enrollmentStats: {
        totalEnrolled,
        completed,
        inProgress
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create course
export const createCourse = async (req, res, next) => {
  try {
    const { title, description, instructorName, category, duration, status } = req.body;

    // Server-side validation
    if (!title || !description || !instructorName || !category || !duration) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        message: 'All fields are required' 
      });
    }

    if (status && !['Active', 'Inactive'].includes(status)) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        message: 'Status must be either Active or Inactive' 
      });
    }

    const course = await Course.create({
      store: req.store._id,
      title,
      description,
      instructorName,
      category,
      duration,
      status: status || 'Active'
    });

    res.status(201).json(course);
  } catch (error) {
    next(error);
  }
};

// Update course
export const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    validateObjectId(id, 'Course ID');

    const { title, description, instructorName, category, duration, status } = req.body;

    // Validate status if provided
    if (status && !['Active', 'Inactive'].includes(status)) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        message: 'Status must be either Active or Inactive' 
      });
    }

    const course = await Course.findOneAndUpdate(
      { _id: id, store: req.store._id },
      { title, description, instructorName, category, duration, status },
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({ 
        error: 'Not found', 
        message: 'Course not found' 
      });
    }

    res.json(course);
  } catch (error) {
    next(error);
  }
};

// Delete course
export const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    validateObjectId(id, 'Course ID');

    const course = await Course.findOneAndDelete({ 
      _id: id, 
      store: req.store._id 
    });

    if (!course) {
      return res.status(404).json({ 
        error: 'Not found', 
        message: 'Course not found' 
      });
    }

    // Also delete associated enrollments
    await Enrollment.deleteMany({ 
      course: id, 
      store: req.store._id 
    });

    res.json({ 
      message: 'Course deleted successfully',
      deletedCourse: course 
    });
  } catch (error) {
    next(error);
  }
};
