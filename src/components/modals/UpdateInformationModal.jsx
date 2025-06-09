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
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
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

            <h2 className="text-black text-2xl font-semibold text-center mb-4">Cập nhật thông tin của bạn</h2>
            <p className="text-sm text-gray-500 text-center mb-6">
              Vui lòng hoàn thành thông tin hồ sơ của bạn (tùy chọn)
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <TextField
                label="Họ và tên"
                variant="outlined"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                fullWidth
              />

              <div className="grid grid-cols-3 gap-4">
                <FormControl fullWidth>
                  <InputLabel>Ngày</InputLabel>
                  <Select
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    label="Ngày"
                  >
                    {days.map((d) => (
                      <MenuItem key={d} value={d}>
                        {d}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Tháng</InputLabel>
                  <Select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    label="Tháng"
                  >
                    {months.map((m, i) => (
                      <MenuItem key={m} value={i + 1}>
                        {m}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Năm</InputLabel>
                  <Select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    label="Năm"
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
                <FormLabel component="legend">Giới tính</FormLabel>
                <RadioGroup
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  row
                >
                  <FormControlLabel value="male" control={<Radio />} label="Nam" />
                  <FormControlLabel value="female" control={<Radio />} label="Nữ" />
                  <FormControlLabel value="other" control={<Radio />} label="Khác" />
                </RadioGroup>
              </FormControl>

              <div className="flex gap-4">
                <Button
                  variant="outlined"
                  onClick={onClose}
                  fullWidth
                >
                  Bỏ qua lúc này
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={isLoading}
                >
                  {isLoading ? "Đang cập nhật..." : "Gửi"}
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