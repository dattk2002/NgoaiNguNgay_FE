import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate

function UserProfile({ loggedInUser, getUserById }) {
  const { id } = useParams(); // Get the user ID from the URL
  const navigate = useNavigate(); // Initialize navigate
  const [profileUser, setProfileUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Remove modal-related state
  // const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // const [editFormData, setEditFormData] = useState({
  //   fullName: profileUser?.fullName || '',
  //   dateOfBirth: profileUser?.dateOfBirth || '',
  //   gender: profileUser?.gender || '',
  // });

  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (loggedInUser && loggedInUser.id === id) {
            // Use logged-in user data if viewing own profile
            setProfileUser(loggedInUser);
        } else {
            // Fetch user data by ID for other profiles
            const data = await getUserById(id);

            if (data) {
                setProfileUser(data);
            } else {
                setError("User not found.");
            }
        }

      } catch (err) {
        console.error("Failed to fetch user profile:", err);
        setError("Failed to load user profile.");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [id, loggedInUser, getUserById]); // Re-run effect if ID, loggedInUser, or getUserById changes

  // Remove modal handlers
  // const openEditModal = () => {
  //   setIsEditModalOpen(true);
  // };
  // const closeEditModal = () => {
  //   setIsEditModalOpen(false);
  // };
  // const handleInputChange = (e) => { ... };
  // const handleSubmit = (e) => { ... };
  // const handleEditProfile = async (updatedInfo) => { ... };

  // Handler for the Edit Profile button click
  const handleEditClick = () => {
      // Navigate to the edit profile route
      navigate(`/user/edit/${profileUser.id}`);
  };


  // Helper function to calculate age from dateOfBirth (keep this if you display age)
  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

   // Recalculate age whenever profileUser changes and has a dateOfBirth
   useEffect(() => {
    if (profileUser && profileUser.dateOfBirth) {
        setProfileUser(prev => ({
            ...prev,
            age: calculateAge(prev.dateOfBirth)
        }));
    }
   }, [profileUser?.dateOfBirth]); // Recalculate if dateOfBirth changes


  if (isLoading) {
    return <div className="text-center py-8">Loading profile...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (!profileUser) {
      return <div className="text-center py-8">User not found.</div>;
  }

  // Determine if the logged-in user is viewing their own profile
  const isOwnProfile = loggedInUser && loggedInUser.id === profileUser.id;

  return (
    <div className="container mx-auto px-20 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Left Column: Profile Summary */}
      <div className="md:col-span-1 bg-white shadow rounded-lg p-6 flex flex-col items-center">
        <img
          src={profileUser.profileImageUrl || "https://avatar.iran.liara.run/public"}
          alt="Profile Avatar"
          className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-gray-300"
        />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{profileUser.name || profileUser.fullName || 'User'}</h2>
        {/* You might want to display a country flag here based on user data */}
        {/* <img src={`path/to/flag/${profileUser.countryCode}.png`} alt="Country Flag" className="w-6 h-4 mb-2" /> */}

        <div className="text-gray-600 text-sm mb-4">
          {profileUser.isTutor && ( // Example conditional rendering for tutors
              <span className="mr-4">{profileUser.posts} Posts</span>
          )}
          <span className="mr-4">{profileUser.following || 0} Following</span>
          <span>{profileUser.followers || 0} Followers</span>
        </div>

        <p className="text-gray-700 text-center mb-4">{profileUser.bio || 'No bio provided.'}</p>

        <div className="text-gray-500 text-sm text-center">
          {profileUser.age ? `${profileUser.age}, ` : ''}
          {profileUser.gender ? `${profileUser.gender}, ` : ''}
          {profileUser.location || 'Location Unknown'}
        </div>
          {profileUser.id && (
              <div className="text-gray-500 text-sm text-center mt-1">
                User ID: {profileUser.id}
              </div>
          )}
      </div>

      {/* Right Column: Details Sections */}
      <div className="md:col-span-2 space-y-8">
        {/* Profile Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Profile</h3>
              {isOwnProfile && (
                <button className="text-blue-600 text-sm hover:underline" onClick={handleEditClick}>Edit Profile</button>
              )}
          </div>    
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <div>
              <p className="font-medium mb-1">Learning</p>
              <div className="flex flex-wrap gap-2">
                  {/* Assuming profileUser.learningLanguages is an array */}
                {profileUser.learningLanguages && Array.isArray(profileUser.learningLanguages) && profileUser.learningLanguages.map((lang, index) => (
                      <span key={index} className="bg-gray-200 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                          {lang}
                      </span>
                ))}
              </div>
            </div>
              <div>
                <p className="font-medium mb-1">Adult; Hobbies or Cultural Interest</p>
                  {/* Assuming profileUser.interestsType is a string */}
                <span className="bg-gray-200 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                      {profileUser.interestsType || 'N/A'}
                </span>
              </div>
              <div>
                <p className="font-medium mb-1">Language Skills</p>
                <div className="flex flex-wrap gap-2">
                    {/* Assuming profileUser.languageSkills is an array of objects like { language: '...', level: '...' } */}
                    {profileUser.languageSkills && Array.isArray(profileUser.languageSkills) && profileUser.languageSkills.map((skill, index) => (
                        <span key={index} className="bg-gray-200 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                            {skill.language} - {skill.level} {/* Adjust based on your data structure */}
                        </span>
                    ))}
                </div>
              </div>
              <div>
                <p className="font-medium mb-1">Interests</p>
                <div className="flex flex-wrap gap-2">
                    {/* Assuming profileUser.interests is an array */}
                    {profileUser.interests && Array.isArray(profileUser.interests) && profileUser.interests.map((interest, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                            {interest}
                        </span>
                    ))}
                </div>
              </div>
          </div>
        </div>

        {/* Lesson Feedback Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800 mr-2">Lesson Feedback</h3>
            {/* Info icon Placeholder */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500 cursor-help">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.251 15.3c-.158.114-.323.21-.5.298Zm-.177-4.937A1.67 1.67 0 0 1 11.5 9.75V9c0-.414-.336-.75-.75-.75h-.75a.75.75 0 0 0-.75.75v.75c0 .414.336.75.75.75 0 .108-.011.216-.032.32Zm-.058 3.549A3.337 3.337 0 0 1 9.75 12c0-.721.117-1.442.35-2.123-.166-.05-.336-.088-.51-.115A3.337 3.337 0 0 0 9.75 15c0 1.659 1.341 3 3 3s3-1.341 3-3c0-.721-.117-1.442-.35-2.123-.166-.05-.336-.088-.51-.115A3.337 3.337 0 0 0 14.25 15c0 1.243-1.007 2.25-2.25 2.25S9.75 16.243 9.75 15Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
              </svg> {/* Replace with a proper tooltip if needed */}
          </div>

            {/* Lesson History */}
            <div className="mb-6">
                <div className="flex items-center text-gray-700 mb-2">
                    <span className="font-medium mr-2">Lesson history</span>
                    {/* Info icon Placeholder */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-500 cursor-help">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m11.251 15.3c-.158.114-.323.21-.5.298Zm-.177-4.937A1.67 1.67 0 0 1 11.5 9.75V9c0-.414-.336-.75-.75-.75h-.75a.75.75 0 0 0-.75.75v.75c0 .414.336.75.75.75 0 .108-.011.216-.032.32Zm-.058 3.549A3.337 3.337 0 0 1 9.75 12c0-.721.117-1.442.35-2.123-.166-.05-.336-.088-.51-.115A3.337 3.337 0 0 0 9.75 15c0 1.659 1.341 3 3 3s3-1.341 3-3c0-.721-.117-1.442-.35-2.123-.166-.05-.336-.088-.51-.115A3.337 3.337 0 0 0 14.25 15c0 1.243-1.007 2.25-2.25 2.25S9.75 16.243 9.75 15Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                    </svg>
                </div>
                {/* Table for Lesson History */}
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {/* Empty header for the first column */}
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Last Month
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Last 3 Months
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    All Time
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {/* Replace with actual data from profileUser */}
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    Completed lessons
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {profileUser.lessonStats?.completedLastMonth || 0}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                     {profileUser.lessonStats?.completedLast3Months || 0}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                     {profileUser.lessonStats?.completedAllTime || 0}
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    Attendance rate
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                     {profileUser.lessonStats?.attendanceLastMonth || 'N/A'}%
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                     {profileUser.lessonStats?.attendanceLast3Months || 'N/A'}%
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                     {profileUser.lessonStats?.attendanceAllTime || 'N/A'}%
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Teacher Reviews */}
             <div>
                <div className="flex items-center text-gray-700 mb-2">
                    <span className="font-medium mr-2">Teacher reviews</span>
                     {/* Info icon Placeholder */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-500 cursor-help">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m11.251 15.3c-.158.114-.323.21-.5.298Zm-.177-4.937A1.67 1.67 0 0 1 11.5 9.75V9c0-.414-.336-.75-.75-.75h-.75a.75.75 0 0 0-.75.75v.75c0 .414.336.75.75.75 0 .108-.011.216-.032.32Zm-.058 3.549A3.337 3.337 0 0 1 9.75 12c0-.721.117-1.442.35-2.123-.166-.05-.336-.088-.51-.115A3.337 3.337 0 0 0 9.75 15c0 1.659 1.341 3 3 3s3-1.341 3-3c0-.721-.117-1.442-.35-2.123-.166-.05-.336-.088-.51-.115A3.337 3.337 0 0 0 14.25 15c0 1.243-1.007 2.25-2.25 2.25S9.75 16.243 9.75 15Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                    </svg>
                </div>
                {/* Display reviews or "No record" */}
                {profileUser.teacherReviews && profileUser.teacherReviews.length > 0 ? (
                    <div>
                        {/* Map through reviews and display them */}
                        {profileUser.teacherReviews.map((review, index) => (
                            <div key={index} className="border-b border-gray-100 py-4 last:border-b-0">
                                <p className="text-sm font-medium text-gray-900">{review.reviewerName}</p>
                                <p className="text-sm text-gray-700 mt-1">{review.comment}</p>
                                {/* Display rating here if available */}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm italic">No record</p>
                )}
            </div>

        </div>

        {/* Activities Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800 mr-2">Activities</h3>
             {/* Info icon Placeholder */}
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500 cursor-help">
                <path strokeLinecap="round" strokeLinejoin="round" d="m11.251 15.3c-.158.114-.323.21-.5.298Zm-.177-4.937A1.67 1.67 0 0 1 11.5 9.75V9c0-.414-.336-.75-.75-.75h-.75a.75.75 0 0 0-.75.75v.75c0 .414.336.75.75.75 0 .108-.011.216-.032.32Zm-.058 3.549A3.337 3.337 0 0 1 9.75 12c0-.721.117-1.442.35-2.123-.166-.05-.336-.088-.51-.115A3.337 3.337 0 0 0 9.75 15c0 1.659 1.341 3 3 3s3-1.341 3-3c0-.721-.117-1.442-.35-2.123-.166-.05-.336-.088-.51-.115A3.337 3.337 0 0 0 14.25 15c0 1.243-1.007 2.25-2.25 2.25S9.75 16.243 9.75 15Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
             </svg>
          </div>
          {/* Display activities or "No record" */}
            {profileUser.activities && profileUser.activities.length > 0 ? (
                <div>
                     {/* Map through activities and display them */}
                     {profileUser.activities.map((activity, index) => (
                         <div key={index} className="border-b border-gray-100 py-4 last:border-b-0">
                             <p className="text-sm font-medium text-gray-900">{activity.type}</p>
                             <p className="text-sm text-gray-700 mt-1">{activity.description}</p>
                             <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
                         </div>
                     ))}
                </div>
            ) : (
             <p className="text-gray-500 text-sm italic">No record</p>
            )}
        </div>
      </div>

      {/* Remove the modal from UserProfile */}
      {/* {isEditModalOpen && ( ... )} */}
    </div>
  );
}

export default UserProfile;