import React from 'react';

const NoFocusOutLineButton = React.forwardRef(({ className = '', ...props }, ref) => (
  <button
    ref={ref}
    className={`no-focus-outline ${className}`}
    {...props}
  />
));

export default NoFocusOutLineButton;
