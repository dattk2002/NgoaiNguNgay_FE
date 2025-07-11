import React, { useState } from 'react';

const ReportManagement = () => {
    const [activeTab, setActiveTab] = useState('pending');
    const [selectedReport, setSelectedReport] = useState(null);

    const pendingReports = [
        {
            id: 1,
            reporterName: 'Nguyễn Thị X',
            reporterEmail: 'nguyenthix@email.com',
            tutorName: 'Trần Văn Y',
            tutorSubject: 'Toán học',
            reportType: 'inappropriate_behavior',
            reportTitle: 'Gia sư có thái độ không phù hợp',
            reportDate: '2024-01-15',
            priority: 'high',
            status: 'pending'
        },
        {
            id: 2,
            reporterName: 'Lê Văn Z',
            reporterEmail: 'levanz@email.com',
            tutorName: 'Phạm Thị A',
            tutorSubject: 'Tiếng Anh',
            reportType: 'poor_quality',
            reportTitle: 'Chất lượng giảng dạy không tốt',
            reportDate: '2024-01-14',
            priority: 'medium',
            status: 'pending'
        },
        {
            id: 3,
            reporterName: 'Hoàng Văn B',
            reporterEmail: 'hoangvanb@email.com',
            tutorName: 'Đinh Thị C',
            tutorSubject: 'Vật lý',
            reportType: 'schedule_issue',
            reportTitle: 'Gia sư thường xuyên hủy lịch học',
            reportDate: '2024-01-13',
            priority: 'low',
            status: 'pending'
        }
    ];

    const resolvedReports = [
        {
            id: 4,
            reporterName: 'Vũ Thị D',
            reporterEmail: 'vuthid@email.com',
            tutorName: 'Bùi Văn E',
            tutorSubject: 'Hóa học',
            reportType: 'technical_issue',
            reportTitle: 'Sự cố kỹ thuật trong buổi học',
            reportDate: '2024-01-10',
            resolvedDate: '2024-01-12',
            priority: 'medium',
            status: 'resolved',
            resolution: 'Đã hỗ trợ kỹ thuật và khắc phục sự cố'
        }
    ];

    const handleViewDetails = (report) => {
        setSelectedReport(report);
    };

    const handleResolveReport = (reportId, resolution) => {
        console.log('Xử lý báo cáo:', reportId, 'với giải pháp:', resolution);
        // Logic xử lý báo cáo
    };

    const handleContactReporter = (reportId) => {
        console.log('Liên hệ người báo cáo:', reportId);
        // Logic liên hệ người báo cáo
    };

    const handleContactTutor = (reportId) => {
        console.log('Liên hệ gia sư:', reportId);
        // Logic liên hệ gia sư
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return '#ff4757';
            case 'medium': return '#ffa502';
            case 'low': return '#2ed573';
            default: return '#747d8c';
        }
    };

    const getReportTypeLabel = (type) => {
        switch (type) {
            case 'inappropriate_behavior': return 'Hành vi không phù hợp';
            case 'poor_quality': return 'Chất lượng kém';
            case 'schedule_issue': return 'Vấn đề lịch học';
            case 'technical_issue': return 'Sự cố kỹ thuật';
            default: return 'Khác';
        }
    };

    const renderReportCard = (report) => (
        <div key={report.id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-200">
            <div className="flex justify-between items-start mb-4">
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${report.priority === 'high' ? 'bg-red-100 text-red-800' :
                    report.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                    }`}>
                    {report.priority === 'high' && 'Cao'}
                    {report.priority === 'medium' && 'Trung bình'}
                    {report.priority === 'low' && 'Thấp'}
                </div>
                <div className="text-sm text-gray-500">{report.reportDate}</div>
            </div>

            <h4 className="text-lg font-semibold text-gray-800 mb-3">{report.reportTitle}</h4>

            <div className="space-y-2 mb-4 text-sm text-gray-600">
                <p><strong>Người báo cáo:</strong> {report.reporterName}</p>
                <p><strong>Gia sư:</strong> {report.tutorName} - {report.tutorSubject}</p>
                <p><strong>Loại báo cáo:</strong> {getReportTypeLabel(report.reportType)}</p>
            </div>

            {report.status === 'resolved' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-green-800"><strong>Giải pháp:</strong> {report.resolution}</p>
                    <p className="text-xs text-green-600 mt-1">Đã xử lý: {report.resolvedDate}</p>
                </div>
            )}

            <div className="flex gap-2 flex-wrap">
                <button
                    className="bg-blue-500 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors flex items-center gap-1 outline-none"
                    onClick={() => handleViewDetails(report)}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Xem chi tiết
                </button>
                {report.status === 'pending' && (
                    <button
                        className="bg-green-500 text-white px-3 py-2 rounded-md text-sm hover:bg-green-600 transition-colors flex items-center gap-1 outline-none"
                        onClick={() => handleResolveReport(report.id, 'Đã xử lý')}
                    >
                        ✅ Xử lý xong
                    </button>
                )}
            </div>
        </div>
    );

    const renderReportDetails = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h3 className="text-2xl font-semibold text-gray-800">Chi tiết báo cáo</h3>
                    <button
                        className="text-gray-500 hover:text-gray-700 p-2 outline-none"
                        onClick={() => setSelectedReport(null)}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Report Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-4">Thông tin báo cáo</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <label className="font-medium text-gray-700">Tiêu đề:</label>
                                <span className="ml-2 text-gray-600">{selectedReport.reportTitle}</span>
                            </div>
                            <div>
                                <label className="font-medium text-gray-700">Loại báo cáo:</label>
                                <span className="ml-2 text-gray-600">{getReportTypeLabel(selectedReport.reportType)}</span>
                            </div>
                            <div>
                                <label className="font-medium text-gray-700">Mức độ ưu tiên:</label>
                                <span className={`ml-2 font-semibold ${selectedReport.priority === 'high' ? 'text-red-600' :
                                    selectedReport.priority === 'medium' ? 'text-yellow-600' :
                                        'text-green-600'
                                    }`}>
                                    {selectedReport.priority === 'high' && 'Cao'}
                                    {selectedReport.priority === 'medium' && 'Trung bình'}
                                    {selectedReport.priority === 'low' && 'Thấp'}
                                </span>
                            </div>
                            <div>
                                <label className="font-medium text-gray-700">Ngày báo cáo:</label>
                                <span className="ml-2 text-gray-600">{selectedReport.reportDate}</span>
                            </div>
                        </div>
                    </div>

                    {/* Reporter Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-4">Thông tin người báo cáo</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <label className="font-medium text-gray-700">Họ tên:</label>
                                <span className="ml-2 text-gray-600">{selectedReport.reporterName}</span>
                            </div>
                            <div>
                                <label className="font-medium text-gray-700">Email:</label>
                                <span className="ml-2 text-gray-600">{selectedReport.reporterEmail}</span>
                            </div>
                        </div>
                    </div>

                    {/* Tutor Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-4">Thông tin gia sư</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <label className="font-medium text-gray-700">Họ tên:</label>
                                <span className="ml-2 text-gray-600">{selectedReport.tutorName}</span>
                            </div>
                            <div>
                                <label className="font-medium text-gray-700">Môn học:</label>
                                <span className="ml-2 text-gray-600">{selectedReport.tutorSubject}</span>
                            </div>
                        </div>
                    </div>

                    {/* Report Content */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-4">Nội dung chi tiết</h4>
                        <div className="text-gray-600 leading-relaxed">
                            <p>
                                Học viên phản ánh rằng gia sư có thái độ không phù hợp trong quá trình giảng dạy.
                                Cụ thể, gia sư thường xuyên đến muộn, không chuẩn bị bài giảng kỹ lưỡng và có
                                thái độ thiếu nhiệt tình khi giải đáp thắc mắc của học viên.
                            </p>
                        </div>
                    </div>

                    {/* Resolution Form */}
                    {selectedReport.status === 'pending' && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-800 mb-4">Xử lý báo cáo</h4>
                            <textarea
                                placeholder="Nhập giải pháp xử lý..."
                                rows="4"
                                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-500"
                            />
                            <div className="flex gap-3 mt-4">
                                <button
                                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors flex items-center gap-2 outline-none"
                                    onClick={() => handleResolveReport(selectedReport.id, 'Giải pháp từ form')}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Xử lý xong
                                </button>
                                <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    Liên hệ người báo cáo
                                </button>
                                <button className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    Liên hệ gia sư
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
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
            {/* Header */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <div className="flex flex-wrap gap-4 mb-6">
                    <button
                        className={`px-6 py-3 rounded-full font-medium transition-all flex items-center gap-2 outline-none ${activeTab === 'pending'
                            ? 'bg-gray-800 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        onClick={() => setActiveTab('pending')}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Chờ xử lý ({pendingReports.length})
                    </button>
                    <button
                        className={`px-6 py-3 rounded-full font-medium transition-all outline-none ${activeTab === 'resolved'
                            ? 'bg-gray-800 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        onClick={() => setActiveTab('resolved')}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Đã xử lý ({resolvedReports.length})
                    </button>
                </div>

                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex bg-white rounded-full overflow-hidden border border-gray-300">
                        <input
                            type="text"
                            placeholder="Tìm kiếm báo cáo..."
                            className="px-4 py-3 bg-transparent outline-none min-w-64 text-black"
                        />
                        <button className="bg-gray-100 text-gray-800 px-4 py-3 hover:bg-gray-200 transition-colors outline-none">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    </div>
                    <select className="px-4 py-3 border border-gray-300 rounded-full bg-white cursor-pointer text-black">
                        <option value="">Tất cả loại báo cáo</option>
                        <option value="inappropriate_behavior">Hành vi không phù hợp</option>
                        <option value="poor_quality">Chất lượng kém</option>
                        <option value="schedule_issue">Vấn đề lịch học</option>
                        <option value="technical_issue">Sự cố kỹ thuật</option>
                    </select>
                    <select className="px-4 py-3 border border-gray-300 rounded-full bg-white cursor-pointer text-black">
                        <option value="">Tất cả mức độ</option>
                        <option value="high">Cao</option>
                        <option value="medium">Trung bình</option>
                        <option value="low">Thấp</option>
                    </select>
                </div>
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {activeTab === 'pending' && pendingReports.map(renderReportCard)}
                {activeTab === 'resolved' && resolvedReports.map(renderReportCard)}
            </div>

            {selectedReport && renderReportDetails()}
        </div>
    );
};

export default ReportManagement; 