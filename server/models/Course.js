import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Course description is required']
  },
  instructorName: {
    type: String,
    required: [true, 'Instructor name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  duration: {
    type: String,
    required: [true, 'Duration is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
    required: true
  }
}, {
  timestamps: true
});

// Compound index for store-specific queries
courseSchema.index({ store: 1, status: 1 });
courseSchema.index({ store: 1, createdAt: -1 });

const Course = mongoose.model('Course', courseSchema);

export default Course;
