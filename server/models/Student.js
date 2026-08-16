import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  }
}, {
  timestamps: true
});

// Compound unique index: email must be unique per store
studentSchema.index({ store: 1, email: 1 }, { unique: true });

const Student = mongoose.model('Student', studentSchema);

export default Student;
