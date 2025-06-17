import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GoogleCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      // Get the authorization code from URL
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (code) {
        try {
          // Send the code to your backend
          const response = await fetch('/api/auth/google/callback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          });

          const data = await response.json();
          
          if (data.success) {
            // Handle successful login
            // Store tokens, update user state, etc.
            navigate('/'); // Redirect to home page
          } else {
            // Handle error
            navigate('/login');
          }
        } catch (error) {
          console.error('Error during Google callback:', error);
          navigate('/login');
        }
      } else {
        // No code received
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  );
};

export default GoogleCallback;
