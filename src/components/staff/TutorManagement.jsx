import React, { useState, useEffect } from 'react';
import { fetchPendingApplications, fetchTutorApplicationById, reviewTutorApplication } from '../api/auth';
import { toast } from 'react-toastify';
import StudentRequests from '../tutorManagement/StudentRequests';

const TutorManagement = () => {
    const [activeTab, setActiveTab] = useState('pending');
    const [selectedTutor, setSelectedTutor] = useState(null);
    const [selectedTutorDetails, setSelectedTutorDetails] = useState(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showInfoRequestModal, setShowInfoRequestModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [reviewNotes, setReviewNotes] = useState('');
    const [reviewingTutor, setReviewingTutor] = useState(null);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [pendingApplications, setPendingApplications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(20);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [detailsCache, setDetailsCache] = useState({});

    const tabs = [
        {
            id: 'pending',
            title: 'Chờ duyệt',
            count: pendingApplications.length,
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            id: 'approved',
            title: 'Đã duyệt',
            count: 156,
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            )
        },
        {
            id: 'need-info',
            title: 'Cần thông tin',
            count: 15,
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            id: 'student-requests',
            title: 'Yêu cầu từ học viên',
            count: 0,
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            )
        }
    ];

    useEffect(() => {
        const loadPendingApplications = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchPendingApplications(currentPage, pageSize);

                // Fetch detailed information for each application
                const enrichedData = await Promise.all(
                    data.map(async (application) => {
                        try {
                            // Check cache first
                            if (detailsCache[application.id]) {
                                return {
                                    ...application,
                                    tutor: {
                                        ...application.tutor,
                                        ...detailsCache[application.id].tutor
                                    }
                                };
                            }

                            const details = await fetchTutorApplicationById(application.id);
                            console.log(`Debug - Detailed data for ${application.id}:`, details);

                            // Cache the details
                            setDetailsCache(prev => ({
                                ...prev,
                                [application.id]: details
                            }));

                            // Merge the detailed tutor information
                            return {
                                ...application,
                                tutor: {
                                    ...application.tutor,
                                    ...details.tutor // This will override with detailed info
                                }
                            };
                        } catch (error) {
                            console.error(`Error fetching details for application ${application.id}:`, error);
                            return application; // Return original if details fetch fails
                        }
                    })
                );

                console.log('Debug - Enriched applications data:', enrichedData);
                setPendingApplications(enrichedData);
            } catch (err) {
                setError(err.message);
                console.error('Error loading pending applications:', err);
            } finally {
                setLoading(false);
            }
        };

        if (activeTab === 'pending') {
            loadPendingApplications();
        }
    }, [activeTab, currentPage, pageSize]);

    const currentTutors = activeTab === 'pending' ? pendingApplications : [];

    const handleViewProfile = async (tutor) => {
        setSelectedTutor(tutor);
        setSelectedTutorDetails(null);

        // Check cache first, then fetch if needed
        if (tutor.id) {
            if (detailsCache[tutor.id]) {
                console.log('Using cached details for modal:', tutor.id);
                setSelectedTutorDetails(detailsCache[tutor.id]);
            } else {
                setDetailsLoading(true);
                try {
                    const details = await fetchTutorApplicationById(tutor.id);
                    console.log('Debug - Modal detailed tutor data:', details);
                    console.log('Debug - Modal tutor object:', details.tutor);

                    // Update cache
                    setDetailsCache(prev => ({
                        ...prev,
                        [tutor.id]: details
                    }));

                    setSelectedTutorDetails(details);
                } catch (error) {
                    console.error('Error fetching tutor details:', error);
                    setSelectedTutorDetails(null);
                } finally {
                    setDetailsLoading(false);
                }
            }
        }
    };

    const handleApprove = (tutor) => {
        setReviewingTutor(tutor);
        setReviewNotes('');
        setShowApproveModal(true);
    };

    const handleReject = (tutor) => {
        setReviewingTutor(tutor);
        setReviewNotes('');
        setShowRejectModal(true);
    };

    const handleRequestInfo = (tutor) => {
        setReviewingTutor(tutor);
        setReviewNotes('');
        setShowInfoRequestModal(true);
    };

    const confirmApprove = async () => {
        setReviewLoading(true);
        try {
            await reviewTutorApplication(reviewingTutor.id, 1, reviewNotes);

            // Update local state
            setPendingApplications(prev =>
                prev.filter(app => app.id !== reviewingTutor.id)
            );

            setShowApproveModal(false);
            setReviewingTutor(null);
            setReviewNotes('');

            // Show success message
            toast.success('Đã phê duyệt hồ sơ gia sư thành công!');
        } catch (error) {
            console.error('Error approving tutor:', error);
            toast.error('Có lỗi xảy ra khi phê duyệt hồ sơ: ' + error.message);
        } finally {
            setReviewLoading(false);
        }
    };

    const confirmReject = async () => {
        if (!reviewingTutor || !reviewNotes.trim()) {
            toast.error('Vui lòng nhập lý do từ chối');
            return;
        }

        setReviewLoading(true);
        try {
            await reviewTutorApplication(reviewingTutor.id, 2, reviewNotes);

            // Update local state
            setPendingApplications(prev =>
                prev.filter(app => app.id !== reviewingTutor.id)
            );

            setShowRejectModal(false);
            setReviewingTutor(null);
            setReviewNotes('');

            // Show success message
            toast.success('Đã từ chối hồ sơ gia sư!');
        } catch (error) {
            console.error('Error rejecting tutor:', error);
            toast.error('Có lỗi xảy ra khi từ chối hồ sơ: ' + error.message);
        } finally {
            setReviewLoading(false);
        }
    };

    const confirmRequestInfo = async () => {
        if (!reviewingTutor || !reviewNotes.trim()) {
            toast.error('Vui lòng nhập thông tin cần bổ sung');
            return;
        }

        setReviewLoading(true);
        try {
            await reviewTutorApplication(reviewingTutor.id, 3, reviewNotes);

            // Update local state
            setPendingApplications(prev =>
                prev.filter(app => app.id !== reviewingTutor.id)
            );

            setShowInfoRequestModal(false);
            setReviewingTutor(null);
            setReviewNotes('');

            // Show success message
            toast.success('Đã yêu cầu bổ sung thông tin!');
        } catch (error) {
            console.error('Error requesting info:', error);
            toast.error('Có lỗi xảy ra khi yêu cầu thông tin: ' + error.message);
        } finally {
            setReviewLoading(false);
        }
    };

    const renderTutorCard = (tutor) => (
        <div key={tutor.id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-200">
            <div className="flex items-start gap-4 mb-4">
                <img src={tutor.avatar} alt={tutor.name} className="w-16 h-16 rounded-full object-cover" />
                <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-800 mb-1">{tutor.name}</h4>
                    <p className="text-gray-600 font-medium mb-2">{tutor.subject}</p>
                    <div className="space-y-1 text-sm text-gray-500">
                        <span className="block">Kinh nghiệm: {tutor.experience}</span>
                        <span className="block">
                            {tutor.status === 'approved' ? `Duyệt: ${tutor.approvedDate}` : `Nộp: ${tutor.submittedDate}`}
                        </span>
                    </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${tutor.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    tutor.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                    }`}>
                    {tutor.status === 'pending' && 'Chờ duyệt'}
                    {tutor.status === 'approved' && 'Đã duyệt'}
                    {tutor.status === 'need_info' && 'Cần thông tin'}
                </div>
            </div>

            <div className="space-y-2 mb-4 text-sm text-gray-600">
                <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {tutor.email}
                </span>
                <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {tutor.phone}
                </span>
            </div>

            <div className="flex gap-2 flex-wrap">
                <button
                    className="bg-blue-500 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors flex items-center gap-1"
                    onClick={() => handleViewProfile(tutor)}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Xem hồ sơ
                </button>

                {tutor.status === 'pending' && (
                    <>
                        <button
                            className="bg-green-500 text-white px-3 py-2 rounded-md text-sm hover:bg-green-600 transition-colors flex items-center gap-1"
                            onClick={() => handleApprove(tutor)}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Phê duyệt
                        </button>
                        <button
                            className="bg-red-500 text-white px-3 py-2 rounded-md text-sm hover:bg-red-600 transition-colors flex items-center gap-1"
                            onClick={() => handleReject(tutor)}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Từ chối
                        </button>
                        <button
                            className="bg-yellow-500 text-white px-3 py-2 rounded-md text-sm hover:bg-yellow-600 transition-colors flex items-center gap-1"
                            onClick={() => handleRequestInfo(tutor)}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Yêu cầu thông tin
                        </button>
                    </>
                )}
            </div>
        </div>
    );

    const renderTutorProfile = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h3 className="text-2xl font-semibold text-gray-800">Chi tiết hồ sơ gia sư</h3>
                    <button
                        className="text-gray-500 hover:text-gray-700 p-2"
                        onClick={() => {
                            setSelectedTutor(null);
                            setSelectedTutorDetails(null);
                        }}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    {detailsLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            <span className="ml-2">Đang tải thông tin chi tiết...</span>
                        </div>
                    ) : selectedTutorDetails ? (
                        <div className="space-y-6">
                            {/* Basic Information */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left Column - Personal Info */}
                                <div className="space-y-4">
                                    {/* Avatar Section */}
                                    <div className="bg-gray-50 p-4 rounded-lg flex items-center space-x-4">
                                        <div className="flex-shrink-0">
                                            {selectedTutorDetails.tutor?.profileImageUrl ? (
                                                <img
                                                    src={selectedTutorDetails.tutor.profileImageUrl}
                                                    alt={selectedTutorDetails.tutor?.fullName || selectedTutorDetails.tutor?.nickName || 'Tutor'}
                                                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                                                />
                                            ) : (
                                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                                                    {((selectedTutorDetails.tutor?.fullName && selectedTutorDetails.tutor?.fullName.trim() !== '') ?
                                                        selectedTutorDetails.tutor.fullName :
                                                        (selectedTutorDetails.tutor?.nickName || 'T')).charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-xl font-bold text-gray-800">
                                                {(selectedTutorDetails.tutor?.fullName && selectedTutorDetails.tutor?.fullName.trim() !== '') ?
                                                    selectedTutorDetails.tutor.fullName :
                                                    (selectedTutorDetails.tutor?.nickName || 'Không có tên')}
                                            </h4>
                                            {selectedTutorDetails.tutor?.fullName && selectedTutorDetails.tutor?.fullName.trim() !== '' &&
                                                selectedTutorDetails.tutor?.nickName && selectedTutorDetails.tutor.fullName !== selectedTutorDetails.tutor.nickName && (
                                                    <p className="text-gray-600">Biệt danh: {selectedTutorDetails.tutor.nickName}</p>
                                                )}
                                            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${selectedTutorDetails.status === 1 ? 'bg-yellow-100 text-yellow-800' :
                                                selectedTutorDetails.status === 2 ? 'bg-green-100 text-green-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                {selectedTutorDetails.status === 1 ? 'Chờ duyệt' :
                                                    selectedTutorDetails.status === 2 ? 'Đã duyệt' : 'Không xác định'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-lg font-semibold text-gray-800 mb-3">Thông tin liên hệ</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="font-medium text-gray-600">Email:</span>
                                                <span className="text-gray-800">{(selectedTutorDetails.tutor?.email && selectedTutorDetails.tutor?.email.trim() !== '') ? selectedTutorDetails.tutor.email : 'Không có email'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Application Info */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-lg font-semibold text-gray-800 mb-3">Thông tin đơn đăng ký</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="font-medium text-gray-600">Ngày nộp:</span>
                                                <span className="text-gray-800">
                                                    {selectedTutorDetails.submittedAt ?
                                                        new Date(selectedTutorDetails.submittedAt).toLocaleDateString('vi-VN') : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Tutor Details */}
                                <div className="space-y-4">
                                    {selectedTutorDetails.tutor && (
                                        <>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h4 className="text-lg font-semibold text-gray-800 mb-3">Thông tin gia sư</h4>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <span className="font-medium text-gray-600">Mô tả ngắn:</span>
                                                        <span className="text-gray-800">{selectedTutorDetails.tutor.brief || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="font-medium text-gray-600">Phương pháp giảng dạy:</span>
                                                        <span className="text-gray-800">{selectedTutorDetails.tutor.teachingMethod || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Languages */}
                                            {selectedTutorDetails.tutor.languages && selectedTutorDetails.tutor.languages.length > 0 && (
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Ngôn ngữ</h4>
                                                    <div className="space-y-2">
                                                        {selectedTutorDetails.tutor.languages.map((lang, index) => (
                                                            <div key={index} className="flex justify-between items-center">
                                                                <span className="font-medium text-gray-600">
                                                                    {lang.languageCode} {lang.isPrimary && '(Chính)'}
                                                                </span>
                                                                <span className="text-gray-800">
                                                                    Trình độ: {lang.proficiency}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Hashtags */}
                                            {selectedTutorDetails.tutor.hashtags && selectedTutorDetails.tutor.hashtags.length > 0 && (
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Kỹ năng & Chứng chỉ</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedTutorDetails.tutor.hashtags.map((tag, index) => (
                                                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                                                                {tag.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Full Description */}
                            {selectedTutorDetails.tutor?.description && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Mô tả chi tiết</h4>
                                    <p className="text-gray-700 whitespace-pre-wrap">{selectedTutorDetails.tutor.description}</p>
                                </div>
                            )}

                            {/* Documents */}
                            {selectedTutorDetails.documents && selectedTutorDetails.documents.length > 0 && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Tài liệu đính kèm</h4>
                                    <div className="space-y-3">
                                        {selectedTutorDetails.documents.map((doc, docIndex) => (
                                            <div key={docIndex} className="space-y-2">
                                                {/* Document description */}
                                                {doc.description && (
                                                    <div className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">
                                                        {doc.description}
                                                    </div>
                                                )}

                                                {/* Files in this document */}
                                                {doc.files && doc.files.length > 0 && doc.files.map((file, fileIndex) => (
                                                    <div key={fileIndex} className="flex items-center justify-between p-3 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                                                        <div className="flex items-center space-x-3 flex-1">
                                                            <div className="flex-shrink-0">
                                                                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                </svg>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                                    {file.originalFileName || `Document ${docIndex + 1}-${fileIndex + 1}`}
                                                                </p>
                                                                <div className="text-sm text-gray-500 space-y-1">
                                                                    <p>Loại: {file.contentType || 'Không xác định'}</p>
                                                                    <p>Kích thước: {file.fileSize ? `${Math.round(file.fileSize / 1024)} KB` : 'Không xác định'}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            {file.cloudinaryUrl && (
                                                                <>
                                                                    <a
                                                                        href={file.cloudinaryUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 outline-none"
                                                                    >
                                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                        </svg>
                                                                        Xem
                                                                    </a>
                                                                    <a
                                                                        href={file.cloudinaryUrl}
                                                                        download={file.originalFileName || `document_${docIndex + 1}_${fileIndex + 1}`}
                                                                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 outline-none"
                                                                    >
                                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                        </svg>
                                                                        Tải về
                                                                    </a>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* Fallback if no files array but has direct file properties */}
                                                {(!doc.files || doc.files.length === 0) && (doc.fileName || doc.fileUrl) && (
                                                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                                                        <div className="flex items-center space-x-3 flex-1">
                                                            <div className="flex-shrink-0">
                                                                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                </svg>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                                    {doc.fileName || `Document ${docIndex + 1}`}
                                                                </p>
                                                                <p className="text-sm text-gray-500">
                                                                    {doc.description || 'Không có mô tả'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            {doc.fileUrl && (
                                                                <a
                                                                    href={doc.fileUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 outline-none"
                                                                >
                                                                    Xem
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">Không thể tải thông tin chi tiết</p>
                        </div>
                    )}

                    <div className="flex gap-4 justify-center pt-6 border-t border-gray-200 mt-6">
                        <button
                            className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 transition-colors flex items-center gap-2 outline-none"
                            onClick={() => handleApprove(selectedTutor)}
                        >
                            ✅ Phê duyệt
                        </button>
                        <button
                            className="bg-yellow-500 text-white px-6 py-3 rounded-md hover:bg-yellow-600 transition-colors flex items-center gap-2 outline-none"
                            onClick={() => handleRequestInfo(selectedTutor)}
                        >
                            📝 Yêu cầu thông tin bổ sung
                        </button>
                        <button
                            className="bg-red-500 text-white px-6 py-3 rounded-md hover:bg-red-600 transition-colors flex items-center gap-2 outline-none"
                            onClick={() => handleReject(selectedTutor)}
                        >
                            ❌ Từ chối
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6" style={{ outline: 'none' }}>
            <style dangerouslySetInnerHTML={{
                __html: `
                    * {
                        outline: none !important;
                    }
                    
                    button:focus {
                        outline: none !important;
                        box-shadow: none !important;
                    }
                    
                    button:focus-visible {
                        outline: none !important;
                        box-shadow: none !important;
                    }
                    
                    input:focus {
                        outline: none !important;
                        box-shadow: none !important;
                    }
                    
                    select:focus {
                        outline: none !important;
                        box-shadow: none !important;
                    }
                    
                    textarea:focus {
                        outline: none !important;
                        box-shadow: none !important;
                    }
                    
                    a:focus {
                        outline: none !important;
                        box-shadow: none !important;
                    }
                `
            }} />
            {/* Statistics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">Tổng đơn đăng ký</p>
                            <p className="text-2xl font-bold">{pendingApplications.length + 156 + 15}</p>
                        </div>
                        <div className="bg-blue-400 bg-opacity-30 rounded-full p-3">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm font-medium">Đã phê duyệt</p>
                            <p className="text-2xl font-bold">156</p>
                        </div>
                        <div className="bg-green-400 bg-opacity-30 rounded-full p-3">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-yellow-100 text-sm font-medium">Chờ xử lý</p>
                            <p className="text-2xl font-bold">{pendingApplications.length}</p>
                        </div>
                        <div className="bg-yellow-400 bg-opacity-30 rounded-full p-3">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 outline-none ${activeTab === tab.id
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <div className={activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'}>
                                {tab.icon}
                            </div>
                            <span>{tab.title}</span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${activeTab === tab.id
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                                }`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Search and Filter - Only show for non-student-requests tabs */}
            {activeTab !== 'student-requests' && (
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="relative flex-1 max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 outline-none text-sm text-black"
                            placeholder="Tìm kiếm gia sư..."
                        />
                    </div>
                    <div className="flex space-x-3">
                        <select className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 outline-none sm:text-sm rounded-md text-black">
                            <option>Tất cả môn học</option>
                            <option>Toán học</option>
                            <option>Tiếng Anh</option>
                            <option>Vật lý</option>
                            <option>Hóa học</option>
                        </select>
                        <select className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 outline-none sm:text-sm rounded-md text-black">
                            <option>Sắp xếp theo</option>
                            <option>Ngày nộp</option>
                            <option>Tên</option>
                            <option>Môn học</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Tab Content */}
            {activeTab === 'student-requests' ? (
                <StudentRequests />
            ) : (
                <>
                    {/* Loading and Error States */}
                    {loading && (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            <span className="ml-2">Đang tải thông tin gia sư...</span>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <strong className="font-bold">Error! </strong>
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                                        {/* Tutors List */}
                    {!loading && !error && (
                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            <ul className="divide-y divide-gray-200">
                                {currentTutors.map((tutor) => (
                                    <li key={tutor.id} className="px-6 py-4 hover:bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-16 w-16">
                                                    {tutor.tutor?.profileImageUrl ? (
                                                        <img
                                                            src={tutor.tutor.profileImageUrl}
                                                            alt={tutor.tutor?.fullName || 'Tutor'}
                                                            className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                                                        />
                                                    ) : (
                                                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                                                            {(tutor.tutor?.fullName || tutor.tutor?.nickName || 'T').charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4 flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="flex items-center">
                                                                <h3 className="text-lg font-semibold text-gray-900">
                                                                    {tutor.tutor?.fullName || tutor.tutor?.nickName || 'Không có tên'}
                                                                </h3>
                                                                <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${tutor.status === 1 ? 'bg-yellow-100 text-yellow-800' :
                                                                    tutor.status === 2 ? 'bg-green-100 text-green-800' :
                                                                        tutor.status === 3 ? 'bg-red-100 text-red-800' :
                                                                            'bg-gray-100 text-gray-800'
                                                                    }`}>
                                                                    {tutor.status === 1 ? 'Chờ duyệt' :
                                                                        tutor.status === 2 ? 'Đã duyệt' :
                                                                            tutor.status === 3 ? 'Từ chối' : 'Không xác định'}
                                                                </span>
                                                            </div>
                                                            {tutor.tutor?.fullName && tutor.tutor?.nickName && tutor.tutor.fullName !== tutor.tutor.nickName && (
                                                                <p className="text-sm text-gray-600 mt-1">Biệt danh: {tutor.tutor.nickName}</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                                        <div className="flex items-center">
                                                            <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                            </svg>
                                                            <span>{tutor.tutor?.email || 'Không có email'}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6v6m-7-3h14a2 2 0 002-2v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                                            </svg>
                                                            <span>
                                                                {tutor.submittedAt ?
                                                                    `Nộp: ${new Date(tutor.submittedAt).toLocaleDateString('vi-VN')}` :
                                                                    'Chưa xác định'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Languages */}
                                                    {tutor.tutor?.languages && tutor.tutor.languages.length > 0 && (
                                                        <div className="mt-3 flex flex-wrap gap-1">
                                                            {tutor.tutor.languages.slice(0, 3).map((lang, index) => (
                                                                <span key={index} className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${lang.isPrimary ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
                                                                    }`}>
                                                                    {lang.languageCode}
                                                                    {lang.isPrimary && <span className="ml-1">★</span>}
                                                                </span>
                                                            ))}
                                                            {tutor.tutor.languages.length > 3 && (
                                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                                                    +{tutor.tutor.languages.length - 3} khác
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Brief description */}
                                                    {tutor.tutor?.brief && (
                                                        <div className="mt-2">
                                                            <p className="text-sm text-gray-700 italic overflow-hidden" style={{
                                                                display: '-webkit-box',
                                                                WebkitLineClamp: 2,
                                                                WebkitBoxOrient: 'vertical'
                                                            }}>
                                                                "{tutor.tutor.brief}"
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Hashtags */}
                                                    {tutor.tutor?.hashtags && tutor.tutor.hashtags.length > 0 && (
                                                        <div className="mt-2 flex flex-wrap gap-1">
                                                            {tutor.tutor.hashtags.slice(0, 4).map((tag, index) => (
                                                                <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                                    #{tag.name}
                                                                </span>
                                                            ))}
                                                            {tutor.tutor.hashtags.length > 4 && (
                                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                                    +{tutor.tutor.hashtags.length - 4}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleViewProfile(tutor)}
                                                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 outline-none"
                                                >
                                                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    Xem
                                                </button>
                                                {activeTab === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(tutor)}
                                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 outline-none">
                                                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            Duyệt
                                                        </button>
                                                        <button
                                                            onClick={() => handleRequestInfo(tutor)}
                                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 outline-none"
                                                        >
                                                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            Yêu cầu TT
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(tutor)}
                                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 outline-none"
                                                        >
                                                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                            Từ chối
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            )}

            {/* Pagination */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                    <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        Trước
                    </button>
                    <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        Sau
                    </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Hiển thị <span className="font-medium">1</span> đến <span className="font-medium">{Math.min(pageSize, currentTutors.length)}</span> trong tổng số{' '}
                            <span className="font-medium">{currentTutors.length}</span> kết quả
                        </p>
                    </div>
                    <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                <span className="sr-only">Trước</span>
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                                1
                            </button>
                            <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                <span className="sr-only">Sau</span>
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </nav>
                    </div>
                </div>
            </div>

            {selectedTutor && renderTutorProfile()}

            {/* Approve Modal */}
            {showApproveModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Xác nhận phê duyệt</h3>
                            <button
                                className="text-gray-500 hover:text-gray-700"
                                onClick={() => setShowApproveModal(false)}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="mb-4">
                            <p className="text-gray-700 mb-4">
                                Bạn có chắc chắn muốn phê duyệt hồ sơ của <strong>{reviewingTutor?.tutor?.fullName || reviewingTutor?.tutor?.nickName || 'Người dùng'}</strong>?
                            </p>
                            <p className="text-sm text-gray-600 mb-4">
                                Sau khi phê duyệt, tài khoản sẽ được chuyển từ learner thành tutor.
                            </p>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ghi chú (tùy chọn):
                                </label>
                                <textarea
                                    value={reviewNotes}
                                    onChange={(e) => setReviewNotes(e.target.value)}
                                    rows={3}
                                    className="w-full p-2 border border-gray-300 rounded-md outline-none text-black"
                                    placeholder="Nhập ghi chú về việc phê duyệt..."
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                                onClick={() => setShowApproveModal(false)}
                                disabled={reviewLoading}
                            >
                                Hủy
                            </button>
                            <button
                                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center gap-2"
                                onClick={confirmApprove}
                                disabled={reviewLoading}
                            >
                                {reviewLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        ✅ Phê duyệt
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Xác nhận từ chối</h3>
                            <button
                                className="text-gray-500 hover:text-gray-700"
                                onClick={() => setShowRejectModal(false)}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="mb-4">
                            <p className="text-gray-700 mb-4">
                                Bạn có chắc chắn muốn từ chối hồ sơ của <strong>{reviewingTutor?.tutor?.fullName || reviewingTutor?.tutor?.nickName || 'Người dùng'}</strong>?
                            </p>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Lý do từ chối <span className="text-red-500">*</span>:
                                </label>
                                <textarea
                                    value={reviewNotes}
                                    onChange={(e) => setReviewNotes(e.target.value)}
                                    rows={4}
                                    className="w-full p-2 border border-gray-300 rounded-md outline-none text-black"
                                    placeholder="Nhập lý do từ chối hồ sơ..."
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                                onClick={() => setShowRejectModal(false)}
                                disabled={reviewLoading}
                            >
                                Hủy
                            </button>
                            <button
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center gap-2"
                                onClick={confirmReject}
                                disabled={reviewLoading}
                            >
                                {reviewLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        ❌ Từ chối
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Request Info Modal */}
            {showInfoRequestModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Yêu cầu thông tin bổ sung</h3>
                            <button
                                className="text-gray-500 hover:text-gray-700"
                                onClick={() => setShowInfoRequestModal(false)}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="mb-4">
                            <p className="text-gray-700 mb-4">
                                Yêu cầu <strong>{reviewingTutor?.tutor?.fullName || reviewingTutor?.tutor?.nickName || 'Người dùng'}</strong> bổ sung thông tin:
                            </p>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Thông tin cần bổ sung <span className="text-red-500">*</span>:
                                </label>
                                <textarea
                                    value={reviewNotes}
                                    onChange={(e) => setReviewNotes(e.target.value)}
                                    rows={4}
                                    className="w-full p-2 border border-gray-300 rounded-md outline-none text-black"
                                    placeholder="Nhập thông tin cần bổ sung..."
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                                onClick={() => setShowInfoRequestModal(false)}
                                disabled={reviewLoading}
                            >
                                Hủy
                            </button>
                            <button
                                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors flex items-center gap-2"
                                onClick={confirmRequestInfo}
                                disabled={reviewLoading}
                            >
                                {reviewLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        📝 Gửi yêu cầu
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TutorManagement; 