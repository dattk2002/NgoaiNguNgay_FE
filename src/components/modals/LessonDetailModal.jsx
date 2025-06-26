import React, { useEffect } from "react";
import { FaVolumeUp } from "react-icons/fa"; // Example icon, adjust as needed
import { formatLanguageCode } from "../../utils/formatLanguageCode";

const LessonDetailModal = ({ isOpen, onClose, lesson, loading, error }) => {
  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Example: fallback for missing lesson fields
  const lessonTags = lesson?.tags || ["Phát âm", "Ngữ pháp", "Nghe hiểu"];

  // Use actual lesson price and duration if available, otherwise fallback
  const priceOptions =
    lesson && lesson.price && lesson.durationInMinutes
      ? [{ duration: lesson.durationInMinutes, price: lesson.price }]
      : [
          { duration: 30, price: 100000.41 },
          { duration: 45, price: 150000.86 },
          { duration: 60, price: 200000.95 },
        ];

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-xl w-full flex flex-col relative max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-center border-b px-6 py-4 relative">
          <span className="text-lg font-semibold text-gray-900 mx-auto">
            Chi tiết bài học
          </span>
          <button
            className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-8 py-6 flex-1">
          {loading ? (
            <div className="space-y-6 animate-pulse">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-200 rounded-full" />
                <div className="h-6 bg-gray-200 rounded w-2/3" />
                <div className="w-6 h-6 bg-gray-200 rounded" />
              </div>
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="flex gap-2 mt-2">
                <div className="h-8 w-24 bg-gray-200 rounded-full" />
                <div className="h-8 w-24 bg-gray-200 rounded-full" />
                <div className="h-8 w-24 bg-gray-200 rounded-full" />
              </div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mt-4" />
              <div className="h-20 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mt-4" />
              <div className="flex gap-4 mt-4">
                <div className="h-16 w-24 bg-gray-200 rounded-lg" />
                <div className="h-16 w-24 bg-gray-200 rounded-lg" />
                <div className="h-16 w-24 bg-gray-200 rounded-lg" />
              </div>
            </div>
          ) : error ? (
            <div className="text-center text-black py-8">{error}</div>
          ) : lesson ? (
            <>
              {/* Title row */}
              <div className="flex items-center gap-2 mb-2">
                <span className="ml-2">📝</span>
                <h2 className="text-xl font-bold text-gray-900">
                  {lesson.name}
                </h2>
              </div>
              {/* <div className="text-gray-400 text-sm mb-4">{lesson.lessonsTaught} Lessons taught</div> */}

              {/* Language */}
              <div className="text-xs text-gray-400 font-semibold mb-1">
                NGÔN NGỮ
              </div>
              <div className="mb-3 text-gray-900">
                {formatLanguageCode(lesson.languageCode) || "Tiếng Anh"}
              </div>

              {/* Level */}
              <div className="text-xs text-gray-400 font-semibold mb-1">
                TRÌNH ĐỘ
              </div>
              <div className="mb-3 text-gray-900">
                {lesson.levels?.join(" - ") ||
                  lesson.prerequisites ||
                  "N/A"}
              </div>

              {/* Category */}
              <div className="text-xs text-gray-400 font-semibold mb-1">
                DANH MỤC
              </div>
              <div className="mb-3 text-gray-900">
                {lesson.category || "Kiến thức ngôn ngữ cơ bản"}
              </div>

              {/* Tags */}
              <div className="flex gap-2 mb-4">
                {lessonTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="border border-gray-400 rounded-full px-4 py-1 text-sm text-gray-900"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Description */}
              <div className="text-xs text-gray-400 font-semibold mb-1">
                MÔ TẢ
              </div>
              <div className="mb-4 text-gray-900">{lesson.description}</div>

              {/* Note */}
              {lesson.note && (
                <div className="mb-4 text-gray-900">
                  <span className="text-xs text-gray-400 font-semibold block mb-1">
                    GHI CHÚ
                  </span>
                  {lesson.note}
                </div>
              )}

              {/* Discount */}
              {lesson.discount && (
                <div className="mb-4 text-green-600 flex items-center gap-1">
                  <span>💲</span>
                  <span>
                    Có {lesson.discount}% GIẢM GIÁ khi mua gói 5 buổi học.
                  </span>
                  <span>💲</span>
                </div>
              )}

              {/* Price */}
              <div className="text-xs text-gray-400 font-semibold mb-1">
                GIÁ
              </div>
              <div className="flex gap-4 mb-4">
                {priceOptions.map((opt, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center border border-[#9e9e9e] rounded-lg px-4 py-2 min-w-[90px]"
                  >
                    <span className="text-base font-semibold text-gray-900">
                      {opt.duration} phút
                    </span>
                    <span className="text-sm text-red-400 font-bold mt-1">
                      VND{" "}
                      {opt.price.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center text-gray-500 text-sm mt-2">
                <FaVolumeUp className="mr-2" />
                Một số giáo viên có thể cho nghỉ giải lao 5 phút trong thời gian học
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="border-t px-8 py-4 bg-white sticky bottom-0 left-0 w-full">
          <button
            className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition"
            onClick={() => alert("Đặt lịch ngay!")}
          >
            Đặt lịch ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonDetailModal;
