import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import { FaArrowRight } from "react-icons/fa6"; // Import FaArrowRight from react-icons/fa6
import { fetchRecommendTutor } from "../api/auth"; // Changed import to fetchRecommendTutor
import RecommendTutorCard from "./RecommendTutorCard";
import { formatLanguageCode } from "../../utils/formatLanguageCode";

const RecommendTutorList = ({ user, onRequireLogin }) => {
  console.log("User prop in RecommendTutorList:", user);
  const [tutors, setTutors] = useState([]);
  const [filteredTutors, setFilteredTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [visibleTutors, setVisibleTutors] = useState(3); // State to track number of visible tutors

  useEffect(() => {
    const loadTutors = async () => {
      try {
        setLoading(true);
        // Call the new fetchRecommendTutor function
        const tutorsData = await fetchRecommendTutor();
        setTutors(tutorsData);
        setFilteredTutors(tutorsData); // Initially show all tutors
      } catch (err) {
        setError(err.message || "Could not load recommended tutors."); // Updated error message
      } finally {
        setLoading(false);
      }
    };

    loadTutors();
  }, []);

  // Extract unique languages from tutors - Updated to use the 'languages' array
  const languages = Array.from(
    new Set(
      tutors
        .flatMap((tutor) =>
          tutor.languages ? tutor.languages.map((lang) => lang.languageCode) : []
        )
        .filter((language) => language)
    )
  ).sort();

  // Handle language filter change - Updated to filter based on 'languages' array
  const handleLanguageFilter = (language) => {
    setSelectedLanguage(language);
    setVisibleTutors(3); // Reset visible tutors when changing filter
    if (language === "") {
      setFilteredTutors(tutors); // Show all tutors if no language selected
    } else {
      const filtered = tutors.filter((tutor) =>
        tutor.languages?.some((lang) => lang.languageCode === language)
      );
      setFilteredTutors(filtered);
    }
  };

  // Handle "Xem thêm" button click
  const handleLoadMore = () => {
    setVisibleTutors((prev) => prev + 3);
  };

  if (loading) return <p className="text-center text-gray-500">Đang tải...</p>;
  if (error) return <p className="text-center text-red-500">Lỗi: {error}</p>;

  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 px-16">
        Tìm gia sư
      </h2>

      {/* Language Filter */}
      <div className="mb-8 flex flex-wrap gap-2 justify-center">
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleLanguageFilter("")}
          sx={{
            backgroundColor: selectedLanguage === "" ? "#000000" : "#d1d5db",
            color: selectedLanguage === "" ? "#ffffff" : "#000000",
            "&:hover": {
              backgroundColor: selectedLanguage === "" ? "#333333" : "#d1d5db",
            },
            padding: "6px 12px",
            borderRadius: "20px",
            textTransform: "none",
          }}
        >
          Tất cả
        </Button>
        {languages.map((language) => (
          <Button
            key={language}
            variant="outlined"
            onClick={() => handleLanguageFilter(language)}
            sx={{
              backgroundColor:
                selectedLanguage === language ? "#000000" : "transparent",
              color: selectedLanguage === language ? "#ffffff" : "#000000",
              borderColor: "#d1d5db",
              "&:hover": {
                backgroundColor:
                  selectedLanguage === language ? "#333333" : "#d1d5db",
                borderColor: "#9ca3af",
              },
              padding: "6px 12px",
              borderRadius: "20px",
              textTransform: "none",
            }}
          >
            {formatLanguageCode(language)}
            {/* {language} */}
          </Button>
        ))}
      </div>

      {/* Tutor Grid */}
      {filteredTutors.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-16">
            {filteredTutors.slice(0, visibleTutors).map((tutor) => (
              <RecommendTutorCard
                key={tutor.tutorId}
                tutor={{
                  id: tutor.tutorId, // Mapped tutorId to id
                  name: tutor.fullName, // Mapped fullName to name
                  subjects: // Mapped languages array to subjects string
                    Array.isArray(tutor.languages) && tutor.languages.length > 0
                      ? tutor.languages.map((lang) => lang.languageCode).join(", ")
                      : "N/A",
                  rating: tutor.rating || 0, // Used rating, default to 0 if undefined
                  reviews: 0, // reviews (ratingCount) is not available in new data
                  price: 0, // price is not available in new data
                  imageUrl: tutor.profileImageUrl, // Mapped profileImageUrl to imageUrl
                  description: tutor.description, // Used description
                  isProfessional: tutor.isProfessional,
                  address: "N/A", // address is not available in new data, defaulting to webcam
                }}
                user={user}
                onRequireLogin={onRequireLogin}
              />
            ))}
          </div>
          {/* Xem thêm Button with Arrow Icon */}
          {visibleTutors < filteredTutors.length && (
            <div className="flex flex-row justify-center text-center mt-8">
              <Button
                variant="contained"
                color="primary"
                onClick={handleLoadMore}
                sx={{
                  backgroundColor: "#000000",
                  color: "#ffffff",
                  "&:hover": {
                    backgroundColor: "#333333",
                  },
                  padding: "8px 16px",
                  borderRadius: "18px",
                  textTransform: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px", // Space between text and icon
                }}
              >
                Xem thêm
                <FaArrowRight />
              </Button>
            </div>
          )}
        </>
      ) : (
        <p className="text-center text-gray-500">
          Không tìm thấy gia sư nào cho ngôn ngữ đã chọn.
        </p>
      )}
    </div>
  );
};

export default RecommendTutorList;