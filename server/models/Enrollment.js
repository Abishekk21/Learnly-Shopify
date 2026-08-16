import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
    index: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student is required']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['In Progress', 'Completed'],
    default: 'In Progress',
    required: true
  }
}, {
  timestamps: true
});

// CRITICAL: Compound unique index to prevent duplicate enrollments
// This enforces uniqueness at the database level
enrollmentSchema.index(
  { store: 1, student: 1, course: 1 }, 
  { unique: true }
);

// Additional indexes for queries
enrollmentSchema.index({ store: 1, status: 1 });
enrollmentSchema.index({ store: 1, enrollmentDate: -1 });
enrollmentSchema.index({ student: 1 });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

export default Enrollment;
