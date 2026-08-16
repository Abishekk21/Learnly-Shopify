import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  faArrowLeft,
  faEdit
} from '@fortawesome/free-solid-svg-icons';
import { getCourse, updateCourse } from '../services/api';
import { formatDate } from '../utils/formatting';

function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const response = await getCourse(id);
      setCourse(response.data);
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <LoadingSpinner message="Loading course details..." />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="page">
        <div className="page__header">
          <h1 className="page__title">Course Not Found</h1>
        </div>
        <div className="card">
          <div className="card__body">
            <p style={{ color: 'var(--error)' }}>
              Course not found or you don't have permission to view it.
            </p>
            <button className="btn btn--secondary" onClick={() => navigate('/courses')}>
              Back to Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <button 
            className="btn btn--secondary btn--sm" 
            onClick={() => navigate('/courses')}
            style={{ marginBottom: '12px' }}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Back to Courses</span>
          </button>
          <h1 className="page__title">{course.title}</h1>
          <p className="page__subtitle">{course.category}</p>
        </div>
        <button className="btn btn--primary">
          <FontAwesomeIcon icon={faEdit} />
          <span>Edit Course</span>
        </button>
      </div>

      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Course Information</h2>
        </div>
        <div className="card__body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--neutral-600)', marginBottom: '4px' }}>
                Instructor
              </div>
              <div style={{ fontSize: '15px', fontWeight: '600' }}>
                {course.instructorName}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--neutral-600)', marginBottom: '4px' }}>
                Duration
              </div>
              <div style={{ fontSize: '15px', fontWeight: '600' }}>
                {course.duration}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--neutral-600)', marginBottom: '4px' }}>
                Status
              </div>
              <div style={{ fontSize: '15px', fontWeight: '600' }}>
                {course.status}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--neutral-600)', marginBottom: '4px' }}>
                Created
              </div>
              <div style={{ fontSize: '15px', fontWeight: '600' }}>
                {formatDate(course.createdAt)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Description</h2>
        </div>
        <div className="card__body">
          <p style={{ color: 'var(--neutral-700)', lineHeight: '1.6' }}>
            {course.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default CourseDetails;
