import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  faPlus,
  faSearch,
  faEye,
  faTrash,
  faFilter,
  faEllipsisV,
  faEdit,
  faTimes,
  faBookOpen,
  faCheckCircle,
  faTimesCircle,
  faUsers
} from '@fortawesome/free-solid-svg-icons';
import { getCourses, createCourse, deleteCourse, updateCourse, getEnrollments } from '../services/api';
import { validateCourseForm } from '../utils/validation';
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

function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);
  const [modalType, setModalType] = useState(null); // 'view', 'edit', 'delete', 'create'
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    instructorName: '',
    category: '',
    duration: '',
    status: 'Active'
  });
  const menuRef = useRef(null);

  useEffect(() => {
    loadCourses();
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

  const loadCourses = async () => {
    try {
      setLoading(true);
      const [coursesRes, enrollmentsRes] = await Promise.all([
        getCourses(),
        getEnrollments()
      ]);
      setCourses(coursesRes.data);
      setEnrollments(enrollmentsRes.data);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuToggle = (courseId) => {
    setActiveMenu(activeMenu === courseId ? null : courseId);
  };

  const handleView = (course) => {
    setSelectedCourse(course);
    setEditForm({
      title: course.title,
      description: course.description,
      instructorName: course.instructorName,
      category: course.category,
      duration: course.duration,
      status: course.status
    });
    setIsEditMode(false);
    setModalType('view');
    setActiveMenu(null);
  };

  const handleEnableEdit = () => {
    setIsEditMode(true);
  };

  const handleSaveFromView = async () => {
    try {
      await updateCourse(selectedCourse._id, editForm);
      await loadCourses();
      
      // Show success animation
      setShowSuccess(true);
      
      // Close modal after animation
      setTimeout(() => {
        setShowSuccess(false);
        closeModal();
      }, 2000);
    } catch (error) {
      console.error('Error updating course:', error);
      alert('Failed to update course');
    }
  };

  const handleEdit = (course) => {
    setSelectedCourse(course);
    setEditForm({
      title: course.title,
      description: course.description,
      instructorName: course.instructorName,
      category: course.category,
      duration: course.duration,
      status: course.status
    });
    setModalType('edit');
    setActiveMenu(null);
  };

  const handleDelete = (course) => {
    setSelectedCourse(course);
    setModalType('delete');
    setActiveMenu(null);
  };

  const handleCreateCourse = () => {
    setModalType('create');
  };

  const handleSaveNewCourse = async () => {
    try {
      await createCourse(createForm);
      await loadCourses();
      
      // Show success animation
      setShowSuccess(true);
      
      // Close modal after animation
      setTimeout(() => {
        setShowSuccess(false);
        closeModal();
      }, 2000);
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Failed to create course');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteCourse(selectedCourse._id);
      await loadCourses();
      closeModal();
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course');
    }
  };

  const handleSaveEdit = async () => {
    try {
      await updateCourse(selectedCourse._id, editForm);
      await loadCourses();
      closeModal();
    } catch (error) {
      console.error('Error updating course:', error);
      alert('Failed to update course');
    }
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedCourse(null);
    setEditForm({});
    setIsEditMode(false);
    setShowSuccess(false);
    setCreateForm({
      title: '',
      description: '',
      instructorName: '',
      category: '',
      duration: '',
      status: 'Active'
    });
  };

  if (loading) {
    return (
      <div className="page">
        <LoadingSpinner message="Loading courses..." />
      </div>
    );
  }

  const activeCourses = courses.filter(c => c.status === 'Active').length;
  const inactiveCourses = courses.filter(c => c.status === 'Inactive').length;
  const totalEnrollments = enrollments.length;

  return (
    <div className="page" style={{ position: 'relative' }}>
      <div className={`page-content ${modalType ? 'page-content--blurred' : ''}`}>
        <div className="page__header">
          <div>
            <h1 className="page__title">Courses</h1>
            <p className="page__subtitle">Manage your course catalog</p>
          </div>
          <button className="btn btn--primary" onClick={handleCreateCourse}>
            <FontAwesomeIcon icon={faPlus} />
            <span>Create Course</span>
          </button>
        </div>

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
          <KPICard
            icon={faBookOpen}
            value={courses.length}
            label="Total Courses"
          />
          <KPICard
            icon={faCheckCircle}
            value={activeCourses}
            label="Active Courses"
          />
          <KPICard
            icon={faTimesCircle}
            value={inactiveCourses}
            label="Inactive Courses"
          />
          <KPICard
            icon={faUsers}
            value={totalEnrollments}
            label="Total Enrollments"
          />
        </div>

        <div className="card">
          <div className="card__header">
            <h2 className="card__title">All Courses ({courses.length})</h2>
          </div>
          <div className="card__body" style={{ padding: 0 }}>
            {courses.length > 0 ? (
              <div className="table-responsive">
                <table className="table table--centered">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Instructor</th>
                      <th>Category</th>
                      <th>Duration</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((course) => (
                      <tr key={course._id}>
                        <td>
                          <span className="text-bold">{course.title}</span>
                        </td>
                        <td className="text-muted">{course.instructorName || 'N/A'}</td>
                        <td className="text-muted">{course.category || 'N/A'}</td>
                        <td>{course.duration || 'N/A'}</td>
                        <td>
                          <StatusBadge status={course.status || 'Inactive'} />
                        </td>
                        <td className="text-muted">{formatDate(course.createdAt)}</td>
                        <td>
                          <div style={{ position: 'relative', display: 'inline-block' }}>
                            <button 
                              className="btn btn--secondary btn--sm"
                              onClick={() => handleMenuToggle(course._id)}
                              style={{ padding: '8px 12px' }}
                            >
                              <FontAwesomeIcon icon={faEllipsisV} />
                            </button>
                            {activeMenu === course._id && (
                              <div ref={menuRef} className="dropdown-menu">
                                <button 
                                  className="dropdown-menu__item"
                                  onClick={() => handleView(course)}
                                >
                                  <FontAwesomeIcon icon={faEye} />
                                  <span>View</span>
                                </button>
                                <button 
                                  className="dropdown-menu__item"
                                  onClick={() => handleEdit(course)}
                                >
                                  <FontAwesomeIcon icon={faEdit} />
                                  <span>Edit</span>
                                </button>
                                <button 
                                  className="dropdown-menu__item dropdown-menu__item--danger"
                                  onClick={() => handleDelete(course)}
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
                heading="No courses yet"
                action={{
                  content: 'Create Course',
                  onAction: handleCreateCourse
                }}
              >
                Create your first course to get started
              </EmptyState>
            )}
          </div>
        </div>
      </div>

      {/* View Modal */}
      {modalType === 'view' && selectedCourse && (
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
                <h3 className="success-title">Course Updated!</h3>
                <p className="success-message">Your changes have been saved successfully.</p>
              </div>
            ) : (
              <>
                <div className="modal-card__header modal-card__header--gradient">
                  <h3 className="modal-card__title">Course Details</h3>
                  <button className="modal-card__close modal-card__close--light" onClick={closeModal}>
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
                <div className="modal-card__body">
                  <div className="modal-row">
                    <div className="modal-field modal-field--half">
                      <label className="modal-field__label">Title</label>
                      {isEditMode ? (
                        <input 
                          type="text"
                          className="modal-field__input"
                          value={editForm.title || ''}
                          onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                        />
                      ) : (
                        <div className="modal-field__value">{selectedCourse.title}</div>
                      )}
                    </div>
                    <div className="modal-field modal-field--half">
                      <label className="modal-field__label">Instructor Name</label>
                      {isEditMode ? (
                        <input 
                          type="text"
                          className="modal-field__input"
                          value={editForm.instructorName || ''}
                          onChange={(e) => setEditForm({...editForm, instructorName: e.target.value})}
                          placeholder="Enter instructor name"
                        />
                      ) : (
                        <div className="modal-field__value">{selectedCourse.instructorName || 'N/A'}</div>
                      )}
                    </div>
                  </div>
                  <div className="modal-row">
                    <div className="modal-field modal-field--half">
                      <label className="modal-field__label">Category</label>
                      {isEditMode ? (
                        <input 
                          type="text"
                          className="modal-field__input"
                          value={editForm.category || ''}
                          onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                          placeholder="e.g., Programming, Design"
                        />
                      ) : (
                        <div className="modal-field__value">{selectedCourse.category || 'N/A'}</div>
                      )}
                    </div>
                    <div className="modal-field modal-field--half">
                      <label className="modal-field__label">Duration</label>
                      {isEditMode ? (
                        <input 
                          type="text"
                          className="modal-field__input"
                          value={editForm.duration || ''}
                          onChange={(e) => setEditForm({...editForm, duration: e.target.value})}
                          placeholder="e.g., 4 weeks"
                        />
                      ) : (
                        <div className="modal-field__value">{selectedCourse.duration || 'N/A'}</div>
                      )}
                    </div>
                  </div>
                  <div className="modal-row">
                    <div className="modal-field modal-field--half">
                      <label className="modal-field__label">Status</label>
                      {isEditMode ? (
                        <select 
                          className="modal-field__input"
                          value={editForm.status || 'Active'}
                          onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      ) : (
                        <div className="modal-field__value">
                          <StatusBadge status={selectedCourse.status || 'Inactive'} />
                        </div>
                      )}
                    </div>
                    <div className="modal-field modal-field--half">
                      <label className="modal-field__label">Created</label>
                      <div className="modal-field__value">{formatDate(selectedCourse.createdAt)}</div>
                    </div>
                  </div>
                  <div className="modal-field">
                    <label className="modal-field__label">Description</label>
                    <div 
                      className={`modal-field__value modal-field__value--description ${isEditMode ? 'modal-field__value--editable' : ''}`}
                      contentEditable={isEditMode}
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        if (isEditMode) {
                          setEditForm({...editForm, description: e.target.textContent});
                        }
                      }}
                    >
                      {isEditMode ? (editForm.description || '') : (selectedCourse.description || 'N/A')}
                    </div>
                  </div>
                </div>
                <div className="modal-card__footer">
                  {isEditMode ? (
                    <>
                      <button className="btn btn--secondary" onClick={() => setIsEditMode(false)}>Cancel</button>
                      <button className="btn btn--primary" onClick={handleSaveFromView}>
                        <FontAwesomeIcon icon={faEdit} style={{ marginRight: '8px' }} />
                        Save Changes
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn--secondary" onClick={closeModal}>Close</button>
                      <button className="btn btn--primary" onClick={handleEnableEdit}>
                        <FontAwesomeIcon icon={faEdit} style={{ marginRight: '8px' }} />
                        Edit
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {modalType === 'edit' && selectedCourse && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-card__header modal-card__header--gradient">
              <h3 className="modal-card__title">Edit Course</h3>
              <button className="modal-card__close modal-card__close--light" onClick={closeModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="modal-card__body">
              <div className="modal-field">
                <label className="modal-field__label">Title</label>
                <input 
                  type="text"
                  className="modal-field__input"
                  value={editForm.title || ''}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                />
              </div>
              <div className="modal-row">
                <div className="modal-field modal-field--half">
                  <label className="modal-field__label">Instructor Name</label>
                  <input 
                    type="text"
                    className="modal-field__input"
                    value={editForm.instructorName || ''}
                    onChange={(e) => setEditForm({...editForm, instructorName: e.target.value})}
                    placeholder="Enter instructor name"
                  />
                </div>
                <div className="modal-field modal-field--half">
                  <label className="modal-field__label">Category</label>
                  <input 
                    type="text"
                    className="modal-field__input"
                    value={editForm.category || ''}
                    onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                    placeholder="e.g., Programming, Design"
                  />
                </div>
              </div>
              <div className="modal-row">
                <div className="modal-field modal-field--half">
                  <label className="modal-field__label">Duration</label>
                  <input 
                    type="text"
                    className="modal-field__input"
                    value={editForm.duration || ''}
                    onChange={(e) => setEditForm({...editForm, duration: e.target.value})}
                    placeholder="e.g., 4 weeks"
                  />
                </div>
                <div className="modal-field modal-field--half">
                  <label className="modal-field__label">Status</label>
                  <select 
                    className="modal-field__input"
                    value={editForm.status || 'Active'}
                    onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="modal-field">
                <label className="modal-field__label">Description</label>
                <div className="modal-field__textarea-wrapper">
                  <textarea 
                    className="modal-field__input modal-field__textarea-fixed"
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <div className="modal-card__footer">
              <button className="btn btn--secondary" onClick={closeModal}>Cancel</button>
              <button className="btn btn--primary" onClick={handleSaveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modalType === 'delete' && selectedCourse && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card modal-card--small modal-card--delete" onClick={(e) => e.stopPropagation()}>
            <div className="modal-card__header modal-card__header--gradient">
              <h3 className="modal-card__title">Delete Course</h3>
              <button className="modal-card__close modal-card__close--light" onClick={closeModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="modal-card__body">
              <p style={{ marginBottom: '16px', color: 'var(--neutral-700)', fontSize: '15px', lineHeight: '1.6' }}>
                Are you sure you want to delete <strong>{selectedCourse.title}</strong>? This action cannot be undone.
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

      {/* Create Course Modal */}
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
                <h3 className="success-title">Course Created!</h3>
                <p className="success-message">Your new course has been created successfully.</p>
              </div>
            ) : (
              <>
                <div className="modal-card__header modal-card__header--gradient">
                  <h3 className="modal-card__title">Create New Course</h3>
                  <button className="modal-card__close modal-card__close--light" onClick={closeModal}>
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
                <div className="modal-card__body">
                  <div className="modal-field">
                    <label className="modal-field__label modal-field__label--required">Title</label>
                    <input 
                      type="text"
                      className="modal-field__input"
                      value={createForm.title}
                      onChange={(e) => setCreateForm({...createForm, title: e.target.value})}
                      placeholder="Enter course title"
                      required
                    />
                  </div>
                  <div className="modal-row">
                    <div className="modal-field modal-field--half">
                      <label className="modal-field__label">Instructor Name</label>
                      <input 
                        type="text"
                        className="modal-field__input"
                        value={createForm.instructorName}
                        onChange={(e) => setCreateForm({...createForm, instructorName: e.target.value})}
                        placeholder="Enter instructor name"
                      />
                    </div>
                    <div className="modal-field modal-field--half">
                      <label className="modal-field__label">Category</label>
                      <input 
                        type="text"
                        className="modal-field__input"
                        value={createForm.category}
                        onChange={(e) => setCreateForm({...createForm, category: e.target.value})}
                        placeholder="e.g., Programming, Design"
                      />
                    </div>
                  </div>
                  <div className="modal-row">
                    <div className="modal-field modal-field--half">
                      <label className="modal-field__label">Duration</label>
                      <input 
                        type="text"
                        className="modal-field__input"
                        value={createForm.duration}
                        onChange={(e) => setCreateForm({...createForm, duration: e.target.value})}
                        placeholder="e.g., 4 weeks"
                      />
                    </div>
                    <div className="modal-field modal-field--half">
                      <label className="modal-field__label">Status</label>
                      <select 
                        className="modal-field__input"
                        value={createForm.status}
                        onChange={(e) => setCreateForm({...createForm, status: e.target.value})}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-field">
                    <label className="modal-field__label">Description</label>
                    <div className="modal-field__textarea-wrapper">
                      <textarea 
                        className="modal-field__input modal-field__textarea-fixed"
                        value={createForm.description}
                        onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                        placeholder="Enter course description"
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-card__footer">
                  <button className="btn btn--secondary" onClick={closeModal}>Cancel</button>
                  <button className="btn btn--primary" onClick={handleSaveNewCourse}>
                    <FontAwesomeIcon icon={faPlus} style={{ marginRight: '8px' }} />
                    Create Course
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Courses;
