// src/components/users/EditUserProfile.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchUserById,
  editUserProfile,
  getAccessToken,
  uploadProfileImage,
} from "../api/auth";
import { showSuccess, showError, showWarning } from "../../utils/toastManager.js";
import "react-toastify/dist/ReactToastify.css";
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { vi } from 'date-fns/locale';
import TextField from '@mui/material/TextField';

function EditUserProfile() {
  const { id } = useParams(); // Get the user ID from the URL
  const navigate = useNavigate();

  // Track which fields are currently being edited
  const [editingFields, setEditingFields] = useState({});

  // Track field-specific validation errors
  const [fieldErrors, setFieldErrors] = useState({});

  // Initialize with empty data that will be filled from API
  const [formData, setFormData] = useState({
    id: "",
    fullName: "",
    dateOfBirth: null,
    gender: 0,
    profileImageUrl: "",
    address: "",
    email: "",
    phoneNumber: "",
    timezone: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const userData = await fetchUserById(id);
        // Remove console.log('User data loaded successfully:', userData);

        // Đảm bảo tất cả các trường đều có giá trị phù hợp để tránh lỗi uncontrolled/controlled input
        setFormData({
          id: userData.id || "",
          fullName: userData.fullName || "",
          dateOfBirth: userData.dateOfBirth || null,
          gender: userData.gender !== undefined ? userData.gender : 0,
          profileImageUrl: userData.profileImageUrl || "",
          address: userData.address || "",
          email: userData.email || "",
          phoneNumber: userData.phoneNumber || "",
          timezone: userData.timezone || "",
        });
        setError(null);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(`Không thể tải hồ sơ người dùng: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchUserData();
    } else {
      setError(
        "Thiếu ID người dùng. Vui lòng kiểm tra URL hoặc đăng nhập lại."
      );
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // Remove console.log('Current form data:', formData);
  }, [formData]);

  // Validate specific field value
  const validateField = (fieldName, value) => {
    let errors = {};

    switch (fieldName) {
      case "fullName":
        if (!value || value.trim() === "") {
          errors[fieldName] = "Tên không được để trống.";
        } else if (value.length < 2 || value.length > 50) {
          errors[fieldName] = "Tên phải từ 2 đến 50 ký tự.";
        } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(value)) {
          errors[fieldName] = "Tên chỉ được chứa chữ cái và khoảng trắng.";
        }
        break;
      case "dateOfBirth":
        if (value) {
          const date = new Date(value);
          const today = new Date();
          const minDate = new Date();
          minDate.setFullYear(today.getFullYear() - 100); // Không cho phép người dùng trên 100 tuổi

          if (isNaN(date.getTime())) {
            errors[fieldName] = "Ngày sinh không hợp lệ.";
          } else if (date > today) {
            errors[fieldName] = "Ngày sinh không thể lớn hơn ngày hiện tại.";
          } else if (date < minDate) {
            errors[fieldName] =
              "Ngày sinh không hợp lệ (người dùng không thể trên 100 tuổi).";
          }
        }
        break;
      case "gender":
        const genderVal = parseInt(value);
        if (![0, 1, 2].includes(genderVal)) {
          errors[fieldName] =
            "Giới tính không hợp lệ (0 - Khác, 1 - Nam, 2 - Nữ).";
        }
        break;
      case "phoneNumber":
        if (value) {
          const cleanPhone = value.replace(/\s+/g, "");
          const phoneRegex = /^0[0-9]{9}$/;
          if (!phoneRegex.test(cleanPhone)) {
            errors[fieldName] = "Số điện thoại phải bắt đầu bằng số 0 và có đúng 10 chữ số.";
          }
        }
        break;
      case "timezone":
        if (!value) {
          errors[fieldName] = "Vui lòng chọn múi giờ.";
        }
        break;
    }

    return errors;
  };

  // Clear errors for a specific field
  const clearFieldError = (fieldName) => {
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  // Gender options
  const genderOptions = [
    { value: 0, label: "Khác" },
    { value: 1, label: "Nam" },
    { value: 2, label: "Nữ" },
  ];

  // Timezone options
  const timezoneOptions = [
    { value: "Pacific/Midway", label: "(UTC-11:00) Đảo Midway, Samoa" },
    { value: "Pacific/Honolulu", label: "(UTC-10:00) Hawaii" },
    { value: "America/Anchorage", label: "(UTC-09:00) Alaska" },
    {
      value: "America/Los_Angeles",
      label: "(UTC-08:00) Giờ Thái Bình Dương (Mỹ & Canada)",
    },
    {
      value: "America/Denver",
      label: "(UTC-07:00) Giờ Miền Núi (Mỹ & Canada)",
    },
    {
      value: "America/Chicago",
      label: "(UTC-06:00) Giờ Miền Trung (Mỹ & Canada)",
    },
    {
      value: "America/New_York",
      label: "(UTC-05:00) Giờ Miền Đông (Mỹ & Canada)",
    },
    { value: "America/Caracas", label: "(UTC-04:30) Caracas" },
    {
      value: "America/Halifax",
      label: "(UTC-04:00) Giờ Đại Tây Dương (Canada)",
    },
    { value: "America/Sao_Paulo", label: "(UTC-03:00) Brasilia" },
    {
      value: "Atlantic/South_Georgia",
      label: "(UTC-02:00) Giữa Đại Tây Dương",
    },
    { value: "Atlantic/Azores", label: "(UTC-01:00) Azores" },
    { value: "Europe/London", label: "(UTC±00:00) Luân Đôn, UTC" },
    {
      value: "Europe/Paris",
      label: "(UTC+01:00) Brussels, Copenhagen, Madrid, Paris",
    },
    {
      value: "Europe/Helsinki",
      label: "(UTC+02:00) Helsinki, Kyiv, Riga, Sofia",
    },
    { value: "Europe/Moscow", label: "(UTC+03:00) Moscow, St. Petersburg" },
    { value: "Asia/Dubai", label: "(UTC+04:00) Abu Dhabi, Muscat" },
    { value: "Asia/Karachi", label: "(UTC+05:00) Islamabad, Karachi" },
    { value: "Asia/Dhaka", label: "(UTC+06:00) Dhaka" },
    { value: "Asia/Jakarta", label: "(UTC+07:00) Jakarta" },
    { value: "Asia/Bangkok", label: "(UTC+07:00) Bangkok, Hà Nội, Jakarta" },
    {
      value: "Asia/Hong_Kong",
      label: "(UTC+08:00) Bắc Kinh, Hồng Kông, Singapore",
    },
    { value: "Asia/Tokyo", label: "(UTC+09:00) Osaka, Sapporo, Tokyo" },
    {
      value: "Australia/Sydney",
      label: "(UTC+10:00) Canberra, Melbourne, Sydney",
    },
    {
      value: "Pacific/Noumea",
      label: "(UTC+11:00) Quần đảo Solomon, New Caledonia",
    },
    { value: "Pacific/Auckland", label: "(UTC+12:00) Auckland, Wellington" },
  ];

  // Proficiency level options
  const proficiencyOptions = [
    { value: 0, label: "Sơ cấp" },
    { value: 1, label: "Tiểu học" },
    { value: 2, label: "Trung cấp" },
    { value: 3, label: "Trung cấp trên" },
    { value: 4, label: "Nâng cao" },
    { value: 5, label: "Thành thạo" },
  ];

  // Language options
  const languageOptions = [
    { value: "en", label: "Tiếng Anh" },
    { value: "vi", label: "Tiếng Việt" },
    { value: "fr", label: "Tiếng Pháp" },
    { value: "ja", label: "Tiếng Nhật" },
    { value: "ko", label: "Tiếng Hàn" },
    { value: "zh", label: "Tiếng Trung" },
    { value: "es", label: "Tiếng Tây Ban Nha" },
    { value: "de", label: "Tiếng Đức" },
    { value: "it", label: "Tiếng Ý" },
    { value: "ru", label: "Tiếng Nga" },
    { value: "pt", label: "Tiếng Bồ Đào Nha" },
    { value: "ar", label: "Tiếng Ả Rập" },
    { value: "hi", label: "Tiếng Hindi" },
    { value: "th", label: "Tiếng Thái" },
    { value: "id", label: "Tiếng Indonesia" },
    { value: "nl", label: "Tiếng Hà Lan" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation errors when field is changed
    clearFieldError(name);
  };

  // Handle profile image upload
  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        showError("Kích thước ảnh phải nhỏ hơn 2MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        showError("Chỉ chấp nhận file hình ảnh");
        return;
      }

      // Create preview URL for immediate feedback
      const previewUrl = URL.createObjectURL(file);

      // Show preview immediately
      setFormData((prev) => ({
        ...prev,
        profileImageUrl: previewUrl,
      }));

      // Start upload process
      setIsUploadingImage(true);

      try {
        // Use the uploadProfileImage API function
        const result = await uploadProfileImage(file);

        // After successful upload, update the image URL from the API response
        if (
          result.data &&
          (result.data.profileImageUrl || result.data.profilePictureUrl)
        ) {
          const imageUrl =
            result.data.profileImageUrl || result.data.profilePictureUrl;

          // Get base URL without any query parameters
          const baseUrl = imageUrl.split("?")[0];

          // Add unique timestamp to URL for cache busting
          const uniqueTimestamp = Date.now();
          const timestampedImageUrl = `${baseUrl}?t=${uniqueTimestamp}`;

          // Remove console.log("Original image URL:", imageUrl);
          // Remove console.log("Timestamped image URL for UI:", timestampedImageUrl);

          // Update component state
          setFormData((prev) => ({
            ...prev,
            profileImageUrl: timestampedImageUrl,
          }));

          // Preload the image to ensure it's in browser cache
          const preloadImg = new Image();
          preloadImg.crossOrigin = "anonymous"; // Prevent CORS issues
          preloadImg.src = timestampedImageUrl;

          preloadImg.onload = () => {
            console.log("Avatar preloaded successfully in EditUserProfile");

            // Update user in localStorage directly too
            try {
              const user = JSON.parse(localStorage.getItem("user"));
              if (user) {
                user.profileImageUrl = timestampedImageUrl;
                localStorage.setItem("user", JSON.stringify(user));
                console.log("Updated user in localStorage with new avatar URL");
              }
            } catch (error) {
              console.error("Error updating localStorage:", error);
            }

            // Dispatch multiple avatar-updated events with slight delays
            // to make sure the message is received by all components
            window.dispatchEvent(
              new CustomEvent("avatar-updated", {
                detail: {
                  profileImageUrl: timestampedImageUrl,
                  timestamp: uniqueTimestamp,
                },
              })
            );

            // Dispatch again after a delay
            setTimeout(() => {
              window.dispatchEvent(
                new CustomEvent("avatar-updated", {
                  detail: {
                    profileImageUrl: timestampedImageUrl,
                    timestamp: uniqueTimestamp + 1,
                  },
                })
              );

              // Notify all tabs by triggering storage event
              window.dispatchEvent(new Event("storage"));

              // Force DOM updates for any avatar images
              const avatarImages = document.querySelectorAll(
                'img[alt="User avatar"], img[alt="Profile Avatar"], img[alt="Profile"]'
              );
              avatarImages.forEach((img) => {
                if (img) {
                  img.src = timestampedImageUrl + "&reload=" + uniqueTimestamp;
                }
              });
            }, 300);
          };

          // Notify user of success
          showSuccess("Cập nhật ảnh đại diện thành công");

          // Release object URL to avoid memory leaks
          URL.revokeObjectURL(previewUrl);
        } else {
          // Fallback to fetching user data if response structure is different
          const userData = await fetchUserById(id);
          if (userData && userData.profileImageUrl) {
            // Make sure we clean the URL before adding a timestamp
            const baseUrl = userData.profileImageUrl.split("?")[0];
            const uniqueTimestamp = Date.now();
            const freshImageUrl = `${baseUrl}?t=${uniqueTimestamp}`;

            setFormData((prev) => ({
              ...prev,
              ...userData,
              profileImageUrl: freshImageUrl,
            }));

            // Update localStorage too
            try {
              const user = JSON.parse(localStorage.getItem("user"));
              if (user) {
                user.profileImageUrl = freshImageUrl;
                localStorage.setItem("user", JSON.stringify(user));
              }
            } catch (error) {
              console.error("Error updating localStorage:", error);
            }

            showSuccess("Cập nhật ảnh đại diện thành công");

            // Dispatch avatar update event
            window.dispatchEvent(
              new CustomEvent("avatar-updated", {
                detail: {
                  profileImageUrl: freshImageUrl,
                  timestamp: uniqueTimestamp,
                },
              })
            );

            // Force DOM updates
            const avatarImages = document.querySelectorAll(
              'img[alt="User avatar"], img[alt="Profile Avatar"], img[alt="Profile"]'
            );
            avatarImages.forEach((img) => {
              if (img) {
                img.src = freshImageUrl + "&reload=" + uniqueTimestamp;
              }
            });

            // Release object URL
            URL.revokeObjectURL(previewUrl);
          } else {
            throw new Error("Không thể cập nhật ảnh đại diện");
          }
        }
      } catch (error) {
        console.error("Error uploading profile image:", error);
        showError(error.message || "Cập nhật ảnh đại diện thất bại");

        // Revert to previous state if there was an error
        try {
          const userData = await fetchUserById(id);
          setFormData((prev) => ({
            ...prev,
            profileImageUrl: userData.profileImageUrl || "",
          }));

          // Release object URL
          URL.revokeObjectURL(previewUrl);
        } catch (fetchError) {
          console.error("Lỗi khi lấy dữ liệu người dùng:", fetchError);
        }
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  const toggleEditField = (fieldName) => {
    // Clear any previous errors for this field
    clearFieldError(fieldName);

    setEditingFields((prev) => {
      // Create a copy of the previous state instead of an empty object
      const newState = { ...prev };

      // Toggle the current field
      newState[fieldName] = !prev[fieldName];

      return newState;
    });
  };

  const handleSave = async (fieldName, directValue = null) => {
    // Start saving process
    setIsSaving(true);

    // Clear any previous errors
    clearFieldError(fieldName);

    try {
      const token = getAccessToken();
      if (!token) {
        showError("Không tìm thấy mã xác thực. Vui lòng đăng nhập lại.");
        throw new Error("Không tìm thấy mã xác thực. Vui lòng đăng nhập lại.");
      }

      // Create data object based on the field being saved
      const valueToSave =
        directValue !== null ? directValue : formData[fieldName];
      // Remove console.log(`Saving field ${fieldName} with value:`, valueToSave);

      // Validate field before saving
      const validationErrors = validateField(fieldName, valueToSave);
      if (Object.keys(validationErrors).length > 0) {
        setFieldErrors((prev) => ({ ...prev, ...validationErrors }));
        showError(validationErrors[fieldName]);
        setIsSaving(false);
        return;
      }

      // Prepare the update data based on field name
      let updateData = {};
      switch (fieldName) {
        case "fullName":
          updateData = { fullName: valueToSave };
          break;
        case "dateOfBirth":
          // Handle date format
          try {
            const date = new Date(valueToSave);

            if (!isNaN(date.getTime())) {
              updateData = { dateOfBirth: date.toISOString() };
            } else {
              showError("Định dạng ngày không hợp lệ.");
              setIsSaving(false);
              return;
            }
          } catch (err) {
            showError("Lỗi xử lý ngày.");
            console.error("Date processing error:", err);
            setIsSaving(false);
            return;
          }
          break;
        case "gender":
          updateData = { gender: parseInt(valueToSave) };
          break;
        case "phoneNumber":
          updateData = { phoneNumber: valueToSave };
          break;
        case "timezone":
          updateData = { timezone: valueToSave };
          break;
        default:
          showWarning(
            `Việc lưu trường "${fieldName}" chưa được triển khai với API.`
          );
          setIsSaving(false);
          setEditingFields((prev) => ({ ...prev, [fieldName]: false }));
          return;
      }

      // Log the data we're about to send
      console.log("Sending update data:", updateData);

      // Call API to update the user profile
      const response = await editUserProfile(token, updateData);

      // After successful update, fetch the latest data from the server
      const updatedUserData = await fetchUserById(id);

      // Update the local state with the fresh data from the server
      setFormData(updatedUserData);

      // Update was successful
      setEditingFields((prev) => ({ ...prev, [fieldName]: false }));
      showSuccess(`Đã được cập nhật thành công!`);
    } catch (err) {
      console.error("Error updating profile:", err);

      // Handle the API validation error format
      if (
        err.response &&
        err.response.data &&
        err.response.data.errorCode === "validation_error"
      ) {
        const apiErrors = err.response.data.errorMessage;

        // Convert API error format to our fieldErrors format
        const newFieldErrors = {};
        Object.keys(apiErrors).forEach((key) => {
          // Convert API field name format to our format (e.g. "FullName" to "fullName")
          const fieldName = key.charAt(0).toLowerCase() + key.slice(1);
          newFieldErrors[fieldName] = apiErrors[key][0]; // Take first error message
        });

        setFieldErrors(newFieldErrors);

        // Show relevant error for the current field
        const normalizedFieldName =
          fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
        if (apiErrors[normalizedFieldName]) {
          showError(apiErrors[normalizedFieldName][0]);
        } else {
          showError(`Cập nhật ${fieldName} thất bại: ${err.message}`);
        }
      } else {
        showError(`Cập nhật ${fieldName} thất bại: ${err.message}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = (fieldName) => {
    // Clear any validation errors for this field
    clearFieldError(fieldName);

    // Reset the specific editing field
    setEditingFields((prev) => ({ ...prev, [fieldName]: false }));
  };

  // Function to format date string from API to display format
  const formatDate = (dateString) => {
    if (!dateString) return "Chưa điền";

    try {
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) return "Ngày không hợp lệ";

      // Format as DD-MM-YYYY
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();

      return `${day}-${month}-${year}`;
    } catch (error) {
      console.error("Error formatting display date:", error);
      return dateString; // Return original string if parsing fails
    }
  };

  // Function to convert date to input format for date fields
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";

    try {
      // Handle different formats including ISO, local date string, etc.
      const date = new Date(dateString);

      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.warn("Invalid date format:", dateString);
        return "";
      }

      // Format as YYYY-MM-DD for input type="date"
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  // Find gender label by value
  const getGenderLabel = (value) => {
    const gender = genderOptions.find((g) => g.value === parseInt(value));
    return gender ? gender.label : "Chưa cung cấp";
  };

  // Find proficiency level label by value
  const getProficiencyLabel = (value) => {
    if (value === null || value === undefined) return "Chưa chỉ định";
    const level = proficiencyOptions.find((p) => p.value === parseInt(value));
    return level ? level.label : "Chưa chỉ định";
  };

  // Find language label by code
  const getLanguageLabel = (code) => {
    if (!code) return "Chưa chỉ định";
    const language = languageOptions.find((l) => l.value === code);
    return language ? language.label : code;
  };

  // Edit field component that shows input and Save/Cancel buttons when editing
  const EditableField = ({
    fieldName,
    label,
    value,
    inputType = "text",
    options = null,
    placeholder = "",
  }) => {
    // Get validation rules for the field
    const getValidationRules = (field) => {
      switch (field) {
        case "fullName":
          return "Tên phải từ 2 đến 50 ký tự, chỉ chứa chữ cái và khoảng trắng";
        case "dateOfBirth":
          return "Ngày sinh phải hợp lệ và không thể lớn hơn ngày hiện tại";
        case "gender":
          return "Vui lòng chọn giới tính (Khác, Nam, hoặc Nữ)";
        case "phoneNumber":
          return "Số điện thoại phải bắt đầu bằng số 0 và có đúng 10 chữ số";
        case "timezone":
          return "Vui lòng chọn múi giờ phù hợp với vị trí của bạn";
        default:
          return "";
      }
    };
    // Determine the initial local value based on field type
    const getInitialValue = () => {
      if (inputType === "select") {
        // For select inputs, we need the raw value, not the formatted label
        if (fieldName === "gender") {
          return formData.gender;
        } else if (fieldName === "learningProficiencyLevel") {
          return formData.learningProficiencyLevel;
        } else if (fieldName === "learningLanguageCode") {
          return formData.learningLanguageCode;
        } else if (fieldName === "timezone") {
          return formData.timezone;
        }
      }
      return value;
    };

    // Local state for the field being edited
    const [localValue, setLocalValue] = useState(getInitialValue());

    // Update local value when the prop value changes (e.g., after API call)
    useEffect(() => {
      if (inputType === "select") {
        // For select inputs, use the raw value from formData
        if (fieldName === "gender") {
          setLocalValue(formData.gender);
        } else if (fieldName === "learningProficiencyLevel") {
          setLocalValue(formData.learningProficiencyLevel);
        } else if (fieldName === "learningLanguageCode") {
          setLocalValue(formData.learningLanguageCode);
        } else if (fieldName === "timezone") {
          setLocalValue(formData.timezone);
        }
      } else {
        setLocalValue(value);
      }
    }, [value, fieldName, inputType]);

    // Handle changes to this specific input field
    const handleLocalInputChange = (e) => {
      const { value, name } = e.target;

      // Clear validation error when user changes the value
      clearFieldError(fieldName);

      // Các trường khác xử lý bình thường (dateOfBirth được xử lý riêng bởi DatePicker)
      setLocalValue(value);
    };

    // Reset local value and close edit mode
    const cancelEdit = () => {
      // Reset back to the original value based on field type
      if (inputType === "select") {
        if (fieldName === "gender") {
          setLocalValue(formData.gender);
        } else if (fieldName === "learningProficiencyLevel") {
          setLocalValue(formData.learningProficiencyLevel);
        } else if (fieldName === "learningLanguageCode") {
          setLocalValue(formData.learningLanguageCode);
        } else if (fieldName === "timezone") {
          setLocalValue(formData.timezone);
        }
      } else {
        setLocalValue(value);
      }

      // Close edit mode
      handleCancel(fieldName);
    };

    // Handle save with the local value
    const saveWithLocalValue = () => {
      // Lấy giá trị localValue đã được cập nhật
      console.log(`Saving ${fieldName} with value:`, localValue);

      // Cập nhật formData trực tiếp từ localValue
      setFormData((prev) => ({
        ...prev,
        [fieldName]: localValue,
      }));

      // Gọi handleSave với giá trị localValue
      handleSave(fieldName, localValue);
    };

    // Helper function to capitalize first letter of each word
    const toTitleCase = (str) => {
      return str.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    };

    const titleCaseLabel = toTitleCase(label);

    return (
      <div className="py-3">
        {editingFields[fieldName] ? (
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-gray-700 font-bold">
                {titleCaseLabel}
              </label>
            </div>

            {inputType === "date" ? (
              <div>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
                  <DatePicker
                    value={localValue ? new Date(localValue) : null}
                    onChange={(newValue) => {
                      if (newValue) {
                        setLocalValue(newValue.toISOString());
                      } else {
                        setLocalValue("");
                      }
                      clearFieldError(fieldName);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        variant="outlined"
                        size="small"
                        error={!!fieldErrors[fieldName]}
                        helperText={fieldErrors[fieldName] || ""}
                        placeholder="Chọn ngày sinh"
                        autoFocus
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '0.375rem',
                            '& fieldset': {
                              borderColor: fieldErrors[fieldName] ? '#ef4444' : '#d1d5db',
                            },
                            '&:hover fieldset': {
                              borderColor: fieldErrors[fieldName] ? '#ef4444' : '#9ca3af',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#3b82f6',
                            },
                          },
                        }}
                      />
                    )}
                    format="dd/MM/yyyy"
                    slotProps={{
                      textField: {
                        size: "small",
                      },
                    }}
                  />
                </LocalizationProvider>
                <p className="text-sm text-gray-500 mt-1">
                  Chọn ngày sinh từ lịch hoặc nhập trực tiếp theo định dạng DD/MM/YYYY. Quy tắc: Ngày sinh phải hợp lệ và không thể lớn hơn ngày hiện tại.
                </p>
              </div>
            ) : inputType === "select" && options ? (
              <div>
                <select
                  id={fieldName}
                  name={fieldName}
                  value={localValue}
                  onChange={handleLocalInputChange}
                  className={`w-full border ${fieldErrors[fieldName]
                    ? "border-red-500"
                    : "border-gray-300"
                    } rounded py-2 px-3 text-gray-700 focus:outline-none focus:border-blue-500`}
                  autoFocus
                >
                  <option value="">-- Chọn {label} --</option>
                  {fieldName === "gender" ||
                    fieldName === "learningProficiencyLevel"
                    ? // For numeric values like gender and learningProficiencyLevel
                    options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))
                    : // For string values like language codes and timezone
                    options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </select>
                {fieldErrors[fieldName] && (
                  <p className="text-red-500 text-sm mt-1">
                    {fieldErrors[fieldName]}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  {fieldName === "gender" && "Chọn giới tính của bạn. Quy tắc: Vui lòng chọn một trong ba lựa chọn (Khác, Nam, hoặc Nữ)."}
                  {fieldName === "timezone" && "Chọn múi giờ phù hợp với vị trí địa lý của bạn. Quy tắc: Chọn múi giờ chính xác để đảm bảo lịch học đúng giờ."}
                </p>
              </div>
            ) : (
              <div>
                <input
                  type={inputType}
                  id={fieldName}
                  name={fieldName}
                  value={
                    inputType === "date" && localValue
                      ? formatDateForInput(localValue)
                      : localValue
                  }
                  onChange={handleLocalInputChange}
                  placeholder={placeholder}
                  className={`w-full border ${fieldErrors[fieldName]
                    ? "border-red-500"
                    : "border-gray-300"
                    } rounded py-2 px-3 text-gray-700 focus:outline-none focus:border-blue-500`}
                  autoFocus
                />
                {fieldErrors[fieldName] && (
                  <p className="text-red-500 text-sm mt-1">
                    {fieldErrors[fieldName]}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  {fieldName === "fullName" && "Nhập tên đầy đủ của bạn (chỉ chứa chữ cái và khoảng trắng). Quy tắc: Tên phải từ 2 đến 50 ký tự."}
                  {fieldName === "phoneNumber" && "Nhập số điện thoại bắt đầu bằng số 0 (ví dụ: 0123456789). Quy tắc: Phải có đúng 10 chữ số."}
                </p>
              </div>
            )}
            <div className="flex mt-2">
              <button
                type="button"
                onClick={saveWithLocalValue}
                disabled={isSaving}
                className={`${isSaving ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
                  } text-white font-medium py-1 px-3 rounded text-sm`}
              >
                {isSaving ? "Đang lưu..." : "Lưu"}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                disabled={isSaving}
                className="ml-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium py-1 px-3 rounded text-sm"
              >
                Hủy
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center py-1">
            <div className="w-1/3 sm:w-1/4">
              <label className="text-gray-700 font-bold">
                {titleCaseLabel}
              </label>
            </div>
            <div className="w-2/3 sm:w-3/4 flex justify-between items-center">
              <span className="text-gray-700">{value}</span>
              <button
                type="button"
                onClick={() => toggleEditField(fieldName)}
                className="bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400 transition-colors flex items-center gap-1"
                aria-label={`Chỉnh sửa ${label}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                <span>Chỉnh sửa</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-gray-50 min-h-screen">
        {isLoading ? (
          <div className="px-6 md:px-16 py-10">
            {/* Profile Photo Skeleton */}
            <div className="mb-12 border-b border-gray-200 pb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Ảnh hồ sơ
              </h2>
              <div className="flex flex-col items-center sm:flex-row sm:items-start">
                <div className="mb-4 sm:mb-0 sm:mr-6">
                  <Skeleton variant="circular" width={96} height={96} />
                </div>
                <div className="flex flex-col gap-2">
                  <Skeleton variant="text" width={220} height={20} />
                  <Skeleton variant="text" width={180} height={18} />
                  <Skeleton variant="rectangular" width={100} height={36} style={{ borderRadius: 8, marginTop: 8 }} />
                </div>
              </div>
            </div>
            {/* Basic Information Skeleton */}
            <div className="mb-12 border-b border-gray-200 pb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Thông tin cơ bản
              </h2>
              <div className="space-y-6">
                {/* Full Name */}
                <div className="flex items-center py-1">
                  <div className="w-1/3 sm:w-1/4">
                    <Skeleton variant="text" width={90} height={18} />
                  </div>
                  <div className="w-2/3 sm:w-3/4">
                    <Skeleton variant="text" width={180} height={24} />
                  </div>
                </div>
                {/* Date of Birth */}
                <div className="flex items-center py-1">
                  <div className="w-1/3 sm:w-1/4">
                    <Skeleton variant="text" width={90} height={18} />
                  </div>
                  <div className="w-2/3 sm:w-3/4">
                    <Skeleton variant="rectangular" width={120} height={24} />
                  </div>
                </div>
                {/* Gender */}
                <div className="flex items-center py-1">
                  <div className="w-1/3 sm:w-1/4">
                    <Skeleton variant="text" width={90} height={18} />
                  </div>
                  <div className="w-2/3 sm:w-3/4">
                    <Skeleton variant="rectangular" width={100} height={24} />
                  </div>
                </div>
                {/* Timezone */}
                <div className="flex items-center py-1">
                  <div className="w-1/3 sm:w-1/4">
                    <Skeleton variant="text" width={90} height={18} />
                  </div>
                  <div className="w-2/3 sm:w-3/4">
                    <Skeleton variant="rectangular" width={160} height={24} />
                  </div>
                </div>
                {/* Email */}
                <div className="flex items-center py-1">
                  <div className="w-1/3 sm:w-1/4">
                    <Skeleton variant="text" width={90} height={18} />
                  </div>
                  <div className="w-2/3 sm:w-3/4">
                    <Skeleton variant="text" width={200} height={24} />
                  </div>
                </div>
                {/* Phone Number */}
                <div className="flex items-center py-1">
                  <div className="w-1/3 sm:w-1/4">
                    <Skeleton variant="text" width={90} height={18} />
                  </div>
                  <div className="w-2/3 sm:w-3/4">
                    <Skeleton variant="rectangular" width={140} height={24} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-60">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <div className="px-6 md:px-16 py-10">
            {/* Header with Back Button */}
            <div className="mb-8">
              <button
                type="button"
                onClick={() => {
                  // Use window.history.back() as fallback or navigate to user profile
                  const user = JSON.parse(localStorage.getItem('user') || '{}');
                  if (user && user.id) {
                    navigate(`/user/${user.id}`);
                  } else {
                    window.history.back();
                  }
                }}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Quay lại hồ sơ
              </button>
            </div>

            {/* Profile Photo Section */}
            <div className="mb-12 border-b border-gray-200 pb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Ảnh hồ sơ
              </h2>

              <div className="flex flex-col items-center sm:flex-row sm:items-start">
                <div className="mb-4 sm:mb-0 sm:mr-6">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {formData.profileImageUrl ? (
                      <img
                        src={formData.profileImageUrl}
                        alt="Ảnh hồ sơ"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error("Error loading profile image:", e);
                          e.target.onerror = null;
                          e.target.src = ""; // Clear the src
                          e.target.parentNode.innerHTML =
                            '<span class="text-3xl text-gray-400">ii</span>';
                        }}
                      />
                    ) : (
                      <span className="text-3xl text-gray-400">ii</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Ảnh này sẽ hiển thị cho người dùng khác khi họ xem hồ sơ
                    hoặc bài đăng của bạn.
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    Kích thước tối đa: 2MB
                  </p>
                  <button
                    className={`${isUploadingImage
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      } text-sm font-medium py-1 px-4 rounded transition-colors`}
                    onClick={() =>
                      document.getElementById("profileImage").click()
                    }
                    disabled={isUploadingImage}
                  >
                    {isUploadingImage ? "ĐANG TẢI LÊN..." : "TẢI LÊN"}
                  </button>
                  <input
                    type="file"
                    id="profileImage"
                    name="profileImage"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                    disabled={isUploadingImage}
                  />
                </div>
              </div>
            </div>

            {/* Basic Information Section */}
            <div className="mb-12 border-b border-gray-200 pb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Thông tin cơ bản
              </h2>

              <div className="space-y-2">
                <EditableField
                  fieldName="fullName"
                  label="Tên hiển thị"
                  value={formData.fullName || "Chưa chỉ định"}
                />

                <EditableField
                  fieldName="dateOfBirth"
                  label="Ngày sinh"
                  value={formatDate(formData.dateOfBirth)}
                  inputType="date"
                />

                <EditableField
                  fieldName="gender"
                  label="Giới tính"
                  value={getGenderLabel(formData.gender)}
                  inputType="select"
                  options={genderOptions}
                />

                <EditableField
                  fieldName="timezone"
                  label="Múi giờ"
                  value={formData.timezone || "Chưa chỉ định"}
                  inputType="select"
                  options={timezoneOptions}
                />

                {/* Email - Read Only */}
                <div className="py-3">
                  <div className="flex items-center py-1">
                    <div className="w-1/3 sm:w-1/4">
                      <label className="text-gray-700 font-bold">Email</label>
                    </div>
                    <div className="w-2/3 sm:w-3/4">
                      <span className="text-gray-700">{formData.email}</span>
                    </div>
                  </div>
                </div>

                <EditableField
                  fieldName="phoneNumber"
                  label="Số điện thoại"
                  value={formData.phoneNumber || "Chưa chỉ định"}
                  inputType="tel"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EditUserProfile;
