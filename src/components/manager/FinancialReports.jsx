import React, { useState } from 'react';
import { toast } from 'react-toastify';
import NoFocusOutLineButton from '../../utils/noFocusOutlineButton';

const FinancialReports = () => {
    const [selectedReportType, setSelectedReportType] = useState('revenue');
    const [dateRange, setDateRange] = useState('month');

    const reportTypes = [
        { id: 'revenue', name: 'Báo cáo doanh thu', description: 'Chi tiết doanh thu theo thời gian và danh mục' },
        { id: 'commission', name: 'Báo cáo hoa hồng', description: 'Hoa hồng gia sư và phí nền tảng' },
        { id: 'payment', name: 'Báo cáo thanh toán', description: 'Trạng thái và phương thức thanh toán' },
        { id: 'tax', name: 'Báo cáo thuế', description: 'Tổng hợp cho khai báo thuế' }
    ];

    const recentReports = [
        { id: 1, name: 'Báo cáo doanh thu tháng 12/2023', type: 'revenue', date: '2024-01-05', status: 'completed', size: '2.4 MB' },
        { id: 2, name: 'Báo cáo hoa hồng Q4/2023', type: 'commission', date: '2024-01-03', status: 'completed', size: '1.8 MB' },
        { id: 3, name: 'Báo cáo thanh toán tháng 12/2023', type: 'payment', date: '2024-01-02', status: 'processing', size: '3.1 MB' },
        { id: 4, name: 'Báo cáo thuế năm 2023', type: 'tax', date: '2023-12-31', status: 'completed', size: '5.2 MB' }
    ];

    const handleGenerateReport = () => {
        toast.info(`Đang tạo ${reportTypes.find(r => r.id === selectedReportType)?.name} cho ${dateRange === 'week' ? '7 ngày' : dateRange === 'month' ? '30 ngày' : dateRange === 'quarter' ? '3 tháng' : '12 tháng'} qua...`);
    };

    const handleDownloadReport = (reportId) => {
        toast.info(`Đang tải xuống báo cáo ID: ${reportId}`);
    };

    return (
        <div className="space-y-6">
            {/* Report Generation */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Tạo báo cáo mới</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Loại báo cáo</label>
                        <select
                            value={selectedReportType}
                            onChange={(e) => setSelectedReportType(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                        >
                            {reportTypes.map(type => (
                                <option key={type.id} value={type.id}>{type.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Khoảng thời gian</label>
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                        >
                            <option value="week">7 ngày qua</option>
                            <option value="month">30 ngày qua</option>
                            <option value="quarter">3 tháng qua</option>
                            <option value="year">12 tháng qua</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <NoFocusOutLineButton
                            onClick={handleGenerateReport}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Tạo báo cáo
                        </NoFocusOutLineButton>
                    </div>
                </div>

                {/* Report Description */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">
                        {reportTypes.find(r => r.id === selectedReportType)?.description}
                    </p>
                </div>
            </div>

            {/* Export Options */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Tùy chọn xuất file</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border border-gray-200 rounded-lg p-4 text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">PDF</h4>
                        <p className="text-xs text-gray-500 mb-3">Định dạng in ấn và chia sẻ</p>
                        <NoFocusOutLineButton className="w-full px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors">
                            Xuất PDF
                        </NoFocusOutLineButton>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4 text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Excel</h4>
                        <p className="text-xs text-gray-500 mb-3">Định dạng phân tích dữ liệu</p>
                        <NoFocusOutLineButton className="w-full px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
                            Xuất Excel
                        </NoFocusOutLineButton>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4 text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">CSV</h4>
                        <p className="text-xs text-gray-500 mb-3">Định dạng dữ liệu thô</p>
                        <NoFocusOutLineButton className="w-full px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                            Xuất CSV
                        </NoFocusOutLineButton>
                    </div>
                </div>
            </div>

            {/* Report Templates */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Mẫu báo cáo có sẵn</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reportTypes.map(type => (
                        <div key={type.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h4 className="text-sm font-medium text-gray-900 mb-1">{type.name}</h4>
                                    <p className="text-xs text-gray-500 mb-3">{type.description}</p>
                                    <div className="flex space-x-2">
                                        <NoFocusOutLineButton className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 transition-colors">
                                            Xem mẫu
                                        </NoFocusOutLineButton>
                                        <NoFocusOutLineButton className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200 transition-colors">
                                            Sử dụng
                                        </NoFocusOutLineButton>
                                    </div>
                                </div>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${type.id === 'revenue' ? 'bg-green-100' :
                                    type.id === 'commission' ? 'bg-blue-100' :
                                        type.id === 'payment' ? 'bg-purple-100' : 'bg-orange-100'
                                    }`}>
                                    <svg className={`w-4 h-4 ${type.id === 'revenue' ? 'text-green-600' :
                                        type.id === 'commission' ? 'text-blue-600' :
                                            type.id === 'payment' ? 'text-purple-600' : 'text-orange-600'
                                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Reports */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Báo cáo gần đây</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Tên báo cáo</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Loại</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Ngày tạo</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Trạng thái</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Kích thước</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentReports.map((report) => (
                                <tr key={report.id} className="border-b border-gray-100">
                                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{report.name}</td>
                                    <td className="py-3 px-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${report.type === 'revenue' ? 'bg-green-100 text-green-800' :
                                            report.type === 'commission' ? 'bg-blue-100 text-blue-800' :
                                                report.type === 'payment' ? 'bg-purple-100 text-purple-800' :
                                                    'bg-orange-100 text-orange-800'
                                            }`}>
                                            {reportTypes.find(r => r.id === report.type)?.name.split(' ')[1]}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-900">{report.date}</td>
                                    <td className="py-3 px-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${report.status === 'completed'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {report.status === 'completed' ? 'Hoàn thành' : 'Đang xử lý'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-900">{report.size}</td>
                                    <td className="py-3 px-4">
                                        {report.status === 'completed' ? (
                                            <NoFocusOutLineButton
                                                onClick={() => handleDownloadReport(report.id)}
                                                className="text-green-600 hover:text-green-900 text-sm font-medium"
                                            >
                                                Tải xuống
                                            </NoFocusOutLineButton>
                                        ) : (
                                            <span className="text-gray-400 text-sm">Đang xử lý...</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FinancialReports; 