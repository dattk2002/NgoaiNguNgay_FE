import React, { useState, useEffect } from "react"; // Import hooks
import Tutor from "./Tutor"; // Import the Tutor component
import { fetchTutors } from "../api/auth"; // Import the new API function

// Sample data for tutors (can be fetched from an API later) - REMOVED

const TutorList = () => {
  const [tutors, setTutors] = useState([]); // State for tutors
  const [loading, setLoading] = useState(true); // State for loading status
  const [error, setError] = useState(null); // State for error handling
  const [displayedTutorsCount, setDisplayedTutorsCount] = useState(6); // State for displayed tutors count

  useEffect(() => {
    // Function to load tutors
    const loadTutors = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error before fetching
        const data = await fetchTutors();
        setTutors(data); // Set fetched data to state
      } catch (err) {
        console.error("Failed to fetch tutors:", err);
        setError(err.message || "Không thể tải danh sách giáo viên."); // Set error state
      } finally {
        setLoading(false); // Set loading to false after fetch attempt
      }
    };

    loadTutors(); // Call the function on component mount
  }, []); // Empty dependency array means this runs once on mount

  const handleShowMore = () => {
    setDisplayedTutorsCount(prevCount => prevCount + 6);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-black text-3xl font-semibold text-center mb-10">
        Featured Teachers
      </h2>
      {loading && <p className="text-center">Loading tutors...</p>}
      {error && <p className="text-center text-red-500">Error: {error}</p>}
      {!loading && !error && tutors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-28">
          {tutors.slice(0, displayedTutorsCount).map((tutor) => (
            <Tutor
              key={tutor.id}
              tutor={{
                id: tutor.id,
                name: tutor.name,
                languages: Array.isArray(tutor.subject) ? tutor.subject.join(', ') : 'N/A',
                rating: tutor.rating,
                reviews: tutor.ratingCount,
                rate: parseFloat(tutor.price) || 0,
                imageUrl: tutor.avatar,
                description: tutor.description,
              }}
            />
          ))}
        </div>
      )}
      {!loading && !error && displayedTutorsCount < tutors.length && (
        <div className="text-center mt-8">
          <button
            onClick={handleShowMore}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-150 ease-in-out"
          >
            Xem thêm
          </button>
        </div>
      )}
      {!loading && !error && tutors.length === 0 && (
        <p className="text-center text-gray-500">No tutors found.</p>
      )}
    </div>
  );
};

export default TutorList;
