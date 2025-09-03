import React, { useState, useEffect } from 'react';
import { createDepositRequest, fetchBankAccounts as apiFetchBankAccounts, createWithdrawalRequest, fetchSystemFeeByCode } from '../api/auth';
import { toast } from 'react-toastify';
import formatPriceInputWithCommas from "../../utils/formatPriceInputWithCommas";

const DepositWithdraw = ({ onBalanceUpdate, currentBalance }) => {
  const [activeTab, setActiveTab] = useState('deposit');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [depositId, setDepositId] = useState('');
  
  // Bank accounts management
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState('');
  const [loadingBankAccounts, setLoadingBankAccounts] = useState(false);

  // Withdrawal fee management
  const [withdrawalFee, setWithdrawalFee] = useState(null);
  const [loadingWithdrawalFee, setLoadingWithdrawalFee] = useState(false);

  const quickAmounts = [50000, 100000, 200000, 500000, 1000000, 2000000];
  const withdrawAmounts = [50000, 100000, 200000, 500000, 1000000];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' VNĐ';
  };

  const handleAmountChange = (value) => {
    const formatted = formatPriceInputWithCommas(value.toString());
    setAmount(formatted);
  };

  // Calculate withdrawal fee and net amount
  const calculateWithdrawalDetails = (grossAmount) => {
    if (!withdrawalFee || !grossAmount) {
      return {
        feeAmount: 0,
        netAmount: grossAmount,
        feeDisplay: '0 VNĐ'
      };
    }

    let feeAmount = 0;
          let feeDisplay = '0 VNĐ';

    if (withdrawalFee.type === 1) {
      // Flat fee
      feeAmount = withdrawalFee.value;
      feeDisplay = formatCurrency(feeAmount);
    } else if (withdrawalFee.type === 0) {
      // Percentage fee
      feeAmount = Math.round(grossAmount * withdrawalFee.value);
      feeDisplay = `${Math.round(withdrawalFee.value * 100)}% (${formatCurrency(feeAmount)})`;
    }

    const netAmount = Math.max(0, grossAmount - feeAmount);

    return {
      feeAmount,
      netAmount,
      feeDisplay
    };
  };

  // Fetch withdrawal fee
  const fetchWithdrawalFee = async () => {
    try {
      setLoadingWithdrawalFee(true);
      const feeData = await fetchSystemFeeByCode('WITHDRAWAL_FEE');
      setWithdrawalFee(feeData);
    } catch (error) {
      console.error('Failed to fetch withdrawal fee:', error);
      // Don't show error toast for fee fetch failure, just log it
      setWithdrawalFee(null);
    } finally {
      setLoadingWithdrawalFee(false);
    }
  };

  // Fetch bank accounts when component mounts or when withdraw tab is selected
  const fetchBankAccounts = async () => {
    try {
      setLoadingBankAccounts(true);
      const data = await apiFetchBankAccounts();
      setBankAccounts(data || []);
      
      // Auto-select default account if available
      const defaultAccount = data?.find(account => account.isDefault);
      if (defaultAccount) {
        setSelectedBankAccountId(defaultAccount.id);
      }
    } catch (error) {
      console.error('Failed to fetch bank accounts:', error);
      toast.error('Không thể tải danh sách tài khoản ngân hàng');
      setBankAccounts([]);
    } finally {
      setLoadingBankAccounts(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'withdraw') {
      fetchBankAccounts();
      fetchWithdrawalFee();
    }
  }, [activeTab]);

  const handleDeposit = async () => {
    if (!amount || parseInt(amount.replace(/,/g, '')) <= 0) {
      toast.error('Vui lòng nhập số tiền hợp lệ');
      return;
    }

    if (parseInt(amount.replace(/,/g, '')) < 10000) {
              toast.error('Số tiền nạp tối thiểu là 10,000 VNĐ');
      return;
    }

    setLoading(true);
    
    try {
      const response = await createDepositRequest(parseInt(amount.replace(/,/g, '')));
      
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
    if (!amount || parseInt(amount.replace(/,/g, '')) <= 0) {
      toast.error('Vui lòng nhập số tiền hợp lệ');
      return;
    }

    if (parseInt(amount.replace(/,/g, '')) < 50000) {
              toast.error('Số tiền rút tối thiểu là 50,000 VNĐ');
      return;
    }

    // Calculate withdrawal details including fee
    const withdrawalDetails = calculateWithdrawalDetails(parseInt(amount.replace(/,/g, '')));
    const totalDeduction = parseInt(amount.replace(/,/g, '')) + withdrawalDetails.feeAmount;

    if (totalDeduction > currentBalance) {
      toast.error(`Số dư không đủ để thực hiện giao dịch. Cần ${formatCurrency(totalDeduction)} (bao gồm phí ${withdrawalDetails.feeDisplay})`);
      return;
    }

    if (!selectedBankAccountId) {
      toast.error('Vui lòng chọn tài khoản ngân hàng nhận tiền');
      return;
    }

    setLoading(true);
    
    try {
      const withdrawalData = {
        bankAccountId: selectedBankAccountId,
        grossAmount: parseInt(amount.replace(/,/g, ''))
      };

      const response = await createWithdrawalRequest(withdrawalData);
      
      if (response) {
        toast.success('Yêu cầu rút tiền đã được gửi thành công! Chúng tôi sẽ xử lý trong vòng 1-3 ngày làm việc.');
        
        // Reset form
        setAmount('');
        setSelectedBankAccountId('');
        
        // Trigger balance update
        if (onBalanceUpdate) {
          onBalanceUpdate();
        }
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
            setSelectedBankAccountId('');
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
                    ? formatCurrency(currentBalance + parseInt(amount.replace(/,/g, '')))
                    : (() => {
                        const withdrawalDetails = calculateWithdrawalDetails(parseInt(amount.replace(/,/g, '')));
                        return formatCurrency(Math.max(0, currentBalance - parseInt(amount.replace(/,/g, ''))));
                      })()
                ) : formatCurrency(currentBalance)}
              </div>
            </div>
          </div>
          
          {/* Withdrawal Fee Information */}
          {activeTab === 'withdraw' && amount && withdrawalFee && (
            <div className="mt-4 pt-4 border-t border-gray-500/30">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="opacity-75 mb-1">💰 Số tiền rút</div>
                  <div className="font-semibold">{formatCurrency(parseInt(amount.replace(/,/g, '')))}</div>
                </div>
                <div>
                  <div className="opacity-75 mb-1">💸 Phí rút tiền</div>
                  <div className="font-semibold text-yellow-300">
                    {loadingWithdrawalFee ? 'Đang tải...' : calculateWithdrawalDetails(parseInt(amount.replace(/,/g, ''))).feeDisplay}
                  </div>
                </div>
                <div>
                  <div className="opacity-75 mb-1">💳 Số tiền thực nhận</div>
                  <div className="font-semibold text-green-300">
                    {loadingWithdrawalFee ? 'Đang tải...' : formatCurrency(calculateWithdrawalDetails(parseInt(amount.replace(/,/g, ''))).netAmount)}
                  </div>
                </div>
              </div>
            </div>
          )}
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
                    onClick={() => {
                      const formatted = formatPriceInputWithCommas(quickAmount.toString());
                      setAmount(formatted);
                    }}
                    className={`p-4 rounded-xl border-2 font-medium transition-all duration-200 hover:shadow-sm outline-none ${
                      amount == formatPriceInputWithCommas(quickAmount.toString())
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
                  type="text" // Changed from number to text
                  value={amount}
                  onChange={(e) => {
                    let value = e.target.value;
                    // Remove non-digit characters
                    let cleaned = value.replace(/[^0-9]/g, '');
                    // Format
                    const formatted = formatPriceInputWithCommas(cleaned);
                    setAmount(formatted);
                  }}
                  placeholder="Nhập số tiền (tối thiểu 10,000 VNĐ)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-gray-800 text-lg transition-all outline-none"
                />
                {amount && (
                  <p className="mt-2 text-sm text-gray-600">
                    Số tiền nạp: <span className="font-medium text-gray-800">{formatCurrency(parseInt(amount.replace(/,/g, '')) || 0)}</span>
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
                    <p>• Hỗ trợ QR Code</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleDeposit}
              disabled={!amount || parseInt(amount.replace(/,/g, '')) < 10000 || loading}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 outline-none ${
                !amount || parseInt(amount.replace(/,/g, '')) < 10000 || loading
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
                    <span>Số tiền nạp tối thiểu: 10,000 VNĐ</span>
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
                    onClick={() => {
                      const formatted = formatPriceInputWithCommas(quickAmount.toString());
                      setAmount(formatted);
                    }}
                    disabled={quickAmount > currentBalance}
                    className={`p-4 rounded-xl border-2 font-medium transition-all duration-200 hover:shadow-sm outline-none ${
                      quickAmount > currentBalance
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : amount == formatPriceInputWithCommas(quickAmount.toString())
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
                  type="text" // Changed from number to text
                  value={amount}
                  onChange={(e) => {
                    let value = e.target.value;
                    // Remove non-digit characters
                    let cleaned = value.replace(/[^0-9]/g, '');
                    // Format
                    const formatted = formatPriceInputWithCommas(cleaned);
                    setAmount(formatted);
                  }}
                  placeholder="Nhập số tiền (tối thiểu 50,000 VNĐ)"
                  max={currentBalance}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-800 text-lg transition-all outline-none"
                />
                {amount && (
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600">
                      Số tiền rút: <span className="font-medium text-red-600">{formatCurrency(parseInt(amount.replace(/,/g, '')) || 0)}</span>
                    </p>
                    {withdrawalFee && (
                      <p className="text-sm text-gray-600">
                        Phí rút tiền: <span className="font-medium text-yellow-600">
                          {loadingWithdrawalFee ? 'Đang tải...' : calculateWithdrawalDetails(parseInt(amount.replace(/,/g, ''))).feeDisplay}
                        </span>
                      </p>
                    )}
                    {withdrawalFee && (
                      <p className="text-sm text-gray-600">
                        Số tiền thực nhận: <span className="font-medium text-green-600">
                          {loadingWithdrawalFee ? 'Đang tải...' : formatCurrency(calculateWithdrawalDetails(parseInt(amount.replace(/,/g, ''))).netAmount)}
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bank Account Selection */}
            <div className="mb-8 space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-700">Chọn tài khoản nhận tiền</h4>
                <button
                  onClick={fetchBankAccounts}
                  disabled={loadingBankAccounts}
                  className="text-sm text-gray-600 hover:text-gray-800 underline disabled:opacity-50"
                >
                  {loadingBankAccounts ? '🔄 Đang tải...' : '🔄 Làm mới'}
                </button>
              </div>

              {/* Loading State */}
              {loadingBankAccounts && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                  <span className="ml-3 text-gray-600">Đang tải tài khoản ngân hàng...</span>
                </div>
              )}

              {/* No Bank Accounts */}
              {!loadingBankAccounts && bankAccounts.length === 0 && (
                <div className="text-center py-8 bg-yellow-50 rounded-xl border border-yellow-200">
                  <div className="text-yellow-600 text-4xl mb-3">🏦</div>
                  <h4 className="font-medium text-yellow-800 mb-2">Chưa có tài khoản ngân hàng</h4>
                  <p className="text-yellow-700 text-sm mb-4">
                    Bạn cần thêm tài khoản ngân hàng trước khi rút tiền
                  </p>
                  <button
                    onClick={() => window.location.href = '#bank-manager'}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                  >
                    Thêm tài khoản ngân hàng
                  </button>
                </div>
              )}

              {/* Bank Account Cards */}
              {!loadingBankAccounts && bankAccounts.length > 0 && (
                <div className="space-y-3">
                  {bankAccounts.map((account) => (
                    <div
                      key={account.id}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        selectedBankAccountId === account.id
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 bg-white hover:border-red-300 hover:bg-red-50'
                      }`}
                      onClick={() => setSelectedBankAccountId(account.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            selectedBankAccountId === account.id
                              ? 'border-red-500 bg-red-500'
                              : 'border-gray-300'
                          }`}>
                            {selectedBankAccountId === account.id && (
                              <div className="w-full h-full rounded-full bg-white scale-50"></div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">{account.bankName}</div>
                            <div className="text-sm text-gray-600">
                              {account.accountNumber ? `**** **** **** ${account.accountNumber.slice(-4)}` : 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">{account.accountHolderName}</div>
                          </div>
                        </div>
                        {account.isDefault && (
                          <div className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full font-medium">
                            Mặc định
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleWithdraw}
              disabled={(() => {
                const basicValidation = !amount || parseInt(amount.replace(/,/g, '')) < 50000 || !selectedBankAccountId || loading || bankAccounts.length === 0;
                if (basicValidation) return true;
                
                // Check if total amount (including fee) exceeds balance
                if (withdrawalFee && amount) {
                  const withdrawalDetails = calculateWithdrawalDetails(parseInt(amount.replace(/,/g, '')));
                  const totalDeduction = parseInt(amount.replace(/,/g, '')) + withdrawalDetails.feeAmount;
                  return totalDeduction > currentBalance;
                }
                
                return parseInt(amount.replace(/,/g, '')) > currentBalance;
              })()}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 outline-none ${
                (() => {
                  const basicValidation = !amount || parseInt(amount.replace(/,/g, '')) < 50000 || !selectedBankAccountId || loading || bankAccounts.length === 0;
                  if (basicValidation) return 'bg-gray-300 text-gray-500 cursor-not-allowed';
                  
                  // Check if total amount (including fee) exceeds balance
                  if (withdrawalFee && amount) {
                    const withdrawalDetails = calculateWithdrawalDetails(parseInt(amount.replace(/,/g, '')));
                    const totalDeduction = parseInt(amount.replace(/,/g, '')) + withdrawalDetails.feeAmount;
                    return totalDeduction > currentBalance ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg';
                  }
                  
                  return parseInt(amount.replace(/,/g, '')) > currentBalance ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg';
                })()
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
                    <span>Số tiền rút tối thiểu: 50,000 VNĐ</span>
                  </li>
                  {withdrawalFee && (
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>
                        Phí rút tiền: {loadingWithdrawalFee ? 'Đang tải...' : (
                          withdrawalFee.type === 1 
                            ? `${formatCurrency(withdrawalFee.value)} (phí cố định)`
                            : `${Math.round(withdrawalFee.value * 100)}% (phí theo phần trăm)`
                        )}
                      </span>
                    </li>
                  )}
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Thời gian xử lý: 1-3 ngày làm việc</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Sử dụng tài khoản ngân hàng đã lưu để đảm bảo an toàn</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Vui lòng kiểm tra kỹ thông tin tài khoản đã chọn</span>
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