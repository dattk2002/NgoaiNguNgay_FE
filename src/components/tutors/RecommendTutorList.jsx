import React, { useState, useEffect } from "react";
import { Button, Typography, Box, Container } from "@mui/material";
import { FaArrowRight } from "react-icons/fa6";
import { fetchRecommendTutor } from "../api/auth";
import RecommendTutorCard from "./RecommendTutorCard";
import { formatLanguageCode } from "../../utils/formatLanguageCode";
import { Skeleton } from "@mui/material";
import { languageList } from "../../utils/languageList";
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
  const [visibleTutors, setVisibleTutors] = useState(3);

  useEffect(() => {
    const loadTutors = async () => {
      try {
        setLoading(true);
        // Load all tutors by default (no language filter)
        const tutorsData = await fetchRecommendTutor();
        setTutors(tutorsData);
        setFilteredTutors(tutorsData);
        setSelectedLanguage(""); // Set empty string to indicate "all languages"
      } catch (err) {
        setError(err.message || "Could not load recommended tutors.");
      } finally {
        setLoading(false);
      }
    };

    loadTutors();
  }, []);

  const handleLanguageFilter = async (language) => {
    try {
      setSelectedLanguage(language);
      setVisibleTutors(3);
      setLoading(true);
      setError(null);
      
      // If no language is selected, show all tutors
      if (language === "") {
        const tutorsData = await fetchRecommendTutor();
        setTutors(tutorsData);
        setFilteredTutors(tutorsData);
      } else {
        // Filter by specific language
        const tutorsData = await fetchRecommendTutor(language);
        setTutors(tutorsData);
        setFilteredTutors(tutorsData);
      }
    } catch (err) {
      setError(err.message || "Could not load recommended tutors for the selected language.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    setVisibleTutors((prev) => prev + 3);
  };

  if (loading) {
    return (
      <Box sx={{ 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #f5f7fa 100%)',
        minHeight: '100vh',
        py: 6
      }}>
        <Container maxWidth="xl">
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              textAlign: 'center', 
              mb: 8, 
              fontWeight: 700,
              background: 'linear-gradient(45deg, #1a1a1a, #4a4a4a)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '2rem', md: '3rem' }
            }}
          >
            Tìm gia sư
          </Typography>
          
          <Box sx={{ mb: 8 }}>
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton 
                  key={i} 
                  variant="rectangular" 
                  width={120} 
                  height={40} 
                  sx={{ borderRadius: 3 }}
                />
              ))}
            </Box>
          </Box>

          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            gap: 4,
            px: { xs: 2, md: 4 }
          }}>
            {[1, 2, 3].map((i) => (
              <Box key={i} sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                p: 4, 
                borderRadius: 4, 
                bgcolor: 'white', 
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <Skeleton variant="circular" width={100} height={100} sx={{ mb: 2 }} />
                <Skeleton variant="text" width={140} height={36} sx={{ mb: 1 }} />
                <Skeleton variant="text" width={200} height={28} sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" width="100%" height={80} sx={{ mb: 2 }} />
                <Skeleton variant="text" width="70%" height={24} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="50%" height={24} />
              </Box>
            ))}
          </Box>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #f5f7fa 100%)'
      }}>
        <Typography variant="h6" color="error" sx={{ textAlign: 'center' }}>
          Lỗi: {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      background: '#F3F4F6',
      minHeight: '100vh',
      py: 6
    }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(45deg, #1a1a1a, #4a4a4a)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '2rem', md: '3rem' },
              mb: 2
            }}
          >
            Tìm gia sư
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{ 
              fontWeight: 400,
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            Khám phá đội ngũ gia sư chất lượng cao với nhiều ngôn ngữ khác nhau
          </Typography>
        </Box>

        {/* Language Filter */}
        <Box sx={{ mb: 8 }}>      
          {/* All Languages Button */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mb: 3 
          }}>
            <Button
              variant="contained"
              onClick={() => handleLanguageFilter("")}
              sx={{
                backgroundColor: selectedLanguage === "" ? "#333333" : "#e5e7eb",
                color: selectedLanguage === "" ? "#ffffff" : "#374151",
                fontWeight: 600,
                fontSize: '0.9rem',
                textTransform: "none",
                padding: "8px 16px",
                borderRadius: "20px",
                "&:hover": {
                  backgroundColor: selectedLanguage === "" ? "#4b5563" : "#d1d5db",
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                },
                transition: 'all 0.2s ease',
                boxShadow: selectedLanguage === "" ? '0 2px 8px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              Hiển thị tất cả ngôn ngữ
            </Button>
          </Box>
          
          <Slider {...sliderSettings} style={{ width: "90%", margin: "0 auto" }}>
            {languages.map((language) => (
              <div key={language}>
                <Button
                  variant="outlined"
                  onClick={() => handleLanguageFilter(language)}
                  sx={{
                    background: selectedLanguage === language 
                      ? 'linear-gradient(45deg, #1a1a1a, #4a4a4a)' 
                      : 'linear-gradient(45deg, #ffffff, #f8f9fa)',
                    color: selectedLanguage === language ? "#ffffff" : "#495057",
                    border: selectedLanguage === language 
                      ? '2px solid #1a1a1a' 
                      : '2px solid #dee2e6',
                    "&:hover": {
                      background: selectedLanguage === language 
                        ? 'linear-gradient(45deg, #333333, #666666)' 
                        : 'linear-gradient(45deg, #f8f9fa, #e9ecef)',
                      borderColor: selectedLanguage === language ? "#333333" : "#adb5bd",
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                    },
                    padding: "12px 24px",
                    borderRadius: "25px",
                    textTransform: "none",
                    width: "90%",
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    transition: 'all 0.3s ease',
                    boxShadow: selectedLanguage === language 
                      ? '0 4px 15px rgba(0,0,0,0.2)' 
                      : '0 2px 10px rgba(0,0,0,0.1)',
                  }}
                >
                  {getLanguageName(language)}
                </Button>
              </div>
            ))}
          </Slider>
        </Box>

        {/* Tutor Grid */}
        {filteredTutors.length > 0 ? (
          <>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
              gap: 4,
              px: { xs: 2, md: 4 },
              mb: 6
            }}>
              {filteredTutors.slice(0, visibleTutors).map((tutor) => (
                <RecommendTutorCard
                  key={tutor.tutorId}
                  tutor={{
                    tutorId: tutor.tutorId,
                    name: tutor.fullName,
                    subjects:
                      Array.isArray(tutor.languages) && tutor.languages.length > 0
                        ? tutor.languages.map((lang) => lang.languageCode).join(", ")
                        : "N/A",
                    rating: tutor.rating || 0,
                    reviews: tutor.totalReviews || 0,
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
            </Box>
            
            {/* Load More Button */}
            {visibleTutors < filteredTutors.length && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mt: 8 
              }}>
                <NoFocusOutLineButton
                  variant="contained"
                  onClick={handleLoadMore}
                  sx={{
                    background: 'linear-gradient(45deg, #1a1a1a, #4a4a4a)',
                    color: "#ffffff",
                    "&:hover": {
                      background: 'linear-gradient(45deg, #333333, #666666)',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 12px 35px rgba(0,0,0,0.25)',
                    },
                    padding: "16px 32px",
                    borderRadius: "30px",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    transition: 'all 0.3s ease',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                  }}
                >
                  Xem thêm
                  <FaArrowRight style={{ fontSize: '1.2rem' }} />
                </NoFocusOutLineButton>
              </Box>
            )}
          </>
        ) : (
          <Box sx={{ 
            textAlign: 'center', 
            py: 8,
            px: 4
          }}>
            <Typography 
              variant="h6" 
              color="text.secondary"
              sx={{ 
                fontWeight: 500,
                maxWidth: 500,
                mx: 'auto'
              }}
            >
              Không tìm thấy gia sư nào cho ngôn ngữ đã chọn.
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ 
                mt: 2,
                opacity: 0.8
              }}
            >
              Vui lòng thử chọn ngôn ngữ khác hoặc quay lại sau.
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default RecommendTutorList;