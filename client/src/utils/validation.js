export const validateEmail = (email) => {
  const regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return regex.test(email);
};

export const validateRequired = (value) => {
  return value && value.toString().trim().length > 0;
};

export const validateCourseForm = (formData) => {
  const errors = {};

  if (!validateRequired(formData.title)) {
    errors.title = 'Course title is required';
  }

  if (!validateRequired(formData.description)) {
    errors.description = 'Description is required';
  }

  if (!validateRequired(formData.instructorName)) {
    errors.instructorName = 'Instructor name is required';
  }

  if (!validateRequired(formData.category)) {
    errors.category = 'Category is required';
  }

  if (!validateRequired(formData.duration)) {
    errors.duration = 'Duration is required';
  }

  return errors;
};

export const validateStudentForm = (formData) => {
  const errors = {};

  if (!validateRequired(formData.name)) {
    errors.name = 'Student name is required';
  }

  if (!validateRequired(formData.email)) {
    errors.email = 'Email is required';
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  return errors;
};

export const validateEnrollmentForm = (formData) => {
  const errors = {};

  if (!formData.studentId) {
    errors.studentId = 'Please select a student';
  }

  if (!formData.courseId) {
    errors.courseId = 'Please select a course';
  }

  return errors;
};
