import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { showSuccess, showError } from '../../utils/toastManager.js';
import { Editor } from '@tinymce/tinymce-react';
import { useTinyMCE } from '../../contexts/TinyMCEContext';
import { 
  fetchLegalDocuments, 
  createLegalDocument, 
  updateLegalDocument, 
  deleteLegalDocument, 
  getLegalDocumentById,
  fetchLegalDocumentVersions,
  createLegalDocumentVersion,
  updateLegalDocumentVersion,
  deleteLegalDocumentVersion,
  fetchLegalDocumentVersionById
} from '../api/auth';
import NoFocusOutLineButton from '../../utils/noFocusOutlineButton';
import './LegalDocumentManagement.css';

// Spinner Icon - matching LoginModal
const SpinnerIcon = () => (
  <div role="status" className="flex items-center justify-center">
    <svg
      aria-hidden="true"
      className="w-6 h-6 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-[#333333]"
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

const LegalDocumentManagement = () => {
    const tinymceConfig = useTinyMCE();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [detailedDocument, setDetailedDocument] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [newDocument, setNewDocument] = useState({
        name: '',
        description: '',
        category: ''
    });
    const [editDocument, setEditDocument] = useState({
        name: '',
        description: '',
        category: ''
    });
    const [filters, setFilters] = useState({
        category: '',
        page: 1,
        size: 10
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0
    });
    const [generalError, setGeneralError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({
        name: "",
        description: "",
        category: ""
    });

    // Version management state
    const [showVersionModal, setShowVersionModal] = useState(false);
    const [showCreateVersionModal, setShowCreateVersionModal] = useState(false);
    const [showEditVersionModal, setShowEditVersionModal] = useState(false);
    const [showDeleteVersionModal, setShowDeleteVersionModal] = useState(false);
    const [showVersionDetailModal, setShowVersionDetailModal] = useState(false);
    const [versions, setVersions] = useState([]);
    const [loadingVersions, setLoadingVersions] = useState(false);
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [versionDetail, setVersionDetail] = useState(null);
    const [loadingVersionDetail, setLoadingVersionDetail] = useState(false);
    const [newVersion, setNewVersion] = useState({
        legalDocumentId: '',
        version: '',
        status: 0,
        content: '',
        contentType: ''
    });
    const [editVersion, setEditVersion] = useState({
        legalDocumentId: '',
        version: '',
        status: 0,
        content: '',
        contentType: ''
    });
    const [versionFieldErrors, setVersionFieldErrors] = useState({
        version: "",
        content: "",
        contentType: ""
    });

    const modalRef = useRef(null);

    // Fetch legal documents
    const fetchDocuments = async () => {
        setLoading(true);
        setGeneralError("");
        try {
            const response = await fetchLegalDocuments(filters);
            
            if (response && response.data) {
                const documentsData = response.data.content || response.data;
                console.log("🔍 Fetched documents:", documentsData);
                console.log("🔍 Documents length:", documentsData.length);
                if (documentsData.length > 0) {
                    console.log("🔍 First document:", documentsData[0]);
                    console.log("🔍 First document id:", documentsData[0]?.id);
                }
                
                setDocuments(documentsData);
                setPagination({
                    currentPage: response.data.pageable?.pageNumber + 1 || 1,
                    totalPages: response.data.totalPages || 1,
                    totalItems: response.data.totalElements || response.data.length
                });
            } else {
                setDocuments([]);
                setPagination({
                    currentPage: 1,
                    totalPages: 1,
                    totalItems: 0
                });
            }
        } catch (error) {
            console.error('Error fetching documents:', error);
            setGeneralError(error.message || "Có lỗi xảy ra khi tải danh sách tài liệu");
            showError(error.message || "Có lỗi xảy ra khi tải danh sách tài liệu");
        } finally {
            setLoading(false);
        }
    };

    // Create new legal document
    const handleCreateDocument = async (e) => {
        e.preventDefault();
        setLoading(true);
        setGeneralError("");
        setFieldErrors({ name: "", description: "", category: "" });

        // Validation
        let currentFieldErrors = { name: "", description: "", category: "" };
        let formIsValid = true;

        if (!newDocument.name.trim()) {
            currentFieldErrors.name = "Tên tài liệu không được để trống";
            formIsValid = false;
        }

        setFieldErrors(currentFieldErrors);

        if (!formIsValid) {
            setGeneralError("Vui lòng sửa các lỗi được đánh dấu");
            setLoading(false);
            return;
        }

        try {
            const response = await createLegalDocument(newDocument);
            
            if (response) {
                setShowCreateModal(false);
                setNewDocument({ name: '', description: '', category: '' });
                fetchDocuments(); // Refresh the list
                showSuccess("Tài liệu pháp lý đã được tạo thành công!");
            }
        } catch (error) {
            console.error('Error creating document:', error);
            if (error.details && error.details.errorMessage && typeof error.details.errorMessage === "object") {
                const apiFieldErrors = error.details.errorMessage;
                const updatedFieldErrors = { name: "", description: "", category: "" };

                if (apiFieldErrors.Name) {
                    updatedFieldErrors.name = Array.isArray(apiFieldErrors.Name)
                        ? apiFieldErrors.Name.join(", ")
                        : String(apiFieldErrors.Name);
                }
                if (apiFieldErrors.Description) {
                    updatedFieldErrors.description = Array.isArray(apiFieldErrors.Description)
                        ? apiFieldErrors.Description.join(", ")
                        : String(apiFieldErrors.Description);
                }
                if (apiFieldErrors.Category) {
                    updatedFieldErrors.category = Array.isArray(apiFieldErrors.Category)
                        ? apiFieldErrors.Category.join(", ")
                        : String(apiFieldErrors.Category);
                }
                setFieldErrors(updatedFieldErrors);
                if (updatedFieldErrors.name || updatedFieldErrors.description || updatedFieldErrors.category) {
                    setGeneralError("Vui lòng sửa các lỗi được đánh dấu");
                }
            } else {
                setGeneralError(error.message || "Có lỗi xảy ra khi tạo tài liệu pháp lý");
            }
            showError(error.message || "Có lỗi xảy ra khi tạo tài liệu pháp lý");
        } finally {
            setLoading(false);
        }
    };

    // Edit legal document
    const handleEditDocument = async (e) => {
        e.preventDefault();
        setLoading(true);
        setGeneralError("");
        setFieldErrors({ name: "", description: "", category: "" });

        // Validation
        let currentFieldErrors = { name: "", description: "", category: "" };
        let formIsValid = true;

        if (!editDocument.name.trim()) {
            currentFieldErrors.name = "Tên tài liệu không được để trống";
            formIsValid = false;
        }

        setFieldErrors(currentFieldErrors);

        if (!formIsValid) {
            setGeneralError("Vui lòng sửa các lỗi được đánh dấu");
            setLoading(false);
            return;
        }

        try {
            const response = await updateLegalDocument(selectedDocument.id, editDocument);
            
            if (response) {
                setShowEditModal(false);
                setSelectedDocument(null);
                setEditDocument({ name: '', description: '', category: '' });
                fetchDocuments(); // Refresh the list
                showSuccess("Tài liệu pháp lý đã được cập nhật thành công!");
            }
        } catch (error) {
            console.error('Error updating document:', error);
            if (error.details && error.details.errorMessage && typeof error.details.errorMessage === "object") {
                const apiFieldErrors = error.details.errorMessage;
                const updatedFieldErrors = { name: "", description: "", category: "" };

                if (apiFieldErrors.Name) {
                    updatedFieldErrors.name = Array.isArray(apiFieldErrors.Name)
                        ? apiFieldErrors.Name.join(", ")
                        : String(apiFieldErrors.Name);
                }
                if (apiFieldErrors.Description) {
                    updatedFieldErrors.description = Array.isArray(apiFieldErrors.Description)
                        ? apiFieldErrors.Description.join(", ")
                        : String(apiFieldErrors.Description);
                }
                if (apiFieldErrors.Category) {
                    updatedFieldErrors.category = Array.isArray(apiFieldErrors.Category)
                        ? apiFieldErrors.Category.join(", ")
                        : String(apiFieldErrors.Category);
                }
                setFieldErrors(updatedFieldErrors);
                if (updatedFieldErrors.name || updatedFieldErrors.description || updatedFieldErrors.category) {
                    setGeneralError("Vui lòng sửa các lỗi được đánh dấu");
                }
            } else {
                setGeneralError(error.message || "Có lỗi xảy ra khi cập nhật tài liệu pháp lý");
            }
            showError(error.message || "Có lỗi xảy ra khi cập nhật tài liệu pháp lý");
        } finally {
            setLoading(false);
        }
    };

    // Delete legal document
    const handleDeleteDocument = async () => {
        setLoading(true);
        try {
            const response = await deleteLegalDocument(selectedDocument.id);
            
            if (response) {
                setShowDeleteModal(false);
                setSelectedDocument(null);
                fetchDocuments(); // Refresh the list
                showSuccess("Tài liệu pháp lý đã được xóa thành công!");
            }
        } catch (error) {
            console.error('Error deleting document:', error);
            showError(error.message || "Có lỗi xảy ra khi xóa tài liệu pháp lý");
        } finally {
            setLoading(false);
        }
    };

    // Handle filter changes
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: 1 // Reset to first page when filtering
        }));
    };

    // Handle pagination
    const handlePageChange = (newPage) => {
        setFilters(prev => ({
            ...prev,
            page: newPage
        }));
    };

    // Open edit modal
    const openEditModal = (document) => {
        setSelectedDocument(document);
        setEditDocument({
            name: document.name || '',
            description: document.description || '',
            category: document.category || ''
        });
        setShowEditModal(true);
    };

    // Open delete modal
    const openDeleteModal = (document) => {
        setSelectedDocument(document);
        setShowDeleteModal(true);
    };

    // Open detail modal and fetch detailed document
    const openDetailModal = async (document) => {
        setSelectedDocument(document);
        setShowDetailModal(true);
        setLoadingDetail(true);
        setDetailedDocument(null);
        
        try {
            const response = await getLegalDocumentById(document.id);
            if (response && response.data) {
                setDetailedDocument(response.data);
            } else {
                showError("Không thể tải chi tiết tài liệu");
            }
        } catch (error) {
            console.error('Error fetching document details:', error);
            showError(error.message || "Có lỗi xảy ra khi tải chi tiết tài liệu");
        } finally {
            setLoadingDetail(false);
        }
    };

    // Helper function to truncate text
    const truncateText = (text, maxLength = 100) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    // ==================== VERSION MANAGEMENT FUNCTIONS ====================

    // Fetch versions for a specific document by getting document details
    const fetchVersions = async (documentId) => {
        console.log("🔍 fetchVersions called with documentId:", documentId);
        console.log("🔍 documentId type:", typeof documentId);
        console.log("🔍 documentId value:", documentId);
        
        if (!documentId) {
            console.error("❌ documentId is falsy:", documentId);
            setVersions([]);
            return;
        }
        
        setLoadingVersions(true);
        try {
            // Use getLegalDocumentById to get document details with versions
            const response = await getLegalDocumentById(documentId);
            
            if (response && response.data && response.data.versions) {
                console.log("✅ Fetched document with versions:", response.data);
                setVersions(response.data.versions);
            } else {
                console.log("📝 No versions found for document");
                setVersions([]);
            }
        } catch (error) {
            console.error('Error fetching versions:', error);
            // Don't show error toast for empty versions - this is expected behavior
            setVersions([]);
        } finally {
            setLoadingVersions(false);
        }
    };

    // Open version management modal
    const openVersionModal = async (document) => {
        console.log("🔍 openVersionModal called with document:", document);
        console.log("🔍 document.id:", document?.id);
        console.log("🔍 document object:", document);
        
        if (!document || !document.id) {
            console.error("❌ Document or document.id is missing:", document);
            showError("Không thể mở quản lý phiên bản: thiếu thông tin tài liệu");
            return;
        }
        
        setSelectedDocument(document);
        setNewVersion({
            legalDocumentId: document.id,
            version: '',
            status: 0,
            content: '',
            contentType: ''
        });
        setShowVersionModal(true);
        await fetchVersions(document.id);
    };

    // Create new version
    const handleCreateVersion = async (e) => {
        e.preventDefault();
        setLoading(true);
        setGeneralError("");
        setVersionFieldErrors({ version: "", content: "", contentType: "" });

        // Validation
        let currentFieldErrors = { version: "", content: "", contentType: "" };
        let formIsValid = true;

        if (!newVersion.version.trim()) {
            currentFieldErrors.version = "Phiên bản không được để trống";
            formIsValid = false;
        }
        // Remove HTML tags for validation
        const contentWithoutHtml = newVersion.content.replace(/<[^>]*>/g, '').trim();
        if (!contentWithoutHtml) {
            currentFieldErrors.content = "Nội dung không được để trống";
            formIsValid = false;
        }
        if (!newVersion.contentType.trim()) {
            currentFieldErrors.contentType = "Loại nội dung không được để trống";
            formIsValid = false;
        }

        setVersionFieldErrors(currentFieldErrors);

        if (!formIsValid) {
            setGeneralError("Vui lòng sửa các lỗi được đánh dấu");
            setLoading(false);
            return;
        }

        try {
            const response = await createLegalDocumentVersion(newVersion);
            
            if (response && response.data) {
                showSuccess("Tạo phiên bản thành công!");
                setShowCreateVersionModal(false);
                setNewVersion({
                    legalDocumentId: selectedDocument.id,
                    version: '',
                    status: 0,
                    content: '',
                    contentType: ''
                });
                await fetchVersions(selectedDocument.id);
            }
        } catch (error) {
            console.error('Error creating version:', error);
            
            // Handle API field errors
            if (error.details && error.details.errorMessage) {
                const apiErrors = error.details.errorMessage;
                const newFieldErrors = { version: "", content: "", contentType: "" };
                
                Object.keys(apiErrors).forEach(field => {
                    if (newFieldErrors.hasOwnProperty(field)) {
                        newFieldErrors[field] = Array.isArray(apiErrors[field]) 
                            ? apiErrors[field].join(', ') 
                            : String(apiErrors[field]);
                    }
                });
                
                setVersionFieldErrors(newFieldErrors);
                setGeneralError("Vui lòng sửa các lỗi được đánh dấu");
            } else {
                setGeneralError(error.message || "Có lỗi xảy ra khi tạo phiên bản");
                showError(error.message || "Có lỗi xảy ra khi tạo phiên bản");
            }
        } finally {
            setLoading(false);
        }
    };

    // Open edit version modal
    const openEditVersionModal = async (version) => {
        setSelectedVersion(version);
        setLoading(true);
        
        try {
            // Fetch full version details to get actual content (not "HIDDEN")
            const response = await fetchLegalDocumentVersionById(version.id);
            
            if (response && response.data) {
                const fullVersion = response.data;
                setEditVersion({
                    legalDocumentId: fullVersion.legalDocumentId || selectedDocument.id,
                    version: fullVersion.version || '',
                    status: fullVersion.status !== undefined ? fullVersion.status : 0,
                    content: fullVersion.content || '',
                    contentType: fullVersion.contentType || ''
                });
            } else {
                // Fallback to version data from list if fetch fails
                setEditVersion({
                    legalDocumentId: version.legalDocumentId || selectedDocument.id,
                    version: version.version || '',
                    status: version.status !== undefined ? version.status : 0,
                    content: version.content || '',
                    contentType: version.contentType || ''
                });
            }
        } catch (error) {
            console.error('Error fetching version details for edit:', error);
            // Fallback to version data from list if fetch fails
            setEditVersion({
                legalDocumentId: version.legalDocumentId || selectedDocument.id,
                version: version.version || '',
                status: version.status !== undefined ? version.status : 0,
                content: version.content || '',
                contentType: version.contentType || ''
            });
        } finally {
            setLoading(false);
            setShowEditVersionModal(true);
        }
    };

    // Update version
    const handleEditVersion = async (e) => {
        e.preventDefault();
        setLoading(true);
        setGeneralError("");
        setVersionFieldErrors({ version: "", content: "", contentType: "" });

        // Validation
        let currentFieldErrors = { version: "", content: "", contentType: "" };
        let formIsValid = true;

        if (!editVersion.version.trim()) {
            currentFieldErrors.version = "Phiên bản không được để trống";
            formIsValid = false;
        }
        // Remove HTML tags for validation
        const contentWithoutHtml = editVersion.content.replace(/<[^>]*>/g, '').trim();
        if (!contentWithoutHtml) {
            currentFieldErrors.content = "Nội dung không được để trống";
            formIsValid = false;
        }
        if (!editVersion.contentType.trim()) {
            currentFieldErrors.contentType = "Loại nội dung không được để trống";
            formIsValid = false;
        }

        setVersionFieldErrors(currentFieldErrors);

        if (!formIsValid) {
            setGeneralError("Vui lòng sửa các lỗi được đánh dấu");
            setLoading(false);
            return;
        }

        try {
            const response = await updateLegalDocumentVersion(selectedVersion.id, editVersion);
            
            if (response && response.data) {
                showSuccess("Cập nhật phiên bản thành công!");
                setShowEditVersionModal(false);
                await fetchVersions(selectedDocument.id);
            }
        } catch (error) {
            console.error('Error updating version:', error);
            
            // Handle API field errors
            if (error.details && error.details.errorMessage) {
                const apiErrors = error.details.errorMessage;
                const newFieldErrors = { version: "", content: "", contentType: "" };
                
                Object.keys(apiErrors).forEach(field => {
                    if (newFieldErrors.hasOwnProperty(field)) {
                        newFieldErrors[field] = Array.isArray(apiErrors[field]) 
                            ? apiErrors[field].join(', ') 
                            : String(apiErrors[field]);
                    }
                });
                
                setVersionFieldErrors(newFieldErrors);
                setGeneralError("Vui lòng sửa các lỗi được đánh dấu");
            } else {
                setGeneralError(error.message || "Có lỗi xảy ra khi cập nhật phiên bản");
                showError(error.message || "Có lỗi xảy ra khi cập nhật phiên bản");
            }
        } finally {
            setLoading(false);
        }
    };

    // Open delete version modal
    const openDeleteVersionModal = (version) => {
        setSelectedVersion(version);
        setShowDeleteVersionModal(true);
    };

    // Delete version
    const handleDeleteVersion = async () => {
        setLoading(true);
        try {
            const response = await deleteLegalDocumentVersion(selectedVersion.id);
            
            if (response) {
                showSuccess("Xóa phiên bản thành công!");
                setShowDeleteVersionModal(false);
                await fetchVersions(selectedDocument.id);
            }
        } catch (error) {
            console.error('Error deleting version:', error);
            showError(error.message || "Có lỗi xảy ra khi xóa phiên bản");
        } finally {
            setLoading(false);
        }
    };

    // Get status text
    const getStatusText = (status) => {
        switch (status) {
            case 0: return "Bản nháp";
            case 1: return "Không hoạt động";
            case 2: return "Hoạt động";
            default: return "Không xác định";
        }
    };

    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case 0: return "bg-yellow-100 text-yellow-800";
            case 1: return "bg-red-100 text-red-800";
            case 2: return "bg-green-100 text-green-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    // Fetch version details
    const fetchVersionDetail = async (versionId) => {
        setLoadingVersionDetail(true);
        try {
            const response = await fetchLegalDocumentVersionById(versionId);
            
            if (response && response.data) {
                setVersionDetail(response.data);
                setShowVersionDetailModal(true);
            }
        } catch (error) {
            console.error('Error fetching version detail:', error);
            showError(error.message || "Có lỗi xảy ra khi tải chi tiết phiên bản");
        } finally {
            setLoadingVersionDetail(false);
        }
    };

    // Open version detail modal
    const openVersionDetailModal = (version) => {
        setSelectedVersion(version);
        fetchVersionDetail(version.id);
    };

    // Load documents on component mount and filter changes
    useEffect(() => {
        fetchDocuments();
    }, [filters]);

    // Modal variants for animations
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Quản lý tài liệu pháp lý</h2>
                    <p className="text-gray-600 mt-1">Quản lý và tạo các tài liệu pháp lý của hệ thống</p>
                </div>
                <NoFocusOutLineButton
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Tạo tài liệu mới</span>
                </NoFocusOutLineButton>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-48">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Danh mục
                        </label>
                        <input
                            type="text"
                            placeholder="Nhập danh mục..."
                            value={filters.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        />
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {generalError && (
                <div className="bg-red-50 border border-red-500 text-red-600 p-3 rounded text-sm text-center">
                    {generalError}
                </div>
            )}

            {/* Documents Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {loading ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {['Tên tài liệu', 'Mô tả', 'Danh mục', 'Ngày tạo', 'Cập nhật lần cuối', 'Thao tác'].map((header, index) => (
                                        <th key={index} className="px-6 py-3 text-left">
                                            <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: '120px' }}></div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {[1, 2, 3, 4, 5].map((index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: '150px' }}></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: '200px' }}></div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="h-6 bg-gray-200 rounded-full animate-pulse" style={{ width: '80px' }}></div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: '100px' }}></div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: '100px' }}></div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex space-x-2">
                                                <div className="h-8 bg-gray-200 rounded animate-pulse" style={{ width: '32px' }}></div>
                                                <div className="h-8 bg-gray-200 rounded animate-pulse" style={{ width: '32px' }}></div>
                                                <div className="h-8 bg-gray-200 rounded animate-pulse" style={{ width: '32px' }}></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tên tài liệu
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Mô tả
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Danh mục
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ngày tạo
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Cập nhật lần cuối
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {documents.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                                <div className="flex flex-col items-center space-y-2">
                                                    <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    <span>Không có tài liệu pháp lý nào</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        documents.map((doc, index) => (
                                            <tr key={doc.id || index} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {doc.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900 max-w-xs">
                                                        {truncateText(doc.description, 80)}
                                                        {doc.description && doc.description.length > 80 && (
                                                            <NoFocusOutLineButton
                                                                onClick={() => openDetailModal(doc)}
                                                                className="text-blue-600 hover:text-blue-800 ml-1 text-xs"
                                                                title="Xem chi tiết"
                                                            >
                                                                Xem thêm
                                                            </NoFocusOutLineButton>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {doc.category || 'Chung'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {doc.createdTime ? new Date(doc.createdTime).toLocaleDateString('vi-VN') : 
                                                     doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {doc.lastUpdatedTime ? new Date(doc.lastUpdatedTime).toLocaleDateString('vi-VN') : 
                                                     doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString('vi-VN') : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <NoFocusOutLineButton
                                                            onClick={() => openDetailModal(doc)}
                                                            className="text-green-600 hover:text-green-900"
                                                            title="Xem chi tiết"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                        </NoFocusOutLineButton>
                                                        <NoFocusOutLineButton
                                                            onClick={() => openVersionModal(doc)}
                                                            className="text-purple-600 hover:text-purple-900"
                                                            title="Quản lý phiên bản"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                            </svg>
                                                        </NoFocusOutLineButton>
                                                        <NoFocusOutLineButton
                                                            onClick={() => openEditModal(doc)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                            title="Chỉnh sửa"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                            </svg>
                                                        </NoFocusOutLineButton>
                                                        <NoFocusOutLineButton
                                                            onClick={() => openDeleteModal(doc)}
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Xóa"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </NoFocusOutLineButton>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    <NoFocusOutLineButton
                                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                                        disabled={pagination.currentPage === 1}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Trước
                                    </NoFocusOutLineButton>
                                    <NoFocusOutLineButton
                                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                                        disabled={pagination.currentPage === pagination.totalPages}
                                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Sau
                                    </NoFocusOutLineButton>
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            Hiển thị <span className="font-medium">{(pagination.currentPage - 1) * filters.size + 1}</span> đến{' '}
                                            <span className="font-medium">
                                                {Math.min(pagination.currentPage * filters.size, pagination.totalItems)}
                                            </span>{' '}
                                            trong tổng số <span className="font-medium">{pagination.totalItems}</span> kết quả
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                                                <NoFocusOutLineButton
                                                    key={page}
                                                    onClick={() => handlePageChange(page)}
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                        page === pagination.currentPage
                                                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {page}
                                                </NoFocusOutLineButton>
                                            ))}
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Create Document Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-4"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={backdropVariants}
                        onClick={() => setShowCreateModal(false)}
                    >
                        <motion.div
                            ref={modalRef}
                            className="bg-white rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-md mx-auto relative overflow-y-auto max-h-[95vh]"
                            variants={modalVariants}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <NoFocusOutLineButton
                                onClick={() => setShowCreateModal(false)}
                                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                                aria-label="Close modal"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </NoFocusOutLineButton>

                            <h2 className="text-black text-2xl font-semibold text-center mb-4">
                                Tạo tài liệu pháp lý mới
                            </h2>

                            {generalError && (
                                <div className="bg-red-50 border border-red-500 text-red-600 p-3 rounded text-sm text-center mb-4">
                                    {generalError}
                                </div>
                            )}

                            <form onSubmit={handleCreateDocument}>
                                <div className="mb-4">
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Tên tài liệu *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={newDocument.name}
                                        onChange={(e) => {
                                            setNewDocument(prev => ({ ...prev, name: e.target.value }));
                                            setFieldErrors(prev => ({ ...prev, name: "" }));
                                            setGeneralError("");
                                        }}
                                        placeholder="Nhập tên tài liệu..."
                                        className={`w-full px-4 py-3 border text-black rounded-lg focus:outline-none focus:ring-1
                                            ${fieldErrors.name
                                                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                : "border-gray-300 focus:ring-black focus:border-black"
                                            }`}
                                        required
                                    />
                                    {fieldErrors.name && (
                                        <p className="text-red-500 text-xs italic mt-1">{fieldErrors.name}</p>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                        Danh mục
                                    </label>
                                    <input
                                        type="text"
                                        id="category"
                                        value={newDocument.category}
                                        onChange={(e) => {
                                            setNewDocument(prev => ({ ...prev, category: e.target.value }));
                                            setFieldErrors(prev => ({ ...prev, category: "" }));
                                            setGeneralError("");
                                        }}
                                        placeholder="Nhập danh mục tài liệu..."
                                        className={`w-full px-4 py-3 border text-black rounded-lg focus:outline-none focus:ring-1
                                            ${fieldErrors.category
                                                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                : "border-gray-300 focus:ring-black focus:border-black"
                                            }`}
                                    />
                                    {fieldErrors.category && (
                                        <p className="text-red-500 text-xs italic mt-1">{fieldErrors.category}</p>
                                    )}
                                </div>

                                <div className="mb-6">
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                        Mô tả
                                    </label>
                                    <textarea
                                        id="description"
                                        value={newDocument.description}
                                        onChange={(e) => {
                                            setNewDocument(prev => ({ ...prev, description: e.target.value }));
                                            setFieldErrors(prev => ({ ...prev, description: "" }));
                                            setGeneralError("");
                                        }}
                                        rows="3"
                                        placeholder="Nhập mô tả tài liệu..."
                                        className={`w-full px-4 py-3 border text-black rounded-lg focus:outline-none focus:ring-1
                                            ${fieldErrors.description
                                                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                : "border-gray-300 focus:ring-black focus:border-black"
                                            }`}
                                    />
                                    {fieldErrors.description && (
                                        <p className="text-red-500 text-xs italic mt-1">{fieldErrors.description}</p>
                                    )}
                                </div>

                                <NoFocusOutLineButton
                                    type="submit"
                                    className={`w-full bg-[#333333] text-white py-3 rounded-lg font-semibold hover:bg-black transition duration-200 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center">
                                            <SpinnerIcon />
                                            Đang tạo...
                                        </div>
                                    ) : (
                                        "Tạo tài liệu"
                                    )}
                                </NoFocusOutLineButton>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Document Modal */}
            <AnimatePresence>
                {showEditModal && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-4"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={backdropVariants}
                        onClick={() => setShowEditModal(false)}
                    >
                        <motion.div
                            className="bg-white rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-5xl relative overflow-y-auto max-h-[100vh]"
                            variants={modalVariants}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <NoFocusOutLineButton
                                onClick={() => setShowEditModal(false)}
                                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                                aria-label="Close modal"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </NoFocusOutLineButton>

                            <h2 className="text-black text-2xl font-semibold text-center mb-4">
                                Chỉnh sửa tài liệu pháp lý
                            </h2>

                            {generalError && (
                                <div className="bg-red-50 border border-red-500 text-red-600 p-3 rounded text-sm text-center mb-4">
                                    {generalError}
                                </div>
                            )}

                            <form onSubmit={handleEditDocument}>
                                <div className="mb-4">
                                    <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Tên tài liệu *
                                    </label>
                                    <input
                                        type="text"
                                        id="edit-name"
                                        value={editDocument.name}
                                        onChange={(e) => {
                                            setEditDocument(prev => ({ ...prev, name: e.target.value }));
                                            setFieldErrors(prev => ({ ...prev, name: "" }));
                                            setGeneralError("");
                                        }}
                                        placeholder="Nhập tên tài liệu..."
                                        className={`w-full px-4 py-3 border text-black rounded-lg focus:outline-none focus:ring-1
                                            ${fieldErrors.name
                                                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                : "border-gray-300 focus:ring-black focus:border-black"
                                            }`}
                                        required
                                    />
                                    {fieldErrors.name && (
                                        <p className="text-red-500 text-xs italic mt-1">{fieldErrors.name}</p>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700 mb-1">
                                        Danh mục
                                    </label>
                                    <input
                                        type="text"
                                        id="edit-category"
                                        value={editDocument.category}
                                        onChange={(e) => {
                                            setEditDocument(prev => ({ ...prev, category: e.target.value }));
                                            setFieldErrors(prev => ({ ...prev, category: "" }));
                                            setGeneralError("");
                                        }}
                                        placeholder="Nhập danh mục tài liệu..."
                                        className={`w-full px-4 py-3 border text-black rounded-lg focus:outline-none focus:ring-1
                                            ${fieldErrors.category
                                                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                : "border-gray-300 focus:ring-black focus:border-black"
                                            }`}
                                    />
                                    {fieldErrors.category && (
                                        <p className="text-red-500 text-xs italic mt-1">{fieldErrors.category}</p>
                                    )}
                                </div>

                                <div className="mb-6">
                                    <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
                                        Mô tả
                                    </label>
                                    <textarea
                                        id="edit-description"
                                        value={editDocument.description}
                                        onChange={(e) => {
                                            setEditDocument(prev => ({ ...prev, description: e.target.value }));
                                            setFieldErrors(prev => ({ ...prev, description: "" }));
                                            setGeneralError("");
                                        }}
                                        rows="3"
                                        placeholder="Nhập mô tả tài liệu..."
                                        className={`w-full px-4 py-3 border text-black rounded-lg focus:outline-none focus:ring-1
                                            ${fieldErrors.description
                                                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                : "border-gray-300 focus:ring-black focus:border-black"
                                            }`}
                                    />
                                    {fieldErrors.description && (
                                        <p className="text-red-500 text-xs italic mt-1">{fieldErrors.description}</p>
                                    )}
                                </div>

                                <NoFocusOutLineButton
                                    type="submit"
                                    className={`w-full bg-[#333333] text-white py-3 rounded-lg font-semibold hover:bg-black transition duration-200 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center">
                                            <SpinnerIcon />
                                            Đang cập nhật...
                                        </div>
                                    ) : (
                                        "Cập nhật tài liệu"
                                    )}
                                </NoFocusOutLineButton>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-4"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={backdropVariants}
                        onClick={() => setShowDeleteModal(false)}
                    >
                        <motion.div
                            className="bg-white rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-md mx-auto relative"
                            variants={modalVariants}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <NoFocusOutLineButton
                                onClick={() => setShowDeleteModal(false)}
                                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                                aria-label="Close modal"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </NoFocusOutLineButton>

                            <div className="text-center">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                    <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Xác nhận xóa
                                </h3>
                                <p className="text-sm text-gray-500 mb-6">
                                    Bạn có chắc chắn muốn xóa tài liệu "{selectedDocument?.name}"? Hành động này không thể hoàn tác.
                                </p>
                                <div className="flex justify-center space-x-3">
                                    <NoFocusOutLineButton
                                        onClick={() => setShowDeleteModal(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                    >
                                        Hủy
                                    </NoFocusOutLineButton>
                                    <NoFocusOutLineButton
                                        onClick={handleDeleteDocument}
                                        disabled={loading}
                                        className={`px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                                    >
                                        {loading ? (
                                            <div className="flex items-center justify-center">
                                                <SpinnerIcon />
                                                Đang xóa...
                                            </div>
                                        ) : (
                                            "Xóa"
                                        )}
                                    </NoFocusOutLineButton>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Document Detail Modal */}
            <AnimatePresence>
                {showDetailModal && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-4"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={backdropVariants}
                        onClick={() => setShowDetailModal(false)}
                    >
                        <motion.div
                            className="bg-white rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-2xl mx-auto relative overflow-y-auto max-h-[95vh]"
                            variants={modalVariants}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <NoFocusOutLineButton
                                onClick={() => setShowDetailModal(false)}
                                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                                aria-label="Close modal"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </NoFocusOutLineButton>

                            <div className="mb-6">
                                <h2 className="text-black text-2xl font-semibold text-center mb-4">
                                    Chi tiết tài liệu pháp lý
                                </h2>
                                
                                {loadingDetail ? (
                                    <div className="space-y-6">
                                        {/* Document Name Skeleton */}
                                        <div>
                                            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" style={{ width: '100px' }}></div>
                                            <div className="h-6 bg-gray-200 rounded animate-pulse" style={{ width: '200px' }}></div>
                                        </div>

                                        {/* Description Skeleton */}
                                        <div>
                                            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" style={{ width: '60px' }}></div>
                                            <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
                                        </div>

                                        {/* Category Skeleton */}
                                        <div>
                                            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" style={{ width: '80px' }}></div>
                                            <div className="h-6 bg-gray-200 rounded-full animate-pulse" style={{ width: '100px' }}></div>
                                        </div>

                                        {/* Date Grid Skeleton */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" style={{ width: '80px' }}></div>
                                                <div className="h-6 bg-gray-200 rounded animate-pulse" style={{ width: '150px' }}></div>
                                            </div>
                                            <div>
                                                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" style={{ width: '120px' }}></div>
                                                <div className="h-6 bg-gray-200 rounded animate-pulse" style={{ width: '150px' }}></div>
                                            </div>
                                        </div>

                                        {/* Versions Section Skeleton */}
                                        <div>
                                            <div className="h-4 bg-gray-200 rounded animate-pulse mb-3" style={{ width: '100px' }}></div>
                                            <div className="space-y-3">
                                                {[1, 2, 3].map((index) => (
                                                    <div key={index} className="p-3 border border-gray-200 rounded-lg">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: '100px' }}></div>
                                                            <div className="h-6 bg-gray-200 rounded-full animate-pulse" style={{ width: '80px' }}></div>
                                                        </div>
                                                        <div className="h-3 bg-gray-200 rounded animate-pulse" style={{ width: '150px' }}></div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : detailedDocument ? (
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Tên tài liệu
                                            </label>
                                            <div className="text-lg font-semibold text-gray-900 p-3 bg-gray-50 rounded-lg">
                                                {detailedDocument.name}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Mô tả
                                            </label>
                                            <div className="text-gray-900 p-3 bg-gray-50 rounded-lg whitespace-pre-wrap">
                                                {detailedDocument.description || 'Không có mô tả'}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Danh mục
                                            </label>
                                            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                                {detailedDocument.category || 'Chung'}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Ngày tạo
                                                </label>
                                                <div className="text-gray-900 p-3 bg-gray-50 rounded-lg">
                                                    {detailedDocument.createdTime ? 
                                                        new Date(detailedDocument.createdTime).toLocaleString('vi-VN') :
                                                        detailedDocument.createdAt ? 
                                                        new Date(detailedDocument.createdAt).toLocaleString('vi-VN') : 
                                                        'N/A'}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Cập nhật lần cuối
                                                </label>
                                                <div className="text-gray-900 p-3 bg-gray-50 rounded-lg">
                                                    {detailedDocument.lastUpdatedTime ? 
                                                        new Date(detailedDocument.lastUpdatedTime).toLocaleString('vi-VN') :
                                                        detailedDocument.updatedAt ? 
                                                        new Date(detailedDocument.updatedAt).toLocaleString('vi-VN') : 
                                                        'N/A'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Versions Section */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                Phiên bản {detailedDocument.versions && detailedDocument.versions.length > 0 ? `(${detailedDocument.versions.length})` : ''}
                                            </label>
                                            {detailedDocument.versions && detailedDocument.versions.length > 0 ? (
                                                <div className="bg-gray-50 rounded-lg p-4">
                                                    <div className="space-y-3">
                                                        {detailedDocument.versions.map((version, index) => (
                                                            <div key={version.id || index} className="bg-white rounded-lg p-4 border border-gray-200">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <div className="flex items-center space-x-3">
                                                                        <span className="text-sm font-medium text-gray-900">
                                                                            Phiên bản: {version.version}
                                                                        </span>
                                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(version.status)}`}>
                                                                            {getStatusText(version.status)}
                                                                        </span>
                                                                        <span className="text-xs text-gray-500">
                                                                            {version.contentType}
                                                                        </span>
                                                                    </div>
                                                                    <NoFocusOutLineButton
                                                                        onClick={() => openVersionDetailModal(version)}
                                                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                                        aria-label="View version details"
                                                                    >
                                                                        Xem chi tiết
                                                                    </NoFocusOutLineButton>
                                                                </div>
                                                                <div className="text-sm text-gray-600">
                                                                    <div className="truncate">
                                                                        <div 
                                                                            dangerouslySetInnerHTML={{ 
                                                                                __html: version.content ? 
                                                                                    version.content.replace(/<[^>]*>/g, '').substring(0, 150) + 
                                                                                    (version.content.replace(/<[^>]*>/g, '').length > 150 ? '...' : '') 
                                                                                    : 'Không có nội dung'
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                                                                    <span>
                                                                        Tạo: {version.createdTime ? 
                                                                            new Date(version.createdTime).toLocaleString('vi-VN') :
                                                                            version.createdAt ? 
                                                                            new Date(version.createdAt).toLocaleString('vi-VN') : 
                                                                            'N/A'}
                                                                    </span>
                                                                    <span>
                                                                        Cập nhật: {version.lastUpdatedTime ? 
                                                                            new Date(version.lastUpdatedTime).toLocaleString('vi-VN') :
                                                                            version.updatedAt ? 
                                                                            new Date(version.updatedAt).toLocaleString('vi-VN') : 
                                                                            'N/A'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-gray-50 rounded-lg p-4 text-center">
                                                    <div className="text-gray-500">
                                                        <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        Chưa có phiên bản nào cho tài liệu này
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <NoFocusOutLineButton
                                                onClick={() => setShowDetailModal(false)}
                                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                            >
                                                Đóng
                                            </NoFocusOutLineButton>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="text-gray-500">
                                            Không thể tải chi tiết tài liệu
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ==================== VERSION MANAGEMENT MODALS ==================== */}

            {/* Version Management Modal */}
            <AnimatePresence>
                {showVersionModal && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-4"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={backdropVariants}
                        onClick={() => setShowVersionModal(false)}
                    >
                        <motion.div
                            ref={modalRef}
                            className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
                            variants={modalVariants}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Quản lý phiên bản - {selectedDocument?.name}
                                </h2>
                                <NoFocusOutLineButton
                                    onClick={() => setShowVersionModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                    aria-label="Close modal"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </NoFocusOutLineButton>
                            </div>

                            <div className="p-6">
                                {/* Header with Create Version Button */}
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">Danh sách phiên bản</h3>
                                        <p className="text-sm text-gray-600">Quản lý các phiên bản của tài liệu pháp lý</p>
                                    </div>
                                    <NoFocusOutLineButton
                                        onClick={() => setShowCreateVersionModal(true)}
                                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        <span>Tạo phiên bản mới</span>
                                    </NoFocusOutLineButton>
                                </div>

                                {/* Versions Table */}
                                <div className="bg-white rounded-lg border overflow-hidden">
                                    {loadingVersions ? (
                                        <div className="p-8 text-center">
                                            <div className="inline-flex items-center space-x-2">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                                                <span className="text-gray-600">Đang tải phiên bản...</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-black">
                                                                Phiên bản
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Trạng thái
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Loại nội dung
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Nội dung
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Thao tác
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {versions.length === 0 ? (
                                                            <tr>
                                                                <td colSpan="5" className="px-6 py-12 text-center">
                                                                    <div className="flex flex-col items-center space-y-3">
                                                                        <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                        </svg>
                                                                        <div className="text-gray-500">
                                                                            <p className="text-lg font-medium">Chưa có phiên bản nào</p>
                                                                            <p className="text-sm">Tạo phiên bản đầu tiên để bắt đầu quản lý tài liệu</p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            versions.map((version, index) => (
                                                                <tr key={version.id || index} className="hover:bg-gray-50">
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <div className="text-sm font-medium text-gray-900">
                                                                            {version.version}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(version.status)}`}>
                                                                            {getStatusText(version.status)}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <div className="text-sm text-gray-900">
                                                                            {version.contentType}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4">
                                                                        <div className="text-sm text-gray-900 max-w-xs">
                                                                            <div 
                                                                                dangerouslySetInnerHTML={{ 
                                                                                    __html: version.content ? 
                                                                                        version.content.replace(/<[^>]*>/g, '').substring(0, 60) + 
                                                                                        (version.content.replace(/<[^>]*>/g, '').length > 60 ? '...' : '') 
                                                                                        : 'Không có nội dung'
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                                        <div className="flex space-x-2">
                                                                            <NoFocusOutLineButton
                                                                                onClick={() => openVersionDetailModal(version)}
                                                                                className="text-green-600 hover:text-green-900"
                                                                                title="Xem chi tiết"
                                                                            >
                                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                                </svg>
                                                                            </NoFocusOutLineButton>
                                                                            <NoFocusOutLineButton
                                                                                onClick={() => openEditVersionModal(version)}
                                                                                className="text-blue-600 hover:text-blue-900"
                                                                                title="Chỉnh sửa"
                                                                            >
                                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                                </svg>
                                                                            </NoFocusOutLineButton>
                                                                            <NoFocusOutLineButton
                                                                                onClick={() => openDeleteVersionModal(version)}
                                                                                className="text-red-600 hover:text-red-900"
                                                                                title="Xóa"
                                                                            >
                                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                                </svg>
                                                                            </NoFocusOutLineButton>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Close Button */}
                                <div className="flex justify-end pt-6">
                                    <NoFocusOutLineButton
                                        onClick={() => setShowVersionModal(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                    >
                                        Đóng
                                    </NoFocusOutLineButton>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Create Version Modal */}
            <AnimatePresence>
                {showCreateVersionModal && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-4"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={backdropVariants}
                        onClick={() => setShowCreateVersionModal(false)}
                    >
                        <motion.div
                            ref={modalRef}
                            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                            variants={modalVariants}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Tạo phiên bản mới
                                </h2>
                                <NoFocusOutLineButton
                                    onClick={() => setShowCreateVersionModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                    aria-label="Close modal"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </NoFocusOutLineButton>
                            </div>

                            <form onSubmit={handleCreateVersion} className="p-6">
                                {generalError && (
                                    <div className="bg-red-50 border border-red-500 text-red-600 p-3 rounded text-sm text-center mb-4">
                                        {generalError}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phiên bản <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={newVersion.version}
                                            onChange={(e) => setNewVersion({...newVersion, version: e.target.value})}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-black ${
                                                versionFieldErrors.version ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Nhập phiên bản (ví dụ: 1.0, 2.1)"
                                        />
                                        {versionFieldErrors.version && (
                                            <p className="mt-1 text-sm text-red-600">{versionFieldErrors.version}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Trạng thái <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={newVersion.status}
                                            onChange={(e) => setNewVersion({...newVersion, status: parseInt(e.target.value)})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
                                        >
                                            <option value={0}>Bản nháp</option>
                                            <option value={1}>Không hoạt động</option>
                                            <option value={2}>Hoạt động</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Loại nội dung <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={newVersion.contentType}
                                            onChange={(e) => setNewVersion({...newVersion, contentType: e.target.value})}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-black ${
                                                versionFieldErrors.contentType ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Nhập loại nội dung (ví dụ: PDF, DOC, HTML)"
                                        />
                                        {versionFieldErrors.contentType && (
                                            <p className="mt-1 text-sm text-red-600">{versionFieldErrors.contentType}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nội dung <span className="text-red-500">*</span>
                                        </label>
                                        <div className={`${versionFieldErrors.content ? 'error' : ''}`}>
                                            <Editor
                                                apiKey={tinymceConfig.apiKey}
                                                value={newVersion.content}
                                                onEditorChange={(content) => setNewVersion({...newVersion, content})}
                                                init={{
                                                    height: tinymceConfig.height,
                                                    menubar: tinymceConfig.menubar,
                                                    plugins: tinymceConfig.plugins,
                                                    toolbar: tinymceConfig.toolbar,
                                                    content_style: tinymceConfig.content_style,
                                                    placeholder: tinymceConfig.placeholder,
                                                    branding: tinymceConfig.branding,
                                                    elementpath: tinymceConfig.elementpath,
                                                    resize: tinymceConfig.resize
                                                }}
                                            />
                                        </div>
                                        {versionFieldErrors.content && (
                                            <p className="mt-1 text-sm text-red-600">{versionFieldErrors.content}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 pt-6">
                                    <NoFocusOutLineButton
                                        type="button"
                                        onClick={() => setShowCreateVersionModal(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                    >
                                        Hủy
                                    </NoFocusOutLineButton>
                                    <NoFocusOutLineButton
                                        type="submit"
                                        disabled={loading}
                                        className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                    >
                                        {loading ? <SpinnerIcon /> : <span>Tạo phiên bản</span>}
                                    </NoFocusOutLineButton>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Version Modal */}
            <AnimatePresence>
                {showEditVersionModal && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-4"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={backdropVariants}
                        onClick={() => setShowEditVersionModal(false)}
                    >
                        <motion.div
                            ref={modalRef}
                            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                            variants={modalVariants}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Chỉnh sửa phiên bản
                                </h2>
                                <NoFocusOutLineButton
                                    onClick={() => setShowEditVersionModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                    aria-label="Close modal"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </NoFocusOutLineButton>
                            </div>

                            <form onSubmit={handleEditVersion} className="p-6">
                                {generalError && (
                                    <div className="bg-red-50 border border-red-500 text-red-600 p-3 rounded text-sm text-center mb-4">
                                        {generalError}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phiên bản <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={editVersion.version}
                                            onChange={(e) => setEditVersion({...editVersion, version: e.target.value})}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-black ${
                                                versionFieldErrors.version ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Nhập phiên bản (ví dụ: 1.0, 2.1)"
                                        />
                                        {versionFieldErrors.version && (
                                            <p className="mt-1 text-sm text-red-600">{versionFieldErrors.version}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Trạng thái <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={editVersion.status}
                                            onChange={(e) => setEditVersion({...editVersion, status: parseInt(e.target.value)})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
                                        >
                                            <option value={0}>Bản nháp</option>
                                            <option value={1}>Không hoạt động</option>
                                            <option value={2}>Hoạt động</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Loại nội dung <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={editVersion.contentType}
                                            onChange={(e) => setEditVersion({...editVersion, contentType: e.target.value})}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-black ${
                                                versionFieldErrors.contentType ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Nhập loại nội dung (ví dụ: PDF, DOC, HTML)"
                                        />
                                        {versionFieldErrors.contentType && (
                                            <p className="mt-1 text-sm text-red-600">{versionFieldErrors.contentType}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nội dung <span className="text-red-500">*</span>
                                        </label>
                                        <div className={`${versionFieldErrors.content ? 'error' : ''}`}>
                                            <Editor
                                                apiKey={tinymceConfig.apiKey}
                                                value={editVersion.content}
                                                onEditorChange={(content) => setEditVersion({...editVersion, content})}
                                                init={{
                                                    height: tinymceConfig.height,
                                                    menubar: tinymceConfig.menubar,
                                                    plugins: tinymceConfig.plugins,
                                                    toolbar: tinymceConfig.toolbar,
                                                    content_style: tinymceConfig.content_style,
                                                    placeholder: tinymceConfig.placeholder,
                                                    branding: tinymceConfig.branding,
                                                    elementpath: tinymceConfig.elementpath,
                                                    resize: tinymceConfig.resize
                                                }}
                                            />
                                        </div>
                                        {versionFieldErrors.content && (
                                            <p className="mt-1 text-sm text-red-600">{versionFieldErrors.content}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 pt-6">
                                    <NoFocusOutLineButton
                                        type="button"
                                        onClick={() => setShowEditVersionModal(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                    >
                                        Hủy
                                    </NoFocusOutLineButton>
                                    <NoFocusOutLineButton
                                        type="submit"
                                        disabled={loading}
                                        className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                    >
                                        {loading ? <SpinnerIcon /> : <span>Cập nhật phiên bản</span>}
                                    </NoFocusOutLineButton>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Version Confirmation Modal */}
            <AnimatePresence>
                {showDeleteVersionModal && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-4"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={backdropVariants}
                        onClick={() => setShowDeleteVersionModal(false)}
                    >
                        <motion.div
                            ref={modalRef}
                            className="bg-white rounded-lg shadow-xl max-w-md w-full"
                            variants={modalVariants}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Xác nhận xóa phiên bản
                                </h2>
                                <NoFocusOutLineButton
                                    onClick={() => setShowDeleteVersionModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                    aria-label="Close modal"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </NoFocusOutLineButton>
                            </div>

                            <div className="p-6">
                                <div className="mb-6">
                                    <p className="text-gray-700 mb-4">
                                        Bạn có chắc chắn muốn xóa phiên bản <strong>"{selectedVersion?.version}"</strong>?
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Hành động này không thể hoàn tác.
                                    </p>
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <NoFocusOutLineButton
                                        onClick={() => setShowDeleteVersionModal(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                    >
                                        Hủy
                                    </NoFocusOutLineButton>
                                    <NoFocusOutLineButton
                                        onClick={handleDeleteVersion}
                                        disabled={loading}
                                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                    >
                                        {loading ? <SpinnerIcon /> : <span>Xóa phiên bản</span>}
                                    </NoFocusOutLineButton>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Version Detail Modal */}
            <AnimatePresence>
                {showVersionDetailModal && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-4"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={backdropVariants}
                        onClick={() => setShowVersionDetailModal(false)}
                    >
                        <motion.div
                            ref={modalRef}
                            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                            variants={modalVariants}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Chi tiết phiên bản
                                </h2>
                                <NoFocusOutLineButton
                                    onClick={() => setShowVersionDetailModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                    aria-label="Close modal"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </NoFocusOutLineButton>
                            </div>

                            <div className="p-6">
                                {loadingVersionDetail ? (
                                    <div className="flex justify-center items-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                                        <span className="ml-3 text-gray-600">Đang tải chi tiết phiên bản...</span>
                                    </div>
                                ) : versionDetail ? (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Phiên bản
                                                </label>
                                                <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                                                    {versionDetail.version}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Trạng thái
                                                </label>
                                                <div className="flex items-center">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(versionDetail.status)}`}>
                                                        {getStatusText(versionDetail.status)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Loại nội dung
                                                </label>
                                                <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                                                    {versionDetail.contentType}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    ID Tài liệu pháp lý
                                                </label>
                                                <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                                                    {versionDetail.legalDocumentId}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Nội dung
                                            </label>
                                            <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md min-h-[200px] border">
                                                <div 
                                                    dangerouslySetInnerHTML={{ __html: versionDetail.content || 'Không có nội dung' }}
                                                    className="prose prose-sm max-w-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Thời gian tạo
                                                </label>
                                                <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                                                    {versionDetail.createdTime ? new Date(versionDetail.createdTime).toLocaleString('vi-VN') : 
                                                     versionDetail.createdAt ? new Date(versionDetail.createdAt).toLocaleString('vi-VN') : 'N/A'}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Cập nhật lần cuối
                                                </label>
                                                <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                                                    {versionDetail.lastUpdatedTime ? new Date(versionDetail.lastUpdatedTime).toLocaleString('vi-VN') : 
                                                     versionDetail.updatedAt ? new Date(versionDetail.updatedAt).toLocaleString('vi-VN') : 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <p className="text-gray-500">Không thể tải chi tiết phiên bản</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end p-6 border-t border-gray-200">
                                <NoFocusOutLineButton
                                    onClick={() => setShowVersionDetailModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    Đóng
                                </NoFocusOutLineButton>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LegalDocumentManagement;
