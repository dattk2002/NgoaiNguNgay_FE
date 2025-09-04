import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchSystemFees, updateSystemFee } from '../api/auth';
import NoFocusOutLineButton from '../../utils/noFocusOutlineButton';
import formatPriceWithCommas from '../../utils/formatPriceWithCommas';
import { showSuccess, showError } from '../../utils/toastManager.js';
import 'react-toastify/dist/ReactToastify.css';

// Spinner Icon for loading states
const SpinnerIcon = () => (
    <div role="status" className="flex items-center justify-center">
        <svg
            aria-hidden="true"
            className="w-6 h-6 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-green-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
            />
            <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
            />
        </svg>
        <span className="sr-only">Đang xử lý...</span>
    </div>
);

const FeeManagement = () => {
    console.log('FeeManagement component loaded');
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        feeCode: '',
        value: '',
        type: 1,
        description: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [feeTypes, setFeeTypes] = useState([]);
    const [feeCodes, setFeeCodes] = useState([]);
    const modalRef = useRef(null);

    // Body scroll lock effect
    useEffect(() => {
        if (showCreateForm) {
            const originalOverflow = document.body.style.overflow;
            const originalPaddingRight = document.body.style.paddingRight;
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

            document.body.style.overflow = "hidden";
            document.body.style.paddingRight = `${scrollbarWidth}px`;

            const header = document.querySelector("header");
            let originalHeaderPaddingRight = "";
            if (header && window.getComputedStyle(header).position === "fixed") {
                originalHeaderPaddingRight = header.style.paddingRight;
                header.style.paddingRight = `${scrollbarWidth + parseInt(window.getComputedStyle(header).paddingRight || "0")}px`;
            }

            return () => {
                document.body.style.overflow = originalOverflow;
                document.body.style.paddingRight = originalPaddingRight;

                if (header && window.getComputedStyle(header).position === "fixed") {
                    header.style.paddingRight = originalHeaderPaddingRight;
                }
            };
        }
        return undefined;
    }, [showCreateForm]);

    // Fetch fees data
    const fetchFees = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetchSystemFees();
            
            if (response && response.data) {
                setFees(response.data);
                
                // Set fee types and codes from additional data
                if (response.additionalData) {
                    setFeeTypes(response.additionalData.FeeTypes || []);
                    setFeeCodes(response.additionalData.FeeCodes || []);
                }
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err) {
            console.error('Failed to fetch fees:', err);
            setError(err.message || 'Failed to fetch fees');
        } finally {
            setLoading(false);
        }
    };

    // Update existing fee
    const updateFee = async (e) => {
        e.preventDefault();
        
        try {
            setSubmitting(true);
            setError(null);

            // Validate form data
            if (!formData.feeCode || !formData.value || formData.description === '') {
                throw new Error('Please fill in all required fields');
            }

            // Validate percentage value range
            const numericValue = parseInt(formData.value);
            if (parseInt(formData.type) === 0) {
                // For percentage type, validate that value is between 0 and 100
                if (numericValue < 0 || numericValue > 100) {
                    throw new Error('Giá trị phần trăm phải nằm trong khoảng từ 0 đến 100');
                }
            } else {
                // For flat type, validate that value is positive
                if (numericValue < 0) {
                    throw new Error('Giá trị phí phải lớn hơn hoặc bằng 0');
                }
            }

            // Convert percentage value to decimal if type is percentage (0)
            let processedValue = numericValue;
            if (parseInt(formData.type) === 0) {
                // For percentage type, convert from percentage to decimal (e.g., 5% -> 0.05)
                processedValue = processedValue / 100;
                console.log('🔍 FeeManagement - Converting percentage value:', {
                    originalValue: formData.value,
                    convertedValue: processedValue,
                    percentage: `${formData.value}% -> ${processedValue}`
                });
            }

            const requestBody = {
                feeCode: formData.feeCode,
                value: processedValue,
                type: parseInt(formData.type),
                description: formData.description
            };

            console.log('🔍 FeeManagement - About to call updateSystemFee with requestBody:', requestBody);
            console.log('🔍 FeeManagement - requestBody type check:', {
                feeCode: typeof requestBody.feeCode,
                value: typeof requestBody.value,
                type: typeof requestBody.type,
                description: typeof requestBody.description
            });

            const response = await updateSystemFee(requestBody);
            
            console.log('🔍 FeeManagement - updateSystemFee response:', response);
            
            if (response) {
                // Show success toast notification
                console.log('🎉 Showing success toast notification');
                showSuccess('Cập nhật phí thành công!', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    draggable: true,
                    style: {
                        backgroundColor: '#10b981',
                        color: 'white',
                    },
                });

                // Reset form and refresh data
                setFormData({
                    feeCode: '',
                    value: '',
                    type: 1,
                    description: ''
                });
                setShowCreateForm(false);
                await fetchFees();
            }
        } catch (err) {
            console.error('❌ FeeManagement - Failed to update fee:', err);
            console.error('❌ FeeManagement - Error details:', {
                message: err.message,
                status: err.status,
                details: err.details
            });
            
            // Show error toast notification
            console.log('❌ Showing error toast notification');
            showError(err.message || 'Cập nhật phí thất bại', {
                position: "top-right",
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                draggable: true,
                style: {
                    backgroundColor: '#ef4444',
                    color: 'white',
                },
            });
            
            setError(err.message || 'Failed to update fee');
        } finally {
            setSubmitting(false);
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('vi-VN');
    };

    // Get fee type name
    const getFeeTypeName = (type) => {
        const feeType = feeTypes.find(ft => ft.value === type);
        return feeType ? feeType.name : `Type ${type}`;
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Auto-fill form when fee code is selected
        if (name === 'feeCode' && value) {
            const selectedFee = fees.find(fee => fee.feeCode === value);
            if (selectedFee) {
                // Convert decimal value back to percentage for display if type is percentage
                let displayValue = selectedFee.value;
                if (selectedFee.type === 0) {
                    // For percentage type, convert from decimal to percentage (e.g., 0.05 -> 5)
                    displayValue = Math.round(selectedFee.value * 100);
                    console.log('🔍 FeeManagement - Converting decimal to percentage for display:', {
                        originalValue: selectedFee.value,
                        displayValue: displayValue,
                        percentage: `${selectedFee.value} -> ${displayValue}%`
                    });
                }

                setFormData(prev => ({
                    ...prev,
                    feeCode: selectedFee.feeCode,
                    value: displayValue.toString(),
                    type: selectedFee.type,
                    description: selectedFee.description
                }));
            }
        }
    };

    useEffect(() => {
        fetchFees();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Quản lý phí hệ thống</h2>
                    <p className="text-gray-600 mt-1">Quản lý các loại phí và cấu hình hệ thống</p>
                </div>
                <NoFocusOutLineButton
                    onClick={() => setShowCreateForm(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                    <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Cập nhật phí
                </NoFocusOutLineButton>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Create Fee Modal */}
            <AnimatePresence>
                {showCreateForm && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowCreateForm(false)}
                    >
                        <motion.div
                            ref={modalRef}
                            className="bg-white rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-md mx-auto relative overflow-y-auto max-h-[95vh]"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <NoFocusOutLineButton
                                onClick={() => setShowCreateForm(false)}
                                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                                aria-label="Close modal"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </NoFocusOutLineButton>

                            <h3 className="text-xl font-semibold text-gray-900 mb-6">Cập nhật phí hệ thống</h3>

                        <form onSubmit={updateFee} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mã phí cần cập nhật *
                                </label>
                                <select
                                    name="feeCode"
                                    value={formData.feeCode}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                                    required
                                >
                                    <option value="">Chọn mã phí cần cập nhật</option>
                                    {feeCodes.map(code => (
                                        <option key={code} value={code}>{code}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Giá trị mới *
                                </label>
                                <input
                                    type="number"
                                    name="value"
                                    value={formData.value}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                                    placeholder="Nhập giá trị phí mới"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Loại phí mới *
                                </label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                                    required
                                >
                                    {feeTypes.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mô tả mới *
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                                    placeholder="Nhập mô tả phí mới"
                                    rows="3"
                                    required
                                />
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <NoFocusOutLineButton
                                    type="button"
                                    onClick={() => setShowCreateForm(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Hủy
                                </NoFocusOutLineButton>
                                <NoFocusOutLineButton
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                >
                                    {submitting ? (
                                        <div className="flex items-center justify-center">
                                            <SpinnerIcon />
                                            Đang cập nhật...
                                        </div>
                                    ) : (
                                        'Cập nhật phí'
                                    )}
                                </NoFocusOutLineButton>
                            </div>
                        </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Fees Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Danh sách phí hiện tại</h3>
                </div>
                
                {fees.length === 0 ? (
                    <div className="text-center py-8">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Không có phí nào</h3>
                        <p className="mt-1 text-sm text-gray-500">Bắt đầu bằng cách cập nhật phí hiện có.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Mã phí
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Mô tả
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Loại
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Giá trị
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ngày hiệu lực
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Cập nhật lần cuối
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {fees.map((fee) => (
                                    <tr key={fee.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {fee.feeCode}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 max-w-xs truncate">
                                                {fee.description}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {getFeeTypeName(fee.type)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {fee.type === 1 
                                                    ? formatPriceWithCommas(fee.value) 
                                                    : `${Math.round(fee.value * 100)}%`
                                                }
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                fee.isActive 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {fee.isActive ? 'Hoạt động' : 'Không hoạt động'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(fee.effectiveFrom)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(fee.lastUpdatedTime)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Tổng số phí</p>
                            <p className="text-2xl font-semibold text-gray-900">{fees.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Phí hoạt động</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {fees.filter(fee => fee.isActive).length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Loại phí</p>
                            <p className="text-2xl font-semibold text-gray-900">{feeTypes.length}</p>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default FeeManagement;
