// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { fetchTutorById, fetchTutors } from "../api/auth";
// import {
//   FaStar,
//   FaUser,
//   FaComment,
//   FaBook,
//   FaUsers,
//   FaClock,
//   FaCheckCircle,
//   FaHeart,
// } from "react-icons/fa";
// import { motion, AnimatePresence } from "framer-motion";
// import ReviewsSection from "../ReviewSection";
// import TutorCard from "./TutorCard";
// import { FaArrowRight } from "react-icons/fa6";
// import Slider from "react-slick";
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";

// // Define the 4-hour time ranges
// const timeRanges = [
//   "00:00 - 04:00",
//   "04:00 - 08:00",
//   "08:00 - 12:00",
//   "12:00 - 16:00",
//   "16:00 - 20:00",
//   "20:00 - 24:00",
// ];

// const TutorProfile = ({ user, onRequireLogin }) => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [teacher, setTeacher] = useState(null);
//   const [tutors, setTutors] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [activeTab, setActiveTab] = useState("About Me");

//   // State for availability data, now structured by 4-hour blocks
//   const [availabilityData, setAvailabilityData] = useState({});
//   const [availabilityDays, setAvailabilityDays] = useState([]);
//   const [availabilityDates, setAvailabilityDates] = useState([]);

//   useEffect(() => {
//     if (!user) {
//       // Trigger login modal immediately for unauthenticated users
//       onRequireLogin("Please log in to contact this tutor.");
//       // Don't redirect; allow viewing the profile
//     }

//     const loadData = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         const teacherData = await fetchTutorById(id);
//         setTeacher(teacherData);

//         // --- Process and Set Availability Data into 4-hour blocks ---
//         const blockAvailability = {};
//         timeRanges.forEach(range => {
//           blockAvailability[range] = {
//             mon: false,
//             tue: false,
//             wed: false,
//             thu: false,
//             fri: false,
//             sat: false,
//             sun: false,
//           };
//         });

//         // Added a check to ensure teacherData.availability is an array
//         if (teacherData && Array.isArray(teacherData.availability)) {
//           teacherData.availability.forEach((timeSlot) => {
//             // Added checks for timeSlot and timeSlot.time before splitting
//             if (timeSlot && timeSlot.time) {
//                 const hour = parseInt(timeSlot.time.split(":")[0], 10);
//                 let timeRangeKey = null;

//                 if (hour >= 0 && hour < 4) timeRangeKey = "00:00 - 04:00";
//                 else if (hour >= 4 && hour < 8) timeRangeKey = "04:00 - 08:00";
//                 else if (hour >= 8 && hour < 12) timeRangeKey = "08:00 - 12:00";
//                 else if (hour >= 12 && hour < 16) timeRangeKey = "12:00 - 16:00";
//                 else if (hour >= 16 && hour < 20) timeRangeKey = "16:00 - 20:00";
//                 else if (hour >= 20 && hour < 24) timeRangeKey = "20:00 - 24:00";

//                 if (timeRangeKey && blockAvailability[timeRangeKey]) {
//                     // If any time slot within the block is available, mark the block as available for that day
//                     // Added checks for day properties before accessing them
//                     if (timeSlot.mon === true) blockAvailability[timeRangeKey].mon = true;
//                     if (timeSlot.tue === true) blockAvailability[timeRangeKey].tue = true;
//                     if (timeSlot.wed === true) blockAvailability[timeRangeKey].wed = true;
//                     if (timeSlot.thu === true) blockAvailability[timeRangeKey].thu = true;
//                     if (timeSlot.fri === true) blockAvailability[timeRangeKey].fri = true;
//                     if (timeSlot.sat === true) blockAvailability[timeRangeKey].sat = true;
//                     if (timeSlot.sun === true) blockAvailability[timeRangeKey].sun = true;
//                 }
//             } else {
//               // Optional: Log a warning if a time slot object or its time property is invalid
//               console.warn("Skipping invalid time slot data:", timeSlot);
//             }
//           });
//         }
//         setAvailabilityData(blockAvailability);
//         // --- End Process and Set Availability Data ---

//         const today = new Date();
//         const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
//         const next7Days = [];
//         const next7Dates = [];

//         for (let i = 0; i < 7; i++) {
//           const date = new Date(today);
//           date.setDate(today.getDate() + i);
//           next7Days.push(daysOfWeek[date.getDay()]);
//           next7Dates.push(date.getDate());
//         }

//         setAvailabilityDays(next7Days);
//         setAvailabilityDates(next7Dates);

//         const tutorsData = await fetchTutors();
//         const filteredTutors = tutorsData.filter((tutor) => tutor.id !== id);
//         setTutors(filteredTutors);
//       } catch (err) {
//         console.error("Failed to fetch data:", err);
//         setError(err.message || "Could not load data.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadData();
//   }, [id, user, navigate, onRequireLogin]);

//   const handleBookLesson = () => {
//     if (!user) {
//       onRequireLogin("Please log in to book a lesson.");
//       return;
//     }
//     // Proceed with booking logic (e.g., open booking modal or navigate)
//     console.log("Booking lesson for user:", user);
//   };

//   const handleClick = () => {
//     navigate("/languages");
//   };

//   if (loading) return <p className="text-center text-gray-500">Loading...</p>;
//   if (error) return <p className="text-center text-red-500">Error: {error}</p>;
//   if (!teacher)
//     return <p className="text-center text-gray-500">Teacher not found.</p>;

//   const interests = [
//     "Travel",
//     "Writing",
//     "Reading",
//     "Films & TV Series",
//     "Pets & Animals",
//   ];

//   const tabVariants = {
//     initial: { opacity: 0, x: 20 },
//     animate: { opacity: 1, x: 0 },
//     exit: { opacity: 0, x: -20 },
//   };

//   const sliderSettings = {
//     dots: false,
//     infinite: tutors.length > 3,
//     speed: 500,
//     slidesToShow: Math.min(tutors.length, 3),
//     slidesToScroll: 1,
//     responsive: [
//       {
//         breakpoint: 1024,
//         settings: {
//           slidesToShow: Math.min(tutors.length, 2),
//           slidesToScroll: 1,
//         },
//       },
//       {
//         breakpoint: 600,
//         settings: {
//           slidesToShow: 1,
//           slidesToScroll: 1,
//         },
//       },
//     ],
//   };

//   return (
//     <div className="container mx-auto px-4 py-12 bg-white min-h-screen rounded-3xl">
//       <div className="flex flex-col md:flex-row gap-8">
//         <div className="flex-1">
//           <div className="flex items-start gap-4">
//             <img
//               src={
//                 teacher.imageUrl || "https://via.placeholder.com/100?text=Avatar"
//               }
//               alt={teacher.name}
//               className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
//             />
//             <div className="flex-1">
//               <div className="flex justify-between items-start">
//                 <div>
//                   <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2 pb-3">
//                     {teacher.name}
//                   </h1>
//                   <p className="text-green-600 font-medium text-sm">
//                     {teacher.tag || "Professional Teacher"}
//                   </p>
//                   <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
//                     <span>Visited 11 hours ago</span>
//                     <span>Teaches</span>
//                     <span className="text-gray-800 font-medium">
//                       {teacher.nativeLanguage || "English"}
//                       <span className="ml-1 inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
//                         Native
//                       </span>
//                     </span>
//                   </div>
//                   <div className="mt-2 text-gray-600 text-sm">
//                     <span>Speaks</span>
//                     <div className="flex flex-wrap gap-2 mt-1">
//                       {teacher.subjects && teacher.subjects.length > 0 ? (
//                         teacher.subjects.map((subject, index) => (
//                           <div key={index} className="flex items-center gap-1">
//                             <span className="text-blue-600 font-medium">
//                               {subject.name}
//                             </span>
//                             <div className="flex gap-0.5">
//                               {[...Array(5)].map((_, i) => (
//                                 <div
//                                   key={i}
//                                   className={`w-1 h-4 rounded-full ${
//                                     i < subject.level
//                                       ? "bg-blue-600"
//                                       : "bg-gray-200"
//                                   }`}
//                                 />
//                               ))}
//                             </div>
//                           </div>
//                         ))
//                       ) : (
//                         <span className="text-gray-600">
//                           No additional languages
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//                 <button className="text-gray-600 hover:text-red-500">
//                   <FaHeart className="w-5 h-5" />
//                 </button>
//               </div>

//               <div className="mt-6 border-b border-gray-200">
//                 <div className="flex gap-4 text-sm font-medium text-gray-600">
//                   {[
//                     "About Me",
//                     "Me as a Teacher",
//                     "My lessons & teaching style",
//                     "Resume & Certificates",
//                   ].map((tab) => (
//                     <button
//                       key={tab}
//                       onClick={() => setActiveTab(tab)}
//                       className={`pb-2 px-1 ${
//                         activeTab === tab
//                           ? "border-b-2 border-red-500 text-gray-800"
//                           : "hover:text-gray-800"
//                       }`}
//                     >
//                       {tab}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               <div className="mt-4">
//                 <AnimatePresence mode="wait">
//                   <motion.div
//                     key={activeTab}
//                     variants={tabVariants}
//                     initial="initial"
//                     animate="animate"
//                     exit="exit"
//                     transition={{ duration: 0.3 }}
//                   >
//                     {activeTab === "About Me" && (
//                       <>
//                         <p className="text-gray-700 text-sm">
//                           From{" "}
//                           <span className="font-medium">{teacher.address}</span>
//                         </p>
//                         <p className="text-gray-700 text-sm mt-2">
//                           Italki teacher since{" "}
//                           <span className="font-medium">Oct 20, 2021</span>
//                         </p>
//                         <h3 className="text-gray-800 font-semibold mt-4">
//                           About Me
//                         </h3>
//                         <p className="text-gray-700 text-sm mt-2">
//                           Interests:{" "}
//                           {interests.map((interest, index) => (
//                             <span
//                               key={index}
//                               className="inline-block bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded mr-1"
//                             >
//                               {interest}
//                             </span>
//                           ))}
//                         </p>
//                         <p className="text-gray-700 text-sm mt-4 leading-relaxed">
//                           Hello! I’m {teacher.name}, a passionate tutor from{" "}
//                           {teacher.address}. I specialize in teaching{" "}
//                           {teacher.nativeLanguage}
//                           {teacher.subjects && teacher.subjects.length > 0
//                             ? ` and ${teacher.subjects
//                                 .map((s) => s.name)
//                                 .join(", ")}`
//                             : ""}
//                           . I’m TEFL certified and have taught over{" "}
//                           {teacher.lessons} lessons to {teacher.students}{" "}
//                           students. My teaching style is interactive and
//                           tailored to each student’s needs. Let’s learn
//                           together!
//                         </p>
//                         <button className="text-blue-600 text-sm mt-2 hover:underline">
//                           Read more
//                         </button>
//                       </>
//                     )}
//                     {activeTab === "Me as a Teacher" && (
//                       <p className="text-gray-700 text-sm leading-relaxed">
//                         As a teacher, I focus on creating a supportive and
//                         engaging environment. I adapt my lessons to suit each
//                         student’s learning style, ensuring they feel confident
//                         and motivated.
//                       </p>
//                     )}
//                     {activeTab === "My lessons & teaching style" && (
//                       <p className="text-gray-700 text-sm leading-relaxed">
//                         My lessons are interactive and student-centered. I use a
//                         mix of conversation practice, grammar exercises, and
//                         cultural insights to make learning fun and effective.
//                       </p>
//                     )}
//                     {activeTab === "Resume & Certificates" && (
//                       <div>
//                         <p className="text-gray-700 text-sm">
//                           Teacher ID: {teacher.id}
//                         </p>
//                         <div className="mt-2 flex flex-wrap gap-2">
//                           {teacher.certifications &&
//                           teacher.certifications.length > 0 ? (
//                             teacher.certifications.map((cert, index) => (
//                               <span
//                                 key={index}
//                                 className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full"
//                               >
//                                 {cert}
//                               </span>
//                             ))
//                           ) : (
//                             <p className="text-gray Ensino-700 text-sm">
//                               No certifications specified
//                             </p>
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </motion.div>
//                 </AnimatePresence>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="md:w-100"> {/* Consider adjusting width if needed */}
//           <div className="relative rounded-lg overflow-hidden shadow-md">
//             <iframe
//               src={
//                 teacher.videoUrl || "https://www.youtube.com/embed/x9tjWF5ArXc"
//               }
//               title={`${teacher.name} Introduction Video`}
//               className="w-full h-48" // Adjust height as necessary
//               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//               allowFullScreen
//             ></iframe>
//           </div>
//           <div className="mt-4 space-y-3">
//             <p className="text-gray-800 font-semibold text-sm">Trial Lesson</p>
//             <p className="text-red-500 font-bold text-lg">
//               USD {(parseFloat(teacher.price) * 0.5).toFixed(2)}
//             </p>
//             <button
//               onClick={handleBookLesson}
//               className="w-full bg-red-500 text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-red-600 transition"
//             >
//               Book Lesson
//             </button>
//             <button
//               onClick={() => {
//                 if (!user) {
//                   onRequireLogin("Please log in to contact this tutor.");
//                   return;
//                 }
//                 // Proceed with contact logic
//                 console.log("Contacting teacher:", teacher.name);
//               }}
//               className="w-full bg-gray-100 text-gray-800 py-3 rounded-lg border border-gray-300 hover:bg-gray-200 transition"
//             >
//               Contact teacher
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
//         <div className="bg-white p-6 rounded-xl shadow-md">
//           <p className="text-2xl font-bold text-gray-800">
//             {teacher.rating.toFixed(1)}
//           </p>
//           <div className="flex justify-center gap-1 mt-1">
//             {[...Array(5)].map((_, i) => (
//               <FaStar
//                 key={i}
//                 className={
//                   i < Math.round(teacher.rating)
//                     ? "text-yellow-400"
//                     : "text-gray-300"
//                 }
//               />
//             ))}
//           </div>
//           <p className="text-gray-600 mt-2">Rating</p>
//         </div>
//         <div className="bg-white p-6 rounded-xl shadow-md">
//           <p className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
//             <FaUsers className="text-blue-500" /> {teacher.students || 0}
//           </p>
//           <p className="text-gray-600 mt-2">Students</p>
//         </div>
//         <div className="bg-white p-6 rounded-xl shadow-md">
//           <p className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
//             <FaBook className="text-blue-500" /> {teacher.lessons || 0}
//           </p>
//           <p className="text-gray-600 mt-2">Lessons</p>
//         </div>
//         <div className="bg-white p-6 rounded-xl shadow-md">
//           <p className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
//             <FaClock className="text-blue-500" />{" "}
//             {teacher.responseRate || "N/A"}
//           </p>
//           <p className="text-gray-600 mt-2">Response Rate</p>
//         </div>
//       </div>

//       <div className="mt-10">
//         <h2 className="text-2xl font-semibold text-gray-800">
//           Lesson Packages
//         </h2>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
//           <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
//             <p className="text-lg font-semibold text-gray-800">Trial Lesson</p>
//             <p className="text-red-500 font-bold mt-2">
//               USD {(parseFloat(teacher.price) * 0.5).toFixed(2)}
//             </p>
//           </div>
//           <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
//             <p className="text-lg font-semibold text-gray-800">
//               Standard Lesson
//             </p>
//             <p className="text-red-500 font-bold mt-2">
//               USD {parseFloat(teacher.price).toFixed(2)}
//             </p>
//           </div>
//           <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
//             <p className="text-lg font-semibold text-gray-800">
//               Premium Package (5 Lessons)
//             </p>
//             <p className="text-red-500 font-bold mt-2">
//               USD {(parseFloat(teacher.price) * 5 * 0.9).toFixed(2)}
//             </p>
//             <p className="text-gray-600 text-sm mt-1">10% Discount!</p>
//           </div>
//         </div>
//       </div>

//       <div className="mt-10">
//         <h2 className="text-2xl font-semibold text-gray-800">Availability</h2>
//         {/* <div className="text-sm text-teal-500 mb-2">
//           Available 10:00 Tomorrow
//         </div> */}
//         <div className="mt-4 overflow-x-auto border border-gray-200 rounded-lg">
//           <div className="grid grid-cols-8 min-w-[600px]">
//             {/* Top-left empty cell */}
//             <div className="text-sm font-medium text-gray-600 border-b border-r border-gray-200"></div>
//             {/* Day and Date Headers */}
//             {availabilityDays.map((day, index) => (
//               <div
//                 key={day}
//                 className="text-center text-sm font-medium text-gray-800 py-2 border-b border-gray-200 last:border-r-0"
//               >
//                 {day}
//                 <br />
//                 <span className="text-xs text-gray-600">
//                   {availabilityDates[index]}
//                 </span>
//               </div>
//             ))}
//             {/* Availability Grid Cells */}
//             {timeRanges.map((timeRange) => (
//               <React.Fragment key={timeRange}>
//                 <div className="text-sm text-gray-600 py-2 px-2 border-r border-b border-gray-200 last:border-b-0 flex items-center">
//                   {timeRange}
//                 </div>
//                 {availabilityDays.map((day) => {
//                   const dayAbbrev = day.toLowerCase(); // Get lowercase abbreviation
//                   // Check if any time slot within this range is available for this day
//                   // Use optional chaining and strict comparison for boolean true
//                   const isAvailable = availabilityData[timeRange]?.[dayAbbrev] === true;

//                   return (
//                     <div
//                       key={`${timeRange}-${day}`}
//                       className={`h-12 border border-gray-200 last:border-b-0 ${
//                         isAvailable
//                           ? "bg-green-400 cursor-pointer hover:bg-green-500"
//                           : "bg-gray-100"
//                       } ${
//                         day === availabilityDays[availabilityDays.length - 1]
//                           ? "border-r border-gray-200"
//                           : ""
//                       }`}
//                     >
//                       {/* You could add an onClick handler here to select a slot */}
//                     </div>
//                   );
//                 })}
//               </React.Fragment>
//             ))}
//           </div>
//         </div>
//         <div className="flex justify-between items-center mt-4">
//           <div className="text-sm text-gray-500">
//              Based on your timezone (UTC+07:00) {/* Updated to match image */}
//           </div>
//           <button
//             onClick={handleBookLesson}
//             className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
//           >
//             Schedule lesson
//           </button>
//         </div>
//       </div>

//       <ReviewsSection teacher={teacher} />

//       <div className="mt-10">
//         <h2 className="text-2xl font-semibold text-gray-800 mb-6">
//           Recommended Tutors
//         </h2>
//         {tutors.length > 0 ? (
//           <Slider {...sliderSettings}>
//             {tutors.map((tutor) => (
//               <div key={tutor.id} className="px-3">
//                 <TutorCard
//                   tutor={{
//                     id: tutor.id,
//                     name: tutor.name,
//                     subjects:
//                       Array.isArray(tutor.subjects) && tutor.subjects.length > 0
//                         ? tutor.subjects
//                             .map((subject) => subject.name)
//                             .join(", ")
//                         : "N/A",
//                     rating: tutor.rating,
//                     reviews: tutor.ratingCount,
//                     price: parseFloat(tutor.price) || 0,
//                     imageUrl: tutor.imageUrl,
//                     description: tutor.description,
//                     address: tutor.address,
//                   }}
//                   user={user}
//                   onRequireLogin={onRequireLogin}
//                 />
//               </div>
//             ))}
//           </Slider>
//         ) : (
//           <p className="text-center text-gray-500">
//             No recommended tutors available at this time.
//           </p>
//         )}
//         <div className="mt-6 text-center">
//           <button
//             onClick={handleClick}
//             className="bg-[#333333] hover:bg-black text-white font-bold py-2 px-6 rounded-lg transition duration-150 ease-in-out"
//           >
//             <div className="flex items-center justify-center">
//               Xem thêm <FaArrowRight className="ml-2" />
//             </div>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TutorProfile;

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchTutorById, fetchTutors } from "../api/auth";
import {
  FaStar,
  FaUser,
  FaComment,
  FaBook,
  FaUsers,
  FaClock,
  FaCheckCircle,
  FaHeart,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import ReviewsSection from "../ReviewSection"; // Assuming this component exists
import TutorCard from "./TutorCard"; // Assuming this component exists
import { FaArrowRight } from "react-icons/fa6";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Define the 4-hour time ranges
const timeRanges = [
  "00:00 - 04:00",
  "04:00 - 08:00",
  "08:00 - 12:00",
  "12:00 - 16:00",
  "16:00 - 20:00",
  "20:00 - 24:00",
];

const TutorProfile = ({ user, onRequireLogin }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("About Me");

  // State for availability data, now structured by 4-hour blocks
  const [availabilityData, setAvailabilityData] = useState({});
  const [availabilityDays, setAvailabilityDays] = useState([]);
  const [availabilityDates, setAvailabilityDates] = useState([]);

  useEffect(() => {
    if (!user) {
      // Trigger login modal immediately for unauthenticated users
      onRequireLogin("Please log in to contact this tutor.");
      // Don't redirect; allow viewing the profile
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const teacherData = await fetchTutorById(id);
        setTeacher(teacherData);

        // --- Process and Set Availability Data into 4-hour blocks ---
        const blockAvailability = {};
        timeRanges.forEach(range => {
          blockAvailability[range] = {
            mon: false, tue: false, wed: false, thu: false,
            fri: false, sat: false, sun: false,
          };
        });

        if (teacherData && Array.isArray(teacherData.availability)) {
          teacherData.availability.forEach((timeSlot) => {
            if (timeSlot && timeSlot.time) {
                const hour = parseInt(timeSlot.time.split(":")[0], 10);
                let timeRangeKey = null;

                if (hour >= 0 && hour < 4) timeRangeKey = "00:00 - 04:00";
                else if (hour >= 4 && hour < 8) timeRangeKey = "04:00 - 08:00";
                else if (hour >= 8 && hour < 12) timeRangeKey = "08:00 - 12:00";
                else if (hour >= 12 && hour < 16) timeRangeKey = "12:00 - 16:00";
                else if (hour >= 16 && hour < 20) timeRangeKey = "16:00 - 20:00";
                else if (hour >= 20 && hour < 24) timeRangeKey = "20:00 - 24:00";

                if (timeRangeKey && blockAvailability[timeRangeKey]) {
                    if (timeSlot.mon === true) blockAvailability[timeRangeKey].mon = true;
                    if (timeSlot.tue === true) blockAvailability[timeRangeKey].tue = true;
                    if (timeSlot.wed === true) blockAvailability[timeRangeKey].wed = true;
                    if (timeSlot.thu === true) blockAvailability[timeRangeKey].thu = true;
                    if (timeSlot.fri === true) blockAvailability[timeRangeKey].fri = true;
                    if (timeSlot.sat === true) blockAvailability[timeRangeKey].sat = true;
                    if (timeSlot.sun === true) blockAvailability[timeRangeKey].sun = true;
                }
            } else {
              console.warn("Skipping invalid time slot data:", timeSlot);
            }
          });
        }
        setAvailabilityData(blockAvailability);
        // --- End Process and Set Availability Data ---

        const today = new Date();
        const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const next7Days = [];
        const next7Dates = [];

        for (let i = 0; i < 7; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          next7Days.push(daysOfWeek[date.getDay()]);
          next7Dates.push(date.getDate());
        }

        setAvailabilityDays(next7Days);
        setAvailabilityDates(next7Dates);

        const tutorsData = await fetchTutors();
        const filteredTutors = tutorsData.filter((tutor) => tutor.id !== id);
        setTutors(filteredTutors);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError(err.message || "Could not load data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, user, navigate, onRequireLogin]);

  const handleBookLesson = () => {
    if (!user) {
      onRequireLogin("Please log in to book a lesson.");
      return;
    }
    // Proceed with booking logic (e.g., open booking modal or navigate)
    console.log("Booking lesson for user:", user);
     // Example: navigate to a booking page, passing the teacher ID
    // navigate(`/book/${teacher.id}`);
  };

  // Updated handler for the "Contact teacher" button
  const handleContactTeacher = () => {
    if (!user) {
      onRequireLogin("Please log in to contact this tutor.");
      return;
    }
    // Navigate to the message page with the teacher's ID
    navigate(`/message/${teacher.id}`);
  };


  const handleClick = () => {
    navigate("/languages");
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;
  if (!teacher)
    return <p className="text-center text-gray-500">Teacher not found.</p>;

  const interests = [
    "Travel",
    "Writing",
    "Reading",
    "Films & TV Series",
    "Pets & Animals",
  ];

  const tabVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const sliderSettings = {
    dots: false,
    infinite: tutors.length > 3,
    speed: 500,
    slidesToShow: Math.min(tutors.length, 3),
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(tutors.length, 2),
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-12 bg-white min-h-screen rounded-3xl">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <div className="flex items-start gap-4">
            <img
              src={
                teacher.imageUrl || "https://via.placeholder.com/100?text=Avatar"
              }
              alt={teacher.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
            />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2 pb-3">
                    {teacher.name}
                  </h1>
                  <p className="text-green-600 font-medium text-sm">
                    {teacher.tag || "Professional Teacher"}
                  </p>
                  <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
                    <span>Visited 11 hours ago</span>
                    <span>Teaches</span>
                    <span className="text-gray-800 font-medium">
                      {teacher.nativeLanguage || "English"}
                      <span className="ml-1 inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                        Native
                      </span>
                    </span>
                  </div>
                  <div className="mt-2 text-gray-600 text-sm">
                    <span>Speaks</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {teacher.subjects && teacher.subjects.length > 0 ? (
                        teacher.subjects.map((subject, index) => (
                          <div key={index} className="flex items-center gap-1">
                            <span className="text-blue-600 font-medium">
                              {subject.name}
                            </span>
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-1 h-4 rounded-full ${
                                    i < subject.level
                                      ? "bg-blue-600"
                                      : "bg-gray-200"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-600">
                          No additional languages
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button className="text-gray-600 hover:text-red-500">
                  <FaHeart className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-6 border-b border-gray-200">
                <div className="flex gap-4 text-sm font-medium text-gray-600">
                  {[
                    "About Me",
                    "Me as a Teacher",
                    "My lessons & teaching style",
                    "Resume & Certificates",
                  ].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-2 px-1 ${
                        activeTab === tab
                          ? "border-b-2 border-red-500 text-gray-800"
                          : "hover:text-gray-800"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    variants={tabVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                  >
                    {activeTab === "About Me" && (
                      <>
                        <p className="text-gray-700 text-sm">
                          From{" "}
                          <span className="font-medium">{teacher.address}</span>
                        </p>
                        <p className="text-gray-700 text-sm mt-2">
                          Italki teacher since{" "}
                          <span className="font-medium">Oct 20, 2021</span> {/* Placeholder */}
                        </p>
                        <h3 className="text-gray-800 font-semibold mt-4">
                          About Me
                        </h3>
                        <p className="text-gray-700 text-sm mt-2">
                          Interests:{" "}
                          {interests.map((interest, index) => (
                            <span
                              key={index}
                              className="inline-block bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded mr-1"
                            >
                              {interest}
                            </span>
                          ))}
                        </p>
                        <p className="text-gray-700 text-sm mt-4 leading-relaxed">
                          Hello! I’m {teacher.name}, a passionate tutor from{" "}
                          {teacher.address}
                          . I specialize in teaching{" "}
                          {teacher.nativeLanguage}
                          {teacher.subjects && teacher.subjects.length > 0
                            ? ` and ${teacher.subjects
                                .map((s) => s.name)
                                .join(", ")}`
                            : ""}
                          . I’m TEFL certified and have taught over{" "}
                          {teacher.lessons} lessons to {teacher.students}{" "}
                          students. My teaching style is interactive and
                          tailored to each student’s needs. Let’s learn
                          together!
                        </p>
                        <button className="text-blue-600 text-sm mt-2 hover:underline">
                          Read more
                        </button>
                      </>
                    )}
                    {activeTab === "Me as a Teacher" && (
                      <p className="text-gray-700 text-sm leading-relaxed">
                        As a teacher, I focus on creating a supportive and
                        engaging environment. I adapt my lessons to suit each
                        student’s learning style, ensuring they feel confident
                        and motivated. {/* Placeholder */}
                      </p>
                    )}
                    {activeTab === "My lessons & teaching style" && (
                      <p className="text-gray-700 text-sm leading-relaxed">
                        My lessons are interactive and student-centered. I use a
                        mix of conversation practice, grammar exercises, and
                        cultural insights to make learning fun and effective. {/* Placeholder */}
                      </p>
                    )}
                    {activeTab === "Resume & Certificates" && (
                      <div>
                        <p className="text-gray-700 text-sm">
                          Teacher ID: {teacher.id}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {teacher.certifications &&
                          teacher.certifications.length > 0 ? (
                            teacher.certifications.map((cert, index) => (
                              <span
                                key={index}
                                className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full"
                              >
                                {cert}
                              </span>
                            ))
                          ) : (
                            <p className="text-gray Ensino-700 text-sm">
                              No certifications specified
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        <div className="md:w-100"> {/* Consider adjusting width if needed */}
          <div className="relative rounded-lg overflow-hidden shadow-md">
            <iframe
              src={
                teacher.videoUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ" // Changed placeholder to a generic embed
              }
              title={`${teacher.name} Introduction Video`}
              className="w-full h-48" // Adjust height as necessary
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <div className="mt-4 space-y-3">
            <p className="text-gray-800 font-semibold text-sm">Trial Lesson</p>
            <p className="text-red-500 font-bold text-lg">
              USD {(parseFloat(teacher.price) * 0.5).toFixed(2)} {/* Placeholder price calculation */}
            </p>
            <button
              onClick={handleBookLesson}
              className="w-full bg-red-500 text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-red-600 transition"
            >
              Book Lesson
            </button>
            <button
               // Use the new handler for contacting
              onClick={handleContactTeacher}
              className="w-full bg-gray-100 text-gray-800 py-3 rounded-lg border border-gray-300 hover:bg-gray-200 transition"
            >
              Contact teacher
            </button>
          </div>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <p className="text-2xl font-bold text-gray-800">
            {teacher.rating ? teacher.rating.toFixed(1) : "N/A"} {/* Added check */}
          </p>
          <div className="flex justify-center gap-1 mt-1">
             {[...Array(5)].map((_, i) => (
               <FaStar
                 key={i}
                 className={
                   teacher.rating && i < Math.round(teacher.rating)
                     ? "text-yellow-400"
                     : "text-gray-300"
                 }
               />
             ))}
          </div>
          <p className="text-gray-600 mt-2">Rating</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <p className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <FaUsers className="text-blue-500" /> {teacher.students || 0}
          </p>
          <p className="text-gray-600 mt-2">Students</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <p className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <FaBook className="text-blue-500" /> {teacher.lessons || 0}
          </p>
          <p className="text-gray-600 mt-2">Lessons</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <p className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <FaClock className="text-blue-500" />{" "}
            {teacher.responseRate || "N/A"}
          </p>
          <p className="text-gray-600 mt-2">Response Rate</p>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-semibold text-gray-800">
          Lesson Packages
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          {/* Added checks for teacher.price before parseFloat */}
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <p className="text-lg font-semibold text-gray-800">Trial Lesson</p>
            <p className="text-red-500 font-bold mt-2">
              USD {teacher.price ? (parseFloat(teacher.price) * 0.5).toFixed(2) : "N/A"}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <p className="text-lg font-semibold text-gray-800">
              Standard Lesson
            </p>
            <p className="text-red-500 font-bold mt-2">
              USD {teacher.price ? parseFloat(teacher.price).toFixed(2) : "N/A"}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <p className="text-lg font-semibold text-gray-800">
              Premium Package (5 Lessons)
            </p>
            <p className="text-red-500 font-bold mt-2">
              USD {teacher.price ? (parseFloat(teacher.price) * 5 * 0.9).toFixed(2) : "N/A"}
            </p>
            <p className="text-gray-600 text-sm mt-1">10% Discount!</p>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-semibold text-gray-800">Availability</h2>
        <div className="mt-4 overflow-x-auto border border-gray-200 rounded-lg">
          <div className="grid grid-cols-8 min-w-[600px]">
            {/* Top-left empty cell */}
            <div className="text-sm font-medium text-gray-600 border-b border-r border-gray-200"></div>
            {/* Day and Date Headers */}
            {availabilityDays.map((day, index) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-800 py-2 border-b border-gray-200 last:border-r-0"
              >
                {day}
                <br />
                <span className="text-xs text-gray-600">
                  {availabilityDates[index]}
                </span>
              </div>
            ))}
            {/* Availability Grid Cells */}
            {timeRanges.map((timeRange) => (
              <React.Fragment key={timeRange}>
                <div className="text-sm text-gray-600 py-2 px-2 border-r border-b border-gray-200 last:border-b-0 flex items-center">
                  {timeRange}
                </div>
                {availabilityDays.map((day) => {
                  const dayAbbrev = day.toLowerCase(); // Get lowercase abbreviation
                  const isAvailable = availabilityData[timeRange]?.[dayAbbrev] === true;

                  return (
                    <div
                      key={`${timeRange}-${day}`}
                      className={`h-12 border border-gray-200 last:border-b-0 ${
                        isAvailable
                          ? "bg-green-400 cursor-pointer hover:bg-green-500"
                          : "bg-gray-100"
                      } ${
                        day === availabilityDays[availabilityDays.length - 1]
                          ? "border-r border-gray-200"
                          : ""
                      }`}
                    >
                      {/* You could add an onClick handler here to select a slot */}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-500">
              Based on your timezone (UTC+07:00)
          </div>
          <button
            onClick={handleBookLesson} // This button could navigate to the booking flow with selected time slot
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            Schedule lesson
          </button>
        </div>
      </div>

      {/* Assuming ReviewsSection is a separate component */}
      <ReviewsSection teacher={teacher} />

      <div className="mt-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Recommended Tutors
        </h2>
        {tutors.length > 0 ? (
          <Slider {...sliderSettings}>
            {tutors.map((tutor) => (
              <div key={tutor.id} className="px-3">
                <TutorCard
                  tutor={{
                    id: tutor.id,
                    name: tutor.name,
                    subjects:
                      Array.isArray(tutor.subjects) && tutor.subjects.length > 0
                        ? tutor.subjects
                            .map((subject) => subject.name)
                            .join(", ")
                        : "N/A",
                    rating: tutor.rating,
                    reviews: tutor.ratingCount,
                    price: parseFloat(tutor.price) || 0,
                    imageUrl: tutor.imageUrl,
                    description: tutor.description,
                    address: tutor.address,
                  }}
                  user={user}
                  onRequireLogin={onRequireLogin}
                />
              </div>
            ))}
          </Slider>
        ) : (
          <p className="text-center text-gray-500">
            No recommended tutors available at this time.
          </p>
        )}
        <div className="mt-6 text-center">
          <button
            onClick={handleClick}
            className="bg-[#333333] hover:bg-black text-white font-bold py-2 px-6 rounded-lg transition duration-150 ease-in-out"
          >
            <div className="flex items-center justify-center">
              Xem thêm <FaArrowRight className="ml-2" /> {/* "See more" in Vietnamese */}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorProfile;