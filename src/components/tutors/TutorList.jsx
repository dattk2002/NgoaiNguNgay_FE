import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import { FaArrowRight } from "react-icons/fa6"; // Import FaArrowRight from react-icons/fa6
import TutorCard from "./TutorCard";
import { fetchTutors } from "../api/auth";

const TutorList = ({ user, onRequireLogin }) => {
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
        const tutorsData = await fetchTutors();
        setTutors(tutorsData);
        setFilteredTutors(tutorsData); // Initially show all tutors
      } catch (err) {
        setError(err.message || "Could not load tutors.");
      } finally {
        setLoading(false);
      }
    };

    loadTutors();
  }, []);

  // Extract unique languages from tutors
  const languages = Array.from(
    new Set(
      tutors
        .flatMap((tutor) =>
          tutor.subjects ? tutor.subjects.map((subject) => subject.name) : []
        )
        .filter((language) => language)
    )
  ).sort();

  // Handle language filter change
  const handleLanguageFilter = (language) => {
    setSelectedLanguage(language);
    setVisibleTutors(3); // Reset visible tutors when changing filter
    if (language === "") {
      setFilteredTutors(tutors); // Show all tutors if no language selected
    } else {
      const filtered = tutors.filter((tutor) =>
        tutor.subjects?.some((subject) => subject.name === language)
      );
      setFilteredTutors(filtered);
    }
  };

  // Handle "Xem thêm" button click
  const handleLoadMore = () => {
    setVisibleTutors((prev) => prev + 3); 
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Find a Tutor
      </h2>

      {/* Language Filter */}
      <div className="mb-8 flex flex-wrap gap-2 justify-center">
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleLanguageFilter("")}
          sx={{
            backgroundColor: selectedLanguage === "" ? "#000000" : "#e5e7eb",
            color: selectedLanguage === "" ? "#ffffff" : "#000000",
            "&:hover": {
              backgroundColor: selectedLanguage === "" ? "#333333" : "#d1d5db",
            },
            padding: "6px 12px",
            borderRadius: "4px",
            textTransform: "none",
          }}
        >
          All
        </Button>
        {languages.map((language) => (
          <Button
            key={language}
            variant="outlined"
            onClick={() => handleLanguageFilter(language)}
            sx={{
              backgroundColor:
                selectedLanguage === language ? "#e5e7eb" : "transparent",
              color: selectedLanguage === language ? "#ffffff" : "#000000",
              borderColor: "#d1d5db",
              "&:hover": {
                backgroundColor:
                  selectedLanguage === language ? "#000000" : "#ffffff",
                borderColor: "#9ca3af",
              },
              padding: "6px 12px",
              borderRadius: "20px",
              textTransform: "none",
            }}
          >
            {language}
          </Button>
        ))}
      </div>

      {/* Tutor Grid */}
      {filteredTutors.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTutors.slice(0, visibleTutors).map((tutor) => (
              <TutorCard
                key={tutor.id}
                tutor={{
                  id: tutor.id,
                  name: tutor.name,
                  subjects:
                    Array.isArray(tutor.subjects) && tutor.subjects.length > 0
                      ? tutor.subjects.map((subject) => subject.name).join(", ")
                      : "N/A",
                  rating: tutor.rating,
                  reviews: tutor.ratingCount,
                  price: parseFloat(tutor.price) || 0,
                  imageUrl: tutor.avatar,
                  description: tutor.description,
                  address: tutor.address,
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
          No tutors found for the selected language.
        </p>
      )}
    </div>
  );
};

export default TutorList;