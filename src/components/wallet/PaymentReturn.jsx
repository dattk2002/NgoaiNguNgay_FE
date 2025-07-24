import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const PaymentReturn = ({ onReturn }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Đang xử lý kết quả thanh toán...');
  const [paymentDetails, setPaymentDetails] = useState({});

  useEffect(() => {
    const paymentStatus = searchParams.get('status');
    const orderCode = searchParams.get('orderCode');
    const code = searchParams.get('code');
    const id = searchParams.get('id');
    const cancel = searchParams.get('cancel');



    // Store payment details
    setPaymentDetails({
      status: paymentStatus,
      orderCode,
      code,
      id,
      cancel
    });

    if (cancel === 'true' || paymentStatus === 'CANCELLED') {
      setStatus('cancelled');
      setMessage('Bạn đã hủy giao dịch thanh toán');
    } else if (paymentStatus === 'PAID' && code === '00') {
      setStatus('success');
      setMessage('Thanh toán thành công! Số dư của bạn đã được cập nhật.');
      // Trigger wallet data refresh on success
      if (onReturn && typeof onReturn === 'function') {
        onReturn();
      }
    } else if (paymentStatus === 'PENDING') {
      setStatus('pending');
      setMessage('Giao dịch đang được xử lý. Vui lòng kiểm tra lại sau.');
    } else {
      setStatus('failed');
      setMessage('Giao dịch thất bại. Vui lòng thử lại.');
    }

    // Auto redirect after 3 seconds
    const timer = setTimeout(() => {
      navigate('/wallet');
    }, 3000);

    return () => clearTimeout(timer);
  }, [searchParams, navigate]);

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return '✅';
      case 'cancelled':
        return '⚠️';
      case 'failed':
        return '❌';
      case 'pending':
        return '⏳';
      default:
        return '🔄';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'cancelled':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'pending':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">

          
          <div className="text-6xl mb-4">{getStatusIcon()}</div>
          
          <div className={`p-4 rounded-xl border mb-6 ${getStatusColor()}`}>
            <h2 className="text-xl font-bold mb-2">
              {status === 'success' && 'Thanh toán thành công!'}
              {status === 'cancelled' && 'Giao dịch đã hủy'}
              {status === 'failed' && 'Giao dịch thất bại'}
              {status === 'pending' && 'Đang xử lý...'}
              {status === 'processing' && 'Đang xử lý...'}
            </h2>
            <p className="text-sm mb-3">{message}</p>
            
            {/* Payment Details */}
            {paymentDetails.orderCode && (
              <div className="text-xs opacity-75 border-t pt-2">
                <p>Mã đơn hàng: <span className="font-mono">{paymentDetails.orderCode}</span></p>
                {paymentDetails.code && (
                  <p>Mã kết quả: <span className="font-mono">{paymentDetails.code}</span></p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/wallet')}
              className="w-full py-3 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-all outline-none"
            >
              Quay về Ví điện tử
            </button>
            
            {status === 'failed' && (
              <button
                onClick={() => navigate('/wallet?tab=deposit')}
                className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all outline-none"
              >
                Thử lại
              </button>
            )}
          </div>

          <div className="mt-6 text-xs text-gray-500">
            Tự động chuyển hướng sau 3 giây...
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentReturn; 