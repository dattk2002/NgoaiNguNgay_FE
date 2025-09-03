import React, { useEffect } from "react";
import { formatLanguageCode } from "../../utils/formatLanguageCode";
import formatPriceWithCommas from "../../utils/formatPriceWithCommas";

const LessonSelectionModal = ({ isOpen, onClose, lessons, onLessonSelect, tutorName }) => {
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

  const handleLessonSelect = (lesson) => {
    onLessonSelect(lesson);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-2xl w-full flex flex-col relative max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-center border-b px-6 py-4 relative">
          <span className="text-lg font-semibold text-gray-900 mx-auto">
            Chọn khóa học với {tutorName}
          </span>
          <button
            className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-6 py-6 flex-1">
          {lessons && lessons.length > 0 ? (
            <div className="space-y-4">
              {lessons.map((lesson, index) => (
                <div
                  key={lesson.id || index}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => handleLessonSelect(lesson)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-lg mb-2">
                        {lesson.name}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">Ngôn ngữ:</span>{" "}
                          {formatLanguageCode(lesson.languageCode)}
                        </p>
                        {lesson.completedCount && (
                          <p>
                            <span className="font-medium">Buổi học:</span>{" "}
                            {lesson.completedCount} buổi đã hoàn thành
                          </p>
                        )}
                        {lesson.description && (
                          <p className="text-gray-500 mt-2 line-clamp-2">
                            {lesson.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end ml-4">
                      <span className="text-red-500 font-bold text-lg">
                        {typeof lesson.price === "number" ||
                        typeof lesson.price === "string"
                          ? formatPriceWithCommas(lesson.price)
                          : "Không có"}{" "}
                        VND
                      </span>
                      {lesson.discount && (
                        <span className="text-xs text-green-600 mt-1 font-medium">
                          Giảm {lesson.discount}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Không có khóa học nào khả dụng.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
            >
              Hủy
            </button>
            <p className="text-sm text-gray-500">
              Chọn một khóa học để tiếp tục đặt lịch
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonSelectionModal;
