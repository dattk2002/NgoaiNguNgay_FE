import React, { useState, useEffect } from 'react';
import { 
    staffFetchTutorApplications,
    staffFetchTutorApplicationsMetadata,
    fetchTutorApplicationById, 
    reviewTutorApplication
} from '../api/auth';
import { showSuccess, showError } from '../../utils/toastManager.js';
import { motion, AnimatePresence } from "framer-motion";
import NoFocusOutLineButton from "../../utils/noFocusOutlineButton";
import { formatLanguageCode, formatProficiencyLevel } from '../../utils/formatLanguageCode';
import { 
    APPLICATION_STATUS, 
    REVISION_ACTION, 
    getStatusText, 
    getStatusColorClass,
    getActionText 
} from '../../utils/tutorApplicationConstants';

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
    const [applications, setApplications] = useState([]);
    const [metadata, setMetadata] = useState(null);
    const [statistics, setStatistics] = useState({
        pending: 0,
        approved: 0,
        needInfo: 0,
        rejected: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [detailsCache, setDetailsCache] = useState({});
    const [statusFilter, setStatusFilter] = useState(null);
    const [overallStatistics, setOverallStatistics] = useState({
        pending: 0,
        approved: 0,
        needInfo: 0,
        rejected: 0
    });

    // Using imported constants and helper functions
    const getStatusColor = (status) => {
        return getStatusColorClass(status);
    };

    // Local function to convert status to Vietnamese
    const getStatusTextVietnamese = (status) => {
        const statusMap = {
            0: "Chưa gửi hồ sơ",
            1: "Chờ duyệt",
            2: "Cần thông tin bổ sung", 
            3: "Chờ xác minh lại",
            4: "Đã duyệt",
            5: "Đã từ chối"
        };
        
        return statusMap[status] || "Không xác định";
    };

    const tabs = [
        {
            id: 'pending',
            title: 'Chờ duyệt',
            count: overallStatistics.pending,
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            id: 'approved',
            title: 'Đã duyệt',
            count: overallStatistics.approved,
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            )
        },
        {
            id: 'need-info',
            title: 'Cần thông tin',
            count: overallStatistics.needInfo,
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            id: 'rejected',
            title: 'Đã từ chối',
            count: overallStatistics.rejected,
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            )
        }
    ];

    // Calculate statistics from applications data
    const calculateStatistics = (applications) => {
        // For now, we'll calculate based on current page data
        // In a real implementation, you might want to fetch statistics separately
        const stats = {
            pending: applications.filter(app => app.status === 1).length,
            approved: applications.filter(app => app.status === 4).length,
            needInfo: applications.filter(app => app.status === 2).length,
            rejected: applications.filter(app => app.status === 5).length
        };
        setStatistics(stats);
    };

    // Load metadata
    const loadMetadata = async () => {
        try {
            const metadataData = await staffFetchTutorApplicationsMetadata();
            setMetadata(metadataData);
            console.log('Metadata loaded:', metadataData);
        } catch (error) {
            console.error('Error loading metadata:', error);
        }
    };

    // Load overall statistics (call this once on component mount)
    const loadOverallStatistics = async () => {
        try {
            // Fetch statistics for all statuses
            const [pendingResponse, approvedResponse, needInfoResponse, rejectedResponse] = await Promise.all([
                staffFetchTutorApplications({ page: 1, size: 1, status: 1 }),
                staffFetchTutorApplications({ page: 1, size: 1, status: 4 }),
                staffFetchTutorApplications({ page: 1, size: 1, status: 2 }),
                staffFetchTutorApplications({ page: 1, size: 1, status: 5 })
            ]);

            setOverallStatistics({
                pending: pendingResponse?.additionalData?.totalItems || 0,
                approved: approvedResponse?.additionalData?.totalItems || 0,
                needInfo: needInfoResponse?.additionalData?.totalItems || 0,
                rejected: rejectedResponse?.additionalData?.totalItems || 0
            });
        } catch (error) {
            console.error('Error loading overall statistics:', error);
        }
    };

    // Load applications
    const loadApplications = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const params = {
                page: currentPage,
                size: pageSize
            };
            
            // Add status filter based on active tab for proper pagination
            if (activeTab === 'pending') {
                params.status = 1; // PendingVerification
            } else if (activeTab === 'approved') {
                params.status = 4; // Verified
            } else if (activeTab === 'need-info') {
                params.status = 2; // RevisionRequested
            } else if (activeTab === 'rejected') {
                params.status = 5; // Rejected
            }

            const response = await staffFetchTutorApplications(params);
            console.log('Applications response:', response);

            if (response && response.data) {
                setApplications(response.data);
                
                // Update pagination info
                if (response.additionalData) {
                    setTotalItems(response.additionalData.totalItems);
                    setTotalPages(response.additionalData.totalPages);
                    setCurrentPage(response.additionalData.currentPageNumber);
                }

                // Fetch detailed information for each application
                const enrichedData = await Promise.all(
                    response.data.map(async (application) => {
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
                                    ...details.tutor
                                },
                                languages: details.languages,
                                hashtags: details.hashtags
                            };
                        } catch (error) {
                            console.error(`Error fetching details for application ${application.id}:`, error);
                            return application; // Return original if details fetch fails
                        }
                    })
                );

                console.log('Debug - Enriched applications data:', enrichedData);
                setApplications(enrichedData);
            }
        } catch (err) {
            setError(err.message);
            console.error('Error loading applications:', err);
        } finally {
            setLoading(false);
        }
    };

    // Filter applications by status
    const filterApplicationsByStatus = (applications, status) => {
        return applications.filter(app => app.status === status);
    };

    useEffect(() => {
        // Load metadata and overall statistics on component mount
        loadMetadata();
        loadOverallStatistics();
    }, []);

    useEffect(() => {
        // Load applications when tab or page changes
        loadApplications();
    }, [activeTab, currentPage, pageSize]);

    useEffect(() => {
        // Calculate statistics whenever applications change
        calculateStatistics(applications);
    }, [applications]);

    // Update the currentTutors calculation to handle pagination properly
    const currentTutors = (() => {
        switch (activeTab) {
            case 'pending':
                return filterApplicationsByStatus(applications, 1); // PendingVerification
            case 'approved':
                return filterApplicationsByStatus(applications, 4); // Verified
            case 'need-info':
                return filterApplicationsByStatus(applications, 2); // RevisionRequested
            case 'rejected':
                return filterApplicationsByStatus(applications, 5); // Rejected
            default:
                return applications; // Show all for other tabs
        }
    })();

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
            await reviewTutorApplication(reviewingTutor.id, REVISION_ACTION.APPROVE, reviewNotes);

            // Update the application status in applications
            setApplications(prev =>
                prev.map(app => 
                    app.id === reviewingTutor.id 
                        ? { ...app, status: 4 }
                        : app
                )
            );

            // Close all modals
            setShowApproveModal(false);
            setSelectedTutor(null);
            setSelectedTutorDetails(null);
            setReviewingTutor(null);
            setReviewNotes('');

            // Update overall statistics
            setOverallStatistics(prev => ({
                ...prev,
                pending: prev.pending - 1,
                approved: prev.approved + 1
            }));

            showSuccess('Đã phê duyệt hồ sơ gia sư thành công!');
        } catch (error) {
            console.error('Error approving tutor:', error);
            showError('Có lỗi xảy ra khi phê duyệt hồ sơ: ' + error.message);
        } finally {
            setReviewLoading(false);
        }
    };

    const confirmReject = async () => {
        if (!reviewingTutor || !reviewNotes.trim()) {
            showError('Vui lòng nhập lý do từ chối');
            return;
        }

        setReviewLoading(true);
        try {
            await reviewTutorApplication(reviewingTutor.id, REVISION_ACTION.REJECT, reviewNotes);

            // Update the application status in applications
            setApplications(prev =>
                prev.map(app => 
                    app.id === reviewingTutor.id 
                        ? { ...app, status: 5 }
                        : app
                )
            );

            // Close all modals
            setShowRejectModal(false);
            setSelectedTutor(null);
            setSelectedTutorDetails(null);
            setReviewingTutor(null);
            setReviewNotes('');

            // Update overall statistics
            setOverallStatistics(prev => ({
                ...prev,
                pending: prev.pending - 1,
                rejected: prev.rejected + 1
            }));

            showSuccess('Đã từ chối hồ sơ gia sư!');
        } catch (error) {
            console.error('Error rejecting tutor:', error);
            showError('Có lỗi xảy ra khi từ chối hồ sơ: ' + error.message);
        } finally {
            setReviewLoading(false);
        }
    };

    const confirmRequestInfo = async () => {
        if (!reviewingTutor || !reviewNotes.trim()) {
            showError('Vui lòng nhập thông tin cần bổ sung');
            return;
        }

        setReviewLoading(true);
        try {
            await reviewTutorApplication(reviewingTutor.id, REVISION_ACTION.REQUEST_REVISION, reviewNotes);

            // Update the application status in applications
            setApplications(prev =>
                prev.map(app => 
                    app.id === reviewingTutor.id 
                        ? { ...app, status: 2 }
                        : app
                )
            );

            // Close all modals
            setShowInfoRequestModal(false);
            setSelectedTutor(null);
            setSelectedTutorDetails(null);
            setReviewingTutor(null);
            setReviewNotes('');

            // Update overall statistics
            setOverallStatistics(prev => ({
                ...prev,
                pending: prev.pending - 1,
                needInfo: prev.needInfo + 1
            }));

            showSuccess('Đã yêu cầu bổ sung thông tin!');
        } catch (error) {
            console.error('Error requesting info:', error);
            showError('Có lỗi xảy ra khi yêu cầu thông tin: ' + error.message);
        } finally {
            setReviewLoading(false);
        }
    };

    // Handle pagination
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
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
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(tutor.status)}`}>
                    {getStatusText(tutor.status)}
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
                <NoFocusOutLineButton
                    className="bg-blue-500 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors flex items-center gap-1"
                    onClick={() => handleViewProfile(tutor)}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Xem hồ sơ
                </NoFocusOutLineButton>

                {tutor.status === 1 && (
                    <>
                        <NoFocusOutLineButton
                            className="bg-green-500 text-white px-3 py-2 rounded-md text-sm hover:bg-green-600 transition-colors flex items-center gap-1"
                            onClick={() => handleApprove(tutor)}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Phê duyệt
                        </NoFocusOutLineButton>
                        <NoFocusOutLineButton
                            className="bg-red-500 text-white px-3 py-2 rounded-md text-sm hover:bg-red-600 transition-colors flex items-center gap-1"
                            onClick={() => handleReject(tutor)}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Từ chối
                        </NoFocusOutLineButton>
                        <NoFocusOutLineButton
                            className="bg-yellow-500 text-white px-3 py-2 rounded-md text-sm hover:bg-yellow-600 transition-colors flex items-center gap-1"
                            onClick={() => handleRequestInfo(tutor)}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Yêu cầu thông tin
                        </NoFocusOutLineButton>
                    </>
                )}
            </div>
        </div>
    );

    const renderTutorProfile = () => {
        const modalVariants = {
            hidden: { opacity: 0, scale: 0.95 },
            visible: { opacity: 1, scale: 1 },
            exit: { opacity: 0, scale: 0.95 },
        };

        const backdropVariants = {
            hidden: { opacity: 0 },
            visible: { opacity: 1 },
            exit: { opacity: 0 },
        };

        return (
            <AnimatePresence>
                <motion.div
                    className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-4"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={backdropVariants}
                    onClick={() => {
                        setSelectedTutor(null);
                        setSelectedTutorDetails(null);
                    }}
                >
                    <motion.div
                        className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] overflow-y-auto relative"
                        variants={modalVariants}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center p-6 border-b border-gray-200">
                            <h3 className="text-2xl font-semibold text-gray-800">Chi tiết hồ sơ gia sư</h3>
                            <NoFocusOutLineButton
                                className="text-gray-500 hover:text-gray-700 p-2"
                                onClick={() => {
                                    setSelectedTutor(null);
                                    setSelectedTutorDetails(null);
                                }}
                                aria-label="Close modal"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </NoFocusOutLineButton>
                        </div>

                        <div className="p-6">
                    {detailsLoading ? (
                        <div className="space-y-6">
                            {/* Basic Information Skeleton */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left Column Skeleton */}
                                <div className="space-y-4">
                                    {/* Avatar Section Skeleton */}
                                    <div className="bg-gray-50 p-4 rounded-lg flex items-center space-x-4">
                                        <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse"></div>
                                        <div className="flex-1">
                                            <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" style={{ width: '150px' }}></div>
                                            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" style={{ width: '100px' }}></div>
                                            <div className="h-6 bg-gray-200 rounded-full animate-pulse" style={{ width: '80px' }}></div>
                                        </div>
                                    </div>

                                    {/* Contact Info Skeleton */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="h-5 bg-gray-200 rounded animate-pulse mb-3" style={{ width: '140px' }}></div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: '60px' }}></div>
                                                <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: '120px' }}></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Application Info Skeleton */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="h-5 bg-gray-200 rounded animate-pulse mb-3" style={{ width: '160px' }}></div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: '80px' }}></div>
                                                <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: '60px' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column Skeleton */}
                                <div className="space-y-4">
                                    {/* Tutor Details Skeleton */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="h-5 bg-gray-200 rounded animate-pulse mb-3" style={{ width: '130px' }}></div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: '100px' }}></div>
                                                <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: '80px' }}></div>
                                            </div>
                                            <div className="flex justify-between">
                                                <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: '140px' }}></div>
                                                <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: '60px' }}></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Languages Skeleton */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="h-5 bg-gray-200 rounded animate-pulse mb-3" style={{ width: '80px' }}></div>
                                        <div className="space-y-2">
                                            {[1, 2, 3].map((index) => (
                                                <div key={index} className="flex justify-between items-center">
                                                    <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: '100px' }}></div>
                                                    <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: '60px' }}></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
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
                                            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedTutorDetails.status)}`}>
                                                {getStatusText(selectedTutorDetails.status)}
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
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h4 className="text-lg font-semibold text-gray-800 mb-3">Ngôn ngữ</h4>
                                                {(() => {
                                                    console.log("🔍 Modal - Languages data:", selectedTutorDetails.languages);
                                                    return selectedTutorDetails.languages && selectedTutorDetails.languages.length > 0 ? (
                                                        <div className="space-y-2">
                                                            {selectedTutorDetails.languages.map((lang, index) => (
                                                                <div key={index} className="flex justify-between items-center">
                                                                    <span className="font-medium text-gray-600">
                                                                        {formatLanguageCode(lang.languageCode)} {lang.isPrimary && '(Chính)'}
                                                                    </span>
                                                                    <span className="text-gray-800">
                                                                        Trình độ: {formatProficiencyLevel(lang.proficiency)}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-gray-500 italic">Chưa có thông tin ngôn ngữ</p>
                                                    );
                                                })()}
                                            </div>

                                            {/* Hashtags */}
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h4 className="text-lg font-semibold text-gray-800 mb-3">Hastag</h4>
                                                {(() => {
                                                    console.log("🔍 Modal - Hashtags data:", selectedTutorDetails.hashtags);
                                                    return selectedTutorDetails.hashtags && selectedTutorDetails.hashtags.length > 0 ? (
                                                        <div className="flex flex-wrap gap-2">
                                                            {selectedTutorDetails.hashtags.map((tag, index) => (
                                                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                                                                    {tag.name || tag.value || tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-gray-500 italic">Chưa có thông tin kỹ năng và chứng chỉ</p>
                                                    );
                                                })()}
                                            </div>
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
                        {selectedTutorDetails?.status === 1 && (
                            <>
                                <NoFocusOutLineButton
                                    className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 transition-colors flex items-center gap-2"
                                    onClick={() => handleApprove(selectedTutor)}
                                >
                                    ✅ Phê duyệt
                                </NoFocusOutLineButton>
                                <NoFocusOutLineButton
                                    className="bg-yellow-500 text-white px-6 py-3 rounded-md hover:bg-yellow-600 transition-colors flex items-center gap-2"
                                    onClick={() => handleRequestInfo(selectedTutor)}
                                >
                                    📝 Yêu cầu thông tin bổ sung
                                </NoFocusOutLineButton>
                                <NoFocusOutLineButton
                                    className="bg-red-500 text-white px-6 py-3 rounded-md hover:bg-red-600 transition-colors flex items-center gap-2"
                                    onClick={() => handleReject(selectedTutor)}
                                >
                                    ❌ Từ chối
                                </NoFocusOutLineButton>
                            </>
                        )}
                        {selectedTutorDetails?.status === 0 && (
                            <>
                                <NoFocusOutLineButton
                                    className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 transition-colors flex items-center gap-2"
                                    onClick={() => handleApprove(selectedTutor)}
                                >
                                    ✅ Phê duyệt
                                </NoFocusOutLineButton>
                                <NoFocusOutLineButton
                                    className="bg-red-500 text-white px-6 py-3 rounded-md hover:bg-red-600 transition-colors flex items-center gap-2"
                                    onClick={() => handleReject(selectedTutor)}
                                >
                                    ❌ Từ chối
                                </NoFocusOutLineButton>
                            </>
                        )}
                    </div>
                        </div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        );
    };

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
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm font-medium">Đã phê duyệt</p>
                            <p className="text-2xl font-bold">{overallStatistics.approved}</p>
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
                            <p className="text-2xl font-bold">{overallStatistics.pending}</p>
                        </div>
                        <div className="bg-yellow-400 bg-opacity-30 rounded-full p-3">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-red-100 text-sm font-medium">Đã từ chối</p>
                            <p className="text-2xl font-bold">{overallStatistics.rejected}</p>
                        </div>
                        <div className="bg-red-400 bg-opacity-30 rounded-full p-3">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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

            {/* Search and Filter - Only show for non-rejected tabs */}
            {activeTab !== 'rejected' && (
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
                        {metadata?.ApplicationStatus && (
                            <select 
                                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 outline-none sm:text-sm rounded-md text-black"
                                value={statusFilter || ''}
                                onChange={(e) => setStatusFilter(e.target.value || null)}
                            >
                                <option value="">Tất cả trạng thái</option>
                                {metadata.ApplicationStatus.map((status) => (
                                    <option key={status.numericValue} value={status.numericValue}>
                                        {status.name} - {status.description}
                                    </option>
                                ))}
                            </select>
                        )}
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
            {activeTab === 'rejected' ? (
                <>
                    {/* Loading and Error States */}
                    {loading && (
                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            <ul className="divide-y divide-gray-200">
                                {[1, 2, 3, 4, 5].map((index) => (
                                    <li key={index} className="px-6 py-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse mr-4"></div>
                                                <div>
                                                    <div className="h-5 bg-gray-200 rounded animate-pulse mb-2" style={{ width: '150px' }}></div>
                                                    <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: '120px' }}></div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <div className="h-8 bg-gray-200 rounded animate-pulse" style={{ width: '80px' }}></div>
                                                <div className="h-8 bg-gray-200 rounded animate-pulse" style={{ width: '60px' }}></div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <strong className="font-bold">Error! </strong>
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    {/* Applications List */}
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
                                                    <div className="flex items-center">
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            {tutor.tutor?.fullName || tutor.tutor?.nickName || tutor.tutorName || 'Không có tên'}
                                                        </h3>
                                                        <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tutor.status)}`}>
                                                            {getStatusTextVietnamese(tutor.status)}
                                                        </span>
                                                    </div>
                                                    {tutor.tutor?.fullName && tutor.tutor?.nickName && tutor.tutor.fullName !== tutor.tutor.nickName && (
                                                        <p className="text-sm text-gray-600 mt-1">Biệt danh: {tutor.tutor.nickName}</p>
                                                    )}

                                                    <div className="mt-2 space-y-1 text-sm text-gray-600">
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

                                                    {/* Brief description */}
                                                    {tutor.tutor?.brief && (
                                                        <div className="mt-2">
                                                            <p className="text-sm text-gray-700 italic">
                                                                "{tutor.tutor.brief}"
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <NoFocusOutLineButton
                                                    onClick={() => handleViewProfile(tutor)}
                                                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                                >
                                                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    Xem
                                                </NoFocusOutLineButton>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            ) : (
                <>
                    {/* Loading and Error States */}
                    {loading && (
                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            <ul className="divide-y divide-gray-200">
                                {[1, 2, 3, 4, 5].map((index) => (
                                    <li key={index} className="px-6 py-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse mr-4"></div>
                                                <div>
                                                    <div className="h-5 bg-gray-200 rounded animate-pulse mb-2" style={{ width: '150px' }}></div>
                                                    <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: '120px' }}></div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <div className="h-8 bg-gray-200 rounded animate-pulse" style={{ width: '80px' }}></div>
                                                <div className="h-8 bg-gray-200 rounded animate-pulse" style={{ width: '60px' }}></div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <strong className="font-bold">Error! </strong>
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    {/* Applications List */}
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
                                                    <div className="flex items-center">
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            {tutor.tutor?.fullName || tutor.tutor?.nickName || tutor.tutorName || 'Không có tên'}
                                                        </h3>
                                                        <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tutor.status)}`}>
                                                            {getStatusTextVietnamese(tutor.status)}
                                                        </span>
                                                    </div>
                                                    {tutor.tutor?.fullName && tutor.tutor?.nickName && tutor.tutor.fullName !== tutor.tutor.nickName && (
                                                        <p className="text-sm text-gray-600 mt-1">Biệt danh: {tutor.tutor.nickName}</p>
                                                    )}

                                                    <div className="mt-2 space-y-1 text-sm text-gray-600">
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

                                                    {/* Brief description */}
                                                    {tutor.tutor?.brief && (
                                                        <div className="mt-2">
                                                            <p className="text-sm text-gray-700 italic">
                                                                "{tutor.tutor.brief}"
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <NoFocusOutLineButton
                                                    onClick={() => handleViewProfile(tutor)}
                                                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                                >
                                                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    Xem
                                                </NoFocusOutLineButton>
                                                {activeTab === 'pending' && tutor.status === 1 && (
                                                    <>
                                                        <NoFocusOutLineButton
                                                            onClick={() => handleApprove(tutor)}
                                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                                                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            Duyệt
                                                        </NoFocusOutLineButton>
                                                        <NoFocusOutLineButton
                                                            onClick={() => handleRequestInfo(tutor)}
                                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
                                                        >
                                                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            Yêu cầu TT
                                                        </NoFocusOutLineButton>
                                                        <NoFocusOutLineButton
                                                            onClick={() => handleReject(tutor)}
                                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                                                        >
                                                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                            Từ chối
                                                        </NoFocusOutLineButton>
                                                    </>
                                                )}
                                                {activeTab === 'need-info' && tutor.status === 0 && (
                                                    <>
                                                        <NoFocusOutLineButton
                                                            onClick={() => handleApprove(tutor)}
                                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                                                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            Duyệt
                                                        </NoFocusOutLineButton>
                                                        <NoFocusOutLineButton
                                                            onClick={() => handleReject(tutor)}
                                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                                                        >
                                                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                            Từ chối
                                                        </NoFocusOutLineButton>
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
            {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <NoFocusOutLineButton 
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Trước
                        </NoFocusOutLineButton>
                        <NoFocusOutLineButton 
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Sau
                        </NoFocusOutLineButton>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Hiển thị <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> đến{' '}
                                <span className="font-medium">{Math.min(currentPage * pageSize, totalItems)}</span> trong tổng số{' '}
                                <span className="font-medium">{totalItems}</span> kết quả
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <NoFocusOutLineButton 
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    <span className="sr-only">Trước</span>
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </NoFocusOutLineButton>
                                
                                {/* Page numbers */}
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    const pageNum = i + 1;
                                    return (
                                        <NoFocusOutLineButton
                                            key={pageNum}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                pageNum === currentPage
                                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                            }`}
                                            onClick={() => handlePageChange(pageNum)}
                                        >
                                            {pageNum}
                                        </NoFocusOutLineButton>
                                    );
                                })}
                                
                                <NoFocusOutLineButton 
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    <span className="sr-only">Sau</span>
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                </NoFocusOutLineButton>
                            </nav>
                        </div>
                    </div>
                </div>
            )}

            {selectedTutor && renderTutorProfile()}

            {/* Approve Modal */}
            {showApproveModal && (
                <AnimatePresence>
                    <motion.div
                        className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowApproveModal(false)}
                    >
                        <motion.div
                            className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">Xác nhận phê duyệt</h3>
                                <NoFocusOutLineButton
                                    className="text-gray-500 hover:text-gray-700"
                                    onClick={() => setShowApproveModal(false)}
                                    aria-label="Close modal"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </NoFocusOutLineButton>
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
                                        className="w-full p-2 border border-gray-300 rounded-md text-black"
                                        placeholder="Nhập ghi chú về việc phê duyệt..."
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end">
                                <NoFocusOutLineButton
                                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                                    onClick={() => setShowApproveModal(false)}
                                    disabled={reviewLoading}
                                >
                                    Hủy
                                </NoFocusOutLineButton>
                                <NoFocusOutLineButton
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
                                </NoFocusOutLineButton>
                            </div>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <AnimatePresence>
                    <motion.div
                        className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowRejectModal(false)}
                    >
                        <motion.div
                            className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">Xác nhận từ chối</h3>
                                <NoFocusOutLineButton
                                    className="text-gray-500 hover:text-gray-700"
                                    onClick={() => setShowRejectModal(false)}
                                    aria-label="Close modal"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </NoFocusOutLineButton>
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
                                        className="w-full p-2 border border-gray-300 rounded-md text-black"
                                        placeholder="Nhập lý do từ chối hồ sơ..."
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end">
                                <NoFocusOutLineButton
                                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                                    onClick={() => setShowRejectModal(false)}
                                    disabled={reviewLoading}
                                >
                                    Hủy
                                </NoFocusOutLineButton>
                                <NoFocusOutLineButton
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
                                </NoFocusOutLineButton>
                            </div>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            )}

            {/* Request Info Modal */}
            {showInfoRequestModal && (
                <AnimatePresence>
                    <motion.div
                        className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowInfoRequestModal(false)}
                    >
                        <motion.div
                            className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">Yêu cầu thông tin bổ sung</h3>
                                <NoFocusOutLineButton
                                    className="text-gray-500 hover:text-gray-700"
                                    onClick={() => setShowInfoRequestModal(false)}
                                    aria-label="Close modal"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </NoFocusOutLineButton>
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
                                        className="w-full p-2 border border-gray-300 rounded-md text-black"
                                        placeholder="Nhập thông tin cần bổ sung..."
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end">
                                <NoFocusOutLineButton
                                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                                    onClick={() => setShowInfoRequestModal(false)}
                                    disabled={reviewLoading}
                                >
                                    Hủy
                                </NoFocusOutLineButton>
                                <NoFocusOutLineButton
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
                                </NoFocusOutLineButton>
                            </div>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            )}
        </div>
    );
};

export default TutorManagement; 