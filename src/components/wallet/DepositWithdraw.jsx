import React, { useState } from 'react';
import { createDepositRequest } from '../api/auth';
import { toast } from 'react-toastify';

const DepositWithdraw = ({ onBalanceUpdate, currentBalance }) => {
  const [activeTab, setActiveTab] = useState('deposit');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [depositId, setDepositId] = useState('');
  
  // Withdraw specific states
  const [bankAccount, setBankAccount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountHolder, setAccountHolder] = useState('');

  const quickAmounts = [50000, 100000, 200000, 500000, 1000000, 2000000];
  const withdrawAmounts = [50000, 100000, 200000, 500000, 1000000];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleAmountChange = (value) => {
    setAmount(value.toString());
  };

  const handleDeposit = async () => {
    if (!amount || parseInt(amount) <= 0) {
      toast.error('Vui lòng nhập số tiền hợp lệ');
      return;
    }

    if (parseInt(amount) < 10000) {
      toast.error('Số tiền nạp tối thiểu là 10,000 VND');
      return;
    }

    setLoading(true);
    
    try {
      const response = await createDepositRequest(parseInt(amount));
      
      if (response && response.payment && response.payment.orderUrl) {
        // Lưu thông tin để tracking
        setDepositId(response.deposit.id);
        setPaymentUrl(response.payment.orderUrl);
        
        // Redirect đến trang thanh toán PayOS
        window.location.href = response.payment.orderUrl;
      } else {
        throw new Error('Không nhận được link thanh toán');
      }
    } catch (error) {
      console.error('Deposit failed:', error);
      toast.error(`Lỗi tạo yêu cầu nạp tiền: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || parseInt(amount) <= 0) {
      toast.error('Vui lòng nhập số tiền hợp lệ');
      return;
    }

    if (parseInt(amount) < 50000) {
      toast.error('Số tiền rút tối thiểu là 50,000 VND');
      return;
    }

    if (parseInt(amount) > currentBalance) {
      toast.error('Số dư không đủ để thực hiện giao dịch');
      return;
    }

    if (!bankAccount || !bankName || !accountHolder) {
      toast.error('Vui lòng điền đầy đủ thông tin tài khoản ngân hàng');
      return;
    }

    setLoading(true);
    
    try {
      // TODO: Implement withdraw API call
      console.log('Withdraw request:', {
        amount: parseInt(amount),
        bankAccount,
        bankName,
        accountHolder
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Yêu cầu rút tiền đã được gửi thành công! Chúng tôi sẽ xử lý trong vòng 24 giờ.');
      
      // Reset form
      setAmount('');
      setBankAccount('');
      setBankName('');
      setAccountHolder('');
      
      // Trigger balance update
      if (onBalanceUpdate) {
        onBalanceUpdate();
      }
    } catch (error) {
      console.error('Withdraw failed:', error);
      toast.error(`Lỗi tạo yêu cầu rút tiền: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">💰 Nạp/Rút tiền</h2>
        <p className="text-gray-600">Quản lý số dư ví điện tử của bạn</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => {
            setActiveTab('deposit');
            setAmount('');
          }}
          className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 outline-none ${
            activeTab === 'deposit'
              ? 'bg-gray-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          ⬇️ Nạp tiền
        </button>
        <button
          onClick={() => {
            setActiveTab('withdraw');
            setAmount('');
          }}
          className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 outline-none ${
            activeTab === 'withdraw'
              ? 'bg-gray-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          ⬆️ Rút tiền
        </button>
      </div>

      <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
        {/* Current Balance Display */}
        <div className="mb-8 p-6 bg-gradient-to-r from-gray-600 to-gray-700 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium opacity-90 mb-1">💳 Số dư hiện tại</h3>
              <div className="text-2xl font-bold">{formatCurrency(currentBalance)}</div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-75">
                {activeTab === 'deposit' ? 'Sau khi nạp' : 'Sau khi rút'}
              </div>
              <div className="text-xl font-semibold">
                {amount ? (
                  activeTab === 'deposit' 
                    ? formatCurrency(currentBalance + parseInt(amount))
                    : formatCurrency(Math.max(0, currentBalance - parseInt(amount)))
                ) : formatCurrency(currentBalance)}
              </div>
            </div>
          </div>
        </div>

        {/* Deposit Tab Content */}
        {activeTab === 'deposit' && (
          <>
            {/* Amount Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Chọn số tiền nạp
              </label>
              
              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {quickAmounts.map((quickAmount) => (
                  <button
                    key={quickAmount}
                    onClick={() => handleAmountChange(quickAmount)}
                    className={`p-4 rounded-xl border-2 font-medium transition-all duration-200 hover:shadow-sm outline-none ${
                      amount == quickAmount
                        ? 'bg-gray-600 text-white border-gray-600'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {formatCurrency(quickAmount)}
                  </button>
                ))}
              </div>

              {/* Custom Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hoặc nhập số tiền khác
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Nhập số tiền (tối thiểu 10,000 VND)"
                  min="10000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-gray-800 text-lg transition-all outline-none"
                />
                {amount && (
                  <p className="mt-2 text-sm text-gray-600">
                    Số tiền nạp: <span className="font-medium text-gray-800">{formatCurrency(parseInt(amount) || 0)}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Payment Method Info */}
            <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="text-2xl">💳</div>
                <div>
                  <h4 className="font-medium text-blue-800 mb-2">Phương thức thanh toán</h4>
                  <div className="text-blue-700 text-sm space-y-1">
                    <p>• PayOS - Cổng thanh toán an toàn</p>
                    <p>• Hỗ trợ QR Code, thẻ ATM, Internet Banking</p>
                    <p>• Giao dịch được mã hóa và bảo mật cao</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleDeposit}
              disabled={!amount || parseInt(amount) < 10000 || loading}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 outline-none ${
                !amount || parseInt(amount) < 10000 || loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-600 text-white hover:bg-gray-700 hover:shadow-lg'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Đang tạo giao dịch...
                </span>
              ) : (
                'Nạp tiền ngay'
              )}
            </button>

            {/* Transaction Info */}
            <div className="mt-8 p-6 bg-amber-50 rounded-xl border border-amber-200">
              <div className="text-amber-800">
                <div className="font-medium mb-3 flex items-center gap-2">
                  <span className="text-lg">⚠️</span>
                  Thông tin quan trọng
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Số tiền nạp tối thiểu: 10,000 VND</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Giao dịch sẽ được xử lý ngay sau khi thanh toán thành công</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Bạn sẽ được chuyển đến cổng thanh toán PayOS để hoàn tất giao dịch</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Không thoát trình duyệt trong quá trình thanh toán</span>
                  </li>
                </ul>
              </div>
            </div>
          </>
        )}

        {/* Withdraw Tab Content */}
        {activeTab === 'withdraw' && (
          <>
            {/* Amount Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Chọn số tiền rút
              </label>
              
              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {withdrawAmounts.map((quickAmount) => (
                  <button
                    key={quickAmount}
                    onClick={() => handleAmountChange(quickAmount)}
                    disabled={quickAmount > currentBalance}
                    className={`p-4 rounded-xl border-2 font-medium transition-all duration-200 hover:shadow-sm outline-none ${
                      quickAmount > currentBalance
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : amount == quickAmount
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-red-300 hover:bg-red-50'
                    }`}
                  >
                    {formatCurrency(quickAmount)}
                  </button>
                ))}
              </div>

              {/* Custom Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hoặc nhập số tiền khác
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Nhập số tiền (tối thiểu 50,000 VND)"
                  min="50000"
                  max={currentBalance}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-800 text-lg transition-all outline-none"
                />
                {amount && (
                  <p className="mt-2 text-sm text-gray-600">
                    Số tiền rút: <span className="font-medium text-red-600">{formatCurrency(parseInt(amount) || 0)}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Bank Account Info */}
            <div className="mb-8 space-y-6">
              <h4 className="font-medium text-gray-700">Thông tin tài khoản nhận tiền</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên chủ tài khoản
                </label>
                <input
                  type="text"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  placeholder="Nhập tên chủ tài khoản"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-800 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên ngân hàng
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-800 transition-all outline-none"
                >
                  <option value="">Chọn ngân hàng</option>
                  <option value="Vietcombank">Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)</option>
                  <option value="VietinBank">Ngân hàng TMCP Công thương Việt Nam (VietinBank)</option>
                  <option value="BIDV">Ngân hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV)</option>
                  <option value="Agribank">Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam (Agribank)</option>
                  <option value="Techcombank">Ngân hàng TMCP Kỹ thương Việt Nam (Techcombank)</option>
                  <option value="MBBank">Ngân hàng TMCP Quân đội (MBBank)</option>
                  <option value="ACB">Ngân hàng TMCP Á Châu (ACB)</option>
                  <option value="TPBank">Ngân hàng TMCP Tiên Phong (TPBank)</option>
                  <option value="Sacombank">Ngân hàng TMCP Sài Gòn Thương tín (Sacombank)</option>
                  <option value="VPBank">Ngân hàng TMCP Việt Nam Thịnh vượng (VPBank)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số tài khoản
                </label>
                <input
                  type="text"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  placeholder="Nhập số tài khoản ngân hàng"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-800 transition-all outline-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleWithdraw}
              disabled={!amount || parseInt(amount) < 50000 || parseInt(amount) > currentBalance || !bankAccount || !bankName || !accountHolder || loading}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 outline-none ${
                !amount || parseInt(amount) < 50000 || parseInt(amount) > currentBalance || !bankAccount || !bankName || !accountHolder || loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Đang xử lý yêu cầu...
                </span>
              ) : (
                'Gửi yêu cầu rút tiền'
              )}
            </button>

            {/* Transaction Info */}
            <div className="mt-8 p-6 bg-red-50 rounded-xl border border-red-200">
              <div className="text-red-800">
                <div className="font-medium mb-3 flex items-center gap-2">
                  <span className="text-lg">⚠️</span>
                  Lưu ý quan trọng
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Số tiền rút tối thiểu: 50,000 VND</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Thời gian xử lý: 1-3 ngày làm việc</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Vui lòng kiểm tra kỹ thông tin tài khoản trước khi gửi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Không thể hủy sau khi đã gửi yêu cầu</span>
                  </li>
                </ul>
              </div>
            </div>
          </>
                 )}
      </div>
    </div>
  );
};

export default DepositWithdraw; 