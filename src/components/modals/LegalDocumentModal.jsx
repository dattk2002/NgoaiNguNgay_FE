import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { getLegalDocumentByCategory, getLegalDocumentVersionById } from '../api/auth';
import NoFocusOutLineButton from '../../utils/noFocusOutlineButton';
import '../manager/LegalDocumentManagement.css';

const LegalDocumentModal = ({ isOpen, onClose, category, onAgree }) => {
  const [document, setDocument] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [versionLoading, setVersionLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (isOpen && category) {
      fetchLegalDocument();
    } else if (!isOpen) {
      // Reset state when modal closes
      setDocument(null);
      setSelectedVersion(null);
      setLoading(false);
      setVersionLoading(false);
      setAgreed(false);
    }
  }, [isOpen, category]);

  const fetchLegalDocument = async () => {
    try {
      setLoading(true);
      const documents = await getLegalDocumentByCategory(category, 1, 1);
      if (documents && documents.length > 0) {
        setDocument(documents[0]);
        // Auto-select the first version if available
        if (documents[0].versions && documents[0].versions.length > 0) {
          await fetchVersionContent(documents[0].versions[0].id);
        }
      } else {
        setDocument(null);
        setSelectedVersion(null);
      }
    } catch (error) {
      console.error('Failed to fetch legal document:', error);
      toast.error('Không thể tải tài liệu pháp lý');
      setDocument(null);
      setSelectedVersion(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchVersionContent = async (versionId) => {
    try {
      setVersionLoading(true);
      const versionData = await getLegalDocumentVersionById(versionId);
      setSelectedVersion(versionData);
    } catch (error) {
      console.error('Failed to fetch version content:', error);
      toast.error('Không thể tải nội dung phiên bản');
      setSelectedVersion(null);
    } finally {
      setVersionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('vi-VN', { month: 'long' });
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${hours}:${minutes} ${day} ${month}, ${year}`;
  };

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

  const handleAgree = () => {
    if (agreed && onAgree) {
      onAgree();
      onClose();
    }
  };

  const handleClose = () => {
    if (agreed) {
      onClose();
    } else {
      toast.warning('Vui lòng đồng ý với điều khoản dịch vụ trước khi đóng');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-[9999] p-4"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={backdropVariants}
          onClick={handleClose}
        >
          <motion.div
            className="bg-white rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-4xl mx-auto relative overflow-y-auto max-h-[90vh]"
            style={{ zIndex: 9999 }}
            variants={modalVariants}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <NoFocusOutLineButton
              onClick={handleClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 z-10"
              aria-label="Close modal"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </NoFocusOutLineButton>

            <div className="mb-6">
              <h2 className="text-black text-2xl font-semibold text-center mb-2">
                Điều khoản dịch vụ và Chính sách bảo mật
              </h2>
              <p className="text-sm text-gray-500 text-center">
                {category === "Đăng nhập" ? "Điều khoản áp dụng cho việc đăng nhập" : 
                 category === "Book thẳng" ? "Điều khoản áp dụng cho việc đặt lịch trực tiếp" :
                 category === "offer_booking" ? "Điều khoản áp dụng cho việc chấp nhận đề xuất từ gia sư" :
                 category === "khiếu nại" ? "Điều khoản áp dụng cho việc tạo báo cáo và khiếu nại" :
                 category === "hủy booking" ? "Điều khoản áp dụng cho việc hủy booking" :
                 "Điều khoản áp dụng cho việc đăng ký"}
              </p>
            </div>

            {loading ? (
              <div className="space-y-6">
                {/* Document Versions Skeleton */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="h-5 bg-gray-200 rounded mb-3 w-48 animate-pulse"></div>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-4/5 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Document Header Skeleton */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="h-6 bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="flex items-center gap-4">
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
                  </div>
                </div>

                {/* Document Content Skeleton */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="h-5 bg-gray-200 rounded mb-3 w-40 animate-pulse"></div>
                  <div className="bg-white p-4 rounded border">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : document ? (
              <div className="space-y-6">
                {/* Document Versions */}
                {document.versions && document.versions.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-md font-semibold text-black mb-3">Phiên bản tài liệu</h4>
                    <div className="space-y-3">
                      {document.versions.map((version) => (
                        <div 
                          key={version.id} 
                          className={`bg-white p-3 rounded border cursor-pointer transition-colors ${
                            selectedVersion?.id === version.id 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => fetchVersionContent(version.id)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-black">Phiên bản {version.version}</span>
                            <span className="text-sm text-gray-600">
                              {formatDate(version.createdTime)}
                            </span>
                          </div>
                          {selectedVersion?.id === version.id && (
                            <div className="text-xs text-blue-600 font-medium">
                              Đang xem
                            </div>
                          )}
                          {selectedVersion?.id === version.id && selectedVersion.content && selectedVersion.content !== 'HIDDEN' && (
                            <div className="text-xs text-gray-500 mt-1">
                              {selectedVersion.content.replace(/<[^>]*>/g, '').substring(0, 100) + 
                               (selectedVersion.content.replace(/<[^>]*>/g, '').length > 100 ? '...' : '')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Document Header */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-black mb-2">
                    {document.name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Danh mục: {document.category}</span>
                    <span>Ngày tạo: {formatDate(document.createdTime)}</span>
                    {document.lastUpdatedTime && document.lastUpdatedTime !== document.createdTime && (
                      <span>Cập nhật: {formatDate(document.lastUpdatedTime)}</span>
                    )}
                  </div>
                  {selectedVersion && (
                    <div className="mt-2 text-sm text-blue-600 font-medium">
                      Đang xem: Phiên bản {selectedVersion.version} 
                      {selectedVersion.lastUpdatedTime && (
                        <span className="text-gray-500 ml-2">
                          (Cập nhật: {formatDate(selectedVersion.lastUpdatedTime)})
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Document Content */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-black mb-3">Nội dung tài liệu</h4>
                  <div className="bg-white p-4 rounded border min-h-[200px]">
                    {versionLoading ? (
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                      </div>
                    ) : selectedVersion ? (
                      <div className="text-gray-800 leading-relaxed">
                        {selectedVersion.content === 'HIDDEN' 
                          ? 'Nội dung này không được hiển thị công khai'
                          : selectedVersion.content ? (
                            <div 
                              dangerouslySetInnerHTML={{ __html: selectedVersion.content }}
                              className="prose prose-sm max-w-none"
                              style={{ 
                                fontFamily: 'inherit',
                                fontSize: 'inherit',
                                lineHeight: 'inherit'
                              }}
                            />
                          ) : 'Không có nội dung chi tiết'
                        }
                      </div>
                    ) : (
                      <div className="text-gray-500 italic">
                        Vui lòng chọn một phiên bản để xem nội dung
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Không tìm thấy tài liệu
                </h3>
                <p className="text-gray-500">
                  Không có tài liệu pháp lý nào cho danh mục "{category}"
                </p>
              </div>
            )}

            <div className="mt-8 space-y-4">
              {/* Agreement Checkbox */}
              <div className="flex items-center justify-center">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm text-gray-700">
                    Tôi đồng ý với Điều khoản dịch vụ và Chính sách bảo mật
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4">
                <NoFocusOutLineButton
                  onClick={handleAgree}
                  disabled={!agreed}
                  className={`px-6 py-2 rounded-lg font-semibold transition duration-200 ${
                    agreed 
                      ? 'bg-black text-white hover:bg-gray-800' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Tôi đồng ý
                </NoFocusOutLineButton>
                
                <NoFocusOutLineButton
                  onClick={handleClose}
                  className="bg-white text-black border border-gray-300 px-6 py-2 rounded-lg font-semibold hover:bg-gray-50 transition duration-200"
                >
                  Đóng
                </NoFocusOutLineButton>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LegalDocumentModal;
