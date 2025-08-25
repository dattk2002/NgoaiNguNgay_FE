import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
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
  const [reviewingVideo, setReviewingVideo] = useState(null);
  const [tutorInfo, setTutorInfo] = useState({});
  const [loadingTutors, setLoadingTutors] = useState({});

  // Fetch pending videos
  const fetchPendingVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPendingTutorIntroductionVideos(currentPage, pageSize);
      
      if (response && response.data) {
        setVideos(response.data);
      } else {
        setVideos([]);
      }
    } catch (error) {
      console.error('Failed to fetch pending videos:', error);
      setError(error.message);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  // Review video (approve/reject)
  const handleReviewVideo = async (videoId, status) => {
    try {
      setReviewingVideo(videoId);
      
      const statusText = status === 1 ? 'approve' : 'reject';
      await reviewTutorIntroductionVideo({ id: videoId, status });
      
      toast.success(`Video ${statusText} thành công!`);
      
      // Refresh the list
      fetchPendingVideos();
    } catch (error) {
      console.error('Failed to review video:', error);
      toast.error(`Thất bại khi ${status === 1 ? 'approve' : 'reject'} video: ${error.message}`);
    } finally {
      setReviewingVideo(null);
    }
  };

  // Get status label
  const getStatusLabel = (status) => {
    switch (status) {
      case 0:
        return { text: 'Đang chờ duyệt', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      case 1:
        return { text: 'Đã duyệt', color: 'bg-green-100 text-green-800 border-green-200' };
      case 2:
        return { text: 'Đã từ chối', color: 'bg-red-100 text-red-800 border-red-200' };
      default:
        return { text: 'Không xác định', color: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Get YouTube thumbnail
  const getYouTubeThumbnail = (url) => {
    const videoId = getYouTubeVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
  };

  // Fetch tutor information by ID
  const fetchTutorInfo = async (tutorId) => {
    if (tutorInfo[tutorId] || loadingTutors[tutorId]) {
      return; // Already loaded or loading
    }

    try {
      setLoadingTutors(prev => ({ ...prev, [tutorId]: true }));
      const tutorData = await fetchTutorById(tutorId);
      setTutorInfo(prev => ({ ...prev, [tutorId]: tutorData }));
    } catch (error) {
      console.error(`Failed to fetch tutor info for ID ${tutorId}:`, error);
      setTutorInfo(prev => ({ ...prev, [tutorId]: null }));
    } finally {
      setLoadingTutors(prev => ({ ...prev, [tutorId]: false }));
    }
  };

  useEffect(() => {
    fetchPendingVideos();
  }, [currentPage]);

  // Fetch tutor info when videos are loaded
  useEffect(() => {
    videos.forEach(video => {
      if (video.tutorUserId && !tutorInfo[video.tutorUserId] && !loadingTutors[video.tutorUserId]) {
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
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Tổng cộng:</span>
            <span className="text-sm font-medium text-gray-900">{videos.length} video</span>
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
              Hiện tại không có video giới thiệu nào đang chờ duyệt.
            </p>
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
                              Duyệt
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
                          </div>
                        )}
                        {video.status !== 0 && (
                          <span className="text-gray-400 text-xs">
                            Đã xử lý
                          </span>
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
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={videos.length < pageSize}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Trang <span className="font-medium">{currentPage}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Trước</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={videos.length < pageSize}
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
