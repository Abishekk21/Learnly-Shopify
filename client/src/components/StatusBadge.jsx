import React from 'react';
import { Badge } from '@shopify/polaris';

function StatusBadge({ status, type = 'default' }) {
  // Map status values to Polaris badge types
  const getStatusConfig = () => {
    // Course/Enrollment status
    if (status === 'Active') return { tone: 'success', children: 'Active' };
    if (status === 'Inactive') return { tone: 'critical', children: 'Inactive' };
    if (status === 'Completed') return { tone: 'info', children: 'Completed' };
    if (status === 'In Progress') return { tone: 'warning', children: 'In Progress' };
    
    return { tone: 'default', children: status };
  };

  const config = getStatusConfig();
  
  return <Badge {...config} />;
}

export default StatusBadge;
