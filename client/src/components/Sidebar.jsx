import React from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faBookOpen,
  faUserGraduate,
  faClipboardList
} from '@fortawesome/free-solid-svg-icons';

function Sidebar() {
  const navItems = [
    {
      to: '/',
      icon: faChartLine,
      label: 'Dashboard',
      exact: true
    },
    {
      to: '/courses',
      icon: faBookOpen,
      label: 'Courses'
    },
    {
      to: '/students',
      icon: faUserGraduate,
      label: 'Students'
    },
    {
      to: '/enrollments',
      icon: faClipboardList,
      label: 'Enrollments'
    }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        <img 
          src="https://cdn-icons-png.flaticon.com/512/3976/3976625.png" 
          alt="Learnly Logo" 
          className="sidebar__logo"
        />
        <h1 className="sidebar__title">Learnly</h1>
      </div>

      <nav className="sidebar__nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) =>
              `sidebar__nav-item ${isActive ? 'sidebar__nav-item--active' : ''}`
            }
          >
            <FontAwesomeIcon icon={item.icon} className="sidebar__nav-icon" />
            <span className="sidebar__nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <p className="sidebar__footer-text">Developed by Abishek</p>
      </div>
    </aside>
  );
}

export default Sidebar;
