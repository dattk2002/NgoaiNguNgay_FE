import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCommentDots, FaWallet } from "react-icons/fa";
import logo from "../assets/logo.png";
import NoFocusOutLineButton from '../utils/noFocusOutlineButton';

// Utility functions for role checking
const hasRole = (user, roleName) => {
  if (!user || !user.roles) return false;

  // Handle both string and array formats
  const roles = Array.isArray(user.roles) ? user.roles : [user.roles];

  // Handle case variations and string matching
  return roles.some(role => {
    if (typeof role === 'string') {
      return role.toLowerCase() === roleName.toLowerCase();
    }
    // Handle object format if roles are objects with name property
    if (role && role.name) {
      return role.name.toLowerCase() === roleName.toLowerCase();
    }
    return false;
  });
};

const isTutor = (user) => hasRole(user, "Tutor");
const isLearner = (user) => {
  if (!user || !user.roles) return false;
  const roles = Array.isArray(user.roles) ? user.roles : [user.roles];
  // Only return true if the user has exactly one role and it is "Learner"
  return roles.length === 1 && hasRole(user, "Learner");
};

function Header({ user, onLogout, onLoginClick, onSignUpClick, firstTutorId }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(null);
  const [avatarKey, setAvatarKey] = useState(Date.now());
  const dropdownRef = useRef(null);
  const imgRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.profileImageUrl) {
      const urlWithTimestamp = user.profileImageUrl.includes("?")
        ? user.profileImageUrl
        : `${user.profileImageUrl}?t=${Date.now()}`;

      setCurrentAvatar(urlWithTimestamp);
      setAvatarKey(Date.now());

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = urlWithTimestamp;
    }
  }, [user]);

  useEffect(() => {
    const handleStorageChange = () => {
      console.log("Storage change detected - checking for user updates");
      try {
        const updatedUser = JSON.parse(localStorage.getItem("user"));
        if (updatedUser && updatedUser.profileImageUrl) {
          const timestamp = Date.now();
          let newUrl = updatedUser.profileImageUrl;
          if (!newUrl.includes("?")) {
            newUrl = `${newUrl}?t=${timestamp}`;
          }

          console.log("Updated avatar from storage event:", newUrl);
          setCurrentAvatar(newUrl);
          setAvatarKey(timestamp);

          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = newUrl;

          if (imgRef.current) {
            imgRef.current.src = newUrl;
          }
        }
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const handleAvatarUpdate = (event) => {
      console.log("Avatar update event received in Header:", event.detail);
      if (event.detail && event.detail.profileImageUrl) {
        console.log(
          "Setting new avatar URL in Header:",
          event.detail.profileImageUrl
        );

        let newUrl = event.detail.profileImageUrl;
        if (!newUrl.includes("?")) {
          newUrl = `${newUrl}?t=${Date.now()}`;
        }

        setCurrentAvatar(newUrl);
        setAvatarKey(Date.now());

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = newUrl;
        img.onload = () => {
          console.log("Avatar preloaded in Header component");
          setAvatarKey(Date.now() + 1);

          if (imgRef.current) {
            imgRef.current.src = newUrl + "&reload=" + Date.now();
          }
        };
      }
    };

    window.addEventListener("avatar-updated", handleAvatarUpdate);

    return () => {
      window.removeEventListener("avatar-updated", handleAvatarUpdate);
    };
  }, []);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.profileImageUrl) {
          const timestamp = Date.now();
          let newUrl = parsedUser.profileImageUrl;

          if (!newUrl.includes("?")) {
            newUrl = `${newUrl}?t=${timestamp}`;
          }

          console.log("Updated avatar from localStorage in Header:", newUrl);
          setCurrentAvatar(newUrl);
          setAvatarKey(timestamp);

          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = newUrl;
        }
      }
    } catch (error) {
      console.error("Error parsing user from localStorage in Header:", error);
    }
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    setIsMenuOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: { duration: 0.15, ease: "easeOut" },
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.2, ease: "easeIn" },
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: { duration: 0.15, ease: "easeOut" },
    },
  };

  const headerVariants = {
    top: {
      position: "relative",
      backgroundColor: "rgba(255, 255, 255, 0)",
      boxShadow: "0 0px 0px 0px rgba(0, 0, 0, 0)",
      borderBottomWidth: "0px",
    },
    scrolled: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: "rgba(255, 255, 255, 1)",
      boxShadow:
        "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
      borderColor: "rgb(229 231 235)",
    },
  };



  return (
    <>
      <motion.header
        className="w-full z-50"
        variants={headerVariants}
        initial="top"
        animate={isScrolled ? "scrolled" : "top"}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="w-full px-4 sm:px-6 flex justify-between items-center">
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              to="/"
              className="text-black text-lg sm:text-xl font-semibold"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <img src={logo} alt="logo" className="w-20 h-20" />
            </Link>
            <div className="hidden md:flex items-center gap-4 sm:gap-6">
              {isTutor(user) ? (
                <Link
                  to="/tutor-management"
                  className="text-gray-700 hover:text-black text-sm sm:text-base"
                >
                  Quản lí dạy học
                </Link>
              ) : (
                <Link
                  to="/become-tutor"
                  className="text-gray-700 hover:text-black text-sm sm:text-base"
                >
                  Trở thành gia sư
                </Link>
              )}

              <Link
                to="/languages"
                className="text-gray-700 hover:text-black text-sm sm:text-base"
              >
                Ngôn ngữ
              </Link>

              <Link
                to="/how-it-works"
                className="text-gray-700 hover:text-black text-sm sm:text-base"
              >
                Cách hoạt động
              </Link>

              <Link
                to="/pricing"
                className="text-gray-700 hover:text-black text-sm sm:text-base"
              >
                Giá cả
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <>
                <Link
                  to="#"
                  className="relative group p-0.5 focus:outline-none z-10 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    if (firstTutorId) {
                      navigate(`/message/${firstTutorId}`);
                    } else {
                      alert("Bạn chưa từng nhắn tin với gia sư nào.");
                    }
                  }}
                >
                  <div className="absolute inset-0 rounded-full -z-10"></div>
                  <span className="p-1">
                    <FaCommentDots className="w-6 h-6 text-gray-700" />
                  </span>
                </Link>

                <Link
                  to="/wallet"
                  className="relative group p-0.5 focus:outline-none z-10 cursor-pointer"
                  title="Ví điện tử"
                >
                  <div className="absolute inset-0 rounded-full -z-10"></div>
                  <span className="p-1">
                    <FaWallet className="w-6 h-6 text-gray-700" />
                  </span>
                </Link>

                <div className="relative" ref={dropdownRef}>
                  <div
                    onClick={toggleDropdown}
                    className="relative group flex items-center gap-1 sm:gap-1.5 p-0.5 focus:outline-none z-10 cursor-pointer"
                    aria-expanded={isDropdownOpen}
                    aria-label="Menu người dùng"
                  >
                    <div className="absolute inset-0 bg-[#333333] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-150 -z-10"></div>

                    <span className="p-1">
                      <svg
                        className="w-6 h-6 text-gray-700 group-hover:text-white transition-colors duration-150"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </span>
                    <div className="relative rounded-full border border-gray-300 group-hover:border-transparent transition-colors duration-150">
                      <img
                        ref={imgRef}
                        key={avatarKey}
                        src={
                          currentAvatar ||
                          "https://avatar.iran.liara.run/public"
                        }
                        alt="Ảnh đại diện người dùng"
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover block"
                        onError={(e) => {
                          console.error("Image error in Header:", e.target.src);
                          e.target.src = "https://avatar.iran.liara.run/public";
                        }}
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        style={{ maxWidth: "100%" }}
                        loading="eager"
                      />
                    </div>
                  </div>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200 origin-top-right"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={dropdownVariants}
                      >
                        <div className="block px-4 py-2 text-sm text-gray-700 font-bold">{`${user.name || user.fullName
                          }`}</div>
                        <Link
                          to="/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-medium"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Bảng điều khiển của tôi
                        </Link>
                        <Link
                          to="/wallet"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-medium"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Ví điện tử
                        </Link>
                        <Link
                          to="/messages"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-medium"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Tin nhắn & Buổi học
                        </Link>
                        {isTutor(user) && (
                          <Link
                            to="/create-ad"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-medium"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            Tạo quảng cáo
                          </Link>
                        )}
                        <div className="border-t border-gray-100 my-1"></div>
                        <Link
                          to={user && user.id ? `/user/${user.id}` : "/"}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Hồ sơ của tôi
                        </Link>
                        {isLearner(user) && (
                          <Link
                            to="/my-bookings"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            Booking của tôi
                          </Link>
                        )}
                        {isTutor(user) && (
                          <Link
                            to={`/tutor-profile/${user?.id}`}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            Hồ sơ gia sư
                          </Link>
                        )}

                        <button
                          onClick={() => {
                            onLogout();
                            setIsDropdownOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Đăng xuất
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <NoFocusOutLineButton onClick={onLoginClick} className="text-black px-3 sm:px-4 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-semibold border border-gray-300 hover:bg-gray-100">
                  Đăng nhập
                </NoFocusOutLineButton>
                <NoFocusOutLineButton onClick={onSignUpClick} className="bg-black text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-semibold hover:bg-[#333333]">
                  Đăng ký
                </NoFocusOutLineButton>
              </>
            )}
            <button
              className="md:hidden p-2 text-gray-700 hover:text-black"
              onClick={toggleMenu}
              aria-label="Chuyển đổi menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={
                    isMenuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden bg-white border-b border-gray-200 overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="flex flex-col px-4 py-2 space-y-2">
                {isTutor(user) ? (
                  <Link
                    to="/tutor-management"
                    className="text-gray-700 hover:text-black text-sm py-2"
                    onClick={toggleMenu}
                  >
                    Quản lí dạy học
                  </Link>
                ) : (
                  <Link
                    to="/become-tutor"
                    className="text-gray-700 hover:text-black text-sm py-2"
                    onClick={toggleMenu}
                  >
                    Trở thành gia sư
                  </Link>
                )}
                <Link
                  to="/languages"
                  className="text-gray-700 hover:text-black text-sm py-2"
                  onClick={toggleMenu}
                >
                  Ngôn ngữ
                </Link>
                <Link
                  to="/how-it-works"
                  className="text-gray-700 hover:text-black text-sm py-2"
                  onClick={toggleMenu}
                >
                  Cách hoạt động
                </Link>
                <Link
                  to="/pricing"
                  className="text-gray-700 hover:text-black text-sm py-2"
                  onClick={toggleMenu}
                >
                  Giá cả
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}

export default Header;
