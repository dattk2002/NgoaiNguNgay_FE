import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Import useNavigate
import {
  learnerBookingTimeSlotByTutorId,
  getAllLearnerBookingTimeSlot,
  deleteLearnerBookingTimeSlot,
} from "../api/auth"; // Import the API function

function hasOnlyLearnerRole(user) {
  if (!user || !user.roles) return false;
  const roles = Array.isArray(user.roles) ? user.roles : [user.roles];
  return (
    roles.length === 1 &&
    (roles[0] === "Learner" || roles[0]?.name === "Learner")
  );
}

function UserProfile({ loggedInUser, getUserById }) {
  const { id } = useParams(); // Get the user ID from the URL
  const navigate = useNavigate(); // Initialize navigate
  const [profileUser, setProfileUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentAvatar, setCurrentAvatar] = useState(null);
  const [avatarKey, setAvatarKey] = useState(Date.now());
  const avatarRef = useRef(null);

  // Listen for avatar updates through custom event
  useEffect(() => {
    const handleAvatarUpdate = (event) => {
      if (event.detail && event.detail.profileImageUrl && profileUser) {
        // Ensure URL has a timestamp
        let newUrl = event.detail.profileImageUrl;
        if (!newUrl.includes("?")) {
          newUrl = `${newUrl}?t=${Date.now()}`;
        }

        // Update local avatar immediately
        setCurrentAvatar(newUrl);
        setAvatarKey(Date.now());

        // Update the profile user object
        setProfileUser((prev) => ({
          ...prev,
          profileImageUrl: newUrl,
        }));

        // Also update DOM directly if possible
        if (avatarRef.current) {
          avatarRef.current.src = newUrl + "&reload=" + Date.now();
        }

        // Preload the image
        const preloadImg = new Image();
        preloadImg.crossOrigin = "anonymous";
        preloadImg.src = newUrl;
        preloadImg.onload = () => {
          // Force re-render with a new key
          setAvatarKey(Date.now() + 1);
        };
      }
    };

    window.addEventListener("avatar-updated", handleAvatarUpdate);

    return () => {
      window.removeEventListener("avatar-updated", handleAvatarUpdate);
    };
  }, [profileUser]);

  // Listen for storage events (for cross-tab updates)
  useEffect(() => {
    const handleStorageChange = () => {
      if (profileUser) {
        try {
          const storedUser = JSON.parse(localStorage.getItem("user"));
          if (
            storedUser &&
            storedUser.id === profileUser.id &&
            storedUser.profileImageUrl
          ) {
            // Add timestamp if needed
            let newUrl = storedUser.profileImageUrl;
            if (!newUrl.includes("?")) {
              newUrl = `${newUrl}?t=${Date.now()}`;
            }
            setCurrentAvatar(newUrl);
            setAvatarKey(Date.now());

            // Also update DOM directly if possible
            if (avatarRef.current) {
              avatarRef.current.src = newUrl + "&reload=" + Date.now();
            }
          }
        } catch (error) {
          console.error("Error handling storage event in UserProfile:", error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [profileUser]);

  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (loggedInUser && loggedInUser.id === id) {
          // Use logged-in user data if viewing own profile
          setProfileUser(loggedInUser);
          // Ensure avatar URL has timestamp
          let avatarUrl = loggedInUser.profileImageUrl;
          if (avatarUrl && !avatarUrl.includes("?")) {
            avatarUrl = `${avatarUrl}?t=${Date.now()}`;
          }
          setCurrentAvatar(avatarUrl);
        } else {
          // Fetch user data by ID for other profiles
          const data = await getUserById(id);
          if (!data) {
            throw new Error("User not found.");
          }
          setProfileUser(data);
          // Ensure avatar URL has timestamp
          let avatarUrl = data.profileImageUrl;
          if (avatarUrl && !avatarUrl.includes("?")) {
            avatarUrl = `${avatarUrl}?t=${Date.now()}`;
          }
          setCurrentAvatar(avatarUrl);
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
        setError(error.message || "Failed to load user profile.");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [id, loggedInUser, getUserById]);

  // Fetch submitted requests if user is pure learner and viewing own profile
  useEffect(() => {
    const fetchRequests = async () => {
      if (
        profileUser &&
        loggedInUser &&
        profileUser.id === loggedInUser.id &&
        hasOnlyLearnerRole(loggedInUser)
      ) {
        try {
          const res = await learnerBookingTimeSlotByTutorId(loggedInUser.id);
          setSubmittedRequests(res.data || []);
        } catch (e) {
          setSubmittedRequests([]);
        }
      }
    };
    fetchRequests();
  }, [profileUser, loggedInUser]);

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
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  // Recalculate age whenever profileUser changes and has a dateOfBirth
  useEffect(() => {
    if (profileUser && profileUser.dateOfBirth) {
      setProfileUser((prev) => ({
        ...prev,
        age: calculateAge(prev.dateOfBirth),
      }));
    }
  }, [profileUser?.dateOfBirth]); // Recalculate if dateOfBirth changes

  useEffect(() => {
    const fetchSentRequests = async () => {
      setLoadingRequests(true);
      try {
        const data = await getAllLearnerBookingTimeSlot();
        setSentRequests(data);
      } catch (err) {
        // handle error, e.g., show toast
      } finally {
        setLoadingRequests(false);
      }
    };
    fetchSentRequests();
  }, []);

  const handleDeleteRequest = async (tutorId) => {
    try {
      await deleteLearnerBookingTimeSlot(tutorId);
      setSentRequests((prev) => prev.filter((req) => req.tutorId !== tutorId));
    } catch (error) {
      console.error("Failed to delete booking request:", error);
      alert("Xóa yêu cầu thất bại. Vui lòng thử lại!");
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        {/* Black Loading Spinner */}
        <svg
          className="animate-spin h-8 w-8 text-black mx-auto"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l2-2.647z"
          ></path>
        </svg>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (!profileUser) {
    return <div className="text-center py-8">Không tìm thấy người dùng.</div>;
  }

  // Determine if the logged-in user is viewing their own profile
  const isOwnProfile = loggedInUser && loggedInUser.id === profileUser.id;

  return (
    <div className="container mx-auto px-20 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Left Column: Profile Summary */}
      <div className="md:col-span-1 bg-white shadow rounded-lg p-6 flex flex-col items-center">
        <img
          ref={avatarRef}
          key={avatarKey}
          src={
            currentAvatar ||
            profileUser?.profileImageUrl ||
            "https://avatar.iran.liara.run/public"
          }
          alt="Ảnh đại diện"
          className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-gray-300"
          onError={(e) => {
            console.error("Error loading profile image:", e);
            e.target.src = "https://avatar.iran.liara.run/public";
          }}
          crossOrigin="anonymous"
          loading="eager"
        />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {profileUser.name || profileUser.fullName || "Người dùng"}
        </h2>
        {/* You might want to display a country flag here based on user data */}
        {/* <img src={`path/to/flag/${profileUser.countryCode}.png`} alt="Country Flag" className="w-6 h-4 mb-2" /> */}

        <div className="text-gray-600 text-sm mb-4">
          {profileUser.isTutor && ( // Example conditional rendering for tutors
            <span className="mr-4">{profileUser.posts} Bài viết</span>
          )}
          <span className="mr-4">
            {profileUser.following || 0} Đang theo dõi
          </span>
          <span>{profileUser.followers || 0} Người theo dõi</span>
        </div>

        <p className="text-gray-700 text-center mb-4">
          {profileUser.bio || "Chưa cung cấp tiểu sử."}
        </p>

        <div className="text-gray-500 text-sm text-center">
          {profileUser.age ? `${profileUser.age} tuổi, ` : ""}
          {profileUser.gender ? `${profileUser.gender}, ` : ""}
          {profileUser.location || "Vị trí không xác định"}
        </div>

        {/* Move the "Hồ sơ" section here */}
      </div>

      {/* Right Column: Details Sections */}
      <div className="md:col-span-2 space-y-8">
        {/* Profile Section */}

        <div className="bg-white shadow rounded-lg p-6 w-full mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Hồ sơ</h3>
            {isOwnProfile && (
              <button
                className="text-blue-600 text-sm hover:underline"
                onClick={handleEditClick}
              >
                Chỉnh sửa hồ sơ
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <div>
              <p className="font-medium mb-1">Đang học</p>
              <div className="flex flex-wrap gap-2">
                {profileUser.learningLanguages &&
                  Array.isArray(profileUser.learningLanguages) &&
                  profileUser.learningLanguages.map((lang, index) => (
                    <span
                      key={index}
                      className="bg-gray-200 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded"
                    >
                      {lang}
                    </span>
                  ))}
              </div>
            </div>
            <div>
              <p className="font-medium mb-1">
                Người lớn; Sở thích hoặc văn hóa
              </p>
              <span className="bg-gray-200 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                {profileUser.interestsType || "N/A"}
              </span>
            </div>
            <div>
              <p className="font-medium mb-1">Kỹ năng ngôn ngữ</p>
              <div className="flex flex-wrap gap-2">
                {profileUser.languageSkills &&
                  Array.isArray(profileUser.languageSkills) &&
                  profileUser.languageSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-gray-200 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded"
                    >
                      {skill.language} - {skill.level}
                    </span>
                  ))}
              </div>
            </div>
            <div>
              <p className="font-medium mb-1">Sở thích</p>
              <div className="flex flex-wrap gap-2">
                {profileUser.interests &&
                  Array.isArray(profileUser.interests) &&
                  profileUser.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full"
                    >
                      {interest}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </div>
        {/* End "Hồ sơ" section */}
        {/* Lesson Feedback Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800 mr-2">
              Phản hồi buổi học
            </h3>
            {/* Info icon Placeholder */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 text-gray-500 cursor-help"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.251 15.3c-.158.114-.323.21-.5.298Zm-.177-4.937A1.67 1.67 0 0 1 11.5 9.75V9c0-.414-.336-.75-.75-.75h-.75a.75.75 0 0 0-.75.75v.75c0 .414.336.75.75.75 0 .108-.011.216-.032.32Zm-.058 3.549A3.337 3.337 0 0 1 9.75 12c0-.721.117-1.442.35-2.123-.166-.05-.336-.088-.51-.115A3.337 3.337 0 0 0 9.75 15c0 1.659 1.341 3 3 3s3-1.341 3-3c0-.721-.117-1.442-.35-2.123-.166-.05-.336-.088-.51-.115A3.337 3.337 0 0 0 14.25 15c0 1.243-1.007 2.25-2.25 2.25S9.75 16.243 9.75 15Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
              />
            </svg>{" "}
            {/* Replace with a proper tooltip if needed */}
          </div>

          {/* Lesson History */}
          <div className="mb-6">
            <div className="flex items-center text-gray-700 mb-2">
              <span className="font-medium mr-2">Lịch sử buổi học</span>
              {/* Info icon Placeholder */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4 text-gray-500 cursor-help"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m11.251 15.3c-.158.114-.323.21-.5.298Zm-.177-4.937A1.67 1.67 0 0 1 11.5 9.75V9c0-.414-.336-.75-.75-.75h-.75a.75.75 0 0 0-.75.75v.75c0 .414.336.75.75.75 0 .108-.011.216-.032.32Zm-.058 3.549A3.337 3.337 0 0 1 9.75 12c0-.721.117-1.442.35-2.123-.166-.05-.336-.088-.51-.115A3.337 3.337 0 0 0 9.75 15c0 1.659 1.341 3 3 3s3-1.341 3-3c0-.721-.117-1.442-.35-2.123-.166-.05-.336-.088-.51-.115A3.337 3.337 0 0 0 14.25 15c0 1.243-1.007 2.25-2.25 2.25S9.75 16.243 9.75 15Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                />
              </svg>
            </div>
            {/* Table for Lesson History */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {/* Empty header for the first column */}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Tháng trước
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      3 tháng gần nhất
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Mọi lúc
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Replace with actual data from profileUser */}
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Số buổi đã hoàn thành
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
                      Tỷ lệ tham gia
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {profileUser.lessonStats?.attendanceLastMonth || "N/A"}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {profileUser.lessonStats?.attendanceLast3Months || "N/A"}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {profileUser.lessonStats?.attendanceAllTime || "N/A"}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Teacher Reviews */}
          <div>
            <div className="flex items-center text-gray-700 mb-2">
              <span className="font-medium mr-2">Đánh giá giáo viên</span>
              {/* Info icon Placeholder */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4 text-gray-500 cursor-help"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m11.251 15.3c-.158.114-.323.21-.5.298Zm-.177-4.937A1.67 1.67 0 0 1 11.5 9.75V9c0-.414-.336-.75-.75-.75h-.75a.75.75 0 0 0-.75.75v.75c0 .414.336.75.75.75 0 .108-.011.216-.032.32Zm-.058 3.549A3.337 3.337 0 0 1 9.75 12c0-.721.117-1.442.35-2.123-.166-.05-.336-.088-.51-.115A3.337 3.337 0 0 0 9.75 15c0 1.659 1.341 3 3 3s3-1.341 3-3c0-.721-.117-1.442-.35-2.123-.166-.05-.336-.088-.51-.115A3.337 3.337 0 0 0 14.25 15c0 1.243-1.007 2.25-2.25 2.25S9.75 16.243 9.75 15Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                />
              </svg>
            </div>
            {/* Display reviews or "No record" */}
            {profileUser.teacherReviews &&
            profileUser.teacherReviews.length > 0 ? (
              <div>
                {/* Map through reviews and display them */}
                {profileUser.teacherReviews.map((review, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-100 py-4 last:border-b-0"
                  >
                    <p className="text-sm font-medium text-gray-900">
                      {review.reviewerName}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      {review.comment}
                    </p>
                    {/* Display rating here if available */}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic">
                Chưa có bản ghi nào
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
