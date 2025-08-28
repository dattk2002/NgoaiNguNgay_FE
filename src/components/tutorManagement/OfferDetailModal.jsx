import React from "react";
import formatPriceWithCommas from "../../utils/formatPriceWithCommas";
import { formatTutorDate } from "../../utils/formatTutorDate";
import {
  formatSlotDateTimeFromTimestampDirect,
  formatSlotTimeRangeFromSlotIndex,
  formatSlotDateFromTimestampDirect,
} from "../../utils/formatSlotTime";

const OfferDetailModal = ({ offer, onClose }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "EXPIRED":
        return "bg-red-100 text-red-800";
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (isExpired) => {
    return isExpired ? "Hết hạn" : "Còn hiệu lực";
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-auto relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
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
        </button>

        <div className="mb-6">
          <h3 className="text-black text-xl font-semibold text-center mb-2">
            Chi tiết Offer
          </h3>
          <p className="text-gray-600 text-center text-sm">
            Offer đến {offer.learner?.fullName || "Học viên"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Thông tin cơ bản */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">
                Thông tin cơ bản
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-900">Trạng thái:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                      offer.isExpired ? "EXPIRED" : "ACTIVE"
                    )}`}
                  >
                    {getStatusText(offer.isExpired)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-900">Ngày tạo:</span>
                  <span className="text-gray-600">
                    {formatTutorDate(offer.createdAt)}
                  </span>
                </div>
                {offer.updatedAt && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">
                      Cập nhật lúc:
                    </span>
                    <span className="text-gray-600">
                      {formatTutorDate(offer.updatedAt)}
                    </span>
                  </div>
                )}
                {offer.expirationTime && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">
                      Hết hạn lúc:
                    </span>
                    <span className="text-gray-600">
                      {formatTutorDate(offer.expirationTime)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Thông tin học viên */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">
                Thông tin học viên
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-900">Tên:</span>
                  <span className="text-gray-600">
                    {offer.learner?.fullName}
                  </span>
                </div>
              </div>
            </div>

            {/* Thông tin bài học */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">
                Thông tin bài học
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-900">
                    Tên bài học:
                  </span>
                  <span className="text-gray-600">{offer.lessonName}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Thông tin thời gian và giá */}
          <div className="space-y-4">
            {/* Thời gian đề xuất */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">
                Thời gian đề xuất
              </h4>
              <div className="space-y-2">
                {offer.offeredSlots && offer.offeredSlots.length > 0 ? (
                  offer.offeredSlots.map((slot, index) => (
                    <div
                      key={index}
                      className="bg-white p-3 rounded-md border border-purple-200"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="font-medium text-sm text-gray-900">
                            {formatSlotTimeRangeFromSlotIndex(slot.slotIndex)}
                          </span>
                          <span className="text-xs text-gray-600">
                            {formatSlotDateFromTimestampDirect(slot.slotDateTime)}
                          </span>
                        </div>
                        <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
                          Slot {slot.slotIndex}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">
                    Không có thời gian đề xuất
                  </p>
                )}
              </div>
            </div>

            {/* Thông tin giá */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">
                Thông tin giá
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-900">Tổng giá:</span>
                  <span className="text-lg font-semibold text-green-600">
                    {formatPriceWithCommas(offer.totalPrice)} VNĐ
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-900">
                    Giá mỗi slot:
                  </span>
                  <span className="text-gray-600">
                    {formatPriceWithCommas(offer.pricePerSlot)} VNĐ
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-900">Thời lượng:</span>
                  <span className="text-gray-600">
                    {offer.durationInMinutes} phút
                  </span>
                </div>
              </div>
            </div>

            {/* Ghi chú */}
            {offer.notes && (
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Ghi chú</h4>
                <p className="text-sm text-gray-700">{offer.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferDetailModal;
