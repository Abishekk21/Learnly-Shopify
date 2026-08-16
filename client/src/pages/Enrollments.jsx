import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  faPlus,
  faFilter,
  faCheckCircle,
  faClock,
  faEllipsisV,
  faEdit,
  faTrash,
  faTimes,
  faUserGraduate,
  faBookOpen,
  faClipboardList,
  faChartLine,
  faPercentage
} from '@fortawesome/free-solid-svg-icons';
import {
  getEnrollments,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
  getStudents,
  getCourses
} from '../services/api';
import { validateEnrollmentForm } from '../utils/validation';
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

function KPICard({ icon, value, label, suffix = '' }) {
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
      <div className="kpi-card__value">{animatedValue}{suffix}</div>
    </div>
  );
}

function Enrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);
  const [modalType, setModalType] = useState(null); // 'create', 'edit', 'delete'
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createForm, setCreateForm] = useState({
    student: '',
    course: '',
    status: 'In Progress'
  });
  const [editForm, setEditForm] = useState({
    status: 'In Progress'
  });
  const [openDropdown, setOpenDropdown] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    loadData();
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
      // Close custom dropdowns when clicking outside
      if (!event.target.closest('.custom-select')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [enrollmentsRes, studentsRes, coursesRes] = await Promise.all([
        getEnrollments(),
        getStudents(),
        getCourses()
      ]);
      setEnrollments(enrollmentsRes.data);
      setStudents(studentsRes.data);
      setCourses(coursesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuToggle = (enrollmentId) => {
    setActiveMenu(activeMenu === enrollmentId ? null : enrollmentId);
  };

  const handleEdit = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setEditForm({
      status: enrollment.status
    });
    setModalType('edit');
    setActiveMenu(null);
  };

  const handleDelete = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setModalType('delete');
    setActiveMenu(null);
  };

  const handleCreateEnrollment = () => {
    setModalType('create');
  };

  const handleSaveNewEnrollment = async () => {
    try {
      // Map form fields to API expected field names
      const enrollmentData = {
        studentId: createForm.student,
        courseId: createForm.course,
        status: createForm.status
      };
      
      await createEnrollment(enrollmentData);
      await loadData();
      
      // Show success animation
      setShowSuccess(true);
      
      // Close modal after animation
      setTimeout(() => {
        setShowSuccess(false);
        closeModal();
      }, 2000);
    } catch (error) {
      console.error('Error creating enrollment:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create enrollment';
      alert(errorMessage);
    }
  };

  const handleSaveEdit = async () => {
    try {
      await updateEnrollment(selectedEnrollment._id, editForm);
      await loadData();
      
      // Show success animation
      setShowSuccess(true);
      
      // Close modal after animation
      setTimeout(() => {
        setShowSuccess(false);
        closeModal();
      }, 2000);
    } catch (error) {
      console.error('Error updating enrollment:', error);
      alert('Failed to update enrollment');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteEnrollment(selectedEnrollment._id);
      await loadData();
      closeModal();
    } catch (error) {
      console.error('Error deleting enrollment:', error);
      alert('Failed to delete enrollment');
    }
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedEnrollment(null);
    setShowSuccess(false);
    setCreateForm({
      student: '',
      course: '',
      status: 'In Progress'
    });
    setEditForm({
      status: 'In Progress'
    });
  };

  if (loading) {
    return (
      <div className="page">
        <LoadingSpinner message="Loading enrollments..." />
      </div>
    );
  }

  const inProgressCount = enrollments.filter(e => e.status === 'In Progress').length;
  const completedCount = enrollments.filter(e => e.status === 'Completed').length;
  const completionRate = enrollments.length > 0 ? Math.round((completedCount / enrollments.length) * 100) : 0;

  return (
    <div className="page" style={{ position: 'relative' }}>
      <div className={`page-content ${modalType ? 'page-content--blurred' : ''}`}>
        <div className="page__header">
          <div>
            <h1 className="page__title">Enrollments</h1>
            <p className="page__subtitle">Track student progress and course enrollments</p>
          </div>
          <button className="btn btn--primary" onClick={handleCreateEnrollment}>
            <FontAwesomeIcon icon={faPlus} />
            <span>Enroll Student</span>
          </button>
        </div>

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
          <KPICard
            icon={faClipboardList}
            value={enrollments.length}
            label="Total Enrollments"
          />
          <KPICard
            icon={faClock}
            value={inProgressCount}
            label="In Progress"
          />
          <KPICard
            icon={faCheckCircle}
            value={completedCount}
            label="Completed"
          />
          <KPICard
            icon={faChartLine}
            value={completionRate}
            label="Completion Rate"
            suffix="%"
          />
        </div>

        <div className="card">
          <div className="card__header">
            <h2 className="card__title">All Enrollments ({enrollments.length})</h2>
          </div>
          <div className="card__body" style={{ padding: 0 }}>
            {enrollments.length > 0 ? (
              <div className="table-responsive">
                <table className="table table--centered">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Course</th>
                      <th>Enrollment Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments.map((enrollment) => (
                      <tr key={enrollment._id}>
                        <td>
                          <div className="table-cell-with-icon">
                            <div className="avatar">
                              <FontAwesomeIcon icon={faUserGraduate} />
                            </div>
                            <span className="text-bold">
                              {enrollment.student?.name || 'Unknown Student'}
                            </span>
                          </div>
                        </td>
                        <td className="text-muted">
                          {enrollment.course?.title || 'Unknown Course'}
                        </td>
                        <td className="text-muted">{formatDate(enrollment.enrollmentDate)}</td>
                        <td>
                          <StatusBadge status={enrollment.status} />
                        </td>
                        <td>
                          <div style={{ position: 'relative', display: 'inline-block' }}>
                            <button 
                              className="btn btn--secondary btn--sm"
                              onClick={() => handleMenuToggle(enrollment._id)}
                              style={{ padding: '8px 12px' }}
                            >
                              <FontAwesomeIcon icon={faEllipsisV} />
                            </button>
                            {activeMenu === enrollment._id && (
                              <div ref={menuRef} className="dropdown-menu">
                                <button 
                                  className="dropdown-menu__item"
                                  onClick={() => handleEdit(enrollment)}
                                >
                                  <FontAwesomeIcon icon={faEdit} />
                                  <span>Edit Status</span>
                                </button>
                                <button 
                                  className="dropdown-menu__item dropdown-menu__item--danger"
                                  onClick={() => handleDelete(enrollment)}
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
                heading="No enrollments yet"
                action={{
                  content: 'Enroll Student',
                  onAction: handleCreateEnrollment
                }}
              >
                Start by enrolling a student in a course
              </EmptyState>
            )}
          </div>
        </div>
      </div>

      {/* Create Enrollment Modal */}
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
                <h3 className="success-title">Student Enrolled!</h3>
                <p className="success-message">The enrollment has been created successfully.</p>
              </div>
            ) : (
              <>
                <div className="modal-card__header modal-card__header--gradient">
                  <h3 className="modal-card__title">Enroll Student</h3>
                  <button className="modal-card__close modal-card__close--light" onClick={closeModal}>
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
                <div className="modal-card__body">
                  <div className="modal-field">
                    <label className="modal-field__label modal-field__label--required">Student</label>
                    <div className="custom-select">
                      <div 
                        className="custom-select__trigger"
                        onClick={() => setOpenDropdown(openDropdown === 'student' ? null : 'student')}
                      >
                        <span className="custom-select__value">
                          {createForm.student 
                            ? students.find(s => s._id === createForm.student)?.name + ' (' + students.find(s => s._id === createForm.student)?.email + ')'
                            : 'Select a student'
                          }
                        </span>
                        <FontAwesomeIcon icon={faFilter} className="custom-select__arrow" style={{ transform: openDropdown === 'student' ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                      </div>
                      {openDropdown === 'student' && (
                        <div className="custom-select__options">
                          <div 
                            className="custom-select__option"
                            onClick={() => {
                              setCreateForm({...createForm, student: ''});
                              setOpenDropdown(null);
                            }}
                          >
                            Select a student
                          </div>
                          {students.map(student => (
                            <div 
                              key={student._id}
                              className={`custom-select__option ${createForm.student === student._id ? 'custom-select__option--selected' : ''}`}
                              onClick={() => {
                                setCreateForm({...createForm, student: student._id});
                                setOpenDropdown(null);
                              }}
                            >
                              {student.name} ({student.email})
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="modal-field">
                    <label className="modal-field__label modal-field__label--required">Course</label>
                    <div className="custom-select">
                      <div 
                        className="custom-select__trigger"
                        onClick={() => setOpenDropdown(openDropdown === 'course' ? null : 'course')}
                      >
                        <span className="custom-select__value">
                          {createForm.course 
                            ? courses.find(c => c._id === createForm.course)?.title
                            : 'Select a course'
                          }
                        </span>
                        <FontAwesomeIcon icon={faFilter} className="custom-select__arrow" style={{ transform: openDropdown === 'course' ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                      </div>
                      {openDropdown === 'course' && (
                        <div className="custom-select__options">
                          <div 
                            className="custom-select__option"
                            onClick={() => {
                              setCreateForm({...createForm, course: ''});
                              setOpenDropdown(null);
                            }}
                          >
                            Select a course
                          </div>
                          {courses.map(course => (
                            <div 
                              key={course._id}
                              className={`custom-select__option ${createForm.course === course._id ? 'custom-select__option--selected' : ''}`}
                              onClick={() => {
                                setCreateForm({...createForm, course: course._id});
                                setOpenDropdown(null);
                              }}
                            >
                              {course.title}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="modal-field">
                    <label className="modal-field__label">Status</label>
                    <select 
                      className="modal-field__input"
                      value={createForm.status}
                      onChange={(e) => setCreateForm({...createForm, status: e.target.value})}
                    >
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
                <div className="modal-card__footer">
                  <button className="btn btn--secondary" onClick={closeModal}>Cancel</button>
                  <button className="btn btn--primary" onClick={handleSaveNewEnrollment}>
                    <FontAwesomeIcon icon={faPlus} style={{ marginRight: '8px' }} />
                    Enroll Student
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Edit Enrollment Modal */}
      {modalType === 'edit' && selectedEnrollment && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card modal-card--small" onClick={(e) => e.stopPropagation()}>
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
                <h3 className="success-title">Status Updated!</h3>
                <p className="success-message">The enrollment status has been updated.</p>
              </div>
            ) : (
              <>
                <div className="modal-card__header modal-card__header--gradient">
                  <h3 className="modal-card__title">Edit Enrollment Status</h3>
                  <button className="modal-card__close modal-card__close--light" onClick={closeModal}>
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
                <div className="modal-card__body">
                  <div className="modal-field">
                    <label className="modal-field__label">Student</label>
                    <div className="modal-field__value">{selectedEnrollment.student?.name}</div>
                  </div>
                  <div className="modal-field">
                    <label className="modal-field__label">Course</label>
                    <div className="modal-field__value">{selectedEnrollment.course?.title}</div>
                  </div>
                  <div className="modal-field">
                    <label className="modal-field__label">Status</label>
                    <select 
                      className="modal-field__input"
                      value={editForm.status}
                      onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                    >
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
                <div className="modal-card__footer">
                  <button className="btn btn--secondary" onClick={closeModal}>Cancel</button>
                  <button className="btn btn--primary" onClick={handleSaveEdit}>
                    <FontAwesomeIcon icon={faEdit} style={{ marginRight: '8px' }} />
                    Update Status
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modalType === 'delete' && selectedEnrollment && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card modal-card--small modal-card--delete" onClick={(e) => e.stopPropagation()}>
            <div className="modal-card__header modal-card__header--gradient">
              <h3 className="modal-card__title">Delete Enrollment</h3>
              <button className="modal-card__close modal-card__close--light" onClick={closeModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="modal-card__body">
              <p style={{ marginBottom: '16px', color: 'var(--neutral-700)', fontSize: '15px', lineHeight: '1.6' }}>
                Are you sure you want to delete the enrollment of <strong>{selectedEnrollment.student?.name}</strong> in <strong>{selectedEnrollment.course?.title}</strong>? This action cannot be undone.
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

export default Enrollments;
