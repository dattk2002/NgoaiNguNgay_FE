import { useEffect } from 'react';

const useGoogleScript = () => {
  useEffect(() => {
    // Check if script is already loaded
    if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    // Add error handling
    script.onerror = () => {
      console.error('Failed to load Google Sign-In script');
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []); // Empty dependency array means this effect runs once on mount
};

export default useGoogleScript;
