import Course from '../models/Course.js';
import Student from '../models/Student.js';
import Enrollment from '../models/Enrollment.js';

export const getDashboardData = async (req, res, next) => {
  try {
    const storeId = req.store._id;

    // Get counts
    const totalCourses = await Course.countDocuments({ store: storeId });
    const totalStudents = await Student.countDocuments({ store: storeId });
    const totalEnrollments = await Enrollment.countDocuments({ store: storeId });
    
    const completedEnrollments = await Enrollment.countDocuments({ 
      store: storeId, 
      status: 'Completed' 
    });
    
    const inProgressEnrollments = await Enrollment.countDocuments({ 
      store: storeId, 
      status: 'In Progress' 
    });

    // Course overview
    const activeCourses = await Course.countDocuments({ 
      store: storeId, 
      status: 'Active' 
    });
    
    const inactiveCourses = await Course.countDocuments({ 
      store: storeId, 
      status: 'Inactive' 
    });

    // Recent enrollments
    const recentEnrollments = await Enrollment.find({ store: storeId })
      .populate('student', 'name email')
      .populate('course', 'title')
      .sort({ enrollmentDate: -1 })
      .limit(5);

    // Most recent courses
    const recentCourses = await Course.find({ store: storeId })
      .sort({ createdAt: -1 })
      .limit(3);

    res.json({
      stats: {
        totalCourses,
        totalStudents,
        totalEnrollments,
        completedEnrollments,
        inProgressEnrollments,
        activeCourses,
        inactiveCourses
      },
      recentEnrollments,
      recentCourses
    });
  } catch (error) {
    next(error);
  }
};
