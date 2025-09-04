import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { showSuccess, showError } from '../../utils/toastManager.js';
import 'react-toastify/dist/ReactToastify.css';
import { 
  getAllTutorBookingOffer, 
  deleteTutorBookingOfferByOfferId 
} from '../api/auth';
import formatPriceWithCommas from '../../utils/formatPriceWithCommas';
import { formatTutorDate } from '../../utils/formatTutorDate';
import { formatSlotDateTimeFromTimestampDirect, formatSlotTimeRangeFromSlotIndex, formatSlotDateFromTimestampDirect } from '../../utils/formatSlotTime';
import OfferDetailModal from './OfferDetailModal';
import OfferUpdateModal from './OfferUpdateModal';
import NoFocusOutLineButton from '../../utils/noFocusOutlineButton';


const OfferManagement = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [offerToUpdate, setOfferToUpdate] = useState(null);
  const [expandedOffers, setExpandedOffers] = useState(new Set());


  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await getAllTutorBookingOffer();
      if (response && response.data) {
        setOffers(response.data);
        // Bỏ toast thông báo thành công khi tải danh sách
      } else {
        setOffers([]);
      }
    } catch (err) {
      setError('Không thể tải danh sách offers');
      console.error('Error fetching offers:', err);
      
      // Hiển thị toast thông báo lỗi
      showError('Không thể tải danh sách yêu cầu. Vui lòng thử lại.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOffer = (offer) => {
    setOfferToDelete(offer);
    setShowDeleteModal(true);
  };

  const handleViewDetail = (offer) => {
    setSelectedOffer(offer);
    setShowDetailModal(true);
  };

  const handleUpdateOffer = (offer) => {
    setOfferToUpdate(offer);
    setShowUpdateModal(true);
  };

  const toggleOfferExpansion = (offerId) => {
    setExpandedOffers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(offerId)) {
        newSet.delete(offerId);
      } else {
        newSet.add(offerId);
      }
      return newSet;
    });
  };



  const confirmDeleteOffer = async () => {
    try {
      await deleteTutorBookingOfferByOfferId(offerToDelete.id);
      
      // Cập nhật state ngay lập tức
      setOffers(prevOffers => prevOffers.filter(offer => offer.id !== offerToDelete.id));
      setShowDeleteModal(false);
      setOfferToDelete(null);
      
      // Hiển thị toast thông báo thành công
      showSuccess('Xóa yêu cầu thành công!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
      });
    } catch (err) {
      console.error('Error deleting offer:', err);
      
      // Hiển thị toast thông báo lỗi
      showError('Không thể xóa yêu cầu. Vui lòng thử lại.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
      });
    }
  };





  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded animate-pulse" style={{ width: '200px' }}></div>
          <div className="h-6 bg-gray-200 rounded animate-pulse" style={{ width: '150px' }}></div>
        </div>
        
        <div className="grid gap-6">
          {[1, 2, 3].map((index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
                  <div>
                    <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" style={{ width: '180px' }}></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: '120px' }}></div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-8 bg-gray-200 rounded animate-pulse" style={{ width: '60px' }}></div>
                  <div className="h-8 bg-gray-200 rounded animate-pulse" style={{ width: '50px' }}></div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="h-5 bg-gray-200 rounded animate-pulse mb-3" style={{ width: '140px' }}></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: '200px' }}></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: '180px' }}></div>
                  </div>
                </div>
                <div>
                  <div className="h-5 bg-gray-200 rounded animate-pulse mb-3" style={{ width: '120px' }}></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: '160px' }}></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: '140px' }}></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => {
            setError(null);
            fetchOffers();
          }}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Quản lý đề xuất đến học viên</h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            {offers.length} yêu cầu đến học viên
          </div>
        </div>
      </div>

      {offers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có yêu cầu đến học viên nào</h3>
          <p className="text-gray-500">Bạn chưa tạo yêu cầu nào cho học viên</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {offers.map((offer) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex justify-between items-start mb-4">
                                 <div className="flex items-center space-x-3">
                   <div className="flex-shrink-0">
                     {offer.learner?.profilePictureUrl ? (
                       <img
                         src={offer.learner.profilePictureUrl}
                         alt={`Avatar của ${offer.learner.fullName}`}
                         className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                       />
                     ) : (
                       <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                         <span className="text-gray-600 text-sm font-medium">
                           {offer.learner?.fullName ? offer.learner.fullName.charAt(0).toUpperCase() : 'H'}
                         </span>
                       </div>
                     )}
                   </div>
                   <div>
                     <h3 className="text-lg font-semibold text-gray-900">
                       Yêu cầu đến {offer.learner?.fullName || 'Học viên'}
                     </h3>
                    <p className="text-sm text-gray-600">
                      Tạo lúc: {formatTutorDate(offer.createdAt)}
                    </p>
                  </div>
                </div>
                                 <div className="flex space-x-2">
                   <button
                     onClick={() => handleViewDetail(offer)}
                     className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                   >
                     Chi tiết
                   </button>
                   {!offer.isExpired && (
                     <button
                       onClick={() => handleUpdateOffer(offer)}
                       className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                     >
                       Cập nhật
                     </button>
                   )}
                   <button
                     onClick={() => handleDeleteOffer(offer)}
                     className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                   >
                     Xóa
                   </button>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div>
                   <h4 className="font-medium text-gray-900 mb-2">Thông tin học viên</h4>
                   <div className="space-y-1 text-sm">
                     <p className="text-gray-600"><span className="font-medium text-gray-900">Tên:</span> {offer.learner?.fullName || 'N/A'}</p>
                   </div>
                 </div>

                 <div>
                   <h4 className="font-medium text-gray-900 mb-2">Thông tin bài học</h4>
                   <div className="space-y-1 text-sm">
                     <p className="text-gray-600"><span className="font-medium text-gray-900">Tên bài học:</span> {offer.lessonName}</p>
                   </div>
                 </div>
              </div>

              <div className="mt-4">
                <h4 className="font-medium text-gray-900 mb-2">Thời gian đề xuất</h4>
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2"
                  layout
                >
                  {offer.offeredSlots && offer.offeredSlots.slice(0, expandedOffers.has(offer.id) ? offer.offeredSlots.length : 3).map((slot, index) => (
                    <motion.div 
                      key={`${offer.id}-${slot.slotDateTime}-${slot.slotIndex}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ 
                        duration: 0.3, 
                        delay: index * 0.05,
                        ease: "easeOut"
                      }}
                      className="bg-gray-50 p-3 rounded-md"
                    >
                      <p className="text-sm font-medium text-black">
                        {formatSlotDateFromTimestampDirect(slot.slotDateTime)}
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatSlotTimeRangeFromSlotIndex(slot.slotIndex)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Slot {slot.slotIndex}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>
                {offer.offeredSlots && offer.offeredSlots.length > 3 && (
                  <motion.div 
                    className="mt-3 flex justify-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <NoFocusOutLineButton
                      onClick={() => toggleOfferExpansion(offer.id)}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                    >
                      <span>
                        {expandedOffers.has(offer.id) ? 'Thu gọn' : `Xem thêm ${offer.offeredSlots.length - 3} slot khác`}
                      </span>
                      <motion.svg
                        animate={{ rotate: expandedOffers.has(offer.id) ? 180 : 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </motion.svg>
                    </NoFocusOutLineButton>
                  </motion.div>
                )}
              </div>

                              <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Trạng thái: 
                      <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                        offer.isExpired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {offer.isExpired ? 'Hết hạn' : 'Còn hiệu lực'}
                      </span>
                    </div>
                    <div className="text-lg font-semibold text-green-600">
                      {formatPriceWithCommas(offer.totalPrice)} VNĐ
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium text-gray-900">Giá mỗi slot:</span> {formatPriceWithCommas(offer.pricePerSlot)} VNĐ
                    <span className="mx-2">•</span>
                    <span className="font-medium text-gray-900">Thời lượng:</span> {offer.durationInMinutes} phút
                  </div>
                </div>
            </motion.div>
          ))}
        </div>
      )}

             {/* Delete Confirmation Modal */}
      {showDeleteModal && offerToDelete && (
        <DeleteConfirmModal
          offer={offerToDelete}
          onClose={() => {
            setShowDeleteModal(false);
            setOfferToDelete(null);
          }}
          onConfirm={confirmDeleteOffer}
        />
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedOffer && (
        <OfferDetailModal
          offer={selectedOffer}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedOffer(null);
          }}
        />
      )}

      {/* Update Modal */}
      {showUpdateModal && offerToUpdate && (
        <OfferUpdateModal
          offer={offerToUpdate}
          open={showUpdateModal}
          onClose={() => {
            setShowUpdateModal(false);
            setOfferToUpdate(null);
          }}
          onUpdateSuccess={() => {
            // Refresh the offers list after successful update
            fetchOffers();
          }}
        />
      )}


    </div>
  );
};



// Delete Confirmation Modal Component
const DeleteConfirmModal = ({ offer, onClose, onConfirm }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-md mx-auto relative">
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

        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-black text-xl font-semibold mb-4">
            Xác nhận xóa Offer
          </h3>
          <p className="text-gray-600 mb-6 text-sm">
            Bạn có chắc chắn muốn xóa offer đến<span className="font-medium">{offer.learner?.fullName || 'Học viên'}</span>? 
            <br />
            Hành động này không thể hoàn tác.
          </p>
          
          <div className="flex justify-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200"
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              onClick={handleConfirm}
              className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div role="status" className="flex items-center justify-center">
                    <svg
                      aria-hidden="true"
                      className="w-4 h-4 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-white"
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
                    <span className="sr-only">Đang xóa...</span>
                  </div>
                  Đang xóa...
                </div>
              ) : (
                "Xóa"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferManagement;
