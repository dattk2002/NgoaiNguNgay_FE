import React from 'react';

const ReviewsSection = ({ teacher }) => {
  return (
    <div className="mt-10">
      <h2 className="text-2xl font-semibold text-gray-800">
        Đánh giá ({teacher.reviews ? teacher.reviews.length : 0})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {teacher.reviews && teacher.reviews.length > 0 ? (
          teacher.reviews.map((review, index) => (
            <div
              key={index}
              className="relative bg-gray-50 p-4 rounded-lg shadow-sm flex items-start gap-4 hover:shadow-md transition"
            >
              {/* Teacher's pick label in the top-right corner of the review box */}
              {review.isTeacherPick && (
                <span className="absolute top-0 right-0 bg-teal-500 text-white text-xs font-medium px-2 py-1 rounded-bl-lg">
                  Lựa chọn của giáo viên
                </span>
              )}
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {review.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-800">{review.name}</p>
                  <span className="text-gray-500 text-sm">
                    {review.lessons} buổi học tiếng Anh
                  </span>
                </div>
                <p className="mt-2 text-gray-700 text-sm">{review.comment}</p>
                <p className="text-gray-500 text-xs mt-1">{review.date}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Chưa có đánh giá nào.</p>
        )}
      </div>
      {teacher.reviews && teacher.reviews.length > 2 && (
        <button className="mt-6 text-blue-600 hover:underline text-sm">
          Hiển thị thêm
        </button>
      )}
    </div>
  );
};

export default ReviewsSection;