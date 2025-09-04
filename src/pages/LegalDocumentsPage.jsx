import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { showSuccess, showError } from "../utils/toastManager.js";
import {
  getAllLegalDocumentCategories,
  getLegalDocumentByCategory,
} from "../components/api/auth";
import {
  FaFileAlt,
  FaCalendarAlt,
  FaClock,
  FaFilter,
  FaTimes,
  FaBookOpen,
  FaShieldAlt,
  FaGavel,
  FaBalanceScale,
  FaSearch,
  FaArrowRight,
  FaEye,
  FaDownload,
} from "react-icons/fa";
import NoFocusOutlineButton from "../utils/noFocusOutlineButton";

const LegalDocumentsPage = () => {
  const [categories, setCategories] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch documents when category changes
  useEffect(() => {
    if (selectedCategory) {
      fetchDocuments(selectedCategory, 1);
    } else {
      setDocuments([]);
      setCurrentPage(1);
      setHasMore(true);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await getAllLegalDocumentCategories();
      setCategories(categoriesData);

      // Auto-select first category if available
      if (categoriesData && categoriesData.length > 0) {
        setSelectedCategory(categoriesData[0]);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      showError("Không thể tải danh mục tài liệu pháp lý");
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async (category, page = 1, append = false) => {
    try {
      setLoadingDocuments(true);
      const documentsData = await getLegalDocumentByCategory(
        category,
        page,
        10
      );

      if (append) {
        setDocuments((prev) => [...prev, ...documentsData]);
      } else {
        setDocuments(documentsData);
      }

      setCurrentPage(page);
      setHasMore(documentsData.length === 10);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      showError("Không thể tải tài liệu pháp lý");
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleLoadMore = () => {
    if (hasMore && !loadingDocuments) {
      fetchDocuments(selectedCategory, currentPage + 1, true);
    }
  };

  const handleDocumentClick = (document) => {
    navigate(`/legal-documents/${document.id}`, {
      state: { document },
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const clearFilter = () => {
    setSelectedCategory("");
    setDocuments([]);
    setCurrentPage(1);
    setHasMore(true);
  };

  const getCategoryIcon = (category) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes("book") || categoryLower.includes("nhanh"))
      return <FaBookOpen />;
    if (
      categoryLower.includes("chính sách") ||
      categoryLower.includes("policy")
    )
      return <FaShieldAlt />;
    if (categoryLower.includes("luật") || categoryLower.includes("law"))
      return <FaGavel />;
    if (
      categoryLower.includes("quy định") ||
      categoryLower.includes("regulation")
    )
      return <FaBalanceScale />;
    return <FaFileAlt />;
  };

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Skeleton */}
          <div className="text-center mb-12">
            <div className="h-12 bg-gray-200 rounded-lg w-3/5 mx-auto mb-4 animate-pulse"></div>
            <div className="h-7 bg-gray-200 rounded-lg w-2/5 mx-auto animate-pulse"></div>
          </div>

          {/* Search Skeleton */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-8">
            <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          {/* Categories Skeleton */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <div className="h-9 bg-gray-200 rounded-lg w-1/3 mb-6 animate-pulse"></div>
            <div className="flex gap-3 flex-wrap">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-10 bg-gray-200 rounded-lg w-36 animate-pulse"
                ></div>
              ))}
            </div>
          </div>

          {/* Documents Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-gray-200 p-6 h-72 animate-pulse"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded-lg w-3/4 mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded-lg w-1/3"></div>
                  </div>
                </div>
                <div className="h-20 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Chính sách pháp lý
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Tìm hiểu về các chính sách và quy định pháp lý của chúng tôi
          </p>
        </div>

        {/* Category Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Danh mục tài liệu pháp lý
            </h3>
            {selectedCategory && (
              <NoFocusOutlineButton
                onClick={clearFilter}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Xóa bộ lọc"
              >
                <FaTimes />
              </NoFocusOutlineButton>
            )}
          </div>

          <div className="flex gap-3 flex-wrap">
            {categories.map((category) => (
              <NoFocusOutlineButton
                key={category}
                onClick={() => handleCategorySelect(category)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                }`}
                title={`Xem tài liệu trong danh mục: ${category}`}
              >
                {getCategoryIcon(category)}
                {category}
              </NoFocusOutlineButton>
            ))}
          </div>
          
          {/* Category description */}
          <p className="text-sm text-gray-500 mt-3">
            Click vào danh mục để xem tài liệu pháp lý thuộc danh mục đó
          </p>
        </div>

        {/* Documents Section */}
        {selectedCategory ? (
          <div>
            <div className="flex items-center gap-4 mb-8">
              <NoFocusOutlineButton className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg">
                {getCategoryIcon(selectedCategory)}
                {selectedCategory}
              </NoFocusOutlineButton>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-medium text-sm">
                {filteredDocuments.length} tài liệu
              </span>
            </div>

            {loadingDocuments && documents.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl border border-gray-200 p-6 h-72 animate-pulse"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-6 bg-gray-200 rounded-lg w-3/4 mb-2"></div>
                        <div className="h-5 bg-gray-200 rounded-lg w-1/3"></div>
                      </div>
                    </div>
                    <div className="h-20 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaFileAlt className="text-4xl text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Không tìm thấy tài liệu
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {searchTerm
                    ? `Không có tài liệu nào phù hợp với từ khóa "${searchTerm}"`
                    : "Chưa có tài liệu pháp lý nào trong danh mục này"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredDocuments.map((document) => (
                  <div
                    key={document.id}
                    onClick={() => handleDocumentClick(document)}
                    className="bg-white rounded-xl border border-gray-200 p-6 h-72 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-blue-300 group"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-xl">
                        {getCategoryIcon(document.category)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {document.name}
                        </h3>
                        <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                          {document.category}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed">
                      {document.description || "Không có mô tả"}
                    </p>

                    <div className="border-t border-gray-100 pt-4">
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-gray-400" />
                          <span>{formatDate(document.createdTime)}</span>
                        </div>

                        {document.versions && document.versions.length > 0 && (
                          <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                            {document.versions.length} phiên bản
                          </span>
                        )}
                      </div>

                      {document.lastUpdatedTime &&
                        document.lastUpdatedTime !== document.createdTime && (
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <FaClock />
                            <span>
                              Cập nhật: {formatDate(document.lastUpdatedTime)}
                            </span>
                          </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-4 flex gap-2">
                      <NoFocusOutlineButton className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <FaEye className="inline mr-1" />
                        Xem
                      </NoFocusOutlineButton>
                      <NoFocusOutlineButton className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                        <FaDownload className="inline mr-1" />
                        Tải
                      </NoFocusOutlineButton>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-12">
                <NoFocusOutlineButton
                  onClick={handleLoadMore}
                  disabled={loadingDocuments}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                >
                  {loadingDocuments ? "Đang tải..." : "Tải thêm tài liệu"}
                  <FaArrowRight />
                </NoFocusOutlineButton>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <FaFilter className="text-5xl text-gray-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Chọn danh mục để xem tài liệu
            </h2>
            <p className="text-gray-600 max-w-md mx-auto mb-8">
              Vui lòng chọn một danh mục từ bên trên để xem các tài liệu pháp lý
            </p>
            <NoFocusOutlineButton
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 hover:scale-105"
            >
              Trở về trang chủ
            </NoFocusOutlineButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default LegalDocumentsPage;
