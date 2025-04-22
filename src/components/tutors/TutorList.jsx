import React, { useState, useEffect } from "react"; // Import hooks
import Slider from "react-slick";
import Tutor from "./Tutor"; // Import the Tutor component
import { fetchTutors } from "../api/auth"; // Import the new API function

// Import slick carousel styles
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Sample data for tutors (can be fetched from an API later) - REMOVED

const TutorList = () => {
  const [tutors, setTutors] = useState([]); // State for tutors
  const [loading, setLoading] = useState(true); // State for loading status
  const [error, setError] = useState(null); // State for error handling

  const initialSlidesToShow = 3; // Define the initial value separately

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

  // Settings for the react-slick carousel
  const settings = {
    dots: true,
    infinite: tutors.length > initialSlidesToShow, // Use the constant here
    speed: 500,
    slidesToShow: initialSlidesToShow, // Use the constant here
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: tutors.length > 2,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: tutors.length > 1,
        },
      },
    ],
    prevArrow: (
      <button className="slick-prev slick-arrow absolute top-1/2 -left-4 z-10 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md disabled:opacity-50" 
              // Use the constant in the disabled check
              disabled={loading || tutors.length <= initialSlidesToShow}> 
        {"<"}
      </button>
    ),
    nextArrow: (
      <button className="slick-next slick-arrow absolute top-1/2 -right-4 z-10 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md disabled:opacity-50" 
              // Use the constant in the disabled check
              disabled={loading || tutors.length <= initialSlidesToShow}>
        {">"}
      </button>
    ),
  };

  return (
    <div className="container mx-auto px-4 py-12 relative">
      {" "}
      {/* Added relative positioning for arrows */}
      <h2 className="text-black text-3xl font-semibold text-center mb-10">
        Featured Teachers
      </h2>
      {loading && <p className="text-center">Loading tutors...</p>}
      {error && <p className="text-center text-red-500">Error: {error}</p>}
      {!loading && !error && tutors.length > 0 && (
        <Slider {...settings} className="mx-4">
          {" "}
          {/* Added margin for arrow spacing */}
          {tutors.map((tutor) => (
            // Map through the fetched tutors state
            // Adapt the props passed to Tutor based on the API data structure
            <Tutor
              key={tutor.id}
              tutor={{
                id: tutor.id,
                name: tutor.name,
                // Join the subject array into a string for languages
                languages: Array.isArray(tutor.subject) ? tutor.subject.join(', ') : 'N/A',
                rating: tutor.rating,
                // Use ratingCount from API for reviews
                reviews: tutor.ratingCount,
                // Parse price string to number for rate
                rate: parseFloat(tutor.price) || 0,
                // Use avatar from API for imageUrl
                imageUrl: tutor.avatar,
                // Include other fields if needed by Tutor component later
                // address: tutor.address,
                // description: tutor.description,
                // tag: tutor.tag,
              }}
            />
          ))}
        </Slider>
      )}
       {!loading && !error && tutors.length === 0 && (
         <p className="text-center text-gray-500">No tutors found.</p>
       )}
    </div>
  );
};

export default TutorList;
