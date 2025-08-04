import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import { FaArrowRight } from "react-icons/fa6"; // Import FaArrowRight from react-icons/fa6
import { fetchRecommendTutor } from "../api/auth"; // Changed import to fetchRecommendTutor
import RecommendTutorCard from "./RecommendTutorCard";
import { formatLanguageCode } from "../../utils/formatLanguageCode";
import { Skeleton } from "@mui/material"; // Add this import
import { languageList } from "../../utils/languageList"; // Add this import
import NoFocusOutLineButton from "../../utils/noFocusOutlineButton";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const getLanguageName = (code) => {
  const lang = languageList.find((l) => l.code === code);
  return lang ? lang.name : code;
  
};

const languages = languageList.map((lang) => lang.code);

const sliderSettings = {
  dots: false,
  infinite: false,
  speed: 500,
  slidesToShow: 8,
  slidesToScroll: 4,
  arrows: true,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 4,
        slidesToScroll: 2,
      },
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
      },
    },
  ],
};

const RecommendTutorList = ({ user, onRequireLogin }) => {
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

  if (loading) {
    // Show 3 skeleton cards in a grid, similar to the real cards
    return (
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 px-16">
          Tìm gia sư
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-16">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center p-4 border rounded-lg bg-white shadow">
              <Skeleton variant="circular" width={80} height={80} />
              <Skeleton variant="text" width={120} height={32} sx={{ mt: 2 }} />
              <Skeleton variant="text" width={180} height={24} />
              <Skeleton variant="rectangular" width="100%" height={60} sx={{ mt: 2, mb: 1 }} />
              <Skeleton variant="text" width="60%" height={20} />
              <Skeleton variant="text" width="40%" height={20} />
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (error) return <p className="text-center text-red-500">Lỗi: {error}</p>;

  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 px-16">
        Tìm gia sư
      </h2>

      {/* Language Filter */}
      <div className="mb-8 flex justify-center">
        <Slider {...sliderSettings} style={{ width: "90%" }}>
          <div>
            <NoFocusOutLineButton
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
                width: "90%",
              }}
            >
              Tất cả
            </NoFocusOutLineButton>
          </div>
          {languages.map((language) => (
            <div key={language}>
              <Button
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
                  width: "90%",
                }}
              >
                {getLanguageName(language)}
              </Button>
            </div>
          ))}
        </Slider>
      </div>

      {/* Tutor Grid */}
      {filteredTutors.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-16">
            {filteredTutors.slice(0, visibleTutors).map((tutor) => (
              <RecommendTutorCard
                key={tutor.tutorId}
                tutor={{
                  tutorId: tutor.tutorId, // <-- Fix here
                  name: tutor.fullName,
                  subjects:
                    Array.isArray(tutor.languages) && tutor.languages.length > 0
                      ? tutor.languages.map((lang) => lang.languageCode).join(", ")
                      : "N/A",
                  rating: tutor.rating || 0,
                  reviews: 0,
                  price: 0,
                  imageUrl: tutor.profileImageUrl,
                  description: tutor.description,
                  isProfessional: tutor.isProfessional,
                  address: "N/A",
                }}
                user={user}
                onRequireLogin={onRequireLogin}
              />
            ))}
          </div>
          {/* Xem thêm Button with Arrow Icon */}
          {visibleTutors < filteredTutors.length && (
            <div className="flex flex-row justify-center text-center mt-8">
              <NoFocusOutLineButton
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
              </NoFocusOutLineButton>
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