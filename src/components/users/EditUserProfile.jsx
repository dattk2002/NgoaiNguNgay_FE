// src/components/users/EditUserProfile.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchUserById } from '../api/auth'; // Assuming updateProfile is your API call

function EditUserProfile({ loggedInUser }) {
  const { id } = useParams(); // Get the user ID from the URL
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    bio: '', // Add other fields you want to edit
    learningLanguages: [],
    interestsType: '',
    languageSkills: [],
    interests: [],
    // Add other fields like profileImageUrl, location, etc.
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch user data to populate the form
        const userData = await fetchUserById(id); // Replace with your actual fetch call

        if (userData) {
          // Populate form data, ensure dates are in YYYY-MM-DD format
          setFormData({
            fullName: userData.fullName || '',
            dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : '',
            gender: userData.gender || '',
            bio: userData.bio || '',
            learningLanguages: userData.learningLanguages || [],
            interestsType: userData.interestsType || '',
            languageSkills: userData.languageSkills || [],
            interests: userData.interests || [],
            // Initialize other fields
          });
        } else {
          setError("User not found.");
        }
      } catch (err) {
        console.error("Failed to fetch user profile for editing:", err);
        setError("Failed to load user profile for editing.");
      } finally {
        setIsLoading(false);
      }
    };

    // Only load data if loggedInUser exists and matches the profile being edited
    if (loggedInUser && loggedInUser.id === id) {
      loadUserData();
    } else if (!loggedInUser) {
        // If not logged in, redirect to signup/login
        navigate('/signup-page', { replace: true });
    }
     else {
        // If logged in but trying to edit another user's profile, redirect
        navigate(`/user/${loggedInUser.id}`, { replace: true });
     }

  }, [id, loggedInUser, navigate]); // Dependency array includes id and loggedInUser

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken'); // Get the token
      if (!token) {
        throw new Error('Authentication token not found.');
      }

      // Prepare the data to send to the backend
      const dataToUpdate = {
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        bio: formData.bio,
        learningLanguages: formData.learningLanguages, // Assuming these are handled as arrays/strings
        interestsType: formData.interestsType,
        languageSkills: formData.languageSkills, // Assuming these are handled
        interests: formData.interests, // Assuming these are handled
        // Include other fields here
      };

      // Call your API to update the profile

      if (response && response.success) {
        alert('Profile updated successfully!');
        // Update the loggedInUser state in App.jsx if the edited profile is the logged-in user's
        // This would require a prop function from App.jsx, let's assume it's called onProfileUpdate
        // if (loggedInUser && loggedInUser.id === id && onProfileUpdate) {
        //     onProfileUpdate(response.updatedUser); // Assuming the API returns the updated user
        // }
        navigate(`/user/${id}`); // Navigate back to the profile view page
      } else {
        throw new Error(response.message || 'Failed to update profile.');
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      setError(`Error saving profile: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/user/${id}`); // Navigate back to the profile view page
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading editor...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  // Add a check to ensure the logged-in user is allowed to edit this profile
  if (!loggedInUser || loggedInUser.id !== id) {
    return <div className="text-center py-8 text-red-500">You do not have permission to edit this profile.</div>;
  }


  return (
    <div className="container mx-auto px-20 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Profile</h2>
        <form onSubmit={handleSave}>
          {/* Full Name */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fullName">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          {/* Date of Birth */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dateOfBirth">
              Date of Birth
            </label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          {/* Gender */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="gender">
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

           {/* Bio */}
           <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bio">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows="4"
            ></textarea>
          </div>

           {/* Add more fields for editing (Learning Languages, Interests, etc.) */}
           {/* These might require more complex input handling (e.g., tags input) */}
            {/* For simplicity, let's just add placeholders for now */}

            {/* Learning Languages */}
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="learningLanguages">
                    Learning Languages (comma-separated)
                </label>
                <input
                    type="text"
                    id="learningLanguages"
                    name="learningLanguages"
                    value={Array.isArray(formData.learningLanguages) ? formData.learningLanguages.join(', ') : formData.learningLanguages}
                    onChange={(e) => setFormData({...formData, learningLanguages: e.target.value.split(',').map(lang => lang.trim())})}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>

             {/* Interests Type */}
             <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="interestsType">
                    Hobbies or Cultural Interest Type
                </label>
                <input
                    type="text"
                    id="interestsType"
                    name="interestsType"
                    value={formData.interestsType}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>

            {/* Interests */}
             <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="interests">
                    Interests (comma-separated)
                </label>
                 <input
                    type="text"
                    id="interests"
                    name="interests"
                     value={Array.isArray(formData.interests) ? formData.interests.join(', ') : formData.interests}
                    onChange={(e) => setFormData({...formData, interests: e.target.value.split(',').map(interest => interest.trim())})}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>

            {/* Language Skills (This might need a more complex component for adding language/level pairs) */}
             <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="languageSkills">
                    Language Skills (e.g., English: Native, Spanish: Intermediate)
                </label>
                 {/* A simplified text input for now */}
                 <textarea
                    id="languageSkills"
                    name="languageSkills"
                    value={Array.isArray(formData.languageSkills) ? formData.languageSkills.map(skill => `${skill.language}: ${skill.level}`).join(', ') : ''}
                    onChange={(e) => {
                        // Simple parsing for demonstration; a real app needs better handling
                        const skillsArray = e.target.value.split(',').map(item => {
                            const parts = item.split(':').map(part => part.trim());
                            return { language: parts[0] || '', level: parts[1] || '' };
                        }).filter(skill => skill.language); // Filter out empty skills
                         setFormData({...formData, languageSkills: skillsArray});
                    }}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    rows="2"
                ></textarea>
            </div>


          <div className="flex items-center justify-between mt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditUserProfile;