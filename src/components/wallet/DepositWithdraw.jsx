import React, { useState } from 'react';

const DepositWithdraw = ({ onBalanceUpdate, currentBalance }) => {
  const [activeTab, setActiveTab] = useState('deposit');
  const [amount, setAmount] = useState('');
  const [selectedCard, setSelectedCard] = useState('');
  const [loading, setLoading] = useState(false);

  const quickAmounts = [100000, 200000, 500000, 1000000, 2000000, 5000000];
  
  const bankCards = [
    { id: 1, name: 'Techcombank - **** 1234', type: 'visa' },
    { id: 2, name: 'Vietcombank - **** 5678', type: 'mastercard' },
    { id: 3, name: 'BIDV - **** 9012', type: 'visa' }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleAmountChange = (value) => {
    setAmount(value.toString());
  };

  const handleSubmit = async () => {
    if (!amount || !selectedCard) {
      alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const numAmount = parseInt(amount);
      if (activeTab === 'deposit') {
        onBalanceUpdate(currentBalance + numAmount);
        alert(`Nạp ${formatCurrency(numAmount)} thành công!`);
      } else {
        if (numAmount > currentBalance) {
          alert('Số dư không đủ!');
        } else {
          onBalanceUpdate(currentBalance - numAmount);
          alert(`Rút ${formatCurrency(numAmount)} thành công!`);
        }
      }
      setAmount('');
      setSelectedCard('');
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">💰 Nạp/Rút tiền</h2>
        <p className="text-gray-600">Thực hiện giao dịch nạp tiền và rút tiền</p>
      </div>

      {/* Tab Selector */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        <button
          className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
            activeTab === 'deposit'
              ? 'text-white shadow-md'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          style={activeTab === 'deposit' ? {backgroundColor: '#333333'} : {}}
          onClick={() => setActiveTab('deposit')}
        >
          ⬇️ Nạp tiền
        </button>
        <button
          className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
            activeTab === 'withdraw'
              ? 'text-white shadow-md'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          style={activeTab === 'withdraw' ? {backgroundColor: '#333333'} : {}}
          onClick={() => setActiveTab('withdraw')}
        >
          ⬆️ Rút tiền
        </button>
      </div>

      <div className="bg-gray-50 rounded-2xl p-8">
        {/* Amount Selection */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Số tiền {activeTab === 'deposit' ? 'nạp' : 'rút'}
          </label>
          
          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {quickAmounts.map((quickAmount) => (
              <button
                key={quickAmount}
                onClick={() => handleAmountChange(quickAmount)}
                className={`p-4 rounded-xl border-2 font-medium transition-all hover:transform hover:-translate-y-1 ${
                  amount == quickAmount
                    ? 'text-white border-transparent shadow-md'
                    : 'bg-gray-100 border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
                style={amount == quickAmount ? {backgroundColor: '#333333'} : {}}
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
              placeholder="Nhập số tiền"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 text-gray-800 text-lg"
              style={{focusRingColor: '#333333'}}
            />
            {amount && (
              <p className="mt-2 text-sm text-gray-600">
                Số tiền: {formatCurrency(parseInt(amount) || 0)}
              </p>
            )}
          </div>
        </div>

        {/* Card Selection */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Chọn thẻ thanh toán
          </label>
          <div className="space-y-3">
            {bankCards.map((card) => (
              <label
                key={card.id}
                className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                  selectedCard == card.id
                    ? 'border-transparent shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={selectedCard == card.id ? {backgroundColor: '#333333'} : {backgroundColor: '#f9fafb'}}
              >
                <input
                  type="radio"
                  name="card"
                  value={card.id}
                  checked={selectedCard == card.id}
                  onChange={(e) => setSelectedCard(e.target.value)}
                  className="mr-4"
                />
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {card.type === 'visa' ? '💳' : '🏦'}
                  </div>
                  <span className={`font-medium ${selectedCard == card.id ? 'text-white' : 'text-gray-800'}`}>
                    {card.name}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Current Balance Info */}
        {activeTab === 'withdraw' && (
          <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center gap-2 text-blue-800">
              <span>ℹ️</span>
              <span className="font-medium">Số dư hiện tại: {formatCurrency(currentBalance)}</span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!amount || !selectedCard || loading}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
            !amount || !selectedCard || loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'text-white hover:opacity-90 transform hover:-translate-y-1 shadow-lg'
          }`}
          style={!amount || !selectedCard || loading ? {} : {backgroundColor: '#333333'}}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Đang xử lý...
            </span>
          ) : (
            `${activeTab === 'deposit' ? 'Nạp' : 'Rút'} tiền`
          )}
        </button>

        {/* Transaction Info */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
          <div className="text-yellow-800 text-sm">
            <div className="font-medium mb-2">⚠️ Lưu ý:</div>
            <ul className="space-y-1 list-disc list-inside">
              <li>Giao dịch nạp tiền sẽ được xử lý trong vòng 1-5 phút</li>
              <li>Giao dịch rút tiền sẽ được xử lý trong vòng 1-3 ngày làm việc</li>
              <li>Phí giao dịch: 0đ cho giao dịch dưới 10,000,000đ</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepositWithdraw; 