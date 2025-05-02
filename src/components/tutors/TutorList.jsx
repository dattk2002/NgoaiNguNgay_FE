import React, { useState, useEffect } from "react";
import TutorCard from "./TutorCard";
import { fetchTutors } from "../api/auth";
import { FaArrowRight } from "react-icons/fa";

const TutorList = ({ user }) => {
  const [tutors, setTutors] = useState([]);
  const [filteredTutors, setFilteredTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayedTutorsCount, setDisplayedTutorsCount] = useState(6);
  const [selectedLanguage, setSelectedLanguage] = useState("All");

  useEffect(() => {
    const loadTutors = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchTutors();
        setTutors(data);
        setFilteredTutors(data);
      } catch (err) {
        console.error("Failed to fetch tutors:", err);
        setError(err.message || "Không thể tải danh sách giáo viên.");
      } finally {
        setLoading(false);
      }
    };

    loadTutors();
  }, []);

  useEffect(() => {
    if (selectedLanguage === "All") {
      setFilteredTutors(tutors);
    } else {
      setFilteredTutors(
        tutors.filter((tutor) => {
          if (!Array.isArray(tutor.subjects)) {
            console.warn("Invalid tutor subjects:", tutor);
            return false;
          }
          return tutor.subjects.some((subject) =>
            subject.name.toLowerCase() === selectedLanguage.toLowerCase()
          );
        })
      );
    }
    setDisplayedTutorsCount(6);
  }, [selectedLanguage, tutors]);

  const handleShowMore = () => {
    setDisplayedTutorsCount((prevCount) => prevCount + 6);
  };

  const languages = [
    "All",
    "Vietnamese",
    "Chinese",
    "French",
    "German",
    "English",
    "Italian",
    "Japanese",
    "Spanish",
    "Korean",
    "Russian",
    "Portuguese",
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-black text-3xl font-semibold text-center mb-5">
        Featured Teachers
      </h2>

      <div className="flex justify-center my-16 space-x-2 overflow-x-auto">
        {languages.map((language) => (
          <button
            key={language}
            onClick={() => setSelectedLanguage(language)}
            className={`px-4 py-2 rounded-4xl text-sm font-medium transition duration-150 ease-in-out ${
              selectedLanguage === language
                ? "bg-[#333333] text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {language}
          </button>
        ))}
      </div>

      {loading && <p className="text-center">Loading tutors...</p>}
      {error && <p className="text-center text-red-500">Error: {error}</p>}
      {!loading && !error && filteredTutors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-28">
          {filteredTutors.slice(0, displayedTutorsCount).map((tutor) => (
            <TutorCard
              key={tutor.id}
              tutor={{
                id: tutor.id,
                name: tutor.name,
                subjects: Array.isArray(tutor.subjects) && tutor.subjects.length > 0
                  ? tutor.subjects.map((subject) => subject.name).join(", ")
                  : "N/A",
                rating: tutor.rating,
                reviews: tutor.ratingCount,
                price: parseFloat(tutor.price) || 0,
                imageUrl: tutor.avatar,
                description: tutor.description,
                address: tutor.address,
              }}
            />
          ))}
        </div>
      )}
      {!loading && !error && displayedTutorsCount < filteredTutors.length && (
        <div className="text-center mt-8">
          <button
            onClick={handleShowMore}
            className="bg-[#333333] hover:bg-black text-white font-bold py-2 px-6 rounded-lg transition duration-150 ease-in-out"
          >
            <div className="flex items-center justify-center">
              Xem thêm <FaArrowRight className="ml-2" />
            </div>
          </button>
        </div>
      )}
      {!loading && !error && filteredTutors.length === 0 && (
        <p className="text-center text-gray-500">
          No tutors found for this language.
        </p>
      )}
    </div>
  );
};

export default TutorList;