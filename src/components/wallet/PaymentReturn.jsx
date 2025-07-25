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
      setMessage('Cảm ơn bạn! Giao dịch nạp tiền đã được xử lý thành công.');
      // Trigger wallet data refresh on success
      if (onReturn && typeof onReturn === 'function') {
        onReturn();
      }
    } else if (paymentStatus === 'PENDING') {
      setStatus('pending');
      setMessage('Giao dịch đang được xử lý. Vui lòng kiểm tra lại sau.');
    } else {
      setStatus('failed');
      setMessage('Giao dịch thất bại. Vui lòng liên hệ hỗ trợ nếu cần thiết.');
    }
  }, [searchParams, navigate]);

  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          icon: '✓',
          title: 'Thanh toán thành công!',
          titleColor: 'text-green-600',
          iconBg: 'bg-green-500'
        };
      case 'cancelled':
        return {
          icon: '⚠',
          title: 'Giao dịch đã hủy',
          titleColor: 'text-yellow-600', 
          iconBg: 'bg-yellow-500'
        };
      case 'failed':
        return {
          icon: '✕',
          title: 'Giao dịch thất bại',
          titleColor: 'text-red-600',
          iconBg: 'bg-red-500'
        };
      case 'pending':
        return {
          icon: '⏳',
          title: 'Đang xử lý...',
          titleColor: 'text-blue-600',
          iconBg: 'bg-blue-500'
        };
      default:
        return {
          icon: '⟳',
          title: 'Đang xử lý...',
          titleColor: 'text-gray-600',
          iconBg: 'bg-gray-500'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="min-h-[68vh] w-full bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          
          {/* Header Section */}
          <div className="text-center pt-12 pb-8 px-8">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${config.iconBg} mb-6`}>
              <span className="text-3xl text-white font-bold">{config.icon}</span>
            </div>
            
            <h1 className={`text-3xl font-bold mb-4 ${config.titleColor}`}>
              {config.title}
            </h1>
            
            <p className="text-lg text-gray-700 leading-relaxed">
              {message}
            </p>

            {/* Order and Transaction Info */}
            {paymentDetails.orderCode && (
              <div className="mt-6 text-sm text-gray-600">
                <p>
                  Mã đơn hàng: <span className="font-mono font-semibold">{paymentDetails.orderCode}</span>
                </p>
              </div>
            )}
          </div>

          {/* Payment Details Section */}
          {status === 'success' && (
            <div className="px-8 pb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                Chi tiết thanh toán
              </h3>
              
              <div className="bg-gray-50 rounded-xl p-6 border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <p className="text-sm text-gray-600 mb-1">Tổng số tiền</p>
                    <p className="text-lg font-semibold text-gray-800">Đang cập nhật</p>
                  </div>
                  
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <p className="text-sm text-gray-600 mb-1">Phương thức</p>
                    <p className="text-lg font-semibold text-gray-800">Chuyển khoản ngân hàng</p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-800 text-center">
                  Vui lòng đợi một thời gian để số tiền được cập nhật vào tài khoản ví của bạn.
                </p>
              </div>
            </div>
          )}

          {/* Contact Info for Failed Transactions */}
          {status === 'failed' && (
            <div className="px-8 pb-8">
              <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                <p className="text-sm text-red-800 text-center">
                  Vui lòng liên hệ hỗ trợ kỹ thuật hoặc email tới support@ngoainguday.com để được trợ giúp.
                </p>
              </div>
            </div>
          )}

          {/* OK Button */}
          <div className="px-8 pb-8">
            <button
              onClick={() => navigate('/wallet')}
              className="w-full py-4 text-white rounded-xl font-semibold text-lg transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-gray-300 shadow-lg"
              style={{ backgroundColor: '#666666' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#555555'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#666666'}
            >
              Quay về Ví điện tử
            </button>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-8 py-4 bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              🔒 Giao dịch được bảo mật bởi hệ thống thanh toán an toàn
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentReturn; 