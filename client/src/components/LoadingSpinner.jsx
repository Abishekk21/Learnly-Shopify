import React from 'react';
import { Spinner, Frame, Loading } from '@shopify/polaris';

function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '64px 24px',
      gap: '16px'
    }}>
      <Spinner size="large" />
      <p style={{ color: 'var(--neutral-600)', fontSize: '14px' }}>{message}</p>
    </div>
  );
}

export default LoadingSpinner;
