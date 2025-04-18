import React from "react";
import Slider from "react-slick";
import Tutor from "./Tutor"; // Import the Tutor component

// Import slick carousel styles
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Sample data for tutors (can be fetched from an API later)
const tutors = [
  {
    id: 1,
    name: "Sarah Johnson",
    languages: "English, Spanish",
    rating: 4.9,
    reviews: 127,
    rate: 25,
    imageUrl:
      "https://avataaars.io/?avatarStyle=Circle&topType=WinterHat4&accessoriesType=Blank&hatColor=PastelYellow&hairColor=Blonde&facialHairType=MoustacheMagnum&facialHairColor=Brown&clotheType=Overall&clotheColor=PastelBlue&eyeType=WinkWacky&eyebrowType=SadConcerned&mouthType=Sad&skinColor=Light",
  },
  {
    id: 2,
    name: "Marco Silva",
    languages: "Portuguese, Italian",
    rating: 4.8,
    reviews: 93,
    rate: 20,
    imageUrl:
      "https://avataaars.io/?avatarStyle=Circle&topType=Turban&accessoriesType=Prescription02&hatColor=Blue02&facialHairType=Blank&facialHairColor=Red&clotheType=Overall&clotheColor=Pink&eyeType=WinkWacky&eyebrowType=UpDown&mouthType=Twinkle&skinColor=Yellow",
  },
  {
    id: 3,
    name: "Yuki Tanaka",
    languages: "Japanese, Korean",
    rating: 4.9,
    reviews: 156,
    rate: 30,
    imageUrl:
      "https://avataaars.io/?avatarStyle=Circle&topType=LongHairStraight&accessoriesType=Prescription01&hatColor=Black&hairColor=BlondeGolden&facialHairType=Blank&clotheType=Overall&clotheColor=Black&eyeType=Cry&eyebrowType=FlatNatural&mouthType=Vomit&skinColor=Light",
  },
  {
    // Add more tutors for the carousel effect
    id: 4,
    name: "Aisha Khan",
    languages: "Arabic, French",
    rating: 4.7,
    reviews: 110,
    rate: 28,
    imageUrl:
      "https://avataaars.io/?avatarStyle=Circle&topType=Hat&accessoriesType=Kurt&hairColor=Black&facialHairType=BeardLight&facialHairColor=Platinum&clotheType=ShirtCrewNeck&clotheColor=Blue02&eyeType=Hearts&eyebrowType=UpDownNatural&mouthType=Disbelief&skinColor=Pale",
  },
  {
    id: 5,
    name: "Chen Wei",
    languages: "Mandarin, English",
    rating: 4.9,
    reviews: 205,
    rate: 32,
    imageUrl:
      "https://avataaars.io/?avatarStyle=Circle&topType=Hat&accessoriesType=Prescription02&hairColor=SilverGray&facialHairType=MoustacheFancy&facialHairColor=Red&clotheType=GraphicShirt&clotheColor=Blue01&graphicType=Skull&eyeType=Side&eyebrowType=SadConcerned&mouthType=Serious&skinColor=Pale",
  },
];

const TutorList = () => {
  // Settings for the react-slick carousel
  const settings = {
    dots: true, // Show navigation dots
    infinite: true, // Loop the carousel
    speed: 500, // Transition speed
    slidesToShow: 3, // Number of slides to show at once
    slidesToScroll: 1, // Number of slides to scroll at a time
    autoplay: true, // Enable autoplay
    autoplaySpeed: 3000, // Autoplay interval
    pauseOnHover: true, // Pause autoplay on hover
    responsive: [
      // Responsive settings
      {
        breakpoint: 1024, // Medium screens
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600, // Small screens
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
    // Custom arrow styles (optional, using Tailwind)
    // You might need to adjust positioning based on your layout
    prevArrow: (
      <button className="slick-prev slick-arrow absolute top-1/2 -left-4 z-10 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md">
        {"<"}
      </button>
    ),
    nextArrow: (
      <button className="slick-next slick-arrow absolute top-1/2 -right-4 z-10 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md">
        {">"}
      </button>
    ),
  };

  return (
    <div className="container mx-auto px-4 py-12 relative">
      {" "}
      {/* Added relative positioning for arrows */}
      <h2 className="text-3xl font-semibold text-center mb-10">
        Featured Teachers
      </h2>
      <Slider {...settings} className="mx-4">
        {" "}
        {/* Added margin for arrow spacing */}
        {tutors.map((tutor) => (
          // Each Tutor component is now a slide
          <Tutor key={tutor.id} tutor={tutor} />
        ))}
      </Slider>
    </div>
  );
};

export default TutorList;
