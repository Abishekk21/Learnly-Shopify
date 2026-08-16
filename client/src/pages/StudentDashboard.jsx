import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  faArrowLeft,
  faUserGraduate
} from '@fortawesome/free-solid-svg-icons';
import { getStudentDashboard } from '../services/api';
import { formatDate } from '../utils/formatting';

function StudentDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentDashboard();
  }, [id]);

  const loadStudentDashboard = async () => {
    try {
      setLoading(true);
      const response = await getStudentDashboard(id);
      setData(response.data);
    } catch (error) {
      console.error('Error loading student dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <LoadingSpinner message="Loading student dashboard..." />
      </div>
    );
  }

  if (!data || !data.student) {
    return (
      <div className="page">
        <div className="page__header">
          <h1 className="page__title">Student Not Found</h1>
        </div>
        <div className="card">
          <div className="card__body">
            <p style={{ color: 'var(--error)' }}>
              Student not found or you don't have permission to view this data.
            </p>
            <button className="btn btn--secondary" onClick={() => navigate('/students')}>
              Back to Students
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { student, stats, enrollments } = data;

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <button 
            className="btn btn--secondary btn--sm" 
            onClick={() => navigate('/students')}
            style={{ marginBottom: '12px' }}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Back to Students</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'var(--brand-primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand-primary)'
            }}>
              <FontAwesomeIcon icon={faUserGraduate} size="lg" />
            </div>
            <div>
              <h1 className="page__title" style={{ marginBottom: '4px' }}>{student.name}</h1>
              <p className="page__subtitle">{student.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <div className="card">
          <div className="card__body">
            <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--brand-primary)' }}>
              {stats.totalEnrollments || 0}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--neutral-600)', marginTop: '4px' }}>
              Total Enrollments
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card__body">
            <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--success)' }}>
              {stats.completed || 0}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--neutral-600)', marginTop: '4px' }}>
              Completed
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card__body">
            <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--warning)' }}>
              {stats.inProgress || 0}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--neutral-600)', marginTop: '4px' }}>
              In Progress
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Enrolled Courses</h2>
        </div>
        <div className="card__body">
          {enrollments && enrollments.length > 0 ? (
            <p style={{ color: 'var(--neutral-600)' }}>
              {enrollments.length} courses enrolled
            </p>
          ) : (
            <p style={{ color: 'var(--neutral-600)' }}>
              This student is not enrolled in any courses yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
