import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { showSuccess, showError } from '../utils/toastManager.js';
import { getLegalDocumentById, fetchLegalDocumentVersionById } from '../components/api/auth';
import {
  FaArrowLeft,
  FaFileAlt,
  FaCalendarAlt,
  FaClock,
  FaEye,
  FaDownload,
  FaShare,
  FaBookOpen,
  FaShieldAlt,
  FaGavel,
  FaBalanceScale,
  FaCheckCircle,
  FaExclamationTriangle,
  FaArchive,
  FaSpinner
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const LegalDocumentDetailPage = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [versionDetails, setVersionDetails] = useState({});
  const [loadingVersion, setLoadingVersion] = useState(false);

  // Get document from location state if available (from navigation)
  const documentFromState = location.state?.document;

  useEffect(() => {
    if (documentFromState) {
      setDocument(documentFromState);
      if (documentFromState.versions && documentFromState.versions.length > 0) {
        setSelectedVersion(documentFromState.versions[0]);
        fetchVersionDetails(documentFromState.versions[0].id);
      }
      setLoading(false);
    } else if (documentId) {
      fetchDocument();
    }
  }, [documentId, documentFromState]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const documentData = await getLegalDocumentById(documentId);
      setDocument(documentData);
      if (documentData.versions && documentData.versions.length > 0) {
        setSelectedVersion(documentData.versions[0]);
        fetchVersionDetails(documentData.versions[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch document:', error);
      showError('Không thể tải tài liệu pháp lý');
      navigate('/legal-documents');
    } finally {
      setLoading(false);
    }
  };

  const fetchVersionDetails = async (versionId) => {
    if (!versionId) return;
    
    try {
      setLoadingVersion(true);
      const versionData = await fetchLegalDocumentVersionById(versionId);
      if (versionData && versionData.data) {
        setVersionDetails(prev => ({
          ...prev,
          [versionId]: versionData.data
        }));
      }
    } catch (error) {
      console.error('Failed to fetch version details:', error);
      showError('Không thể tải chi tiết phiên bản');
    } finally {
      setLoadingVersion(false);
    }
  };

  const handleBack = () => {
    navigate('/legal-documents');
  };

  const handleVersionSelect = (version) => {
    setSelectedVersion(version);
    // Fetch version details if not already loaded
    if (!versionDetails[version.id]) {
      fetchVersionDetails(version.id);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 0: return 'bg-yellow-100 text-yellow-800 border-yellow-200'; // Draft
      case 1: return 'bg-green-100 text-green-800 border-green-200'; // Active
      case 2: return 'bg-gray-100 text-gray-800 border-gray-200'; // Archived
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0: return 'Bản nháp';
      case 1: return 'Đang hiệu lực';
      case 2: return 'Đã lưu trữ';
      default: return 'Không xác định';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 0: return <FaExclamationTriangle />;
      case 1: return <FaCheckCircle />;
      case 2: return <FaArchive />;
      default: return <FaFileAlt />;
    }
  };

  const getCategoryIcon = (category) => {
    const categoryLower = category?.toLowerCase();
    if (categoryLower?.includes('book') || categoryLower?.includes('thẳng')) return <FaBookOpen />;
    if (categoryLower?.includes('chính sách') || categoryLower?.includes('policy')) return <FaShieldAlt />;
    if (categoryLower?.includes('luật') || categoryLower?.includes('law')) return <FaGavel />;
    if (categoryLower?.includes('quy định') || categoryLower?.includes('regulation')) return <FaBalanceScale />;
    return <FaFileAlt />;
  };

  const getContentTypeIcon = (contentType) => {
    switch (contentType?.toUpperCase()) {
      case 'PDF': return <FaFileAlt className="text-blue-600" />;
      case 'DOC': return <FaFileAlt className="text-blue-700" />;
      case 'DOCX': return <FaFileAlt className="text-blue-700" />;
      case 'TXT': return <FaFileAlt className="text-gray-600" />;
      case 'HTML': return <FaFileAlt className="text-orange-600" />;
      default: return <FaFileAlt className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumbs Skeleton */}
          <div className="mb-6">
            <div className="h-6 bg-gray-200 rounded-lg w-1/3 animate-pulse"></div>
          </div>
          
          {/* Back Button Skeleton */}
          <div className="mb-8">
            <div className="h-10 bg-gray-200 rounded-lg w-32 animate-pulse"></div>
          </div>
          
          {/* Document Header Skeleton */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <div className="flex items-start gap-6 mb-6">
              <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-8 bg-gray-200 rounded-lg w-3/4 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded-lg w-1/2 mb-4"></div>
                <div className="h-20 bg-gray-200 rounded-lg mb-4"></div>
                <div className="flex gap-3">
                  <div className="h-8 bg-gray-200 rounded-lg w-24"></div>
                  <div className="h-8 bg-gray-200 rounded-lg w-32"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Content Skeleton */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="h-8 bg-gray-200 rounded-lg w-1/3 mb-6"></div>
            <div className="h-80 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Không tìm thấy tài liệu
            </h2>
            <button 
              onClick={handleBack} 
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FaArrowLeft />
              Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link 
            to="/legal-documents"
                className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            Chính sách pháp lý
              </Link>
            </li>
            <li className="text-gray-500">/</li>
            <li className="text-gray-900 font-medium truncate max-w-xs">
            {document.name}
            </li>
          </ol>
        </nav>

        {/* Back Button */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FaArrowLeft />
            Quay lại danh sách
          </button>
        </div>

        {/* Document Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8 shadow-sm">
          <div className="flex items-start gap-6 mb-6">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-2xl">
                {getCategoryIcon(document.category)}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {document.name}
              </h1>
              
              <div className="flex gap-3 flex-wrap mb-4">
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm font-medium">
                  {getCategoryIcon(document.category)}
                  {document.category}
                </span>
                  {document.versions && document.versions.length > 0 && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded-full text-sm font-medium">
                    {document.versions.length} phiên bản
                  </span>
                )}
              </div>
              
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  {document.description || 'Không có mô tả'}
              </p>
              
              <div className="flex gap-6 flex-wrap text-sm text-gray-500 mb-6">
                <div className="flex items-center gap-2">
                  <FaCalendarAlt />
                  <span>Tạo: {formatDate(document.createdTime)}</span>
                </div>
                  
                  {document.lastUpdatedTime && document.lastUpdatedTime !== document.createdTime && (
                  <div className="flex items-center gap-2">
                    <FaClock />
                    <span>Cập nhật: {formatDate(document.lastUpdatedTime)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
            
            {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap">
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
              <FaEye />
                Xem tài liệu
            </button>
            
            <button className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
              <FaDownload />
                Tải xuống
            </button>
              
            <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  showSuccess('Đã sao chép link vào clipboard');
                }}
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FaShare />
                Chia sẻ
            </button>
          </div>
        </div>

        {/* Document Content */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Nội dung tài liệu
          </h2>
          
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {document.description || 'Không có nội dung chi tiết'}
              </p>
            </div>
          </div>
        </div>

        {/* Document Versions */}
        {document.versions && document.versions.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Phiên bản tài liệu
            </h2>
            
            <div className="space-y-6">
              {/* Version Selector */}
              <div className="flex gap-3 flex-wrap">
                {document.versions.map((version) => (
                  <button
                    key={version.id}
                    onClick={() => handleVersionSelect(version)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 ${
                      selectedVersion?.id === version.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                    }`}
                  >
                    {getStatusIcon(version.status)}
                    Phiên bản {version.version}
                  </button>
                ))}
              </div>
              
              {/* Selected Version Content */}
              {selectedVersion && (
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      Phiên bản {selectedVersion.version}
                    </h3>
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedVersion.status)}`}>
                      {getStatusIcon(selectedVersion.status)}
                      {getStatusText(selectedVersion.status)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt />
                      <span>Ngày tạo: {formatDate(selectedVersion.createdTime)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-2">
                        Loại tài liệu: 
                        {getContentTypeIcon(versionDetails[selectedVersion.id]?.contentType || selectedVersion.contentType)}
                        {versionDetails[selectedVersion.id]?.contentType || selectedVersion.contentType}
                      </span>
                    </div>
                    {selectedVersion.lastUpdatedTime && (
                      <div className="flex items-center gap-2">
                        <FaClock />
                        <span>Cập nhật: {formatDate(selectedVersion.lastUpdatedTime)}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Version Content */}
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">Nội dung phiên bản</h4>
                      {loadingVersion && (
                        <div className="flex items-center gap-2 text-blue-600">
                          <FaSpinner className="animate-spin" />
                          <span className="text-sm">Đang tải...</span>
                        </div>
                      )}
                    </div>
                    
                    {loadingVersion ? (
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                      </div>
                    ) : versionDetails[selectedVersion.id] ? (
                      <div className="prose prose-lg max-w-none">
                        <div 
                          className="text-gray-700 leading-relaxed"
                          dangerouslySetInnerHTML={{ 
                            __html: versionDetails[selectedVersion.id].content || 'Không có nội dung' 
                          }}
                        />
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <FaFileAlt className="text-4xl mx-auto mb-3 text-gray-300" />
                        <p>Không thể tải nội dung phiên bản</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Additional Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Thông tin bổ sung
          </h2>
          
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
                Thông tin kỹ thuật
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>ID:</strong> {document.id}</p>
              <p><strong>Danh mục:</strong> {document.category}</p>
              <p><strong>Ngày tạo:</strong> {formatDate(document.createdTime)}</p>
                {document.lastUpdatedTime && (
                <p><strong>Cập nhật lần cuối:</strong> {formatDate(document.lastUpdatedTime)}</p>
                )}
                {document.versions && (
                <p><strong>Số phiên bản:</strong> {document.versions.length}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalDocumentDetailPage;