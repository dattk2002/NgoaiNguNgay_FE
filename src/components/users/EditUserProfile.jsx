// src/components/users/EditUserProfile.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchUserById, editUserProfile, getAccessToken, uploadProfileImage } from '../api/auth';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function EditUserProfile() {
  const { id } = useParams(); // Get the user ID from the URL
  const navigate = useNavigate();

  // Track which fields are currently being edited
  const [editingFields, setEditingFields] = useState({});

  // Track field-specific validation errors
  const [fieldErrors, setFieldErrors] = useState({});

  // Initialize with empty data that will be filled from API
  const [formData, setFormData] = useState({
    id: '',
    fullName: '',
    dateOfBirth: null,
    gender: 0,
    profileImageUrl: '',
    address: '',
    userName: '',
    email: '',
    phoneNumber: '',
    timezone: '',
    from: '',
    livingIn: '',
    learningLanguageCode: '',
    learningProficiencyLevel: 0
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
        console.log('User data loaded successfully:', userData);

        // Đảm bảo tất cả các trường đều có giá trị phù hợp để tránh lỗi uncontrolled/controlled input
        setFormData({
          id: userData.id || '',
          fullName: userData.fullName || '',
          dateOfBirth: userData.dateOfBirth || null,
          gender: userData.gender !== undefined ? userData.gender : 0,
          profileImageUrl: userData.profileImageUrl || '',
          address: userData.address || '',
          userName: userData.userName || '',
          email: userData.email || '',
          phoneNumber: userData.phoneNumber || '',
          timezone: userData.timezone || '',
          from: userData.from || '',
          livingIn: userData.livingIn || '',
          learningLanguageCode: userData.learningLanguageCode || '',
          learningProficiencyLevel: userData.learningProficiencyLevel !== undefined ?
            userData.learningProficiencyLevel : 0
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(`Failed to load user profile: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchUserData();
    } else {
      setError('User ID is missing. Please check the URL or login again.');
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    console.log('Current form data:', formData);
  }, [formData]);

  // Validate specific field value
  const validateField = (fieldName, value) => {
    let errors = {};

    switch (fieldName) {
      case 'fullName':
        if (!value || value.trim() === '') {
          errors[fieldName] = 'Tên không được để trống.';
        }
        break;
      case 'gender':
        const genderVal = parseInt(value);
        if (![0, 1, 2].includes(genderVal)) {
          errors[fieldName] = 'Giới tính không hợp lệ (0 - Khác, 1 - Nam, 2 - Nữ).';
        }
        break;
      // Add more validation rules for other fields as needed
    }

    return errors;
  };

  // Clear errors for a specific field
  const clearFieldError = (fieldName) => {
    if (fieldErrors[fieldName]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  // Gender options
  const genderOptions = [
    { value: 0, label: 'Khác' },
    { value: 1, label: 'Nam' },
    { value: 2, label: 'Nữ' }
  ];

  // Timezone options
  const timezoneOptions = [
    { value: 'Pacific/Midway', label: '(UTC-11:00) Midway Island, Samoa' },
    { value: 'Pacific/Honolulu', label: '(UTC-10:00) Hawaii' },
    { value: 'America/Anchorage', label: '(UTC-09:00) Alaska' },
    { value: 'America/Los_Angeles', label: '(UTC-08:00) Pacific Time (US & Canada)' },
    { value: 'America/Denver', label: '(UTC-07:00) Mountain Time (US & Canada)' },
    { value: 'America/Chicago', label: '(UTC-06:00) Central Time (US & Canada)' },
    { value: 'America/New_York', label: '(UTC-05:00) Eastern Time (US & Canada)' },
    { value: 'America/Caracas', label: '(UTC-04:30) Caracas' },
    { value: 'America/Halifax', label: '(UTC-04:00) Atlantic Time (Canada)' },
    { value: 'America/Sao_Paulo', label: '(UTC-03:00) Brasilia' },
    { value: 'Atlantic/South_Georgia', label: '(UTC-02:00) Mid-Atlantic' },
    { value: 'Atlantic/Azores', label: '(UTC-01:00) Azores' },
    { value: 'Europe/London', label: '(UTC±00:00) London, UTC' },
    { value: 'Europe/Paris', label: '(UTC+01:00) Brussels, Copenhagen, Madrid, Paris' },
    { value: 'Europe/Helsinki', label: '(UTC+02:00) Helsinki, Kyiv, Riga, Sofia' },
    { value: 'Europe/Moscow', label: '(UTC+03:00) Moscow, St. Petersburg' },
    { value: 'Asia/Dubai', label: '(UTC+04:00) Abu Dhabi, Muscat' },
    { value: 'Asia/Karachi', label: '(UTC+05:00) Islamabad, Karachi' },
    { value: 'Asia/Dhaka', label: '(UTC+06:00) Dhaka' },
    { value: 'Asia/Jakarta', label: '(UTC+07:00) Jakarta' },
    { value: 'Asia/Bangkok', label: '(UTC+07:00) Bangkok, Hanoi, Jakarta' },
    { value: 'Asia/Hong_Kong', label: '(UTC+08:00) Beijing, Hong Kong, Singapore' },
    { value: 'Asia/Tokyo', label: '(UTC+09:00) Osaka, Sapporo, Tokyo' },
    { value: 'Australia/Sydney', label: '(UTC+10:00) Canberra, Melbourne, Sydney' },
    { value: 'Pacific/Noumea', label: '(UTC+11:00) Solomon Is., New Caledonia' },
    { value: 'Pacific/Auckland', label: '(UTC+12:00) Auckland, Wellington' }
  ];

  // Proficiency level options
  const proficiencyOptions = [
    { value: 0, label: 'Beginner' },
    { value: 1, label: 'Elementary' },
    { value: 2, label: 'Intermediate' },
    { value: 3, label: 'Upper Intermediate' },
    { value: 4, label: 'Advanced' },
    { value: 5, label: 'Proficient' },
  ];

  // Language options
  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'vi', label: 'Vietnamese' },
    { value: 'fr', label: 'French' },
    { value: 'ja', label: 'Japanese' },
    { value: 'ko', label: 'Korean' },
    { value: 'zh', label: 'Chinese' },
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
        toast.error('Image size must be less than 2MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed');
        return;
      }

      // Create preview URL for immediate feedback
      const previewUrl = URL.createObjectURL(file);

      // Show preview immediately
      setFormData(prev => ({
        ...prev,
        profileImageUrl: previewUrl,
      }));

      // Start upload process
      setIsUploadingImage(true);

      try {
        // Use the uploadProfileImage API function
        const result = await uploadProfileImage(file);

        // After successful upload, update the image URL from the API response
        if (result.data && (result.data.profileImageUrl || result.data.profilePictureUrl)) {
          const imageUrl = result.data.profileImageUrl || result.data.profilePictureUrl;
          setFormData(prev => ({
            ...prev,
            profileImageUrl: imageUrl
          }));
          toast.success('Profile image uploaded successfully');

          // Force reload to ensure avatar is updated everywhere in the app
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          // If the response structure is different, fetch user data again
          const userData = await fetchUserById(id);
          setFormData(prev => ({
            ...prev,
            ...userData
          }));
          toast.success('Profile image uploaded successfully');

          // Force reload
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      } catch (error) {
        console.error('Error uploading profile image:', error);
        toast.error(error.message || 'Failed to upload profile image');

        // Revert to previous state if there was an error
        const userData = await fetchUserById(id);
        setFormData(prev => ({
          ...prev,
          profileImageUrl: userData.profileImageUrl || ''
        }));
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  const toggleEditField = (fieldName) => {
    // Clear any previous errors for this field
    clearFieldError(fieldName);

    setEditingFields(prev => {
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
        toast.error('Authentication token not found. Please log in again.');
        throw new Error('Authentication token not found. Please log in again.');
      }

      // Create data object based on the field being saved
      const valueToSave = directValue !== null ? directValue : formData[fieldName];
      console.log(`Saving field ${fieldName} with value:`, valueToSave);

      // Validate field before saving
      const validationErrors = validateField(fieldName, valueToSave);
      if (Object.keys(validationErrors).length > 0) {
        setFieldErrors(prev => ({ ...prev, ...validationErrors }));
        toast.error(validationErrors[fieldName]);
        setIsSaving(false);
        return;
      }

      let updateData = {};
      switch (fieldName) {
        case 'fullName':
          updateData = { fullName: valueToSave };
          break;
        case 'dateOfBirth':
          // Đảm bảo ngày tháng được định dạng đúng
          try {
            // Kiểm tra nếu là ngày hợp lệ
            const date = new Date(valueToSave);
            if (!isNaN(date.getTime())) {
              // Convert thành ISO string chuẩn cho API
              updateData = { dateOfBirth: date.toISOString() };
            } else {
              toast.error('Invalid date format. Please use YYYY-MM-DD format.');
              setIsSaving(false);
              return;
            }
          } catch (err) {
            toast.error('Error processing date. Please use YYYY-MM-DD format.');
            console.error('Date processing error:', err);
            setIsSaving(false);
            return;
          }
          break;
        case 'gender':
          updateData = { gender: parseInt(valueToSave) };
          break;
        case 'from':
          updateData = { from: valueToSave };
          break;
        case 'livingIn':
          updateData = { livingIn: valueToSave };
          break;
        case 'timezone':
          updateData = { timezone: valueToSave };
          break;
        case 'phoneNumber':
          updateData = { phoneNumber: valueToSave };
          break;
        case 'learningLanguageCode':
          updateData = { learningLanguageCode: valueToSave };
          break;
        case 'learningProficiencyLevel':
          updateData = { learningProficiencyLevel: parseInt(valueToSave) };
          break;
        default:
          // For other fields we might need to add them to the API or handle differently
          toast.warning(`Saving field "${fieldName}" is not yet implemented with API.`);
          setIsSaving(false);
          setEditingFields(prev => ({ ...prev, [fieldName]: false }));
          return;
      }

      // Log data before sending
      console.log("Sending update data:", updateData);

      // Call API to update the user profile with only the changed field
      const response = await editUserProfile(token, updateData);

      // After successful update, fetch the latest data from the server
      const updatedUserData = await fetchUserById(id);

      // Update the local state with the fresh data from the server
      setFormData(updatedUserData);

      // Update was successful
      setEditingFields(prev => ({ ...prev, [fieldName]: false }));
      toast.success(`Field "${fieldName}" updated successfully!`);
    } catch (err) {
      console.error('Error updating profile:', err);

      // Handle the API validation error format
      if (err.response && err.response.data && err.response.data.errorCode === 'validation_error') {
        const apiErrors = err.response.data.errorMessage;

        // Convert API error format to our fieldErrors format
        const newFieldErrors = {};
        Object.keys(apiErrors).forEach(key => {
          // Convert API field name format to our format (e.g. "FullName" to "fullName")
          const fieldName = key.charAt(0).toLowerCase() + key.slice(1);
          newFieldErrors[fieldName] = apiErrors[key][0]; // Take first error message
        });

        setFieldErrors(newFieldErrors);

        // Show relevant error for the current field
        const normalizedFieldName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
        if (apiErrors[normalizedFieldName]) {
          toast.error(apiErrors[normalizedFieldName][0]);
        } else {
          toast.error(`Failed to update ${fieldName}: ${err.message}`);
        }
      } else {
        toast.error(`Failed to update ${fieldName}: ${err.message}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = (fieldName) => {
    // Clear any validation errors for this field
    clearFieldError(fieldName);

    // Reset the specific editing field
    setEditingFields(prev => ({ ...prev, [fieldName]: false }));
  };

  // Function to format date string from API to display format
  const formatDate = (dateString) => {
    if (!dateString) return "Unfilled";

    try {
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) return "Invalid date";

      // Format options for more readable display
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };

      return date.toLocaleDateString(undefined, options);
    } catch (error) {
      console.error('Error formatting display date:', error);
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
        console.warn('Invalid date format:', dateString);
        return "";
      }

      // Format as YYYY-MM-DD for input type="date"
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return "";
    }
  };

  // Find gender label by value
  const getGenderLabel = (value) => {
    const gender = genderOptions.find(g => g.value === parseInt(value));
    return gender ? gender.label : 'Not given';
  };

  // Find proficiency level label by value
  const getProficiencyLabel = (value) => {
    if (value === null || value === undefined) return 'Not specified';
    const level = proficiencyOptions.find(p => p.value === parseInt(value));
    return level ? level.label : 'Not specified';
  };

  // Find language label by code
  const getLanguageLabel = (code) => {
    if (!code) return "Not specified";
    const language = languageOptions.find(l => l.value === code);
    return language ? language.label : code;
  };

  // Edit field component that shows input and Save/Cancel buttons when editing
  const EditableField = ({
    fieldName,
    label,
    value,
    inputType = 'text',
    options = null,
    placeholder = ''
  }) => {
    // Determine the initial local value based on field type
    const getInitialValue = () => {
      if (inputType === 'select') {
        // For select inputs, we need the raw value, not the formatted label
        if (fieldName === 'gender') {
          return formData.gender;
        } else if (fieldName === 'learningProficiencyLevel') {
          return formData.learningProficiencyLevel;
        } else if (fieldName === 'learningLanguageCode') {
          return formData.learningLanguageCode;
        } else if (fieldName === 'timezone') {
          return formData.timezone;
        }
      }
      return value;
    };

    // Local state for the field being edited
    const [localValue, setLocalValue] = useState(getInitialValue());

    // Update local value when the prop value changes (e.g., after API call)
    useEffect(() => {
      if (inputType === 'select') {
        // For select inputs, use the raw value from formData
        if (fieldName === 'gender') {
          setLocalValue(formData.gender);
        } else if (fieldName === 'learningProficiencyLevel') {
          setLocalValue(formData.learningProficiencyLevel);
        } else if (fieldName === 'learningLanguageCode') {
          setLocalValue(formData.learningLanguageCode);
        } else if (fieldName === 'timezone') {
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

      // Xử lý đặc biệt cho trường dateOfBirth
      if (fieldName === 'dateOfBirth') {
        try {
          // Kiểm tra nếu đây là ngày hợp lệ
          const inputDate = new Date(value);
          if (!isNaN(inputDate.getTime())) {
            // Nếu hợp lệ, lưu dưới dạng ISO string (format chuẩn cho API)
            setLocalValue(inputDate.toISOString());
          } else {
            // Nếu không hợp lệ (người dùng đang nhập), vẫn lưu để hiển thị
            setLocalValue(value);
          }
        } catch (error) {
          console.error('Error parsing date:', error);
          setLocalValue(value);
        }
      } else {
        // Các trường khác xử lý bình thường
        setLocalValue(value);
      }
    };

    // Reset local value and close edit mode
    const cancelEdit = () => {
      // Reset back to the original value based on field type
      if (inputType === 'select') {
        if (fieldName === 'gender') {
          setLocalValue(formData.gender);
        } else if (fieldName === 'learningProficiencyLevel') {
          setLocalValue(formData.learningProficiencyLevel);
        } else if (fieldName === 'learningLanguageCode') {
          setLocalValue(formData.learningLanguageCode);
        } else if (fieldName === 'timezone') {
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
      setFormData(prev => ({
        ...prev,
        [fieldName]: localValue
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
              <label className="text-gray-700 font-bold">{titleCaseLabel}</label>
            </div>
            {inputType === 'date' ? (
              <div>
                <input
                  type="date"
                  id={fieldName}
                  name={fieldName}
                  value={localValue ? formatDateForInput(localValue) : ''}
                  onChange={handleLocalInputChange}
                  placeholder={placeholder}
                  className={`w-full border ${fieldErrors[fieldName] ? 'border-red-500' : 'border-gray-300'} rounded py-2 px-3 text-gray-700 focus:outline-none focus:border-blue-500`}
                  autoFocus
                />
                <p className="text-sm text-gray-500 mt-1">Chọn từ lịch hoặc nhập trực tiếp định dạng YYYY-MM-DD</p>
                {fieldErrors[fieldName] && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors[fieldName]}</p>
                )}
              </div>
            ) : inputType === 'select' && options ? (
              <div>
                <select
                  id={fieldName}
                  name={fieldName}
                  value={localValue}
                  onChange={handleLocalInputChange}
                  className={`w-full border ${fieldErrors[fieldName] ? 'border-red-500' : 'border-gray-300'} rounded py-2 px-3 text-gray-700 focus:outline-none focus:border-blue-500`}
                  autoFocus
                >
                  <option value="">-- Select {label} --</option>
                  {fieldName === 'gender' || fieldName === 'learningProficiencyLevel' ? (
                    // For numeric values like gender and learningProficiencyLevel
                    options.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))
                  ) : (
                    // For string values like language codes and timezone
                    options.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))
                  )}
                </select>
                {fieldErrors[fieldName] && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors[fieldName]}</p>
                )}
              </div>
            ) : (
              <div>
                <input
                  type={inputType}
                  id={fieldName}
                  name={fieldName}
                  value={inputType === 'date' && localValue ? formatDateForInput(localValue) : localValue}
                  onChange={handleLocalInputChange}
                  placeholder={placeholder}
                  className={`w-full border ${fieldErrors[fieldName] ? 'border-red-500' : 'border-gray-300'} rounded py-2 px-3 text-gray-700 focus:outline-none focus:border-blue-500`}
                  autoFocus
                />
                {fieldErrors[fieldName] && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors[fieldName]}</p>
                )}
              </div>
            )}
            <div className="flex mt-2">
              <button
                type="button"
                onClick={saveWithLocalValue}
                disabled={isSaving}
                className={`${isSaving ? 'bg-gray-400' : 'bg-red-500 hover:bg-red-600'} text-white font-medium py-1 px-3 rounded text-sm`}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                disabled={isSaving}
                className="ml-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium py-1 px-3 rounded text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center py-1">
            <div className="w-1/3 sm:w-1/4">
              <label className="text-gray-700 font-bold">{titleCaseLabel}</label>
            </div>
            <div className="w-2/3 sm:w-3/4 flex justify-between items-center">
              <span className="text-gray-700">{value}</span>
              <button
                type="button"
                onClick={() => toggleEditField(fieldName)}
                className="bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400 transition-colors flex items-center gap-1"
                aria-label={`Edit ${label}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-4xl mx-auto bg-gray-50 min-h-screen">
        {isLoading ? (
          <div className="flex justify-center items-center h-60">
            <p className="text-gray-600">Loading profile data...</p>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-60">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <div className="px-6 md:px-16 py-10">
            {/* Profile Photo Section */}
            <div className="mb-12 border-b border-gray-200 pb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Profile Photo</h2>

              <div className="flex flex-col items-center sm:flex-row sm:items-start">
                <div className="mb-4 sm:mb-0 sm:mr-6">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {formData.profileImageUrl ? (
                      <img
                        src={formData.profileImageUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Error loading profile image:', e);
                          e.target.onerror = null;
                          e.target.src = ''; // Clear the src
                          e.target.parentNode.innerHTML = '<span class="text-3xl text-gray-400">ii</span>';
                        }}
                      />
                    ) : (
                      <span className="text-3xl text-gray-400">ii</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">This will be displayed to other users when they view your profile or posts.</p>
                  <p className="text-sm text-gray-600 mb-4">Max size: 2MB</p>
                  <button
                    className={`${isUploadingImage
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      } text-sm font-medium py-1 px-4 rounded transition-colors`}
                    onClick={() => document.getElementById('profileImage').click()}
                    disabled={isUploadingImage}
                  >
                    {isUploadingImage ? 'UPLOADING...' : 'UPLOAD'}
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
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Basic Information</h2>

              <div className="space-y-2">
                <EditableField
                  fieldName="fullName"
                  label="Display Name"
                  value={formData.fullName || "Not specified"}
                />

                <EditableField
                  fieldName="dateOfBirth"
                  label="Date of Birth"
                  value={formatDate(formData.dateOfBirth)}
                  inputType="date"
                />

                <EditableField
                  fieldName="gender"
                  label="Gender"
                  value={getGenderLabel(formData.gender)}
                  inputType="select"
                  options={genderOptions}
                />

                <EditableField
                  fieldName="from"
                  label="From"
                  value={formData.from || "Not specified"}
                />

                <EditableField
                  fieldName="livingIn"
                  label="Living in"
                  value={formData.livingIn || "Not specified"}
                />

                <EditableField
                  fieldName="timezone"
                  label="Timezone"
                  value={formData.timezone || "Not specified"}
                  inputType="select"
                  options={timezoneOptions}
                />

                {/* Username - Read Only */}
                <div className="py-3">
                  <div className="flex items-center py-1">
                    <div className="w-1/3 sm:w-1/4">
                      <label className="text-gray-700 font-bold">Username</label>
                    </div>
                    <div className="w-2/3 sm:w-3/4">
                      <span className="text-gray-700">{formData.userName}</span>
                    </div>
                  </div>
                </div>

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
                  label="Phone Number"
                  value={formData.phoneNumber || "Not specified"}
                  inputType="tel"
                />
              </div>
            </div>

            {/* Learning Preferences Section */}
            <div className="mb-12 border-b border-gray-200 pb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Learning Preferences</h2>

              <div className="space-y-2">
                <EditableField
                  fieldName="learningLanguageCode"
                  label="Learning Language"
                  value={formData.learningLanguageCode ? getLanguageLabel(formData.learningLanguageCode) : "Not specified"}
                  inputType="select"
                  options={languageOptions}
                />

                <EditableField
                  fieldName="learningProficiencyLevel"
                  label="Proficiency Level"
                  value={getProficiencyLabel(formData.learningProficiencyLevel)}
                  inputType="select"
                  options={proficiencyOptions}
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