# Learnly - Shopify LMS Application

A production-grade Learning Management System (LMS) built as a Shopify Embedded App with React, Node.js, Express, and MongoDB.

![Build](https://img.shields.io/badge/Build-Passing-success) ![License](https://img.shields.io/badge/License-MIT-blue) ![Node](https://img.shields.io/badge/Node-v18+-green) ![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-green)

## 🎯 Overview

Learnly enables Shopify merchants to manage courses, students, and enrollments directly within their store admin. Built with a premium UI using Shopify Polaris components, animated KPI cards, and comprehensive data management.

### Key Features

- **📊 Analytics Dashboard** - Real-time KPIs with animated counters and visual charts
- **📚 Course Management** - Create, edit, delete courses with status tracking
- **👥 Student Management** - Track students with enrollment analytics
- **📝 Enrollment System** - Duplicate prevention with compound indexes
- **🏪 Shopify Integration** - Live store data via GraphQL API
- **🎨 Premium UI** - Shopify Polaris components with custom violet branding

## 🏗️ Tech Stack

**Frontend**
- React 18 + Vite
- Shopify Polaris UI Components
- React Router v6
- Recharts for visualizations
- Axios for API calls

**Backend**
- Node.js + Express
- MongoDB + Mongoose ODM
- Shopify Admin GraphQL API
- RESTful API architecture

**Database**
- MongoDB with compound indexes
- Reference-based relationships
- Store-level data isolation

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Shopify Partner Account

### 1. Clone & Install

```bash
git clone https://github.com/Abishekk21/Shopify-LMS.git
cd Shopify-LMS

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Environment Setup

**Backend** (`server/.env`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/shopify-lms
SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_API_SECRET=your_shopify_api_secret
SHOPIFY_SCOPES=read_products,write_products
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=your_random_secret
```

**Frontend** (`client/.env`):
```env
VITE_API_URL=http://localhost:5000
VITE_SHOPIFY_API_KEY=your_shopify_api_key
VITE_SHOP_DOMAIN=your-store.myshopify.com
```

### 3. Run Application

**Backend:**
```bash
cd server
npm run dev
```

**Frontend:**
```bash
cd client
npm run dev
```

**Seed Demo Data (Optional):**
```bash
cd server
npm run seed
```

Access at: `http://localhost:5173`

## 📊 Database Schema

```
Store
├── shopDomain (unique)
├── shopName
└── accessToken

Course
├── store (ref: Store)
├── title, description
├── instructorName, category
├── duration, status
└── timestamps

Student
├── store (ref: Store)
├── name, email (unique per store)
└── timestamps

Enrollment
├── store (ref: Store)
├── student (ref: Student)
├── course (ref: Course)
├── status (In Progress | Completed)
└── Compound Index: { store, student, course } (unique)
```

### Critical Features

**Duplicate Prevention:** MongoDB compound unique index prevents duplicate enrollments at database level.

**Store Isolation:** All queries automatically scoped by `store._id` for multi-tenant security.

## 🔌 API Endpoints

### Dashboard
- `GET /api/dashboard` - Statistics and recent activity

### Courses
- `GET /api/courses` - List all courses (search, filter)
- `POST /api/courses` - Create course
- `GET /api/courses/:id` - Course details
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Students
- `GET /api/students` - List all students
- `POST /api/students` - Create student
- `GET /api/students/:id/dashboard` - Student dashboard
- `DELETE /api/students/:id` - Delete student (cascade enrollments)

### Enrollments
- `GET /api/enrollments` - List enrollments
- `POST /api/enrollments` - Enroll student (duplicate check)
- `PATCH /api/enrollments/:id` - Update status
- `DELETE /api/enrollments/:id` - Delete enrollment

### Shopify
- `GET /api/shop` - Store information via GraphQL

## 🎨 UI Features

### Animated KPI Cards
- Count-up animations from 0 to value
- Floating background shapes with rotation
- Violet gradient backgrounds (#9147FF)
- Present on Dashboard, Courses, Students, Enrollments pages

### Shopify Polaris Components
- **Badge** - Status indicators (Active, Inactive, Completed, In Progress)
- **Spinner** - Loading states on all pages
- **EmptyState** - User-friendly empty data displays
- **AppProvider** - Polaris initialization wrapper

### Custom Features
- Responsive tables with action menus
- Modal dialogs for CRUD operations
- Success animations with checkmarks
- Real-time search and filtering
- Recharts pie chart for course activity

## 🔒 Security

- **Authentication:** Shopify OAuth integration
- **Authorization:** Store-level data isolation
- **Validation:** Client + server-side validation
- **Error Handling:** Graceful error messages without exposing system details
- **Database:** Parameterized queries, compound indexes
- **Environment:** All secrets in `.env` files

## 🚀 Production Deployment

### Build for Production

```bash
# Frontend
cd client
npm run build

# Backend
cd server
npm start
```

### Deployment Platforms
- **Backend:** Render, Railway, Heroku, AWS Elastic Beanstalk
- **Frontend:** Vercel, Netlify, Cloudflare Pages
- **Database:** MongoDB Atlas

### Production Checklist
- [ ] Update environment variables with production URLs
- [ ] Configure MongoDB Atlas connection
- [ ] Update Shopify app URLs in Partner Dashboard
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS for production domain
- [ ] Test all CRUD operations
- [ ] Verify database indexes are created
- [ ] Monitor application health

## 📱 Pages & Features

### Dashboard
- 4 KPI cards (Total Courses, Students, Enrollments, In Progress)
- Recharts pie chart for course activity
- Recent enrollments table
- Store information badge

### Courses
- 4 KPI cards (Total, Active, Inactive, Total Enrollments)
- Searchable course table
- Create/Edit/Delete modals
- Status badge visualization

### Students
- 4 KPI cards (Total, Active, Inactive, Total Enrollments)
- Student table with enrollment counts
- Individual student dashboards
- Cascade delete protection

### Enrollments
- 4 KPI cards (Total, In Progress, Completed, Completion Rate %)
- Filterable enrollment table
- Status update functionality
- Duplicate prevention

## 🧪 Testing

### Manual Testing
1. Create courses with various statuses
2. Add students with unique emails
3. Enroll students in courses
4. Attempt duplicate enrollment (should fail)
5. Update enrollment status
6. Delete course (verify cascade delete)
7. View KPI cards for accurate counts

### API Testing
```bash
# Health check
curl http://localhost:5000/health

# Get courses
curl http://localhost:5000/api/courses?shop=your-store.myshopify.com
```

## 📂 Project Structure

```
shopify-lms-app/
├── client/               # React frontend
│   ├── src/
│   │   ├── components/  # Polaris wrapper components
│   │   ├── pages/       # Main application pages
│   │   ├── services/    # API service layer
│   │   ├── utils/       # Validation, formatting utilities
│   │   └── styles/      # Custom CSS
│   └── package.json
├── server/              # Express backend
│   ├── config/          # Database, Shopify config
│   ├── controllers/     # Business logic
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Auth, validation, error handling
│   ├── scripts/         # Seed script
│   └── package.json
├── .gitignore
├── LICENSE
└── README.md
```

## 🐛 Known Limitations

- Pagination not implemented (suitable for <1000 records per collection)
- Simplified authentication for development (full OAuth for production)
- No file upload functionality (course images, certificates)
- No email notifications
- No audit logging

## 📄 License

MIT License - See [LICENSE](./LICENSE) file for details.

## 🤝 Contributing

This is a demonstration project. For production use, consider adding:
- Unit and integration tests
- Error monitoring (Sentry)
- Rate limiting
- Caching layer (Redis)
- CI/CD pipeline
- API documentation (Swagger)

## 📞 Support

For issues or questions:
1. Check environment variables are correctly configured
2. Verify MongoDB connection is active
3. Review API error responses in browser console
4. Check server logs for detailed errors

---

**Built by:** Abishek  
**Repository:** [github.com/Abishekk21/Shopify-LMS](https://github.com/Abishekk21/Shopify-LMS)  
**Tech Stack:** React • Node.js • Express • MongoDB • Shopify Polaris • GraphQL

**Focus:** Clean Architecture • Database Design • Professional UI/UX • Production Readiness
