import React, { useState, useEffect } from 'react';
import { showSuccess, showError } from '../../utils/toastManager.js';
import { 
  getPendingTutorIntroductionVideos, 
  reviewTutorIntroductionVideo,
  fetchTutorById
} from '../api/auth';

const VideoManagement = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [selectedStatus, setSelectedStatus] = useState(null); // null = all statuses
  const [reviewingVideo, setReviewingVideo] = useState(null);
  const [tutorInfo, setTutorInfo] = useState({});
  const [loadingTutors, setLoadingTutors] = useState({});

  // Fetch videos with status filter
  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Log the selected status for debugging
      console.log('🔍 Fetching videos with status:', selectedStatus);
      console.log('🔍 Page:', currentPage, 'PageSize:', pageSize);
      
      const response = await getPendingTutorIntroductionVideos(currentPage, pageSize, selectedStatus);
      
      console.log('🔍 API response:', response);
      console.log('🔍 Response data type:', typeof response?.data);
      console.log('🔍 Response data is array:', Array.isArray(response?.data));
      
      if (response && response.data) {
        console.log('📊 Setting videos:', response.data);
        // Handle different response formats
        const videoData = Array.isArray(response.data) ? response.data : 
                         (response.data.items || response.data.content || response.data);
        const finalVideoData = Array.isArray(videoData) ? videoData : [];
        console.log('📊 Final video data:', finalVideoData);
        console.log('📊 Video count:', finalVideoData.length);
        setVideos(finalVideoData);
      } else {
        console.log('📊 No videos data, setting empty array');
        console.log('📊 Response structure:', response);
        setVideos([]);
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error);
      setError(error.message || 'Có lỗi xảy ra khi tải danh sách video');
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  // Review video (set to Active, Rejected, or Inactive)
  const handleReviewVideo = async (videoId, status) => {
    try {
      console.log('🎬 Reviewing video:', videoId, 'with status:', status);
      setReviewingVideo(videoId);
      
      let statusText = '';
      switch (status) {
        case 1:
          statusText = 'kích hoạt';
          break;
        case 2:
          statusText = 'từ chối';
          break;
        case 3:
          statusText = 'vô hiệu hóa';
          break;
        default:
          statusText = 'cập nhật';
      }
      
      await reviewTutorIntroductionVideo({ id: videoId, status });
      
      showSuccess(`Video đã được ${statusText} thành công!`);
      
      // Refresh the list
      console.log('🔄 Refreshing video list after review');
      fetchVideos();
    } catch (error) {
      console.error('Failed to review video:', error);
      showError(`Thất bại khi cập nhật video: ${error.message}`);
    } finally {
      setReviewingVideo(null);
    }
  };

  // Get status label with new status values
  const getStatusLabel = (status) => {
    console.log('🏷️ Getting status label for status:', status);
    switch (status) {
      case 0:
        return { text: 'Đang chờ duyệt', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      case 1:
        return { text: 'Đang hoạt động', color: 'bg-green-100 text-green-800 border-green-200' };
      case 2:
        return { text: 'Đã từ chối', color: 'bg-red-100 text-red-800 border-red-200' };
      case 3:
        return { text: 'Không hoạt động', color: 'bg-gray-100 text-gray-800 border-gray-200' };
      default:
        console.warn('⚠️ Unknown status:', status);
        return { text: 'Không xác định', color: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  // Status options for filter
  const statusOptions = [
    { value: null, label: 'Tất cả trạng thái' },
    { value: 0, label: 'Đang chờ duyệt' },
    { value: 1, label: 'Đang hoạt động' },
    { value: 2, label: 'Đã từ chối' },
    { value: 3, label: 'Không hoạt động' }
  ];

  // Debug logging for status options
  console.log('🔍 Status options:', statusOptions);
  console.log('🔍 Current selected status:', selectedStatus);
  console.log('🔍 Component state - videos:', videos.length, 'loading:', loading, 'error:', error);

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url) => {
    if (!url) {
      console.log('🎥 No URL provided for YouTube video ID extraction');
      return null;
    }
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    console.log('🎥 YouTube video ID extraction - URL:', url, 'Video ID:', videoId);
    return videoId;
  };

  // Get YouTube thumbnail
  const getYouTubeThumbnail = (url) => {
    const videoId = getYouTubeVideoId(url);
    const thumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
    console.log('🎥 YouTube thumbnail for URL:', url, 'Video ID:', videoId, 'Thumbnail:', thumbnail);
    return thumbnail;
  };

  // Fetch tutor information by ID
  const fetchTutorInfo = async (tutorId) => {
    if (tutorInfo[tutorId] || loadingTutors[tutorId]) {
      console.log('👥 Skipping tutor info fetch for ID:', tutorId, '- already loaded or loading');
      return; // Already loaded or loading
    }

    try {
      console.log('👥 Starting to fetch tutor info for ID:', tutorId);
      setLoadingTutors(prev => ({ ...prev, [tutorId]: true }));
      const tutorData = await fetchTutorById(tutorId);
      console.log('👥 Tutor data received for ID:', tutorId, tutorData);
      setTutorInfo(prev => ({ ...prev, [tutorId]: tutorData }));
    } catch (error) {
      console.error(`Failed to fetch tutor info for ID ${tutorId}:`, error);
      setTutorInfo(prev => ({ ...prev, [tutorId]: null }));
    } finally {
      setLoadingTutors(prev => ({ ...prev, [tutorId]: false }));
    }
  };

  useEffect(() => {
    console.log('🔄 useEffect triggered - currentPage:', currentPage, 'selectedStatus:', selectedStatus);
    console.log('🔄 Component state - videos count:', videos.length, 'loading:', loading, 'error:', error);
    console.log('🔄 About to fetch videos...');
    fetchVideos();
  }, [currentPage, selectedStatus]);

  // Initial load effect
  useEffect(() => {
    console.log('🚀 Component mounted - initial load');
    console.log('🚀 Initial state - selectedStatus:', selectedStatus, 'currentPage:', currentPage);
    console.log('🚀 Status options available:', statusOptions.length);
    console.log('🚀 Status options:', statusOptions.map(opt => `${opt.value}: ${opt.label}`));
    console.log('🚀 About to trigger first fetch...');
    console.log('🚀 Component ready for use');
    console.log('🚀 ========================================');
    console.log('🚀 Filter should now work correctly for all statuses');
    console.log('🚀 API will receive status=all for "Tất cả trạng thái"');
    console.log('🚀 This should fix the issue where "Tất cả trạng thái" shows no data');
    console.log('🚀 ========================================');
    console.log('🚀 Ready to test the filter functionality');
    console.log('🚀 ========================================');
    console.log('🚀 END OF INITIAL LOAD LOGGING');
  }, []);

  // Fetch tutor info when videos are loaded
  useEffect(() => {
    console.log('👥 Fetching tutor info for', videos.length, 'videos');
    videos.forEach(video => {
      if (video.tutorUserId && !tutorInfo[video.tutorUserId] && !loadingTutors[video.tutorUserId]) {
        console.log('👥 Fetching tutor info for ID:', video.tutorUserId);
        fetchTutorInfo(video.tutorUserId);
      }
    });
  }, [videos]);

  if (loading && videos.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" style={{ width: '250px' }}></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: '200px' }}></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: '80px' }}></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: '60px' }}></div>
            </div>
          </div>
        </div>

        {/* Videos Table Skeleton */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Video', 'Thông tin gia sư', 'Trạng thái', 'Hành động'].map((header, index) => (
                    <th key={index} className="px-6 py-3 text-left">
                      <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: '100px' }}></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[1, 2, 3].map((index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="h-16 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
                        <div>
                          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" style={{ width: '150px' }}></div>
                          <div className="h-3 bg-gray-200 rounded animate-pulse" style={{ width: '100px' }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
                        <div>
                          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" style={{ width: '120px' }}></div>
                          <div className="h-3 bg-gray-200 rounded animate-pulse" style={{ width: '100px' }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-6 bg-gray-200 rounded-full animate-pulse" style={{ width: '80px' }}></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <div className="h-8 bg-gray-200 rounded animate-pulse" style={{ width: '60px' }}></div>
                        <div className="h-8 bg-gray-200 rounded animate-pulse" style={{ width: '60px' }}></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Lỗi khi tải dữ liệu</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
            <div className="mt-3">
              <button
                onClick={() => {
                  setError(null);
                  fetchVideos();
                }}
                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Quản lý Video Giới thiệu</h2>
            <p className="text-sm text-gray-500 mt-1">
              Duyệt và quản lý video giới thiệu của gia sư
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-500">Lọc theo trạng thái:</label>
              <select
                value={selectedStatus === null ? '' : selectedStatus}
                onChange={(e) => {
                  const newStatus = e.target.value === '' ? null : parseInt(e.target.value);
                  console.log('🔍 Filter changed from', selectedStatus, 'to', newStatus);
                  setSelectedStatus(newStatus);
                  // Reset to page 1 when filter changes
                  setCurrentPage(1);
                }}
                disabled={loading}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value === null ? '' : option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Tổng cộng:</span>
              <span className="text-sm font-medium text-gray-900">
                {loading ? '...' : `${videos.length} video`}
                {selectedStatus !== null && (
                  <span className="text-xs text-gray-400 ml-1">
                    (lọc theo {statusOptions.find(opt => opt.value === selectedStatus)?.label})
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Videos List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {videos.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có video nào</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedStatus === null 
                ? "Hiện tại không có video giới thiệu nào trong hệ thống."
                : `Không có video nào với trạng thái "${statusOptions.find(opt => opt.value === selectedStatus)?.label}"`
              }
            </p>
            {selectedStatus === null && (
              <p className="mt-1 text-xs text-gray-400">
                Thử chọn một trạng thái cụ thể để xem video theo trạng thái đó.
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Video
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thông tin gia sư
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {videos.map((video) => {
                  const statusInfo = getStatusLabel(video.status);
                  const thumbnail = getYouTubeThumbnail(video.url);
                  
                  return (
                    <tr key={video.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          {thumbnail ? (
                            <div className="flex-shrink-0 h-16 w-24">
                              <img
                                className="h-16 w-24 object-cover rounded-lg"
                                src={thumbnail}
                                alt="Video thumbnail"
                              />
                            </div>
                          ) : (
                            <div className="flex-shrink-0 h-16 w-24 bg-gray-200 rounded-lg flex items-center justify-center">
                              <svg className="h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                              </svg>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <div className="flex-shrink-0 w-5 h-5 text-red-500">
                                <svg fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                </svg>
                              </div>
                              <a
                                href={video.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-blue-600 hover:text-blue-800 truncate"
                              >
                                {video.url}
                              </a>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              ID: {video.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          {loadingTutors[video.tutorUserId] ? (
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
                              <div>
                                <div className="h-4 bg-gray-200 rounded animate-pulse mb-1" style={{ width: '100px' }}></div>
                                <div className="h-3 bg-gray-200 rounded animate-pulse" style={{ width: '120px' }}></div>
                              </div>
                            </div>
                          ) : tutorInfo[video.tutorUserId] ? (
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={
                                    tutorInfo[video.tutorUserId].profileImageUrl || 
                                    tutorInfo[video.tutorUserId].profilePictureUrl ||
                                    tutorInfo[video.tutorUserId].avatarUrl ||
                                    tutorInfo[video.tutorUserId].avatar ||
                                    tutorInfo[video.tutorUserId].imageUrl ||
                                    tutorInfo[video.tutorUserId].image ||
                                    "https://via.placeholder.com/40?text=?"
                                  }
                                  alt="Tutor avatar"
                                  onError={(e) => {
                                    e.target.src = "https://via.placeholder.com/40?text=?";
                                  }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {tutorInfo[video.tutorUserId].fullName || "Không có tên"}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {tutorInfo[video.tutorUserId].email || "Không có email"}
                                </p>
                                <p className="text-xs text-gray-400 truncate">
                                  ID: {video.tutorUserId}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Không tìm thấy thông tin</p>
                                <p className="text-xs text-gray-400">ID: {video.tutorUserId}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${statusInfo.color}`}>
                          {statusInfo.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {video.status === 0 && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleReviewVideo(video.id, 1)}
                              disabled={reviewingVideo === video.id}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {reviewingVideo === video.id ? (
                                <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <svg className="-ml-1 mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                              Kích hoạt
                            </button>
                            <button
                              onClick={() => handleReviewVideo(video.id, 2)}
                              disabled={reviewingVideo === video.id}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {reviewingVideo === video.id ? (
                                <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <svg className="-ml-1 mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              )}
                              Từ chối
                            </button>
                            <button
                              onClick={() => handleReviewVideo(video.id, 3)}
                              disabled={reviewingVideo === video.id}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {reviewingVideo === video.id ? (
                                <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <svg className="-ml-1 mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              )}
                              Vô hiệu hóa
                            </button>
                          </div>
                        )}
                        {video.status !== 0 && (
                          <div className="flex space-x-2">
                            {video.status === 2 && (
                              <button
                                onClick={() => handleReviewVideo(video.id, 1)}
                                disabled={reviewingVideo === video.id}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {reviewingVideo === video.id ? (
                                  <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                ) : (
                                  <svg className="-ml-1 mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                                Kích hoạt
                              </button>
                            )}
                            {video.status === 1 && (
                              <button
                                onClick={() => handleReviewVideo(video.id, 3)}
                                disabled={reviewingVideo === video.id}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {reviewingVideo === video.id ? (
                                  <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                ) : (
                                  <svg className="-ml-1 mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                )}
                                Vô hiệu hóa
                              </button>
                            )}
                            {video.status === 3 && (
                              <button
                                onClick={() => handleReviewVideo(video.id, 1)}
                                disabled={reviewingVideo === video.id}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {reviewingVideo === video.id ? (
                                  <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                ) : (
                                  <svg className="-ml-1 mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                                Kích hoạt
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {videos.length > 0 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || loading}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={videos.length < pageSize || loading}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Trang <span className="font-medium">{currentPage}</span>
                {selectedStatus !== null && (
                  <span className="text-xs text-gray-500 ml-1">
                    (lọc theo {statusOptions.find(opt => opt.value === selectedStatus)?.label})
                  </span>
                )}
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1 || loading}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Trước</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={videos.length < pageSize || loading}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Sau</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoManagement;
