import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAccessToken, editUserProfile } from "../components/api/auth";
import { formatLanguageCode } from '../utils/formatLanguageCode';

const BecomeATutorPage = ({
    user,
    onRequireLogin,
    fetchProfileData: fetchProfileDataApi,
    fetchHashtags: fetchHashtagsApi,
    uploadProfileImage: uploadProfileImageApi,
    deleteProfileImage: deleteProfileImageApi,
    registerAsTutor: registerAsTutorApi,
    uploadCertificate: uploadCertificateApi,
    requestTutorVerification: requestTutorVerificationApi
}) => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [hashtags, setHashtags] = useState([]);
    const [tutorApplicationId, setTutorApplicationId] = useState(null);
    const [formData, setFormData] = useState({
        // Basic Information
        fullName: "",
        dateOfBirth: "",
        gender: 1, // Default to male
        timezone: "UTC+7", // Default to Vietnam timezone
        profilePhoto: null,
        profilePhotoPreview: "",

        // Tutor Information
        nickName: "",
        brief: "",
        description: "",
        teachingMethod: "",

        // Hashtags
        hashtagIds: [],

        // Languages
        languages: [{ languageCode: "", proficiency: 3, isPrimary: true }],

        // Certificates
        certificates: []
    });

    // State for profile editing
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileEditData, setProfileEditData] = useState({
        fullName: "",
        dateOfBirth: "",
        gender: 1,
        timezone: "UTC+7"
    });
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

    const proficiencyLevels = [
        { value: 1, label: "Người mới bắt đầu (A1)" },
        { value: 2, label: "Sơ cấp (A2)" },
        { value: 3, label: "Trung cấp (B1)" },
        { value: 4, label: "Trung cấp trên (B2)" },
        { value: 5, label: "Nâng cao (C1)" },
        { value: 6, label: "Thành thạo (C2)" },
        { value: 7, label: "Bản ngữ" }
    ];

    const timezones = [
        { value: "UTC-12", label: "(UTC-12:00) Đường đổi ngày quốc tế phía Tây" },
        { value: "UTC-11", label: "(UTC-11:00) Giờ phối hợp quốc tế-11" },
        { value: "UTC-10", label: "(UTC-10:00) Hawaii" },
        { value: "UTC-9", label: "(UTC-09:00) Alaska" },
        { value: "UTC-8", label: "(UTC-08:00) Giờ Thái Bình Dương (Mỹ & Canada)" },
        { value: "UTC-7", label: "(UTC-07:00) Giờ Miền Núi (Mỹ & Canada)" },
        { value: "UTC-6", label: "(UTC-06:00) Giờ Trung tâm (Mỹ & Canada)" },
        { value: "UTC-5", label: "(UTC-05:00) Giờ Miền Đông (Mỹ & Canada)" },
        { value: "UTC-4", label: "(UTC-04:00) Giờ Đại Tây Dương (Canada)" },
        { value: "UTC-3", label: "(UTC-03:00) Brasilia" },
        { value: "UTC-2", label: "(UTC-02:00) Giữa Đại Tây Dương" },
        { value: "UTC-1", label: "(UTC-01:00) Azores" },
        { value: "UTC+0", label: "(UTC+00:00) Luân Đôn, Dublin, Edinburgh" },
        { value: "UTC+1", label: "(UTC+01:00) Paris, Amsterdam, Berlin" },
        { value: "UTC+2", label: "(UTC+02:00) Athens, Istanbul, Helsinki" },
        { value: "UTC+3", label: "(UTC+03:00) Moscow, Baghdad, Kuwait" },
        { value: "UTC+4", label: "(UTC+04:00) Abu Dhabi, Dubai, Muscat" },
        { value: "UTC+5", label: "(UTC+05:00) Islamabad, Karachi, Tashkent" },
        { value: "UTC+6", label: "(UTC+06:00) Astana, Dhaka, Almaty" },
        { value: "UTC+7", label: "(UTC+07:00) Bangkok, Hà Nội, Jakarta" },
        { value: "UTC+8", label: "(UTC+08:00) Bắc Kinh, Hồng Kông, Singapore" },
        { value: "UTC+9", label: "(UTC+09:00) Tokyo, Seoul, Osaka" },
        { value: "UTC+10", label: "(UTC+10:00) Sydney, Melbourne, Brisbane" },
        { value: "UTC+11", label: "(UTC+11:00) Vladivostok, Quần đảo Solomon" },
        { value: "UTC+12", label: "(UTC+12:00) Auckland, Wellington, Fiji" }
    ];

    const availableLanguages = [
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
        { value: "nl", label: "Tiếng Hà Lan" }
    ];

    // Thêm CSS style inline
    const formControlStyle = {
        color: 'black !important',
        backgroundColor: 'white !important',
        fontWeight: 'normal',
        borderColor: '#ccc'
    };

    const formSelectStyle = {
        ...formControlStyle,
        WebkitAppearance: "none",
        MozAppearance: "none",
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007CB2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right .7em top 50%",
        backgroundSize: ".65em auto",
        paddingRight: "1.95em"
    };

    // Fetch profile data and hashtags on component mount
    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                await Promise.all([
                    fetchProfileData(),
                    fetchHashtags()
                ]);
            } catch (error) {
                console.error("Error fetching initial data:", error);
                toast.error("Không thể tải dữ liệu ban đầu. Vui lòng thử lại.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const fetchProfileData = async () => {
        try {
            const token = getAccessToken();
            if (!token) {
                toast.error("Bạn phải đăng nhập để đăng ký làm gia sư.");
                onRequireLogin();
                return;
            }

            const response = await fetchProfileDataApi();
            if (response && response.data) {
                setFormData(prev => ({
                    ...prev,
                    fullName: response.data.fullName || "",
                    dateOfBirth: response.data.dateOfBirth ? new Date(response.data.dateOfBirth).toISOString().split('T')[0] : "",
                    gender: response.data.gender !== undefined ? response.data.gender : 1,
                    profilePhotoPreview: response.data.profileImageUrl || ""
                }));
            }
        } catch (error) {
            console.error("Error fetching profile data:", error);
            toast.error("Không thể tải dữ liệu hồ sơ.");
        }
    };

    const fetchHashtags = async () => {
        try {
            const token = getAccessToken();
            if (!token) return;

            const response = await fetchHashtagsApi();
            if (response && response.data) {
                setHashtags(response.data);
            }
        } catch (error) {
            console.error("Error fetching hashtags:", error);
            toast.error("Không thể tải các thẻ hashtag.");
        }
    };

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prevState => {
            const newState = { ...prevState, [name]: value };
            return newState;
        });
    };

    const handleFileChange = (e) => {
        const { files } = e.target;
        if (files.length > 0) {
            const file = files[0];

            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Kích thước ảnh phải nhỏ hơn 2MB');
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Chỉ chấp nhận các tệp ảnh');
                return;
            }

            const previewUrl = URL.createObjectURL(file);

            setFormData(prev => ({
                ...prev,
                profilePhoto: file,
                profilePhotoPreview: previewUrl
            }));

            // Upload the profile image to the server
            uploadProfileImage(file);
        }
    };

    const uploadProfileImage = async (file) => {
        try {
            const response = await uploadProfileImageApi(file);
            if (response && response.data && response.data.profileImageUrl) {
                // Update profile preview with the server URL
                setFormData(prev => ({
                    ...prev,
                    profilePhotoPreview: response.data.profileImageUrl
                }));
                toast.success("Ảnh hồ sơ đã được tải lên thành công");
            }
        } catch (error) {
            console.error("Error uploading profile image:", error);
            toast.error("Không thể tải ảnh hồ sơ. Vui lòng thử lại.");
        }
    };

    const deleteProfileImage = async () => {
        try {
            await deleteProfileImageApi();

            // Clear profile photo data
            setFormData(prev => ({
                ...prev,
                profilePhoto: null,
                profilePhotoPreview: ""
            }));

            toast.success("Ảnh hồ sơ đã được gỡ bỏ thành công");
        } catch (error) {
            console.error("Error deleting profile image:", error);
            toast.error("Không thể xóa ảnh hồ sơ. Vui lòng thử lại.");
        }
    };

    // Function to update profile information
    const updateProfile = async () => {
        setIsUpdatingProfile(true);
        try {
            const token = getAccessToken();
            if (!token) {
                toast.error("Bạn phải đăng nhập để cập nhật thông tin.");
                onRequireLogin();
                return;
            }

            // Validate required fields
            if (!profileEditData.fullName || profileEditData.fullName.trim() === "") {
                toast.error("Họ và tên đầy đủ là bắt buộc");
                return;
            }
            if (!profileEditData.dateOfBirth) {
                toast.error("Ngày sinh là bắt buộc");
                return;
            }

            // Call API to update profile using the existing function
            const updateData = {
                fullName: profileEditData.fullName.trim(),
                dateOfBirth: new Date(profileEditData.dateOfBirth).toISOString(),
                gender: parseInt(profileEditData.gender),
                timezone: profileEditData.timezone
            };

            await editUserProfile(token, updateData);
            
            // Fetch updated profile data to ensure consistency
            await fetchProfileData();
            
            setIsEditingProfile(false);
            toast.success("Cập nhật thông tin thành công!");
            
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error(error.message || "Cập nhật thông tin thất bại. Vui lòng thử lại.");
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handleProfileEditChange = (e) => {
        const { name, value } = e.target;
        setProfileEditData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const startEditingProfile = () => {
        setProfileEditData({
            fullName: formData.fullName,
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender,
            timezone: formData.timezone
        });
        setIsEditingProfile(true);
    };

    const cancelEditingProfile = () => {
        setIsEditingProfile(false);
        setProfileEditData({
            fullName: "",
            dateOfBirth: "",
            gender: 1,
            timezone: "UTC+7"
        });
    };

    const handleLanguageChange = (index, field, value) => {
        const updatedLanguages = [...formData.languages];
        updatedLanguages[index] = {
            ...updatedLanguages[index],
            [field]: value,
        };

        setFormData(prevState => ({
            ...prevState,
            languages: updatedLanguages
        }));
    };

    const addLanguage = () => {
        // Only the first language is primary by default
        const isPrimary = formData.languages.length === 0;

        setFormData(prev => ({
            ...prev,
            languages: [...prev.languages, { languageCode: "", proficiency: 3, isPrimary }],
        }));
    };

    const removeLanguage = (index) => {
        const updatedLanguages = [...formData.languages];
        updatedLanguages.splice(index, 1);

        // If we removed the primary language and there are other languages,
        // make the first one primary
        if (updatedLanguages.length > 0 && !updatedLanguages.some(lang => lang.isPrimary)) {
            updatedLanguages[0].isPrimary = true;
        }

        setFormData(prev => ({
            ...prev,
            languages: updatedLanguages
        }));
    };

    const handleHashtagChange = (hashtagId) => {
        setFormData(prev => {
            // Ensure hashtagIds is an array
            const hashtagIds = Array.isArray(prev.hashtagIds) ? [...prev.hashtagIds] : [];

            if (hashtagIds.includes(hashtagId)) {
                // Remove if already selected
                return {
                    ...prev,
                    hashtagIds: hashtagIds.filter(id => id !== hashtagId)
                };
            } else {
                // Add if not selected
                return {
                    ...prev,
                    hashtagIds: [...hashtagIds, hashtagId]
                };
            }
        });
    };

    // Removed handleCertificateChange since we no longer have name field

    const handleCertificateFileChange = (index, e) => {
        const { files } = e.target;
        if (files.length > 0) {
            const file = files[0];

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Kích thước file phải nhỏ hơn 5MB');
                return;
            }

            // Validate file type
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
            if (!allowedTypes.includes(file.type)) {
                toast.error('Chỉ chấp nhận file PDF hoặc ảnh (JPG, PNG)');
                return;
            }

            const previewUrl = URL.createObjectURL(file);
            const updatedCertificates = [...formData.certificates];
            updatedCertificates[index] = {
                ...updatedCertificates[index],
                file: file,
                filePreview: previewUrl
            };
            setFormData({ ...formData, certificates: updatedCertificates });
        }
    };

    const addCertificate = () => {
        setFormData({
            ...formData,
            certificates: [...formData.certificates, { file: null, filePreview: "" }],
        });
    };

    const removeCertificate = (index) => {
        const updatedCertificates = [...formData.certificates];
        updatedCertificates.splice(index, 1);
        setFormData({ ...formData, certificates: updatedCertificates });
    };

    useEffect(() => {
        // Cleanup object URLs when component unmounts
        return () => {
            if (formData.profilePhotoPreview) URL.revokeObjectURL(formData.profilePhotoPreview);
            formData.certificates?.forEach(cert => {
                if (cert.filePreview) URL.revokeObjectURL(cert.filePreview);
            });
        };
    }, []);

    useEffect(() => {
        // Thiết lập các giá trị mặc định để tránh lỗi hiển thị
        setFormData(prev => ({
            ...prev,
            fullName: prev.fullName || "",
            dateOfBirth: prev.dateOfBirth || "",
            gender: prev.gender || 1,
            timezone: prev.timezone || "UTC+7",
            languages: prev.languages.length ? prev.languages : [{ languageCode: "", proficiency: 3, isPrimary: true }],
            nickName: prev.nickName || "",
            brief: prev.brief || "",
            description: prev.description || "",
            teachingMethod: prev.teachingMethod || "",
            hashtagIds: prev.hashtagIds || [],
        }));
    }, []);

    const nextStep = () => {
        if (validateCurrentStep()) {
            setActiveStep(activeStep + 1);
            window.scrollTo(0, 0);
        }
    };

    const prevStep = () => {
        setActiveStep(activeStep - 1);
        window.scrollTo(0, 0);
    };

    const validateCurrentStep = () => {
        switch (activeStep) {
            case 1: // Basic Information
                // Check if user is currently editing profile
                if (isEditingProfile) {
                    toast.error("Vui lòng hoàn thành việc cập nhật thông tin trước khi tiếp tục");
                    return false;
                }
                
                // Validate required profile information
                if (!formData.fullName || formData.fullName.trim() === "") {
                    toast.error("Vui lòng cập nhật họ và tên đầy đủ trong hồ sơ cá nhân");
                    return false;
                }
                if (!formData.dateOfBirth) {
                    toast.error("Vui lòng cập nhật ngày sinh trong hồ sơ cá nhân");
                    return false;
                }
                if (formData.gender === undefined || formData.gender === null) {
                    toast.error("Vui lòng cập nhật giới tính trong hồ sơ cá nhân");
                    return false;
                }
                if (!formData.timezone) {
                    toast.error("Vui lòng cập nhật múi giờ trong hồ sơ cá nhân");
                    return false;
                }
                return true;

            case 2: // Tutor Information
                // Validate nickName (optional but if provided, must be valid)
                if (formData.nickName && formData.nickName.trim() !== "") {
                    if (formData.nickName.trim().length < 5) {
                        toast.error("Biệt danh phải có ít nhất 5 ký tự");
                        return false;
                    }
                    if (formData.nickName.trim().length > 20) {
                        toast.error("Biệt danh không được vượt quá 20 ký tự");
                        return false;
                    }
                }

                // Validate brief (optional but if provided, must be valid)
                if (formData.brief && formData.brief.trim() !== "") {
                    if (formData.brief.trim().length < 10) {
                        toast.error("Giới thiệu ngắn gọn phải có ít nhất 10 ký tự");
                        return false;
                    }
                    if (formData.brief.trim().length > 100) {
                        toast.error("Giới thiệu ngắn gọn không được vượt quá 100 ký tự");
                        return false;
                    }
                }

                // Validate description (required)
                if (!formData.description || formData.description.trim() === "") {
                    toast.error("Mô tả đầy đủ là bắt buộc");
                    return false;
                }
                if (formData.description.trim().length < 100) {
                    toast.error("Mô tả phải có ít nhất 100 ký tự");
                    return false;
                }
                if (formData.description.trim().length > 300) {
                    toast.error("Mô tả không được vượt quá 300 ký tự");
                    return false;
                }

                // Validate teachingMethod (required)
                if (!formData.teachingMethod || formData.teachingMethod.trim() === "") {
                    toast.error("Phương pháp giảng dạy là bắt buộc");
                    return false;
                }
                if (formData.teachingMethod.trim().length < 10) {
                    toast.error("Phương pháp giảng dạy phải có ít nhất 10 ký tự");
                    return false;
                }
                if (formData.teachingMethod.trim().length > 100) {
                    toast.error("Phương pháp giảng dạy không được vượt quá 100 ký tự");
                    return false;
                }
                return true;

            case 3: // Languages
                if (formData.languages.length === 0) {
                    toast.error("Vui lòng thêm ít nhất một ngôn ngữ");
                    return false;
                }

                // Validate each language
                for (let i = 0; i < formData.languages.length; i++) {
                    if (!formData.languages[i].languageCode) {
                        toast.error(`Vui lòng chọn một ngôn ngữ cho Ngôn ngữ ${i + 1}`);
                        return false;
                    }
                }

                // Ensure at least one language is marked as primary
                if (!formData.languages.some(lang => lang.isPrimary)) {
                    toast.error("Vui lòng đánh dấu ít nhất một ngôn ngữ là ngôn ngữ chính");
                    return false;
                }

                return true;

            case 4:
                // Make sure hashtagIds array exists
                if (!formData.hashtagIds || !Array.isArray(formData.hashtagIds) || formData.hashtagIds.length === 0) {
                    toast.error("Vui lòng chọn ít nhất một hashtag");
                    return false;
                }

                // Additional validation to ensure selected hashtags exist in the hashtags list
                const invalidHashtags = formData.hashtagIds.filter(id =>
                    !Array.isArray(hashtags) || !hashtags.some(tag => tag.id === id)
                );

                if (invalidHashtags.length > 0) {
                    console.error("Invalid hashtag IDs detected:", invalidHashtags);
                    toast.error("Một số hashtag đã chọn không hợp lệ. Vui lòng làm mới trang và thử lại.");
                    return false;
                }

                return true;

            case 5:
                // Certificates are required
                if (!formData.certificates || formData.certificates.length === 0) {
                    toast.error("Vui lòng tải lên ít nhất một chứng chỉ");
                    return false;
                }

                for (let i = 0; i < formData.certificates.length; i++) {
                    const cert = formData.certificates[i];
                    if (!cert.file) {
                        toast.error(`Vui lòng tải lên file cho chứng chỉ thứ ${i + 1}`);
                        return false;
                    }
                }
                return true;

            default:
                return true;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (activeStep === 4) {
            // Step 4: Submit tutor registration
            if (!validateCurrentStep()) {
                return;
            }

            setIsSubmitting(true);

            try {
                const token = getAccessToken();
                if (!token) {
                    toast.error("Bạn phải đăng nhập để đăng ký làm gia sư");
                    onRequireLogin();
                    return;
                }

                // Format data to match API requirements
                const payload = {
                    fullName: formData.fullName,
                    dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
                    gender: parseInt(formData.gender),
                    timezone: formData.timezone,
                    nickName: formData.nickName || null,
                    brief: formData.brief || null,
                    description: formData.description,
                    teachingMethod: formData.teachingMethod,
                    hashtagIds: formData.hashtagIds,
                    languages: formData.languages.map(lang => ({
                        languageCode: lang.languageCode,
                        proficiency: parseInt(lang.proficiency),
                        isPrimary: lang.isPrimary
                    }))
                };

                const response = await registerAsTutorApi(payload);
                console.log("Tutor registration response:", response);

                // Store the application ID for step 5
                // Try different possible locations for the application ID
                let applicationId = null;
                if (response && response.data) {
                    applicationId = response.data.applicationId ||
                        response.data.id ||
                        response.data.tutorApplicationId ||
                        response.data.tutorId;
                }

                if (applicationId) {
                    setTutorApplicationId(applicationId);
                    console.log("Application ID found:", applicationId);
                } else {
                    console.warn("No application ID found in response:", response);
                    // Still proceed to step 5, but show a warning
                    toast.warning("Đăng ký thành công nhưng không tìm thấy ID ứng dụng. Vui lòng liên hệ hỗ trợ nếu gặp vấn đề.");
                }

                // Show success message and go to step 5
                toast.success("Đăng ký cơ bản thành công! Bây giờ bạn có thể tải lên chứng chỉ (tùy chọn).");
                setActiveStep(5);
                window.scrollTo(0, 0);

            } catch (error) {
                console.error("Error submitting tutor registration:", error);
                toast.error(error.message || "Đăng ký thất bại. Vui lòng thử lại sau.");
            } finally {
                setIsSubmitting(false);
            }
            return;
        }

        if (activeStep === 5) {
            // Step 5: Submit certificates and request verification
            if (!validateCurrentStep()) {
                return;
            }

            setIsSubmitting(true);

            try {
                const token = getAccessToken();
                if (!token) {
                    toast.error("Bạn phải đăng nhập để hoàn thành đăng ký");
                    onRequireLogin();
                    return;
                }

                if (!tutorApplicationId) {
                    toast.error("Không tìm thấy thông tin đăng ký. Vui lòng thử lại hoặc liên hệ hỗ trợ.");
                    return;
                }

                // Upload certificates if any
                if (formData.certificates && formData.certificates.length > 0) {
                    const certificatesWithFiles = formData.certificates.filter(cert => cert.file);
                    if (certificatesWithFiles.length > 0) {
                        const files = certificatesWithFiles.map(cert => cert.file);
                        await uploadCertificateApi(files, tutorApplicationId);
                    }
                }

                // Request verification
                await requestTutorVerificationApi(tutorApplicationId);

                toast.success("Hoàn thành đăng ký gia sư! Hồ sơ của bạn hiện đang được xem xét trong vòng 1-3 ngày làm việc.");

                // Redirect to home page after 2 seconds
                setTimeout(() => {
                    navigate('/');
                }, 2000);

            } catch (error) {
                console.error("Error submitting certificates and verification request:", error);
                toast.error(error.message || "Hoàn thành đăng ký thất bại. Vui lòng thử lại sau.");
            } finally {
                setIsSubmitting(false);
            }
            return;
        }

        // For other steps, just go to next step
        nextStep();
    };

    useEffect(() => {
        console.log("Form data:", formData);
    }, [formData]);

    // Add this useEffect to log hashtags whenever they change
    useEffect(() => {
        console.log("Current hashtags state:", hashtags);
        console.log("Is Array:", Array.isArray(hashtags));
        if (Array.isArray(hashtags)) {
            console.log("Length:", hashtags.length);
            if (hashtags.length > 0) {
                console.log("First item:", hashtags[0]);
            }
        }
    }, [hashtags]);

    const renderStepIndicator = () => {
        const steps = [
            "Thông tin cơ bản",
            "Thông tin gia sư",
            "Ngôn ngữ",
            "Hashtag",
            "Chứng chỉ"
        ];

        return (
            <div className="w-full mb-12">
                {/* Progress bar container */}
                <div className="relative mb-8">
                    {/* The whole stepper container */}
                    <div className="relative">
                        {/* Steps display */}
                        <div className="flex justify-between items-start relative">
                            {/* Background line - positioned exactly at center of the circles */}
                            <div className="absolute h-1 bg-gray-200" style={{ left: '20px', right: '20px', top: '20px' }}></div>

                            {/* Progress fill - grows based on active step */}
                            <div
                                className="absolute h-1 bg-[#333333] transition-all duration-300"
                                style={{
                                    left: '20px',
                                    top: '20px',
                                    width: activeStep === 1 ? '0%' : `calc(${(activeStep - 1) / (steps.length - 1)} * (100% - 40px))`
                                }}
                            ></div>

                            {steps.map((step, index) => (
                                <div
                                    key={index}
                                    className="relative flex flex-col items-center"
                                    style={{ width: `${100 / steps.length}%` }}
                                >
                                    {/* Circle */}
                                    <div
                                        className={`z-10 cursor-pointer h-10 w-10 rounded-full flex items-center justify-center shadow-md transition-all duration-300
                                        ${activeStep > index + 1
                                                ? "bg-[#000000] text-white"
                                                : activeStep === index + 1
                                                    ? "bg-[#333333] text-white"
                                                    : "bg-white text-gray-600 border-2 border-gray-300"
                                            }`}
                                        onClick={() => {
                                            if (index + 1 < activeStep) {
                                                setActiveStep(index + 1);
                                            }
                                        }}
                                    >
                                        {activeStep > index + 1 ? (
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M5 13l4 4L19 7"
                                                ></path>
                                            </svg>
                                        ) : (
                                            <span className="text-center font-medium">{index + 1}</span>
                                        )}
                                    </div>

                                    {/* Label */}
                                    <span className={`text-xs font-medium text-center mt-2
                                        ${activeStep === index + 1 ? "text-[#333333] font-bold" :
                                            activeStep > index + 1 ? "text-[#000000]" : "text-gray-500"}`}
                                    >
                                        {step}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderStepContent = () => {
        switch (activeStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-800 border-b pb-3">Thông tin cơ bản</h2>

                        {/* Warning message for incomplete profile */}
                        {(!formData.fullName || !formData.dateOfBirth || formData.gender === undefined || formData.gender === null || !formData.timezone) && !isEditingProfile && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-800">
                                            <strong>Thông tin hồ sơ chưa đầy đủ!</strong> Vui lòng cập nhật thông tin còn thiếu trong hồ sơ cá nhân trước khi tiếp tục.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-5">
                            {/* Profile Photo Section */}
                            <div className="rounded-lg bg-white p-5 shadow-sm border border-gray-100">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ảnh hồ sơ
                                </label>
                                <div className="flex flex-col md:flex-row items-center gap-5">
                                    {formData.profilePhotoPreview ? (
                                        <div className="w-32 h-32 border-2 border-gray-300 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                                            <img
                                                src={formData.profilePhotoPreview}
                                                alt="Profile Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-32 h-32 border-2 border-gray-300 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                                            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Thông tin này được lấy từ hồ sơ của bạn và không thể chỉnh sửa
                                </p>
                            </div>

                            {/* Edit Profile Button */}
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={startEditingProfile}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                    </svg>
                                    Chỉnh sửa thông tin
                                </button>
                            </div>

                            {/* Profile Information - Read Only Display */}
                            {!isEditingProfile && (
                                <>
                                    <div className="rounded-lg bg-white p-5 shadow-sm border border-gray-100">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Họ và tên đầy đủ
                                        </label>
                                        <div className="w-full p-3 border border-gray-200 rounded-md bg-gray-50 text-gray-700">
                                            {formData.fullName || "Chưa có thông tin"}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Thông tin này được lấy từ hồ sơ của bạn
                                        </p>
                                    </div>

                                    <div className="rounded-lg bg-white p-5 shadow-sm border border-gray-100">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Ngày sinh
                                        </label>
                                        <div className="w-full p-3 border border-gray-200 rounded-md bg-gray-50 text-gray-700">
                                            {formData.dateOfBirth ?
                                                new Date(formData.dateOfBirth).toLocaleDateString('vi-VN') :
                                                "Chưa có thông tin"
                                            }
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Thông tin này được lấy từ hồ sơ của bạn
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="rounded-lg bg-white p-5 shadow-sm border border-gray-100">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Giới tính
                                            </label>
                                            <div className="w-full p-3 border border-gray-200 rounded-md bg-gray-50 text-gray-700">
                                                {formData.gender === 0 ? "Khác" :
                                                    formData.gender === 1 ? "Nam" :
                                                        formData.gender === 2 ? "Nữ" : "Chưa có thông tin"}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Thông tin này được lấy từ hồ sơ của bạn
                                            </p>
                                        </div>

                                        <div className="rounded-lg bg-white p-5 shadow-sm border border-gray-100">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Múi giờ
                                            </label>
                                            <div className="w-full p-3 border border-gray-200 rounded-md bg-gray-50 text-gray-700">
                                                {timezones.find(tz => tz.value === formData.timezone)?.label || formData.timezone || "Chưa có thông tin"}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Thông tin này được lấy từ hồ sơ của bạn
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Profile Information - Edit Mode */}
                            {isEditingProfile && (
                                <>
                                    <div className="rounded-lg bg-white p-5 shadow-sm border border-gray-100">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Họ và tên đầy đủ <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={profileEditData.fullName}
                                            onChange={handleProfileEditChange}
                                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                                            placeholder="Nhập họ và tên đầy đủ"
                                            required
                                        />
                                    </div>

                                    <div className="rounded-lg bg-white p-5 shadow-sm border border-gray-100">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Ngày sinh <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            name="dateOfBirth"
                                            value={profileEditData.dateOfBirth}
                                            onChange={handleProfileEditChange}
                                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="rounded-lg bg-white p-5 shadow-sm border border-gray-100">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Giới tính <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                name="gender"
                                                value={profileEditData.gender}
                                                onChange={handleProfileEditChange}
                                                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                                                required
                                                style={formSelectStyle}
                                            >
                                                <option value={0}>Khác</option>
                                                <option value={1}>Nam</option>
                                                <option value={2}>Nữ</option>
                                            </select>
                                        </div>

                                        <div className="rounded-lg bg-white p-5 shadow-sm border border-gray-100">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Múi giờ <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                name="timezone"
                                                value={profileEditData.timezone}
                                                onChange={handleProfileEditChange}
                                                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                                                required
                                                style={formSelectStyle}
                                            >
                                                {timezones.map((tz) => (
                                                    <option key={tz.value} value={tz.value} className="py-2 text-black">
                                                        {tz.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Edit Action Buttons */}
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={cancelEditingProfile}
                                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="button"
                                            onClick={updateProfile}
                                            disabled={isUpdatingProfile}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {isUpdatingProfile ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Đang cập nhật...
                                                </>
                                            ) : (
                                                'Cập nhật'
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-800 border-b pb-3">Thông tin gia sư</h2>
                        <div className="space-y-5">
                            <div className="rounded-lg bg-white p-5 shadow-sm border border-gray-100">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Biệt danh
                                </label>
                                <input
                                    type="text"
                                    name="nickName"
                                    value={formData.nickName}
                                    onChange={handleChange}
                                    className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white text-black ${formData.nickName && formData.nickName.trim() !== "" &&
                                        (formData.nickName.trim().length < 5 || formData.nickName.trim().length > 20)
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                    style={formControlStyle}
                                    placeholder="Nhập biệt danh bạn muốn (tùy chọn, 2-50 ký tự)"
                                />
                                <div className="flex justify-between mt-1">
                                    <p className="text-xs text-gray-500">
                                        Tối thiểu 5 ký tự, tối đa 20 ký tự (tùy chọn)
                                    </p>
                                    <p className={`text-xs ${formData.nickName && formData.nickName.trim() !== "" &&
                                        (formData.nickName.trim().length < 5 || formData.nickName.trim().length > 20)
                                        ? 'text-red-500'
                                        : 'text-gray-500'
                                        }`}>
                                        {formData.nickName.length}/20 ký tự
                                    </p>
                                </div>
                                {formData.nickName && formData.nickName.trim() !== "" && formData.nickName.trim().length < 5 && (
                                    <p className="text-xs text-red-500 mt-1">
                                        Biệt danh phải có ít nhất 5 ký tự
                                    </p>
                                )}
                                {formData.nickName && formData.nickName.trim() !== "" && formData.nickName.trim().length > 20 && (
                                    <p className="text-xs text-red-500 mt-1">
                                        Biệt danh không được vượt quá 20 ký tự
                                    </p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                    Biệt danh này sẽ được hiển thị cho học viên.
                                </p>
                            </div>

                            <div className="rounded-lg bg-white p-5 shadow-sm border border-gray-100">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Giới thiệu ngắn gọn
                                </label>
                                <textarea
                                    name="brief"
                                    value={formData.brief}
                                    onChange={handleChange}
                                    className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black ${formData.brief && formData.brief.trim() !== "" &&
                                        (formData.brief.trim().length < 10 || formData.brief.trim().length > 100)
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                    rows="2"
                                    style={formControlStyle}
                                    placeholder="Giới thiệu ngắn gọn về bản thân (tùy chọn, 10-100 ký tự)"
                                ></textarea>
                                <div className="flex justify-between mt-1">
                                    <p className="text-xs text-gray-500">
                                        Tối thiểu 10 ký tự, tối đa 100 ký tự (tùy chọn)
                                    </p>
                                    <p className={`text-xs ${formData.brief && formData.brief.trim() !== "" &&
                                        (formData.brief.trim().length < 10 || formData.brief.trim().length > 100)
                                        ? 'text-red-500'
                                        : 'text-gray-500'
                                        }`}>
                                        {formData.brief.length}/100 ký tự
                                    </p>
                                </div>
                                {formData.brief && formData.brief.trim() !== "" && formData.brief.trim().length < 10 && (
                                    <p className="text-xs text-red-500 mt-1">
                                        Giới thiệu ngắn gọn phải có ít nhất 10 ký tự
                                    </p>
                                )}
                                {formData.brief && formData.brief.trim() !== "" && formData.brief.trim().length > 100 && (
                                    <p className="text-xs text-red-500 mt-1">
                                        Giới thiệu ngắn gọn không được vượt quá 100 ký tự
                                    </p>
                                )}
                            </div>

                            <div className="rounded-lg bg-white p-5 shadow-sm border border-gray-100">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mô tả đầy đủ <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black ${formData.description &&
                                        (formData.description.trim().length < 100 || formData.description.trim().length > 300)
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                    rows="6"
                                    style={formControlStyle}
                                    placeholder="Cung cấp mô tả chi tiết về bản thân, bao gồm trình độ học vấn, kinh nghiệm làm việc và triết lý giảng dạy (100-300 ký tự)"
                                    required
                                ></textarea>
                                <div className="flex justify-between mt-1">
                                    <p className="text-xs text-gray-500">
                                        Tối thiểu 100 ký tự, tối đa 300 ký tự
                                    </p>
                                    <p className={`text-xs ${formData.description &&
                                        (formData.description.trim().length < 100 || formData.description.trim().length > 300)
                                        ? 'text-red-500'
                                        : 'text-gray-500'
                                        }`}>
                                        {formData.description.length}/300 ký tự
                                    </p>
                                </div>
                                {formData.description && formData.description.trim().length < 100 && (
                                    <p className="text-xs text-red-500 mt-1">
                                        Mô tả phải có ít nhất 100 ký tự
                                    </p>
                                )}
                                {formData.description && formData.description.trim().length > 300 && (
                                    <p className="text-xs text-red-500 mt-1">
                                        Mô tả không được vượt quá 300 ký tự
                                    </p>
                                )}
                            </div>

                            <div className="rounded-lg bg-white p-5 shadow-sm border border-gray-100">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phương pháp giảng dạy <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="teachingMethod"
                                    value={formData.teachingMethod}
                                    onChange={handleChange}
                                    className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black ${formData.teachingMethod &&
                                        (formData.teachingMethod.trim().length < 10 || formData.teachingMethod.trim().length > 100)
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                    rows="3"
                                    style={formControlStyle}
                                    placeholder="Mô tả phương pháp và cách tiếp cận giảng dạy của bạn (10-100 ký tự)"
                                    required
                                ></textarea>
                                <div className="flex justify-between mt-1">
                                    <p className="text-xs text-gray-500">
                                        Tối thiểu 10 ký tự, tối đa 300 ký tự
                                    </p>
                                    <p className={`text-xs ${formData.teachingMethod &&
                                        (formData.teachingMethod.trim().length < 10 || formData.teachingMethod.trim().length > 100)
                                        ? 'text-red-500'
                                        : 'text-gray-500'
                                        }`}>
                                        {formData.teachingMethod.length}/100 ký tự
                                    </p>
                                </div>
                                {formData.teachingMethod && formData.teachingMethod.trim().length < 10 && (
                                    <p className="text-xs text-red-500 mt-1">
                                        Phương pháp giảng dạy phải có ít nhất 10 ký tự
                                    </p>
                                )}
                                {formData.teachingMethod && formData.teachingMethod.trim().length > 100 && (
                                    <p className="text-xs text-red-500 mt-1">
                                        Phương pháp giảng dạy không được vượt quá 100 ký tự
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-800 border-b pb-3">Ngôn ngữ</h2>
                        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 rounded-md">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-800">
                                        Thêm các ngôn ngữ bạn có thể giảng dạy và trình độ của bạn (A1-C2).
                                    </p>
                                    <div className="mt-2 text-xs">
                                        <p><span className="font-bold">A1-A2:</span> Người mới bắt đầu</p>
                                        <p><span className="font-bold">B1-B2:</span> Trung cấp</p>
                                        <p><span className="font-bold">C1-C2:</span> Nâng cao</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {formData.languages.map((lang, index) => (
                                <div key={index} className="p-5 bg-white border border-gray-200 rounded-lg shadow-sm space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-medium text-gray-800">
                                            Ngôn ngữ {index + 1}: {formatLanguageCode(lang.languageCode)}
                                            {lang.isPrimary && (
                                                <span className="ml-2 inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                                                    Chính
                                                </span>
                                            )}
                                        </h3>
                                        {index > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => removeLanguage(index)}
                                                className="text-red-500 hover:text-red-700 flex items-center transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                Xóa
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Ngôn ngữ <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={lang.languageCode}
                                                    onChange={(e) => handleLanguageChange(index, "languageCode", e.target.value)}
                                                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white text-black"
                                                    required
                                                    style={formSelectStyle}
                                                >
                                                    <option value="">Chọn một ngôn ngữ</option>
                                                    {availableLanguages.map((language) => (
                                                        <option
                                                            key={language.value}
                                                            value={language.value}
                                                            className="py-2 text-black"
                                                        >
                                                            {language.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Trình độ <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={lang.proficiency}
                                                    onChange={(e) => handleLanguageChange(index, "proficiency", parseInt(e.target.value))}
                                                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white text-black"
                                                    required
                                                    style={formSelectStyle}
                                                >
                                                    {proficiencyLevels.map((level) => (
                                                        <option
                                                            key={level.value}
                                                            value={level.value}
                                                            className="py-2 text-black"
                                                        >
                                                            {level.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addLanguage}
                                className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                <svg
                                    className="w-5 h-5 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                    ></path>
                                </svg>
                                Thêm ngôn ngữ khác
                            </button>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-800 border-b pb-3">Hashtag</h2>
                        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 rounded-md">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-800">
                                        Chọn các hashtag liên quan để học viên có thể tìm thấy bạn. Chọn các hashtag đại diện cho chuyên môn giảng dạy, chứng chỉ hoặc nhóm học viên mục tiêu của bạn.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                            <h3 className="text-lg font-medium text-gray-800 mb-4">Chọn Hashtag</h3>
                            <p className="text-sm text-gray-600 mb-4">Chọn ít nhất một hashtag đại diện cho chuyên môn giảng dạy của bạn.</p>

                            <div className="flex flex-wrap gap-3 mt-4">
                                {isLoading ? (
                                    <div className="w-full flex justify-center py-8">
                                        <svg className="animate-spin h-8 w-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </div>
                                ) : !Array.isArray(hashtags) ? (
                                    <p className="text-gray-500 text-center w-full py-8">Không có hashtag nào. Liên hệ hỗ trợ nếu bạn cho rằng đây là lỗi.</p>
                                ) : hashtags.length === 0 ? (
                                    <p className="text-gray-500 text-center w-full py-8">Không có hashtag nào. Liên hệ hỗ trợ nếu bạn cho rằng đây là lỗi.</p>
                                ) : (
                                    hashtags.map((hashtag) => (
                                        <div
                                            key={hashtag.id}
                                            onClick={() => handleHashtagChange(hashtag.id)}
                                            className={`
                                                px-4 py-2 rounded-full text-sm cursor-pointer transition-colors
                                                ${formData.hashtagIds.includes(hashtag.id)
                                                    ? 'bg-blue-100 border-blue-300 text-blue-800 border'
                                                    : 'bg-gray-100 border-gray-200 text-gray-800 border hover:bg-gray-200'
                                                }
                                            `}
                                        >
                                            #{hashtag.name}
                                            {formData.hashtagIds.includes(hashtag.id) && (
                                                <span className="ml-1 text-blue-600">✓</span>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="mt-4">
                                <p className="text-sm text-gray-700">
                                    Các hashtag đã chọn ({formData.hashtagIds.length}):
                                </p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.hashtagIds.length === 0 ? (
                                        <span className="text-sm text-gray-500 italic">Chưa có hashtag nào được chọn</span>
                                    ) : (
                                        formData.hashtagIds.map(id => {
                                            const tag = Array.isArray(hashtags) ? hashtags.find(h => h.id === id) : null;
                                            return (
                                                <span key={id} className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm flex items-center">
                                                    #{tag ? tag.name : id}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleHashtagChange(id)}
                                                        className="ml-2 text-blue-200 hover:text-white"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            )
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-800 border-b pb-3">Chứng chỉ</h2>
                        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-md">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-green-800">
                                        <strong>Chúc mừng!</strong> Bạn đã hoàn thành thông tin cơ bản. Bây giờ bạn tải lên các chứng chỉ để được phê duyệt (bắt buộc).
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                            <h3 className="text-lg font-medium text-gray-800 mb-4">Tải lên chứng chỉ</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Tải lên các chứng chỉ, bằng cấp hoặc giấy chứng nhận liên quan đến giảng dạy ngôn ngữ.
                                Việc tải lên chứng chỉ là bắt buộc để được phê duyệt hồ sơ.
                            </p>

                            <div className="space-y-4">
                                {formData.certificates.map((cert, index) => (
                                    <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-medium text-gray-800">Chứng chỉ {index + 1}</h4>
                                            <button
                                                type="button"
                                                onClick={() => removeCertificate(index)}
                                                className="text-red-500 hover:text-red-700 flex items-center transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                Xóa
                                            </button>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Tải lên chứng chỉ
                                            </label>
                                            <input
                                                type="file"
                                                onChange={(e) => handleCertificateFileChange(index, e)}
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Chấp nhận: PDF, JPG, PNG (tối đa 5MB)
                                            </p>
                                        </div>

                                        {cert.filePreview && (
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-600 mb-1">Xem trước:</p>
                                                {cert.file.type.startsWith('image/') ? (
                                                    <img
                                                        src={cert.filePreview}
                                                        alt="Certificate Preview"
                                                        className="max-w-xs max-h-32 object-contain border border-gray-200 rounded"
                                                    />
                                                ) : (
                                                    <div className="flex items-center p-2 bg-gray-50 border border-gray-200 rounded">
                                                        <svg className="w-8 h-8 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="text-sm text-gray-600">{cert.file.name}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={addCertificate}
                                    className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
                                >
                                    <svg
                                        className="w-5 h-5 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                        ></path>
                                    </svg>
                                    Thêm chứng chỉ khác
                                </button>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-10 relative">
            {/* Global style for all input fields */}
            <style jsx global>{`
                input, select, textarea, option {
                    color: black !important;
                    background-color: white !important;
                }
                option {
                    padding: 10px;
                }
                select {
                    color: black !important;
                }
            `}</style>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Toast container */}
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="colored"
                />

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-[#333333] py-6 px-6">
                        <h1 className="text-2xl font-bold text-white text-center">Trở thành Gia sư</h1>
                        <p className="text-blue-100 text-center mt-1">Chia sẻ kiến thức và kết nối với học viên trên toàn thế giới</p>
                    </div>
                    <div className="p-6">
                        {renderStepIndicator()}
                        <form onSubmit={(activeStep === 4 || activeStep === 5) ? handleSubmit : (e) => e.preventDefault()}>
                            {/* Error message for validation that only appears when submit is clicked, not during navigation */}
                            {activeStep === 4 && formData.hashtagIds.length === 0 && (
                                <div className="mb-4 bg-red-50 border border-red-500 text-red-600 p-3 rounded text-sm text-center">
                                    Vui lòng chọn ít nhất một hashtag
                                </div>
                            )}

                            {renderStepContent()}
                            <div className="mt-8 flex justify-between items-center">
                                {activeStep > 1 && (
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 -ml-1" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                        </svg>
                                        Trước
                                    </button>
                                )}

                                {activeStep < 4 ? (
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        disabled={isEditingProfile}
                                        className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#333333] hover:bg-[#000000] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#333333] transition-colors disabled:opacity-70 disabled:cursor-not-allowed ${!activeStep > 1 ? 'ml-auto' : ''}`}
                                    >
                                        Tiếp theo
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 -mr-1" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                ) : activeStep === 4 ? (
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || formData.hashtagIds.length === 0}
                                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Đang xử lý...
                                            </>
                                        ) : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 -ml-1" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                Tiếp theo
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Đang xử lý...
                                            </>
                                        ) : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 -ml-1" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                Hoàn thành đăng ký
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                <div className="mt-8 text-center text-gray-600 text-sm">
                    Sau khi hoàn thành đăng ký, hồ sơ của bạn sẽ được xem xét trong vòng 1-3 ngày làm việc.
                </div>
            </div>
        </div>
    );
};

export default BecomeATutorPage;