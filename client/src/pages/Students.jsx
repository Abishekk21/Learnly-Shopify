import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  faPlus,
  faSearch,
  faEye,
  faUserGraduate,
  faEllipsisV,
  faTimes,
  faTrash,
  faUsers,
  faCheckCircle,
  faTimesCircle,
  faClipboardList
} from '@fortawesome/free-solid-svg-icons';
import { getStudents, createStudent, deleteStudent, getEnrollments } from '../services/api';
import { validateStudentForm } from '../utils/validation';
import { formatDate } from '../utils/formatting';

// Counter animation hook
function useCountUp(end, duration = 2000) {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
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
      <div className="kpi-card__static-circle"></div>
      <div className="kpi-card__bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
      <div className="kpi-card__header">
        <div className="kpi-card__icon">
          <FontAwesomeIcon icon={icon} />
        </div>
        <div className="kpi-card__label">{label}</div>
      </div>
      <div className="kpi-card__value">{animatedValue}</div>
    </div>
  );
}

function Students() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);
  const [modalType, setModalType] = useState(null); // 'create', 'delete'
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: ''
  });
  const [enrollmentCounts, setEnrollmentCounts] = useState({});
  const menuRef = useRef(null);

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    // Prevent body scroll when modal is open
    if (modalType) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [modalType]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const [studentsRes, enrollmentsRes] = await Promise.all([
        getStudents(),
        getEnrollments()
      ]);
      
      setStudents(studentsRes.data);
      
      // Count enrollments per student
      const counts = {};
      enrollmentsRes.data.forEach(enrollment => {
        const studentId = enrollment.student?._id || enrollment.student;
        counts[studentId] = (counts[studentId] || 0) + 1;
      });
      setEnrollmentCounts(counts);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuToggle = (studentId) => {
    setActiveMenu(activeMenu === studentId ? null : studentId);
  };

  const handleView = (student) => {
    navigate(`/students/${student._id}/dashboard`);
  };

  const handleDelete = (student) => {
    setSelectedStudent(student);
    setModalType('delete');
    setActiveMenu(null);
  };

  const handleCreateStudent = () => {
    setModalType('create');
  };

  const handleSaveNewStudent = async () => {
    try {
      await createStudent(createForm);
      await loadStudents();
      
      // Show success animation
      setShowSuccess(true);
      
      // Close modal after animation
      setTimeout(() => {
        setShowSuccess(false);
        closeModal();
      }, 2000);
    } catch (error) {
      console.error('Error creating student:', error);
      alert('Failed to create student. Email may already exist.');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteStudent(selectedStudent._id);
      await loadStudents();
      closeModal();
    } catch (error) {
      console.error('Error deleting student:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete student';
      alert(errorMessage);
    }
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedStudent(null);
    setShowSuccess(false);
    setCreateForm({
      name: '',
      email: ''
    });
  };

  if (loading) {
    return (
      <div className="page">
        <LoadingSpinner message="Loading students..." />
      </div>
    );
  }

  const activeStudents = students.filter(s => (enrollmentCounts[s._id] || 0) > 0).length;
  const inactiveStudents = students.filter(s => (enrollmentCounts[s._id] || 0) === 0).length;
  const totalEnrollments = Object.values(enrollmentCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="page" style={{ position: 'relative' }}>
      <div className={`page-content ${modalType ? 'page-content--blurred' : ''}`}>
        <div className="page__header">
          <div>
            <h1 className="page__title">Students</h1>
            <p className="page__subtitle">Manage student enrollments and progress</p>
          </div>
          <button className="btn btn--primary" onClick={handleCreateStudent}>
            <FontAwesomeIcon icon={faPlus} />
            <span>Add Student</span>
          </button>
        </div>

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
          <KPICard
            icon={faUsers}
            value={students.length}
            label="Total Students"
          />
          <KPICard
            icon={faCheckCircle}
            value={activeStudents}
            label="Active Students"
          />
          <KPICard
            icon={faTimesCircle}
            value={inactiveStudents}
            label="Inactive Students"
          />
          <KPICard
            icon={faClipboardList}
            value={totalEnrollments}
            label="Total Enrollments"
          />
        </div>

        <div className="card">
          <div className="card__header">
            <h2 className="card__title">All Students ({students.length})</h2>
          </div>
          <div className="card__body" style={{ padding: 0 }}>
            {students.length > 0 ? (
              <div className="table-responsive">
                <table className="table table--centered">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Enrollment Count</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student._id}>
                        <td>
                          <div className="table-cell-with-icon">
                            <div className="avatar">
                              <FontAwesomeIcon icon={faUserGraduate} />
                            </div>
                            <span className="text-bold">{student.name}</span>
                          </div>
                        </td>
                        <td className="text-muted">{student.email || 'N/A'}</td>
                        <td>
                          <span className="text-bold">{enrollmentCounts[student._id] || 0}</span>
                        </td>
                        <td className="text-muted">{formatDate(student.createdAt)}</td>
                        <td>
                          <div style={{ position: 'relative', display: 'inline-block' }}>
                            <button 
                              className="btn btn--secondary btn--sm"
                              onClick={() => handleMenuToggle(student._id)}
                              style={{ padding: '8px 12px' }}
                            >
                              <FontAwesomeIcon icon={faEllipsisV} />
                            </button>
                            {activeMenu === student._id && (
                              <div ref={menuRef} className="dropdown-menu">
                                <button 
                                  className="dropdown-menu__item"
                                  onClick={() => handleView(student)}
                                >
                                  <FontAwesomeIcon icon={faEye} />
                                  <span>View Dashboard</span>
                                </button>
                                <button 
                                  className="dropdown-menu__item dropdown-menu__item--danger"
                                  onClick={() => handleDelete(student)}
                                >
                                  <FontAwesomeIcon icon={faTrash} />
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                heading="No students yet"
                action={{
                  content: 'Add Student',
                  onAction: handleCreateStudent
                }}
              >
                Start by adding your first student
              </EmptyState>
            )}
          </div>
        </div>
      </div>

      {/* Create Student Modal */}
      {modalType === 'create' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            {showSuccess ? (
              <div className="success-animation">
                <div className="success-checkmark">
                  <div className="check-icon">
                    <span className="icon-line line-tip"></span>
                    <span className="icon-line line-long"></span>
                    <div className="icon-circle"></div>
                    <div className="icon-fix"></div>
                  </div>
                </div>
                <h3 className="success-title">Student Added!</h3>
                <p className="success-message">The student has been added successfully.</p>
              </div>
            ) : (
              <>
                <div className="modal-card__header modal-card__header--gradient">
                  <h3 className="modal-card__title">Add New Student</h3>
                  <button className="modal-card__close modal-card__close--light" onClick={closeModal}>
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
                <div className="modal-card__body">
                  <div className="modal-field">
                    <label className="modal-field__label">Name</label>
                    <input 
                      type="text"
                      className="modal-field__input"
                      value={createForm.name}
                      onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                      placeholder="Enter student name"
                    />
                  </div>
                  <div className="modal-field">
                    <label className="modal-field__label">Email</label>
                    <input 
                      type="email"
                      className="modal-field__input"
                      value={createForm.email}
                      onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                      placeholder="Enter student email"
                    />
                  </div>
                </div>
                <div className="modal-card__footer">
                  <button className="btn btn--secondary" onClick={closeModal}>Cancel</button>
                  <button className="btn btn--primary" onClick={handleSaveNewStudent}>
                    <FontAwesomeIcon icon={faPlus} style={{ marginRight: '8px' }} />
                    Add Student
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modalType === 'delete' && selectedStudent && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card modal-card--small modal-card--delete" onClick={(e) => e.stopPropagation()}>
            <div className="modal-card__header modal-card__header--gradient">
              <h3 className="modal-card__title">Delete Student</h3>
              <button className="modal-card__close modal-card__close--light" onClick={closeModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="modal-card__body">
              <p style={{ marginBottom: '16px', color: 'var(--neutral-700)', fontSize: '15px', lineHeight: '1.6' }}>
                Are you sure you want to delete <strong>{selectedStudent.name}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="modal-card__footer">
              <button className="btn btn--secondary" onClick={closeModal}>Cancel</button>
              <button 
                className="btn btn--primary" 
                onClick={handleConfirmDelete}
                style={{ background: 'var(--error)' }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Students;
