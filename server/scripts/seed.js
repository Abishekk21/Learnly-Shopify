import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Store from '../models/Store.js';
import Course from '../models/Course.js';
import Student from '../models/Student.js';
import Enrollment from '../models/Enrollment.js';

dotenv.config();

const SHOP_DOMAIN = 'development-store.myshopify.com';

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Clear existing data
    await Enrollment.deleteMany({});
    await Student.deleteMany({});
    await Course.deleteMany({});
    await Store.deleteMany({});

    console.log('Cleared existing data');

    // Create development store
    const store = await Store.create({
      shopDomain: SHOP_DOMAIN,
      shopName: 'Development Store',
      email: 'dev@example.com',
      accessToken: 'dev_token_' + Date.now(),
      isActive: true
    });

    console.log('Created store:', store.shopName);

    // Create courses
    const courses = await Course.create([
      {
        store: store._id,
        title: 'React Fundamentals',
        description: 'Learn the basics of React including components, props, state, and hooks.',
        instructorName: 'Sarah Johnson',
        category: 'Web Development',
        duration: '8 weeks',
        status: 'Active'
      },
      {
        store: store._id,
        title: 'Advanced Node.js',
        description: 'Master Node.js, Express, REST APIs, and backend architecture patterns.',
        instructorName: 'Michael Chen',
        category: 'Backend Development',
        duration: '10 weeks',
        status: 'Active'
      },
      {
        store: store._id,
        title: 'MongoDB Essentials',
        description: 'Complete guide to MongoDB, Mongoose, schema design, and database optimization.',
        instructorName: 'Priya Patel',
        category: 'Database',
        duration: '6 weeks',
        status: 'Active'
      },
      {
        store: store._id,
        title: 'JavaScript Deep Dive',
        description: 'Advanced JavaScript concepts including closures, prototypes, async programming.',
        instructorName: 'David Martinez',
        category: 'Programming',
        duration: '12 weeks',
        status: 'Active'
      },
      {
        store: store._id,
        title: 'TypeScript Mastery',
        description: 'Learn TypeScript from basics to advanced type system features.',
        instructorName: 'Emma Wilson',
        category: 'Programming',
        duration: '8 weeks',
        status: 'Active'
      },
      {
        store: store._id,
        title: 'GraphQL API Design',
        description: 'Build scalable GraphQL APIs with best practices and real-world patterns.',
        instructorName: 'James Taylor',
        category: 'API Development',
        duration: '6 weeks',
        status: 'Active'
      },
      {
        store: store._id,
        title: 'UI/UX Design Principles',
        description: 'Master user interface and experience design fundamentals.',
        instructorName: 'Lisa Anderson',
        category: 'Design',
        duration: '8 weeks',
        status: 'Active'
      },
      {
        store: store._id,
        title: 'Docker & Kubernetes',
        description: 'Container orchestration and deployment strategies.',
        instructorName: 'Robert Kim',
        category: 'DevOps',
        duration: '10 weeks',
        status: 'Inactive'
      },
      {
        store: store._id,
        title: 'Python for Data Science',
        description: 'Data analysis, visualization, and machine learning with Python.',
        instructorName: 'Maria Garcia',
        category: 'Data Science',
        duration: '12 weeks',
        status: 'Active'
      },
      {
        store: store._id,
        title: 'AWS Cloud Fundamentals',
        description: 'Introduction to Amazon Web Services and cloud computing.',
        instructorName: 'Chris Brown',
        category: 'Cloud Computing',
        duration: '8 weeks',
        status: 'Inactive'
      }
    ]);

    console.log(`Created ${courses.length} courses`);

    // Create students
    const students = await Student.create([
      { store: store._id, name: 'John Smith', email: 'john.smith@example.com' },
      { store: store._id, name: 'Emily Davis', email: 'emily.davis@example.com' },
      { store: store._id, name: 'Michael Johnson', email: 'michael.j@example.com' },
      { store: store._id, name: 'Sophia Williams', email: 'sophia.w@example.com' },
      { store: store._id, name: 'Daniel Brown', email: 'daniel.brown@example.com' },
      { store: store._id, name: 'Olivia Garcia', email: 'olivia.g@example.com' },
      { store: store._id, name: 'James Martinez', email: 'james.m@example.com' },
      { store: store._id, name: 'Emma Rodriguez', email: 'emma.r@example.com' },
      { store: store._id, name: 'Alexander Lee', email: 'alex.lee@example.com' },
      { store: store._id, name: 'Ava Taylor', email: 'ava.taylor@example.com' },
      { store: store._id, name: 'William Anderson', email: 'william.a@example.com' },
      { store: store._id, name: 'Isabella Thomas', email: 'isabella.t@example.com' },
      { store: store._id, name: 'Ethan Jackson', email: 'ethan.j@example.com' },
      { store: store._id, name: 'Mia White', email: 'mia.white@example.com' },
      { store: store._id, name: 'Noah Harris', email: 'noah.h@example.com' },
      { store: store._id, name: 'Charlotte Martin', email: 'charlotte.m@example.com' },
      { store: store._id, name: 'Liam Thompson', email: 'liam.t@example.com' },
      { store: store._id, name: 'Amelia Clark', email: 'amelia.c@example.com' },
      { store: store._id, name: 'Benjamin Lewis', email: 'ben.lewis@example.com' },
      { store: store._id, name: 'Harper Walker', email: 'harper.w@example.com' }
    ]);

    console.log(`Created ${students.length} students`);

    // Create enrollments
    const enrollments = [];
    const statuses = ['In Progress', 'Completed'];
    
    // Create varied enrollments
    for (let i = 0; i < 30; i++) {
      const randomStudent = students[Math.floor(Math.random() * students.length)];
      const randomCourse = courses[Math.floor(Math.random() * 8)]; // Only active courses
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      // Random date within last 30 days
      const daysAgo = Math.floor(Math.random() * 30);
      const enrollmentDate = new Date();
      enrollmentDate.setDate(enrollmentDate.getDate() - daysAgo);

      try {
        const enrollment = await Enrollment.create({
          store: store._id,
          student: randomStudent._id,
          course: randomCourse._id,
          status: randomStatus,
          enrollmentDate
        });
        enrollments.push(enrollment);
      } catch (err) {
        // Skip duplicate enrollments
        if (err.code !== 11000) {
          console.error('Error creating enrollment:', err.message);
        }
      }
    }

    console.log(`Created ${enrollments.length} enrollments`);
    console.log('\n✅ Seed data created successfully!');
    console.log(`\nDevelopment Store: ${SHOP_DOMAIN}`);
    console.log('Use this shop domain when making API requests\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
