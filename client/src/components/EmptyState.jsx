import React from 'react';
import { EmptyState as PolarisEmptyState } from '@shopify/polaris';

function EmptyStateComponent({ 
  heading, 
  children, 
  action, 
  image = 'https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png'
}) {
  return (
    <PolarisEmptyState
      heading={heading}
      action={action}
      image={image}
    >
      <p>{children}</p>
    </PolarisEmptyState>
  );
}

export default EmptyStateComponent;
