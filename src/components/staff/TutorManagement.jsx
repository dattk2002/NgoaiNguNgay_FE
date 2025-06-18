import React, { useState } from 'react';

const TutorManagement = () => {
    const [activeTab, setActiveTab] = useState('pending');
    const [selectedTutor, setSelectedTutor] = useState(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showInfoRequestModal, setShowInfoRequestModal] = useState(false);

    const tabs = [
        {
            id: 'pending',
            title: 'Chờ duyệt',
            count: 23,
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
        }
    ];

    const mockTutors = {
        pending: [
            {
                id: 1,
                name: 'Nguyễn Văn A',
                email: 'nguyenvana@gmail.com',
                subject: 'Toán học',
                phone: '0123456789',
                experience: '3 năm kinh nghiệm',
                education: 'Cử nhân Toán, ĐH Bách Khoa',
                rating: null,
                submitDate: '2023-12-01',
                status: 'pending'
            },
            {
                id: 2,
                name: 'Trần Thị B',
                email: 'tranthib@gmail.com',
                subject: 'Tiếng Anh',
                phone: '0987654321',
                experience: '5 năm kinh nghiệm',
                education: 'Thạc sĩ Ngôn ngữ Anh, ĐH Ngoại Ngữ',
                rating: null,
                submitDate: '2023-12-02',
                status: 'pending'
            }
        ],
        approved: [
            {
                id: 3,
                name: 'Lê Văn C',
                email: 'levanc@gmail.com',
                subject: 'Vật lý',
                phone: '0369258147',
                experience: '7 năm kinh nghiệm',
                education: 'Tiến sĩ Vật lý, ĐH Quốc Gia',
                rating: 4.8,
                submitDate: '2023-11-15',
                status: 'approved'
            }
        ],
        'need-info': [
            {
                id: 4,
                name: 'Phạm Thị D',
                email: 'phamthid@gmail.com',
                subject: 'Hóa học',
                phone: '0147258369',
                experience: '2 năm kinh nghiệm',
                education: 'Cử nhân Hóa học, ĐH Khoa Học Tự Nhiên',
                rating: null,
                submitDate: '2023-11-28',
                status: 'need-info'
            }
        ]
    };

    const currentTutors = mockTutors[activeTab] || [];

    const handleViewProfile = (tutor) => {
        setSelectedTutor(tutor);
    };

    const handleApprove = (tutorId) => {
        console.log('Phê duyệt gia sư:', tutorId);
        // Logic phê duyệt gia sư
    };

    const handleReject = (tutorId) => {
        console.log('Từ chối gia sư:', tutorId);
        // Logic từ chối gia sư
    };

    const handleRequestInfo = (tutorId) => {
        console.log('Yêu cầu thông tin bổ sung:', tutorId);
        // Logic yêu cầu thông tin bổ sung
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
                            onClick={() => handleApprove(tutor.id)}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Phê duyệt
                        </button>
                        <button
                            className="bg-red-500 text-white px-3 py-2 rounded-md text-sm hover:bg-red-600 transition-colors flex items-center gap-1"
                            onClick={() => handleReject(tutor.id)}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Từ chối
                        </button>
                        <button
                            className="bg-yellow-500 text-white px-3 py-2 rounded-md text-sm hover:bg-yellow-600 transition-colors flex items-center gap-1"
                            onClick={() => handleRequestInfo(tutor.id)}
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
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h3 className="text-2xl font-semibold text-gray-800">Chi tiết hồ sơ gia sư</h3>
                    <button
                        className="text-gray-500 hover:text-gray-700 p-2"
                        onClick={() => setSelectedTutor(null)}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    <div className="flex gap-6 mb-8 pb-6 border-b border-gray-200">
                        <img src={selectedTutor.avatar} alt={selectedTutor.name} className="w-24 h-24 rounded-full object-cover" />
                        <div className="flex-1">
                            <h4 className="text-2xl font-semibold text-gray-800 mb-4">{selectedTutor.name}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
                                <p><span className="font-medium">Môn học:</span> {selectedTutor.subject}</p>
                                <p><span className="font-medium">Kinh nghiệm:</span> {selectedTutor.experience}</p>
                                <p><span className="font-medium">Email:</span> {selectedTutor.email}</p>
                                <p><span className="font-medium">Điện thoại:</span> {selectedTutor.phone}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 mb-8">
                        <h5 className="text-xl font-semibold text-gray-800">Thông tin chi tiết</h5>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h6 className="font-semibold text-gray-800 mb-2">Học vấn</h6>
                            <p className="text-gray-600">{selectedTutor.education}</p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h6 className="font-semibold text-gray-800 mb-2">Kinh nghiệm giảng dạy</h6>
                            <p className="text-gray-600">{selectedTutor.experience}</p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h6 className="font-semibold text-gray-800 mb-2">Chứng chỉ</h6>
                            <p className="text-gray-600">{selectedTutor.rating ? `Điểm: ${selectedTutor.rating}` : 'Chưa đánh giá'}</p>
                        </div>
                    </div>

                    <div className="flex gap-4 justify-center pt-6 border-t border-gray-200">
                        <button
                            className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 transition-colors flex items-center gap-2"
                            onClick={() => handleApprove(selectedTutor.id)}
                        >
                            ✅ Phê duyệt
                        </button>
                        <button
                            className="bg-yellow-500 text-white px-6 py-3 rounded-md hover:bg-yellow-600 transition-colors flex items-center gap-2"
                            onClick={() => handleRequestInfo(selectedTutor.id)}
                        >
                            📝 Yêu cầu thông tin bổ sung
                        </button>
                        <button
                            className="bg-red-500 text-white px-6 py-3 rounded-md hover:bg-red-600 transition-colors flex items-center gap-2"
                            onClick={() => handleReject(selectedTutor.id)}
                        >
                            ❌ Từ chối
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === tab.id
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

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative flex-1 max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm text-black"
                        placeholder="Tìm kiếm gia sư..."
                    />
                </div>
                <div className="flex space-x-3">
                    <select className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md text-black">
                        <option>Tất cả môn học</option>
                        <option>Toán học</option>
                        <option>Tiếng Anh</option>
                        <option>Vật lý</option>
                        <option>Hóa học</option>
                    </select>
                    <select className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md text-black">
                        <option>Sắp xếp theo</option>
                        <option>Ngày nộp</option>
                        <option>Tên</option>
                        <option>Môn học</option>
                    </select>
                </div>
            </div>

            {/* Tutors List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {currentTutors.map((tutor) => (
                        <li key={tutor.id} className="px-6 py-4 hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-12 w-12">
                                        <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                                            <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <div className="flex items-center">
                                            <div className="text-sm font-medium text-gray-900">{tutor.name}</div>
                                            {tutor.rating && (
                                                <div className="ml-2 flex items-center">
                                                    <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                    <span className="ml-1 text-sm text-gray-600">{tutor.rating}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-500">{tutor.email}</div>
                                        <div className="flex items-center mt-1">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {tutor.subject}
                                            </span>
                                            <span className="ml-2 text-sm text-gray-500">{tutor.experience}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setSelectedTutor(tutor)}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        Xem
                                    </button>
                                    {activeTab === 'pending' && (
                                        <>
                                            <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                                                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Duyệt
                                            </button>
                                            <button
                                                onClick={() => setShowInfoRequestModal(true)}
                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                                            >
                                                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Yêu cầu TT
                                            </button>
                                            <button
                                                onClick={() => setShowRejectModal(true)}
                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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
                            Hiển thị <span className="font-medium">1</span> đến <span className="font-medium">10</span> trong tổng số{' '}
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
        </div>
    );
};

export default TutorManagement; 