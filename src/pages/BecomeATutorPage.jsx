import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BecomeATutorPage = () => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(1);
    const [formData, setFormData] = useState({
        // Basic Information
        displayName: "",
        communicationTool: "",
        country: "",
        livingIn: "",
        // Private Information
        firstName: "",
        lastName: "",
        birthday: "",
        streetAddress: "",
        // Language Skills
        languages: [{ language: "", level: "A1" }],
        // Profile
        profilePhoto: null,
        profilePhotoPreview: "",
        hourlyRate: "",
        description: "",
        // Certifications
        certifications: [{ name: "", file: null, filePreview: "" }],
        // Video Introduction
        introductionVideo: null,
        introductionVideoPreview: "",
    });

    const languageLevels = ["A1", "A2", "B1", "B2", "C1", "C2"];
    const communicationTools = ["Skype", "Zoom", "Google Meet", "Microsoft Teams", "Discord"];
    const countries = ["USA", "UK", "Canada", "Australia", "Vietnam", "Japan", "China", "Korea", "France", "Germany", "Spain", "Italy", "Brazil", "Mexico", "Russia", "India"];
    const availableLanguages = [
        "English", "Vietnamese", "Japanese", "Korean", "Chinese", "French",
        "German", "Spanish", "Italian", "Russian", "Portuguese", "Arabic",
        "Hindi", "Thai", "Indonesian", "Dutch", "Swedish", "Norwegian",
        "Danish", "Finnish", "Greek", "Turkish", "Polish", "Czech"
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

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        console.log(`Field ${name} changed to: ${value}`);

        setFormData(prevState => {
            const newState = { ...prevState, [name]: value };
            console.log('New form state:', newState);
            return newState;
        });
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files.length > 0) {
            const file = files[0];
            const previewUrl = URL.createObjectURL(file);

            if (name === "profilePhoto") {
                setFormData({
                    ...formData,
                    profilePhoto: file,
                    profilePhotoPreview: previewUrl
                });
            } else if (name === "introductionVideo") {
                setFormData({
                    ...formData,
                    introductionVideo: file,
                    introductionVideoPreview: previewUrl
                });
            }
        }
    };

    const handleLanguageChange = (index, field, value) => {
        console.log(`Language field ${field} at index ${index} changed to: ${value}`);

        const updatedLanguages = [...formData.languages];
        updatedLanguages[index] = {
            ...updatedLanguages[index],
            [field]: value,
        };

        setFormData(prevState => {
            const newState = { ...prevState, languages: updatedLanguages };
            console.log('New languages state:', newState.languages);
            return newState;
        });
    };

    const addLanguage = () => {
        setFormData({
            ...formData,
            languages: [...formData.languages, { language: "", level: "A1" }],
        });
    };

    const removeLanguage = (index) => {
        const updatedLanguages = [...formData.languages];
        updatedLanguages.splice(index, 1);
        setFormData({ ...formData, languages: updatedLanguages });
    };

    const handleCertificationChange = (index, field, value) => {
        const updatedCertifications = [...formData.certifications];
        updatedCertifications[index] = {
            ...updatedCertifications[index],
            [field]: value,
        };
        setFormData({ ...formData, certifications: updatedCertifications });
    };

    const handleCertificationFileChange = (index, e) => {
        const { files } = e.target;
        if (files.length > 0) {
            const file = files[0];
            const previewUrl = URL.createObjectURL(file);
            const updatedCertifications = [...formData.certifications];
            updatedCertifications[index] = {
                ...updatedCertifications[index],
                file: file,
                filePreview: previewUrl
            };
            setFormData({ ...formData, certifications: updatedCertifications });
        }
    };

    const addCertification = () => {
        setFormData({
            ...formData,
            certifications: [...formData.certifications, { name: "", file: null, filePreview: "" }],
        });
    };

    const removeCertification = (index) => {
        const updatedCertifications = [...formData.certifications];
        updatedCertifications.splice(index, 1);
        setFormData({ ...formData, certifications: updatedCertifications });
    };

    useEffect(() => {
        // Cleanup object URLs when component unmounts
        return () => {
            if (formData.profilePhotoPreview) URL.revokeObjectURL(formData.profilePhotoPreview);
            if (formData.introductionVideoPreview) URL.revokeObjectURL(formData.introductionVideoPreview);
            formData.certifications.forEach(cert => {
                if (cert.filePreview) URL.revokeObjectURL(cert.filePreview);
            });
        };
    }, []);

    useEffect(() => {
        // Thiết lập các giá trị mặc định để tránh lỗi hiển thị
        setFormData(prev => ({
            ...prev,
            displayName: prev.displayName || "",
            communicationTool: prev.communicationTool || "",
            country: prev.country || "",
            livingIn: prev.livingIn || "",
            firstName: prev.firstName || "",
            lastName: prev.lastName || "",
            birthday: prev.birthday || "",
            streetAddress: prev.streetAddress || "",
            languages: prev.languages.length ? prev.languages : [{ language: "", level: "A1" }],
            hourlyRate: prev.hourlyRate || "",
            description: prev.description || ""
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
                if (!formData.displayName) {
                    toast.error("Please enter a display name");
                    return false;
                }
                if (!formData.communicationTool) {
                    toast.error("Please select a communication tool");
                    return false;
                }
                if (!formData.country) {
                    toast.error("Please select a country of origin");
                    return false;
                }
                if (!formData.livingIn) {
                    toast.error("Please select a current living location");
                    return false;
                }
                return true;
            case 2: // Private Information
                if (!formData.firstName) {
                    toast.error("Please enter your first name");
                    return false;
                }
                if (!formData.lastName) {
                    toast.error("Please enter your last name");
                    return false;
                }
                if (!formData.birthday) {
                    toast.error("Please select your birthday");
                    return false;
                }
                if (!formData.streetAddress) {
                    toast.error("Please enter your street address");
                    return false;
                }
                return true;
            case 3: // Language Skills
                for (let i = 0; i < formData.languages.length; i++) {
                    if (!formData.languages[i].language) {
                        toast.error(`Please enter language ${i + 1}`);
                        return false;
                    }
                }
                return true;
            case 4: // Profile
                if (!formData.profilePhoto) {
                    toast.error("Please upload a profile photo");
                    return false;
                }
                if (!formData.hourlyRate) {
                    toast.error("Please enter your hourly rate");
                    return false;
                }
                if (!formData.description) {
                    toast.error("Please enter a description about yourself");
                    return false;
                } else if (formData.description.length < 100) {
                    toast.error("Description must be at least 100 characters");
                    return false;
                } else if (formData.description.length > 1000) {
                    toast.error("Description cannot exceed 1000 characters");
                    return false;
                }
                return true;
            case 5:
                for (let i = 0; i < formData.certifications.length; i++) {
                    if (!formData.certifications[i].name) {
                        toast.error(`Please enter certification name ${i + 1}`);
                        return false;
                    }
                    if (!formData.certifications[i].file) {
                        toast.error(`Please upload certification file ${i + 1}`);
                        return false;
                    }
                }
                return true;
            case 6:
                return true;
            default:
                return true;
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (activeStep !== 6) {
            // Nếu chưa đến bước cuối, chuyển đến bước tiếp theo
            nextStep();
            return;
        }

        if (validateCurrentStep()) {
            // Hiển thị thông báo loading
            toast.info("Processing your information...");

            try {
                // Tạo dữ liệu form để gửi đi (bỏ qua các preview)
                const formDataToSubmit = {
                    displayName: formData.displayName,
                    communicationTool: formData.communicationTool,
                    country: formData.country,
                    livingIn: formData.livingIn,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    birthday: formData.birthday,
                    streetAddress: formData.streetAddress,
                    languages: formData.languages,
                    hourlyRate: formData.hourlyRate,
                    description: formData.description,
                    // Các file sẽ được xử lý riêng ở backend
                };

                // Log dữ liệu (trong thực tế sẽ gửi API)
                console.log("Form submitted:", formDataToSubmit);

                // Hiển thị thông báo thành công
                toast.success("Registration successful! Your profile is under review.");
            } catch (error) {
                // Xử lý lỗi nếu có
                console.error("Error submitting form:", error);
                toast.error("An error occurred while registering. Please try again later.");
            }
        }
    };

    useEffect(() => {
        console.log("Form data:", formData);
    }, [formData]);

    const renderStepIndicator = () => {
        const steps = [
            "Basic Information",
            "Personal Information",
            "Language Skills",
            "Teacher Profile",
            "Certifications",
            "Video Introduction",
        ];

        return (
            <div className="w-full mb-12">
                <div className="flex flex-col">
                    {/* Steps with the line */}
                    <div className="relative flex justify-between items-center">
                        {/* Progress bar underneath */}
                        <div className="absolute h-1 bg-gray-200 left-0 right-0 z-0"></div>
                        <div
                            className="absolute h-1 bg-blue-600 left-0 z-0 transition-all duration-300"
                            style={{ width: `${((activeStep - 1) / 5) * 100}%` }}
                        ></div>

                        {/* Step circles */}
                        {steps.map((step, index) => (
                            <div
                                key={index}
                                className="z-10 cursor-pointer"
                                onClick={() => {
                                    // Allow going back to previous steps
                                    if (index + 1 < activeStep) {
                                        setActiveStep(index + 1);
                                    }
                                }}
                            >
                                <div
                                    className={`h-10 w-10 rounded-full flex items-center justify-center 
                                    ${activeStep > index + 1
                                            ? "bg-green-500 text-white"
                                            : activeStep === index + 1
                                                ? "bg-blue-600 text-white"
                                                : "bg-white text-gray-600 border-2 border-gray-300"
                                        }
                                    shadow-md transition-all duration-300`}
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
                            </div>
                        ))}
                    </div>

                    {/* Step labels (separated from circles for better alignment) */}
                    <div className="flex justify-between mt-2">
                        <div className="text-center" style={{ width: '16.66%' }}>
                            <span className={`text-xs font-medium inline-block
                                ${activeStep === 1 ? "text-blue-600 font-bold" :
                                    activeStep > 1 ? "text-green-500" : "text-gray-500"}`}
                            >
                                {steps[0]}
                            </span>
                        </div>
                        <div className="text-center" style={{ width: '16.66%' }}>
                            <span className={`text-xs font-medium inline-block
                                ${activeStep === 2 ? "text-blue-600 font-bold" :
                                    activeStep > 2 ? "text-green-500" : "text-gray-500"}`}
                            >
                                {steps[1]}
                            </span>
                        </div>
                        <div className="text-center" style={{ width: '16.66%' }}>
                            <span className={`text-xs font-medium inline-block
                                ${activeStep === 3 ? "text-blue-600 font-bold" :
                                    activeStep > 3 ? "text-green-500" : "text-gray-500"}`}
                            >
                                {steps[2]}
                            </span>
                        </div>
                        <div className="text-center" style={{ width: '16.66%' }}>
                            <span className={`text-xs font-medium inline-block
                                ${activeStep === 4 ? "text-blue-600 font-bold" :
                                    activeStep > 4 ? "text-green-500" : "text-gray-500"}`}
                            >
                                {steps[3]}
                            </span>
                        </div>
                        <div className="text-center" style={{ width: '16.66%' }}>
                            <span className={`text-xs font-medium inline-block
                                ${activeStep === 5 ? "text-blue-600 font-bold" :
                                    activeStep > 5 ? "text-green-500" : "text-gray-500"}`}
                            >
                                {steps[4]}
                            </span>
                        </div>
                        <div className="text-center" style={{ width: '16.66%' }}>
                            <span className={`text-xs font-medium inline-block
                                ${activeStep === 6 ? "text-blue-600 font-bold" :
                                    activeStep > 6 ? "text-green-500" : "text-gray-500"}`}
                            >
                                {steps[5]}
                            </span>
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
                        <h2 className="text-xl font-semibold text-gray-800 border-b pb-3">Basic Information</h2>
                        <div className="space-y-5">
                            <div className="rounded-lg bg-white p-5 shadow-sm border border-gray-100">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Display Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="displayName"
                                    defaultValue={formData.displayName || ""}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white text-black"
                                    placeholder="Display name"
                                    style={formControlStyle}
                                    readOnly={false}
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    This is the name that students will see
                                </p>
                            </div>

                            <div className="rounded-lg bg-white p-5 shadow-sm border border-gray-100">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Communication Tool <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        name="communicationTool"
                                        defaultValue={formData.communicationTool || ""}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-all bg-white text-black"
                                        required
                                        style={formSelectStyle}
                                    >
                                        <option value="" style={{ color: 'black', backgroundColor: 'white', padding: '10px' }}>
                                            Select a communication tool
                                        </option>
                                        {communicationTools.map((tool) => (
                                            <option
                                                key={tool}
                                                value={tool}
                                                className="py-2 text-black"
                                                style={{ color: 'black', backgroundColor: 'white', padding: '10px' }}
                                            >
                                                {tool}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">

                                        </svg>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    The tool you'll use for online teaching
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="rounded-lg bg-white p-5 shadow-sm border border-gray-100">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Country <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="country"
                                            defaultValue={formData.country || ""}
                                            onChange={handleChange}
                                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-all bg-white text-black"
                                            required
                                            style={formSelectStyle}
                                        >
                                            <option value="">Select a country</option>
                                            {countries.map((country) => (
                                                <option
                                                    key={country}
                                                    value={country}
                                                    className="py-2 text-black"
                                                >
                                                    {country}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">

                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-lg bg-white p-5 shadow-sm border border-gray-100">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Living In <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="livingIn"
                                            defaultValue={formData.livingIn || ""}
                                            onChange={handleChange}
                                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-all bg-white text-black"
                                            required
                                            style={formSelectStyle}
                                        >
                                            <option value="">Select a country</option>
                                            {countries.map((country) => (
                                                <option
                                                    key={country}
                                                    value={country}
                                                    className="py-2 text-black"
                                                >
                                                    {country}
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
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-800 border-b pb-3">Personal Information</h2>
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-md">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-blue-800">
                                        This information will not be displayed publicly. Only used for identity verification.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="rounded-lg bg-white p-5 shadow-sm border border-gray-100">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        First Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        defaultValue={formData.firstName || ""}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white text-black"
                                        placeholder="Enter your first name"
                                        style={formControlStyle}
                                        required
                                    />
                                </div>
                                <div className="rounded-lg bg-white p-5 shadow-sm border border-gray-100">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Last Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        defaultValue={formData.lastName || ""}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white text-black"
                                        placeholder="Enter your last name"
                                        style={formControlStyle}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="rounded-lg bg-white p-5 shadow-sm border border-gray-100">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Birthday <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="birthday"
                                    defaultValue={formData.birthday || ""}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white text-black"
                                    style={formControlStyle}
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    You must be at least 18 years old to register as a tutor
                                </p>
                            </div>

                            <div className="rounded-lg bg-white p-5 shadow-sm border border-gray-100">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Street Address <span className="text-red-100">*</span>
                                </label>
                                <textarea
                                    name="streetAddress"
                                    defaultValue={formData.streetAddress || ""}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white text-black"
                                    rows="3"
                                    style={formControlStyle}
                                    placeholder="Enter your full street address"
                                    required
                                ></textarea>
                                <p className="text-xs text-gray-500 mt-1">
                                    Enter your full address including street number, street name, district, city/province
                                </p>
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-800 border-b pb-3">Language Skills</h2>
                        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 rounded-md">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-800">
                                        Add the languages you can teach and your level (A1-C2).
                                    </p>
                                    <div className="mt-2 text-xs">
                                        <p><span className="font-bold">A1-A2:</span> Beginner</p>
                                        <p><span className="font-bold">B1-B2:</span> Intermediate</p>
                                        <p><span className="font-bold">C1-C2:</span> Advanced</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {formData.languages.map((lang, index) => (
                                <div key={index} className="p-5 bg-white border border-gray-200 rounded-lg shadow-sm space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-medium text-gray-800">Language {index + 1}</h3>
                                        {index > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => removeLanguage(index)}
                                                className="text-red-500 hover:text-red-700 flex items-center transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Language <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <select
                                                    defaultValue={lang.language || ""}
                                                    onChange={(e) =>
                                                        handleLanguageChange(index, "language", e.target.value)
                                                    }
                                                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white text-black"
                                                    required
                                                    style={formSelectStyle}
                                                >
                                                    <option value="">Select a language</option>
                                                    {availableLanguages.map((language) => (
                                                        <option
                                                            key={language}
                                                            value={language}
                                                            className="py-2 text-black"
                                                        >
                                                            {language}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Level <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <select
                                                    defaultValue={lang.level || "A1"}
                                                    onChange={(e) =>
                                                        handleLanguageChange(index, "level", e.target.value)
                                                    }
                                                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white text-black"
                                                    required
                                                    style={formSelectStyle}
                                                >
                                                    {languageLevels.map((level) => (
                                                        <option
                                                            key={level}
                                                            value={level}
                                                            className="py-2 text-black"
                                                        >
                                                            {level}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
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
                                Add another language
                            </button>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-800 border-b pb-3">Teacher Profile</h2>
                        <div className="space-y-5">
                            <div className="rounded-lg bg-white p-5 shadow-sm border border-gray-100">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Profile Photo <span className="text-red-500">*</span>
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
                                    <div className="flex-1">
                                        <div className="flex items-center justify-center w-full">
                                            <label className="flex flex-col w-full h-32 border-2 border-blue-200 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <svg className="w-10 h-10 text-blue-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                                    </svg>
                                                    <p className="mb-2 text-sm text-blue-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                                    <p className="text-xs text-gray-500">JPG, PNG (Max 5MB)</p>
                                                </div>
                                                <input
                                                    type="file"
                                                    name="profilePhoto"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    required
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Upload a professional photo. This is the photo that students will see.
                                </p>
                            </div>

                            <div className="rounded-lg bg-white p-5 shadow-sm border border-gray-100">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Hourly Rate (USD/h) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative mt-1 rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">$</span>
                                    </div>
                                    <input
                                        type="number"
                                        name="hourlyRate"
                                        defaultValue={formData.hourlyRate || ""}
                                        onChange={handleChange}
                                        className="w-full pl-10 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black font-medium"
                                        placeholder="e.g. 15"
                                        style={formControlStyle}
                                        min="1"
                                        step="0.01"
                                        required
                                    />

                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Set a competitive price to attract more students
                                </p>
                            </div>

                            <div className="rounded-lg bg-white p-5 shadow-sm border border-gray-100">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="description"
                                    defaultValue={formData.description || ""}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black font-medium"
                                    rows="6"
                                    style={formControlStyle}
                                    placeholder="Describe yourself, teaching experience, and teaching method."
                                    required
                                ></textarea>
                                <div className="flex justify-between mt-1">
                                    <p className="text-xs text-gray-500">
                                        Min 100 characters, max 1000 characters
                                    </p>
                                    <p className={`text-xs ${formData.description.length < 100 ? 'text-red-500' : formData.description.length > 1000 ? 'text-red-500' : 'text-green-500'}`}>
                                        {formData.description.length}/1000 characters
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-800 border-b pb-3">Certifications</h2>
                        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 rounded-md">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-800">
                                        Add your teaching-related certifications.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-5">
                            {formData.certifications.map((cert, index) => (
                                <div key={index} className="p-5 bg-white border border-gray-200 rounded-lg shadow-sm space-y-5">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-medium text-gray-800">Certification {index + 1}</h3>
                                        {index > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => removeCertification(index)}
                                                className="text-red-500 hover:text-red-700 flex items-center transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Certification Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                defaultValue={cert.name || ""}
                                                onChange={(e) =>
                                                    handleCertificationChange(index, "name", e.target.value)
                                                }
                                                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black font-medium"
                                                placeholder="e.g. TEFL, CELTA, Master's in Education"
                                                style={formControlStyle}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Certification File <span className="text-red-500">*</span>
                                            </label>

                                            <div className="flex flex-col sm:flex-row items-start gap-4">
                                                {cert.filePreview && (
                                                    <div className="flex items-center p-2 border rounded-md bg-gray-50 max-w-full">
                                                        <svg className="h-8 w-8 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                                                        </svg>
                                                        <span className="text-sm text-gray-700 truncate">
                                                            {cert.file && cert.file.name}
                                                        </span>
                                                    </div>
                                                )}

                                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-blue-200 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                        <svg className="w-10 h-10 text-blue-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                                        </svg>
                                                        <p className="mb-2 text-sm text-blue-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                                        <p className="text-xs text-gray-500">PDF, JPG, PNG (Max 5MB)</p>
                                                    </div>
                                                    <input
                                                        type="file"
                                                        onChange={(e) => handleCertificationFileChange(index, e)}
                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                        className="hidden"
                                                        required
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addCertification}
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
                                Add another certification
                            </button>
                        </div>
                    </div>
                );
            case 6:
                return (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-800 border-b pb-3">Video Introduction</h2>
                        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-md">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-green-800">
                                        Upload a short video introducing yourself and your teaching style. This will help students understand you better.
                                    </p>
                                    <p className="text-sm text-green-800 mt-1 font-medium">
                                        This step is optional but recommended.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div className="rounded-lg bg-white p-5 shadow-sm border border-gray-100">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Video Introduction
                                </label>

                                <div className="space-y-4">
                                    {formData.introductionVideoPreview ? (
                                        <div className="w-full border rounded-lg overflow-hidden bg-black">
                                            <video
                                                src={formData.introductionVideoPreview}
                                                controls
                                                className="w-full h-auto max-h-60"
                                            ></video>
                                        </div>
                                    ) : null}

                                    <div className="flex flex-col items-center justify-center w-full h-40 border-2 border-blue-200 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                        <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <svg className="w-10 h-10 text-blue-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                                </svg>
                                                <p className="mb-2 text-sm text-blue-500"><span className="font-semibold">Click to upload video</span></p>
                                                <p className="text-xs text-gray-500">MP4 (Max 50MB, 1-3 minutes)</p>
                                            </div>
                                            <input
                                                type="file"
                                                name="introductionVideo"
                                                onChange={handleFileChange}
                                                accept="video/*"
                                                className="hidden"
                                            />
                                        </label>
                                    </div>

                                    {formData.introductionVideo && (
                                        <p className="text-xs text-green-600 text-center">
                                            Selected video: {formData.introductionVideo.name}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="p-5 bg-blue-50 rounded-lg">
                                <h3 className="font-medium text-blue-800 mb-3">Video Tips</h3>
                                <ul className="text-sm text-blue-700 space-y-2 list-disc pl-5">
                                    <li>Introduce yourself clearly</li>
                                    <li>Talk about your teaching experience</li>
                                    <li>Explain your teaching method</li>
                                    <li>Show your personality and enthusiasm</li>
                                    <li>Ensure good lighting and clear audio</li>
                                    <li>Choose a quiet place with no background noise</li>
                                    <li>Look directly into the camera to create a connection</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-10">
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
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-6 px-6">
                        <h1 className="text-2xl font-bold text-white text-center">Become a Tutor</h1>
                        <p className="text-blue-100 text-center mt-1">Share your knowledge and connect with students worldwide</p>
                    </div>
                    <div className="p-6">
                        {renderStepIndicator()}
                        <form onSubmit={activeStep === 6 ? handleSubmit : (e) => e.preventDefault()}>
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
                                        Previous
                                    </button>
                                )}

                                {activeStep < 6 ? (
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${!activeStep > 1 ? 'ml-auto' : ''}`}
                                    >
                                        Next
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 -mr-1" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 -ml-1" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        Submit Application
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                <div className="mt-8 text-center text-gray-600 text-sm">
                    After registering, your profile will be reviewed within 1-3 business days.
                </div>
            </div>
            <ToastContainer
                position="top-center"
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
        </div>
    );
};

export default BecomeATutorPage;