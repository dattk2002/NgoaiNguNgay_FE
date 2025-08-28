import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { getLegalDocumentByCategory } from '../api/auth';
import NoFocusOutLineButton from '../../utils/noFocusOutlineButton';

const LegalDocumentModal = ({ isOpen, onClose, category }) => {
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && category) {
      fetchLegalDocument();
    }
  }, [isOpen, category]);

  const fetchLegalDocument = async () => {
    try {
      setLoading(true);
      const documents = await getLegalDocumentByCategory(category, 1, 1);
      if (documents && documents.length > 0) {
        setDocument(documents[0]);
      } else {
        setDocument(null);
      }
    } catch (error) {
      console.error('Failed to fetch legal document:', error);
      toast.error('Không thể tải tài liệu pháp lý');
      setDocument(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1001] p-4"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={backdropVariants}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-4xl mx-auto relative overflow-y-auto max-h-[90vh]"
            variants={modalVariants}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <NoFocusOutLineButton
              onClick={onClose}
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
                {category === "Đăng nhập" ? "Điều khoản áp dụng cho việc đăng nhập" : "Điều khoản áp dụng cho việc đăng ký"}
              </p>
            </div>

            {loading ? (
              <div className="space-y-6">
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
              </div>
            ) : document ? (
              <div className="space-y-6">
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
                </div>

                {/* Document Content */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-black mb-3">Nội dung tài liệu</h4>
                  <div className="bg-white p-4 rounded border">
                    <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                      {document.description || 'Không có nội dung chi tiết'}
                    </div>
                  </div>
                </div>

                {/* Document Versions */}
                {document.versions && document.versions.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-md font-semibold text-black mb-3">Phiên bản tài liệu</h4>
                    <div className="space-y-3">
                      {document.versions.map((version) => (
                        <div key={version.id} className="bg-white p-3 rounded border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-black">Phiên bản {version.version}</span>
                            <span className="text-sm text-gray-600">
                              {formatDate(version.createdTime)}
                            </span>
                          </div>
                          <div className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
                            {version.content || 'Không có nội dung'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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

            <div className="mt-8 text-center">
              <NoFocusOutLineButton
                onClick={onClose}
                className="bg-[#333333] text-white px-6 py-2 rounded-lg font-semibold hover:bg-black transition duration-200"
              >
                Đóng
              </NoFocusOutLineButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LegalDocumentModal;
