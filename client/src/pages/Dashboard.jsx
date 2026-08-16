import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  faBookOpen,
  faUserGraduate,
  faClipboardList,
  faCheckCircle,
  faClock,
  faStore,
  faChartLine,
  faTrophy
} from '@fortawesome/free-solid-svg-icons';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { getDashboard, getShopInfo } from '../services/api';
import { formatDate } from '../utils/formatting';

// Counter animation hook
function useCountUp(end, duration = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return count;
}

function KPICard({ icon, value, label }) {
  const animatedValue = useCountUp(value);

  return (
    <div className="kpi-card">
      {/* Static circular shape top right */}
      <div className="kpi-card__static-circle"></div>
      
      {/* Animated circular shapes */}
      <div className="kpi-card__bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
      
      {/* Icon and label at top left */}
      <div className="kpi-card__header">
        <div className="kpi-card__icon">
          <FontAwesomeIcon icon={icon} />
        </div>
        <div className="kpi-card__label">{label}</div>
      </div>
      
      {/* Large number at bottom right */}
      <div className="kpi-card__value">{animatedValue}</div>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [shopInfo, setShopInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashboardRes, shopRes] = await Promise.all([
        getDashboard(),
        getShopInfo()
      ]);

      setDashboardData(dashboardRes.data);
      setShopInfo(shopRes.data);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <LoadingSpinner message="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="page__header">
          <h1 className="page__title">Dashboard</h1>
        </div>
        <div className="card">
          <div className="card__body">
            <p style={{ color: 'var(--error)' }}>{error}</p>
            <button className="btn btn--primary" onClick={loadDashboard} style={{ marginTop: '16px' }}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};
  const recentEnrollments = dashboardData?.recentEnrollments || [];

  // Prepare data for pie chart
  const chartData = [
    { name: 'Active Courses', value: stats.activeCourses || 0, color: '#9147FF' },
    { name: 'Inactive Courses', value: stats.inactiveCourses || 0, color: '#A3A3A3' },
    { name: 'Completed', value: stats.completedEnrollments || 0, color: '#10B981' },
    { name: 'In Progress', value: stats.inProgressEnrollments || 0, color: '#F59E0B' }
  ];

  const COLORS = ['#9147FF', '#A3A3A3', '#10B981', '#F59E0B'];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'white',
          padding: '12px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          border: '1px solid var(--neutral-200)'
        }}>
          <p style={{ 
            fontWeight: '600', 
            color: 'var(--neutral-900)', 
            marginBottom: '4px',
            fontSize: '14px'
          }}>
            {payload[0].name}
          </p>
          <p style={{ 
            fontWeight: '700', 
            color: payload[0].payload.color,
            fontSize: '18px'
          }}>
            {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLegend = (props) => {
    const { payload } = props;
    return (
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginTop: '20px',
        padding: '0 60px'
      }}>
        {payload.map((entry, index) => (
          <div key={`legend-${index}`} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '3px',
              background: entry.color,
              flexShrink: 0
            }} />
            <span style={{
              fontSize: '13px',
              color: 'var(--neutral-700)',
              fontWeight: '500',
              flex: 1
            }}>
              {entry.value}
            </span>
            <span style={{
              fontSize: '13px',
              color: 'var(--neutral-500)',
              fontWeight: '600'
            }}>
              {entry.payload.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">Dashboard</h1>
          <p className="page__subtitle">Welcome to Learnly - Your Learning Management System</p>
        </div>
        {shopInfo && (
          <div className="store-badge">
            <FontAwesomeIcon icon={faStore} />
            <span>{shopInfo.domain}</span>
          </div>
        )}
      </div>

      {/* Main Dashboard Layout - 60/40 Split */}
      <div className="dashboard-main-grid">
        {/* Left Side - 60% - KPI Cards 2x2 */}
        <div className="dashboard-left">
          <div className="kpi-grid-2x2">
            <KPICard
              icon={faBookOpen}
              value={stats.totalCourses || 0}
              label="Total Courses"
            />
            <KPICard
              icon={faUserGraduate}
              value={stats.totalStudents || 0}
              label="Total Students"
            />
            <KPICard
              icon={faClipboardList}
              value={stats.totalEnrollments || 0}
              label="Total Enrollments"
            />
            <KPICard
              icon={faClock}
              value={stats.inProgressEnrollments || 0}
              label="In Progress"
            />
          </div>
        </div>

        {/* Right Side - 50% - Course Activity with Pie Chart */}
        <div className="dashboard-right">
          <div className="card" style={{ height: '100%' }}>
            <div className="card__header card__header--light-violet">
              <h3 className="card__title">
                <FontAwesomeIcon icon={faChartLine} style={{ marginRight: '8px', color: 'black' }} />
                Course Activity
              </h3>
            </div>
            <div className="card__body">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={100}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend content={renderLegend} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Enrollments Table */}
      <div className="card">
        <div className="card__header card__header--dark">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 className="card__title">Recent Enrollments</h2>
            <button 
              className="btn btn--secondary btn--sm"
              onClick={() => navigate('/enrollments')}
            >
              View All
            </button>
          </div>
        </div>
        <div className="card__body" style={{ padding: 0 }}>
          {recentEnrollments.length > 0 ? (
            <div className="table-responsive">
              <table className="table table--centered">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Enrollment Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEnrollments.slice(0, 5).map((enrollment) => (
                    <tr key={enrollment._id}>
                      <td>
                        <div className="table-cell-with-icon">
                          <div className="avatar">
                            <FontAwesomeIcon icon={faUserGraduate} />
                          </div>
                          <span className="text-bold">{enrollment.student?.name || 'N/A'}</span>
                        </div>
                      </td>
                      <td>{enrollment.course?.title || 'N/A'}</td>
                      <td className="text-muted">{formatDate(enrollment.enrollmentDate)}</td>
                      <td>
                        <StatusBadge status={enrollment.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              heading="No enrollments yet"
              action={{
                content: 'Enroll Student',
                onAction: () => navigate('/enrollments')
              }}
            >
              Start by enrolling students in courses
            </EmptyState>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
