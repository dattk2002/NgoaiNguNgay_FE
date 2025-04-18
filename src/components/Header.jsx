import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

function Header({ user, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);

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

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Dropdown animation variants
  const dropdownVariants = {
    hidden: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: { duration: 0.15, ease: "easeOut" }
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.2, ease: "easeIn" }
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: { duration: 0.15, ease: "easeOut" }
    }
  };

  // Header animation variants
  const headerVariants = {
    top: {
      position: 'relative',
      backgroundColor: 'rgba(255, 255, 255, 0)',
      boxShadow: '0 0px 0px 0px rgba(0, 0, 0, 0)',
      borderBottomWidth: '0px',
    },
    scrolled: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(255, 255, 255, 1)',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
      borderColor: 'rgb(229 231 235)',
    }
  };

  return (
    <motion.header
      className="w-full z-50"
      variants={headerVariants}
      initial="top"
      animate={isScrolled ? "scrolled" : "top"}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="w-full px-4 sm:px-6 py-4 flex justify-between items-center">
        {/* Logo and Navigation Links */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link to="/" className="text-black text-lg sm:text-xl font-semibold">
            NgoaiNguNgay
          </Link>
          {/* Navigation Links - Hidden on mobile, visible on larger screens */}
          <div className="hidden md:flex items-center gap-4 sm:gap-6">
            <Link
              to="/teachers"
              className="text-gray-700 hover:text-black text-sm sm:text-base"
            >
              Find teachers
            </Link>
            <Link
              to="/languages"
              className="text-gray-700 hover:text-black text-sm sm:text-base"
            >
              Languages
            </Link>
            <Link
              to="/how-it-works"
              className="text-gray-700 hover:text-black text-sm sm:text-base"
            >
              How it works
            </Link>
            <Link
              to="/pricing"
              className="text-gray-700 hover:text-black text-sm sm:text-base"
            >
              Pricing
            </Link>
          </div>
        </div>

        {/* Right Side: User Actions and Hamburger Menu */}
        <div
          className="flex items-center gap-2 sm:gap-3"
        >
          {/* User Actions - Adjust padding and font size responsively */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <div
                onClick={toggleDropdown}
                className="relative group flex items-center gap-1 sm:gap-1.5 p-0.5 focus:outline-none z-10"
                aria-expanded={isDropdownOpen}
                aria-label="User menu"
              >
                <div className="absolute inset-0 bg-[#969bff] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-150 -z-10"></div>
                <span className="p-1">
                  <svg
                    className="w-6 h-6 text-gray-700 group-hover:text-black transition-colors duration-150"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d={isDropdownOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
                    />
                  </svg>
                </span>
                <div className="relative rounded-full border border-gray-300 group-hover:border-transparent transition-colors duration-150">
                  <img
                    src={
                      user.avatarUrl ||
                      "https://avataaars.io/?avatarStyle=Circle&topType=ShortHairTheCaesarSidePart&accessoriesType=Sunglasses&hairColor=SilverGray&facialHairType=BeardLight&facialHairColor=BrownDark&clotheType=ShirtCrewNeck&clotheColor=Blue01&graphicType=Selena&eyeType=EyeRoll&eyebrowType=FlatNatural&mouthType=Grimace&skinColor=DarkBrown"
                    }
                    alt="User avatar"
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover block"
                  />
                </div>
              </div>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    className="absolute right-0 mt-3 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200 origin-top-right"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={dropdownVariants}
                  >
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-medium"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      My Dashboard
                    </Link>
                    <Link
                      to="/messages"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-medium"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Messages & Lessons
                    </Link>
                    <Link
                      to="/create-ad"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-medium"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Create an ad
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      onClick={() => {
                        onLogout();
                        setIsDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Log Out
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="text-black px-3 sm:px-4 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-semibold border border-gray-300 hover:bg-gray-100"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-semibold hover:bg-[#333333] hover:text-white"
              >
                Sign up
              </Link>
            </>
          )}
          {/* Hamburger Menu - Visible on mobile only */}
          <button
            className="md:hidden p-2 text-gray-700 hover:text-black"
            onClick={toggleMenu}
            aria-label="Toggle menu"
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
                d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu - Visible when hamburger is clicked */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200">
          <div className="flex flex-col px-4 py-2 space-y-2">
            <Link
              to="/teachers"
              className="text-gray-700 hover:text-black text-sm py-2"
              onClick={toggleMenu}
            >
              Find teachers
            </Link>
            <Link
              to="/languages"
              className="text-gray-700 hover:text-black text-sm py-2"
              onClick={toggleMenu}
            >
              Languages
            </Link>
            <Link
              to="/how-it-works"
              className="text-gray-700 hover:text-black text-sm py-2"
              onClick={toggleMenu}
            >
              How it works
            </Link>
            <Link
              to="/pricing"
              className="text-gray-700 hover:text-black text-sm py-2"
              onClick={toggleMenu}
            >
              Pricing
            </Link>
          </div>
        </div>
      )}
    </motion.header>
  );
}

export default Header;
