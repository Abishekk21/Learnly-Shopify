# Testing Guide

Comprehensive testing guide for the Shopify LMS Application.

## Manual Testing Checklist

### Dashboard Testing

- [ ] **Load Dashboard**
  - Dashboard displays without errors
  - All statistics show correct numbers
  - Connected store badge is visible
  - Shopify store information displays

- [ ] **Statistics Accuracy**
  - Total Courses matches course count
  - Total Students matches student count
  - Total Enrollments is accurate
  - Completed count is correct
  - In Progress count is correct

- [ ] **Recent Enrollments**
  - Table displays recent enrollments
  - Student names are correct
  - Course names are correct
  - Dates format properly
  - Status badges show correct colors

- [ ] **Course Overview**
  - Active courses count is accurate
  - Inactive courses count is accurate

- [ ] **Shopify Integration**
  - Store name displays from GraphQL API
  - Store domain displays
  - Store email displays
  - Connection status badge shows

### Course Management Testing

#### Create Course

- [ ] **Form Validation**
  - Empty title shows error
  - Empty description shows error
  - Empty instructor shows error
  - Empty category shows error
  - Empty duration shows error
  - All errors display inline

- [ ] **Successful Creation**
  - Form submits with valid data
  - Success toast appears
  - New course appears in list
  - Modal closes automatically

- [ ] **Error Handling**
  - Network error shows toast
  - Server error shows toast
  - Form remains open on error

#### View Courses

- [ ] **Course List**
  - All courses display in table
  - Columns show correct data
  - Status badges color-coded correctly
  - Dates format properly

- [ ] **Search Functionality**
  - Search by course title works
  - Search by instructor name works
  - Search by category works
  - Empty search shows all courses
  - No results shows empty state

- [ ] **Filter by Status**
  - Filter shows only Active courses
  - Filter shows only Inactive courses
  - "All Statuses" shows everything

- [ ] **Empty State**
  - Shows when no courses exist
  - "Create Course" button works
  - Helpful message displays

#### View Course Details

- [ ] **Course Information**
  - Title displays correctly
  - All details show properly
  - Created/Updated dates format correctly
  - Status badge color is correct

- [ ] **Enrollment Statistics**
  - Total enrolled count is accurate
  - Completed count is accurate
  - In Progress count is accurate

- [ ] **Navigation**
  - Back button returns to course list
  - Edit button opens edit modal

#### Edit Course

- [ ] **Form Pre-population**
  - All fields pre-fill with current data
  - Status dropdown shows current status

- [ ] **Validation**
  - Same validation as create
  - Errors display inline

- [ ] **Successful Update**
  - Changes save correctly
  - Success toast appears
  - Details page updates
  - Modal closes

#### Delete Course

- [ ] **Confirmation Modal**
  - Modal appears on delete click
  - Course title shows in message
  - Warning message is clear

- [ ] **Successful Deletion**
  - Course removes from database
  - Success toast appears
  - Course list updates
  - Associated enrollments deleted

- [ ] **Cancellation**
  - Cancel button closes modal
  - Course is not deleted

### Student Management Testing

#### Add Student

- [ ] **Form Validation**
  - Empty name shows error
  - Empty email shows error
  - Invalid email format shows error
  - Errors display inline

- [ ] **Successful Creation**
  - Student saves to database
  - Success toast appears
  - Student appears in list
  - Modal closes

- [ ] **Duplicate Email Prevention**
  - Same email in same store shows error
  - Error message is user-friendly

#### View Students

- [ ] **Student List**
  - All students display
  - Email shows correctly
  - Enrollment counts display
  - Created date formats properly

- [ ] **Search Functionality**
  - Search by name works
  - Search by email works
  - Empty search shows all

- [ ] **Enrollment Statistics**
  - Total enrollments badge correct
  - Completed badge correct
  - In Progress badge correct
  - Badge colors appropriate

- [ ] **Empty State**
  - Shows when no students
  - Add button works

#### Student Dashboard

- [ ] **Student Information**
  - Name displays as title
  - Email displays as subtitle

- [ ] **Statistics Cards**
  - Total enrollments accurate
  - Completed count accurate
  - In Progress count accurate

- [ ] **Enrolled Courses Table**
  - All enrollments display
  - Course details show
  - Dates format correctly
  - Status badges correct

- [ ] **Empty State**
  - Shows when no enrollments
  - Message is helpful

- [ ] **Navigation**
  - Back button returns to students list

### Enrollment Management Testing

#### Create Enrollment

- [ ] **Form Validation**
  - No student selected shows error
  - No course selected shows error
  - Errors display clearly

- [ ] **Dropdown Population**
  - All students appear in dropdown
  - All active courses appear
  - Dropdowns show helpful labels

- [ ] **Successful Enrollment**
  - Enrollment saves to database
  - Success toast appears
  - Enrollment appears in list
  - Modal closes

- [ ] **Duplicate Prevention - Frontend**
  - Cannot submit duplicate enrollment
  - Error message displays

- [ ] **Duplicate Prevention - Backend**
  - Backend rejects duplicate
  - User-friendly error shows
  - Modal remains open

- [ ] **Duplicate Prevention - Database**
  - MongoDB compound index enforces uniqueness
  - Error code 11000 handled gracefully

#### View Enrollments

- [ ] **Enrollment List**
  - All enrollments display
  - Student info shows
  - Course info shows
  - Dates format properly
  - Status badges correct

- [ ] **Filter by Status**
  - "In Progress" filter works
  - "Completed" filter works
  - "All Statuses" shows everything

- [ ] **Empty State**
  - Shows when no enrollments
  - Enroll button works

#### Update Enrollment Status

- [ ] **Mark Complete**
  - Status changes to Completed
  - Button changes to "Mark In Progress"
  - Success toast appears
  - Badge updates to green

- [ ] **Mark In Progress**
  - Status changes to In Progress
  - Button changes to "Mark Complete"
  - Success toast appears
  - Badge updates to yellow

- [ ] **Error Handling**
  - Network error shows toast
  - Enrollment list doesn't break

## API Testing

### Using Curl

```bash
# Set variables
SHOP="development-store.myshopify.com"
API="http://localhost:5000/api"

# Get courses
curl "$API/courses?shop=$SHOP"

# Create course
curl -X POST "$API/courses?shop=$SHOP" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "API Test Course",
    "description": "Testing API",
    "instructorName": "Test Instructor",
    "category": "Testing",
    "duration": "2 weeks",
    "status": "Active"
  }'

# Get students
curl "$API/students?shop=$SHOP"

# Create student
curl -X POST "$API/students?shop=$SHOP" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Test Student",
    "email": "apitest@example.com"
  }'

# Get enrollments
curl "$API/enrollments?shop=$SHOP"

# Get dashboard
curl "$API/dashboard?shop=$SHOP"

# Get shop info
curl "$API/shop?shop=$SHOP"
```

### Expected Response Codes

| Endpoint | Method | Success | Error |
|----------|--------|---------|-------|
| /api/courses | GET | 200 | 401, 500 |
| /api/courses | POST | 201 | 400, 401, 500 |
| /api/courses/:id | GET | 200 | 401, 404, 500 |
| /api/courses/:id | PUT | 200 | 400, 401, 404, 500 |
| /api/courses/:id | DELETE | 200 | 401, 404, 500 |
| /api/students | GET | 200 | 401, 500 |
| /api/students | POST | 201 | 400, 401, 500 |
| /api/enrollments | POST | 201 | 400, 401, 500 |
| /api/enrollments/:id | PATCH | 200 | 400, 401, 404, 500 |

## Database Testing

### Verify Indexes

```javascript
// In MongoDB shell or Compass
use shopify-lms

// Check Enrollment indexes
db.enrollments.getIndexes()

// Should see compound unique index:
// { store: 1, student: 1, course: 1 }

// Check Student indexes
db.students.getIndexes()

// Should see:
// { store: 1, email: 1 }
```

### Test Duplicate Prevention

```javascript
// Try to insert duplicate enrollment
db.enrollments.insertOne({
  store: ObjectId("..."),
  student: ObjectId("..."),
  course: ObjectId("..."),
  status: "In Progress"
});

// Second insert should fail with E11000 error
```

## Performance Testing

### Load Testing Endpoints

```bash
# Install Apache Bench
apt-get install apache2-utils  # Linux
brew install ab                # Mac

# Test dashboard endpoint
ab -n 100 -c 10 "http://localhost:5000/api/dashboard?shop=development-store.myshopify.com"

# Test courses list
ab -n 100 -c 10 "http://localhost:5000/api/courses?shop=development-store.myshopify.com"
```

### Expected Performance

- Dashboard load: < 200ms
- Course list: < 150ms
- Course details: < 100ms
- Create operations: < 200ms

## Error Scenario Testing

### Network Errors

- [ ] Frontend shows error when backend is down
- [ ] Retry mechanism works (if implemented)
- [ ] Error messages are user-friendly

### Invalid Data

- [ ] Invalid ObjectId returns 400
- [ ] Missing required fields return 400
- [ ] Invalid status values return 400

### Authentication Errors

- [ ] Missing shop parameter returns 401
- [ ] Invalid shop returns 401
- [ ] Cross-store access blocked

### Database Errors

- [ ] MongoDB connection error handled
- [ ] Duplicate key errors handled
- [ ] Validation errors handled

## Browser Compatibility

Test in:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers (iOS Safari, Chrome)

## Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Screen reader compatible (basic test)
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators visible
- [ ] Form labels associated

## Security Testing

### Authentication

- [ ] Cannot access API without shop parameter
- [ ] Cannot access other store's data
- [ ] Store ID from session, not request body

### Validation

- [ ] SQL injection not possible (MongoDB)
- [ ] XSS not possible (React escapes)
- [ ] CSRF not applicable (stateless API)

### Data Exposure

- [ ] Access tokens not exposed to frontend
- [ ] Error messages don't leak system info
- [ ] Stack traces not in production

## Regression Testing

After making changes, verify:
- [ ] Existing features still work
- [ ] No console errors
- [ ] Database queries still efficient
- [ ] No UI regressions

## Test Data Scenarios

### Create These Scenarios

1. **Empty State**: No data in database
2. **Single Items**: One course, one student
3. **Many Items**: 50+ courses, 100+ students
4. **Completed Course**: All enrollments completed
5. **Mixed Status**: Various enrollment statuses
6. **Long Text**: Very long course descriptions
7. **Special Characters**: Names with accents, symbols

## Automated Testing (Future)

### Unit Tests (Jest)

```javascript
// Example: Validation function test
describe('validateEmail', () => {
  it('should validate correct email', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });
  
  it('should reject invalid email', () => {
    expect(validateEmail('invalid')).toBe(false);
  });
});
```

### Integration Tests (Supertest)

```javascript
// Example: API endpoint test
describe('GET /api/courses', () => {
  it('should return courses for authenticated store', async () => {
    const res = await request(app)
      .get('/api/courses')
      .query({ shop: 'test-store.myshopify.com' });
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
```

### E2E Tests (Playwright/Cypress)

```javascript
// Example: User flow test
test('should create course', async ({ page }) => {
  await page.goto('http://localhost:5173/courses');
  await page.click('text=Create Course');
  await page.fill('[name="title"]', 'Test Course');
  // ... fill other fields
  await page.click('text=Create');
  await expect(page.locator('text=Test Course')).toBeVisible();
});
```

## Test Coverage Goals

- [ ] Unit tests: 80%+ coverage
- [ ] Integration tests: All API endpoints
- [ ] E2E tests: Critical user flows
- [ ] Manual tests: All features quarterly

## Bug Tracking

When you find a bug:
1. Note reproduction steps
2. Check browser console
3. Check server logs
4. Note expected vs actual behavior
5. Create detailed bug report

## Conclusion

Regular testing ensures:
- Features work as expected
- No regressions introduced
- Good user experience maintained
- Security vulnerabilities caught
- Performance remains acceptable
