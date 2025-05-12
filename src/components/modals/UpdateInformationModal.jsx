import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel
} from "@mui/material";
import { editUserProfile } from "../api/auth";

const UpdateInformationModal = ({ isOpen, onClose, onSubmit, user }) => {
  const [fullName, setFullName] = useState(user?.name || "");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [gender, setGender] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate required fields
    if (!fullName || !day || !month || !year || !gender) {
      console.error("All fields are required.");
      setIsLoading(false);
      return;
    }

    // Format dateOfBirth as ISO string (e.g., "2025-05-12T00:00:00.000Z")
    const formattedDateOfBirth = new Date(`${year}-${month}-${day}`).toISOString();

    // Map gender to a number (e.g., "male" -> 0, "female" -> 1, etc.)
    const genderMap = {
      male: 0,
      female: 1,
      other: 2,
    };
    const genderValue = genderMap[gender];

    // Log the request body for debugging
    console.log("Request Body:", {
      fullName,
      dateOfBirth: formattedDateOfBirth,
      gender: genderValue,
    });

    try {
      const token = localStorage.getItem("accessToken");
      const response = await editUserProfile(token, fullName, formattedDateOfBirth, genderValue);
      console.log("Profile updated successfully:", response);

      // Mark profile as updated and close the modal
      localStorage.setItem("hasUpdatedProfile", "true");
      onSubmit({ fullName, dateOfBirth: formattedDateOfBirth, gender: genderValue });
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-md mx-auto relative overflow-y-auto max-h-[95vh]"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-black text-2xl font-semibold text-center mb-4">Update Your Information</h2>
            <p className="text-sm text-gray-500 text-center mb-6">
              Please complete your profile information (optional)
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <TextField
                label="Full Name"
                variant="outlined"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                fullWidth
              />

              <div className="grid grid-cols-3 gap-4">
                <FormControl fullWidth>
                  <InputLabel>Day</InputLabel>
                  <Select
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    label="Day"
                  >
                    {days.map((d) => (
                      <MenuItem key={d} value={d}>
                        {d}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Month</InputLabel>
                  <Select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    label="Month"
                  >
                    {months.map((m, i) => (
                      <MenuItem key={m} value={i + 1}>
                        {m}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Year</InputLabel>
                  <Select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    label="Year"
                  >
                    {years.map((y) => (
                      <MenuItem key={y} value={y}>
                        {y}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

              <FormControl component="fieldset">
                <FormLabel component="legend">Gender</FormLabel>
                <RadioGroup
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  row
                >
                  <FormControlLabel value="male" control={<Radio />} label="Male" />
                  <FormControlLabel value="female" control={<Radio />} label="Female" />
                  <FormControlLabel value="other" control={<Radio />} label="Other" />
                </RadioGroup>
              </FormControl>

              <div className="flex gap-4">
                <Button
                  variant="outlined"
                  onClick={onClose}
                  fullWidth
                >
                  Skip for Now
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={isLoading}
                >
                  {isLoading ? "Updating..." : "Submit"}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpdateInformationModal; 