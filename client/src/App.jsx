import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider, Frame } from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';
import './styles/App.css';

// Components
import Sidebar from './components/Sidebar';

// Pages
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetails from './pages/CourseDetails';
import Students from './pages/Students';
import StudentDashboard from './pages/StudentDashboard';
import Enrollments from './pages/Enrollments';

function App() {
  return (
    <AppProvider
      i18n={{
        Polaris: {
          ResourceList: {
            sortingLabel: 'Sort by',
            defaultItemSingular: 'item',
            defaultItemPlural: 'items',
            showing: 'Showing {itemsCount} {resource}',
            Item: {
              viewItem: 'View details for {itemName}',
            },
          },
          Common: {
            checkbox: 'checkbox',
          },
        },
      }}
    >
      <Router>
        <Frame>
          <div className="app">
            <Sidebar />
            <main className="app__main">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/courses/:id" element={<CourseDetails />} />
                <Route path="/students" element={<Students />} />
                <Route path="/students/:id" element={<StudentDashboard />} />
                <Route path="/enrollments" element={<Enrollments />} />
              </Routes>
            </main>
          </div>
        </Frame>
      </Router>
    </AppProvider>
  );
}

export default App;
