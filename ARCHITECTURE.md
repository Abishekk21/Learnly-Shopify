# Architecture Documentation

## System Overview

The Shopify LMS Application follows a clean, three-tier architecture:

```
┌─────────────────────────────────────────────┐
│         React Frontend (Client)              │
│   Vite + Shopify Polaris + App Bridge       │
└─────────────────┬───────────────────────────┘
                  │ HTTP/REST
                  │ (Axios)
┌─────────────────▼───────────────────────────┐
│      Node.js Backend (Server)                │
│   Express + REST API + Shopify API          │
└─────────────────┬───────────────────────────┘
                  │ Mongoose ODM
                  │
┌─────────────────▼───────────────────────────┐
│           MongoDB Database                   │
│   Stores, Courses, Students, Enrollments    │
└──────────────────────────────────────────────┘
```

## Frontend Architecture

### Technology Choices

**React + Vite**
- Fast HMR (Hot Module Replacement)
- Optimized production builds
- Modern ES modules

**Shopify Polaris**
- Native Shopify Admin look and feel
- Accessible components out of the box
- Consistent design system

**React Router**
- Client-side routing
- Nested routes support
- URL-based navigation

### Directory Structure

```
client/
├── src/
│   ├── components/          # Reusable components
│   ├── pages/               # Route pages
│   │   ├── Dashboard.jsx
│   │   ├── Courses.jsx
│   │   ├── CourseDetails.jsx
│   │   ├── Students.jsx
│   │   ├── StudentDashboard.jsx
│   │   └── Enrollments.jsx
│   ├── services/
│   │   └── api.js           # API client
│   ├── hooks/               # Custom React hooks
│   ├── utils/
│   │   ├── validation.js    # Form validation
│   │   └── formatting.js    # Data formatting
│   ├── styles/
│   │   └── App.css          # Custom styles
│   ├── App.jsx              # Main app component
│   └── main.jsx             # Entry point
├── index.html
├── vite.config.js
└── package.json
```

### Component Hierarchy

```
App
├── AppProvider (Polaris)
│   └── Router
│       └── Frame
│           ├── Navigation
│           └── Routes
│               ├── Dashboard
│               ├── Courses
│               │   └── CourseDetails
│               ├── Students
│               │   └── StudentDashboard
│               └── Enrollments
```

### State Management

**Local State (useState)**
- Component-specific data
- Form inputs
- UI state (modals, loading)

**Why No Redux/Context?**
- Application scope is focused
- No complex shared state
- Server is source of truth
- React Query could be added for caching

### Data Flow

```
User Action → Component → API Call → Backend
     ↑                                    ↓
     └────────── Update UI ←──────── Response
```

## Backend Architecture

### Technology Choices

**Express.js**
- Minimal, flexible framework
- Large ecosystem
- Well-documented

**Mongoose**
- Schema validation
- Query building
- Middleware hooks
- Population (joins)

**REST API**
- Simple, standard approach
- Easy to test
- Well-understood patterns

### Directory Structure

```
server/
├── config/
│   ├── database.js          # MongoDB connection
│   └── shopify.js           # Shopify API config
├── models/
│   ├── Store.js
│   ├── Course.js
│   ├── Student.js
│   └── Enrollment.js
├── controllers/
│   ├── courseController.js
│   ├── studentController.js
│   ├── enrollmentController.js
│   ├── dashboardController.js
│   └── shopifyController.js
├── routes/
│   ├── courseRoutes.js
│   ├── studentRoutes.js
│   ├── enrollmentRoutes.js
│   ├── dashboardRoutes.js
│   └── shopifyRoutes.js
├── middleware/
│   ├── auth.js              # Authentication
│   ├── errorHandler.js      # Error handling
│   └── validation.js        # Request validation
├── services/                # Business logic
├── utils/                   # Helper functions
├── scripts/
│   └── seed.js              # Database seeding
└── server.js                # Entry point
```

### Request Flow

```
HTTP Request
    ↓
Express Router
    ↓
Auth Middleware (verify store)
    ↓
Controller (handle request)
    ↓
Service Layer (business logic)
    ↓
Model (Mongoose)
    ↓
MongoDB
    ↓
Response ← Controller ← Service ← Model
```

### Middleware Stack

1. **CORS**: Allow cross-origin requests from frontend
2. **Body Parser**: Parse JSON payloads
3. **Cookie Parser**: Parse cookies
4. **Authentication**: Verify Shopify store
5. **Route Handlers**: Execute business logic
6. **Error Handler**: Catch and format errors

### Error Handling Strategy

```javascript
try {
  // Business logic
} catch (error) {
  next(error);  // Pass to error handler
}
```

**Error Handler Catches:**
- MongoDB errors (validation, duplicate key, cast)
- Custom application errors
- Unexpected errors

**Returns:**
- User-friendly error messages
- Appropriate HTTP status codes
- No sensitive information exposed

## Database Architecture

### Schema Design Philosophy

**Normalized Structure**
- Each entity in separate collection
- References instead of embedding
- Easier to query and update

**Why Not Embedded?**
- Courses can exist without enrollments
- Students can exist without enrollments
- Need to query each entity independently

### Relationships

```
Store (1) ──┬── (N) Course
            ├── (N) Student
            └── (N) Enrollment

Enrollment (N) ── (1) Student
Enrollment (N) ── (1) Course
```

### Index Strategy

**Primary Indexes** (Automatic)
- `_id` on all collections

**Compound Unique Indexes**
- `{store: 1, email: 1}` on Student (email unique per store)
- `{store: 1, student: 1, course: 1}` on Enrollment (prevents duplicates)

**Performance Indexes**
- `{store: 1, status: 1}` on Course
- `{store: 1, createdAt: -1}` on Course
- `{store: 1, status: 1}` on Enrollment
- `{store: 1, enrollmentDate: -1}` on Enrollment

### Query Optimization

**Population Strategy**
```javascript
// Get enrollments with student and course data
Enrollment.find({ store: storeId })
  .populate('student', 'name email')      // Only needed fields
  .populate('course', 'title category')   // Only needed fields
```

**Projection**
```javascript
// Only select needed fields
Student.find({ store: storeId }, 'name email createdAt')
```

## Authentication Flow

### Simplified Development Flow

```
Request
    ↓
Extract shop domain (query/header)
    ↓
Find store in database
    ↓
Auto-create if not exists (dev only)
    ↓
Attach store to req.store
    ↓
Continue to route handler
```

### Production OAuth Flow (To Implement)

```
1. Merchant clicks "Install App"
    ↓
2. Redirect to Shopify OAuth
    ↓
3. Merchant approves scopes
    ↓
4. Shopify redirects with code
    ↓
5. Exchange code for access token
    ↓
6. Store token in database
    ↓
7. Redirect to app
    ↓
8. All requests include shop domain
    ↓
9. Verify token for each request
```

## API Design Patterns

### RESTful Conventions

```
GET    /api/courses          # List
POST   /api/courses          # Create
GET    /api/courses/:id      # Read
PUT    /api/courses/:id      # Update (full)
PATCH  /api/courses/:id      # Update (partial)
DELETE /api/courses/:id      # Delete
```

### Response Format

**Success:**
```json
{
  "_id": "...",
  "title": "Course Title",
  "status": "Active",
  ...
}
```

**Error:**
```json
{
  "error": "Validation failed",
  "message": "Title is required"
}
```

### HTTP Status Codes

- `200 OK`: Successful GET, PUT, PATCH
- `201 Created`: Successful POST
- `400 Bad Request`: Validation error, duplicate
- `401 Unauthorized`: Authentication failed
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Unexpected error

## Security Architecture

### Data Isolation

```javascript
// Every query includes store filter
Course.find({ store: req.store._id })

// Store ID from authenticated session, NOT from request body
```

### Validation Layers

**Layer 1: Frontend**
- Immediate user feedback
- Reduces unnecessary requests
- Better UX

**Layer 2: Backend**
- Cannot be bypassed
- Validates all inputs
- Sanitizes data

**Layer 3: Database**
- Schema validation
- Unique constraints
- Data integrity

### Preventing Common Vulnerabilities

**SQL Injection**: N/A (using MongoDB)
**NoSQL Injection**: Mongoose escapes by default
**XSS**: React escapes by default
**CSRF**: Not applicable (API-only backend)
**IDOR**: Store ownership verified on every request

## Performance Considerations

### Frontend

**Code Splitting** (can be added)
```javascript
const Courses = lazy(() => import('./pages/Courses'));
```

**Memoization** (can be added)
```javascript
const memoizedValue = useMemo(() => computeExpensive(data), [data]);
```

**Debouncing Search**
```javascript
const debouncedSearch = useCallback(
  debounce((value) => setSearchTerm(value), 300),
  []
);
```

### Backend

**Database Queries**
- Use indexes for frequent queries
- Project only needed fields
- Limit results when appropriate

**Connection Pooling**
```javascript
mongoose.connect(uri, {
  maxPoolSize: 10,  // Max connections
  minPoolSize: 2    // Min connections
});
```

### Scaling Strategies

**Horizontal Scaling**
- Run multiple backend instances
- Use load balancer
- Stateless authentication (JWT)

**Caching**
- Redis for sessions
- Cache frequent queries
- CDN for static assets

**Database**
- MongoDB sharding
- Read replicas
- Indexes optimization

## Deployment Architecture

### Development

```
localhost:5173 (Frontend)
      ↓
localhost:5000 (Backend)
      ↓
localhost:27017 (MongoDB)
```

### Production

```
Vercel/Netlify (Frontend)
      ↓
Render/Railway (Backend)
      ↓
MongoDB Atlas (Database)
```

## Monitoring & Observability

### Logging Strategy

**Development:**
```javascript
console.log('Debug info');
console.error('Error occurred');
```

**Production:**
```javascript
logger.info('User action', { userId, action });
logger.error('Error occurred', { error, context });
```

### Metrics to Track

- Request count per endpoint
- Response times
- Error rates
- Database query performance
- Active user count

### Health Checks

```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});
```

## Future Enhancements

### Technical

- [ ] Add Redis caching layer
- [ ] Implement full Shopify OAuth
- [ ] Add comprehensive test suite
- [ ] Implement pagination
- [ ] Add rate limiting
- [ ] WebSocket for real-time updates
- [ ] Implement job queue (Bull)

### Features

- [ ] Course categories management
- [ ] Student progress tracking
- [ ] Certificates generation
- [ ] Email notifications
- [ ] Course materials upload
- [ ] Quiz/assessment system
- [ ] Reporting and analytics
- [ ] Bulk operations

### DevOps

- [ ] CI/CD pipeline
- [ ] Automated testing
- [ ] Docker containerization
- [ ] Kubernetes orchestration
- [ ] Automated backups
- [ ] Load testing

## Design Decisions

### Why REST over GraphQL?

- Simpler to implement and debug
- Well-understood by most developers
- Sufficient for current requirements
- Easier to cache

### Why MongoDB over PostgreSQL?

- Flexible schema (requirements may evolve)
- Horizontal scaling built-in
- JSON-native (matches JavaScript)
- Easy to start with

### Why Vite over Create React App?

- Much faster development builds
- Faster HMR
- Smaller bundle sizes
- Modern tooling

### Why Not TypeScript?

- Project scope doesn't require it
- JavaScript is sufficient for demonstration
- Easier for broader audience
- Can be added incrementally

## Conclusion

This architecture prioritizes:
- **Simplicity**: Easy to understand and maintain
- **Scalability**: Can grow with requirements
- **Security**: Multiple validation layers
- **Performance**: Optimized queries and indexes
- **Developer Experience**: Clear structure, good tooling
