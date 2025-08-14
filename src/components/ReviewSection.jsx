import React from 'react';
import { FaStar } from 'react-icons/fa';

const ReviewsSection = ({ teacher, tutorReviews = [] }) => {
  // Helper function to render star rating
  const renderStarRating = (rating) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            className={`w-3 h-3 ${
              i < Math.round(rating) ? "text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-xs text-gray-600 ml-1">({rating.toFixed(1)})</span>
      </div>
    );
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-semibold text-gray-800">
        Đánh giá ({tutorReviews.length})
      </h2>
      <div className="space-y-4 mt-4">
        {tutorReviews && tutorReviews.length > 0 ? (
          tutorReviews.map((review, index) => (
            <div
              key={review.id || index}
              className="relative bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden flex-shrink-0">
                  {review.profilePictureUrl ? (
                    <img 
                      src={review.profilePictureUrl} 
                      alt={review.learnerName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    review.learnerName?.charAt(0) || 'U'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-semibold text-gray-800">{review.learnerName}</p>
                    <span className="text-gray-500 text-xs">
                      {formatDate(review.createdTime)}
                    </span>
                  </div>
                  
                  {/* Rating breakdown */}
                  <div className="flex flex-wrap gap-4 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600">Chất lượng giảng dạy:</span>
                      {renderStarRating(review.teachingQuality)}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600">Thái độ:</span>
                      {renderStarRating(review.attitude)}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600">Cam kết:</span>
                      {renderStarRating(review.commitment)}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 text-sm">{review.comment}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Chưa có đánh giá nào.</p>
        )}
      </div>
      {tutorReviews && tutorReviews.length > 2 && (
        <button className="mt-6 text-blue-600 hover:underline text-sm">
          Hiển thị thêm
        </button>
      )}
    </div>
  );
};

export default ReviewsSection;