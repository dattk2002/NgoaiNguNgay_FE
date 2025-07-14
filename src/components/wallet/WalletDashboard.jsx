import React from 'react';

const WalletDashboard = ({ balance }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const stats = [
    { label: 'Tổng tiền nạp', value: formatCurrency(2500000), icon: '📈', color: 'border-l-green-500' },
    { label: 'Tổng tiền rút', value: formatCurrency(1250000), icon: '📉', color: 'border-l-red-500' },
    { label: 'Giao dịch tháng này', value: '15', icon: '📊', color: 'border-l-blue-500' },
    { label: 'Thẻ đã liên kết', value: '2', icon: '💳', color: 'border-l-purple-500' }
  ];

  const recentTransactions = [
    { id: 1, type: 'deposit', amount: 500000, date: '2024-01-15', description: 'Nạp tiền từ Techcombank' },
    { id: 2, type: 'withdraw', amount: 200000, date: '2024-01-14', description: 'Rút tiền về Vietcombank' },
    { id: 3, type: 'deposit', amount: 1000000, date: '2024-01-13', description: 'Nạp tiền từ BIDV' }
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Balance Card */}
        <div className="rounded-2xl p-8 text-white shadow-xl" style={{background: 'linear-gradient(135deg, #333333 0%, #555555 100%)'}}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">💰 Số dư hiện tại</h3>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-black bg-opacity-30 rounded-lg text-sm font-medium hover:bg-opacity-40 transition-all">
                Nạp tiền
              </button>
              <button className="px-4 py-2 bg-black bg-opacity-30 rounded-lg text-sm font-medium hover:bg-opacity-40 transition-all">
                Rút tiền
              </button>
            </div>
          </div>
          <div className="text-4xl font-bold mb-2">{formatCurrency(balance)}</div>
          <div className="text-sm opacity-80">Cập nhật lần cuối: Hôm nay, 14:30</div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className={`bg-gray-50 p-4 rounded-xl border-l-4 ${stat.color} hover:shadow-lg transition-all`}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{stat.icon}</span>
                <span className="text-sm text-gray-600 font-medium">{stat.label}</span>
              </div>
              <div className="text-xl font-bold text-gray-800">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">📋 Giao dịch gần đây</h3>
        <div className="space-y-4">
          {recentTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-100 rounded-xl hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${
                  transaction.type === 'deposit' ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {transaction.type === 'deposit' ? '↗️' : '↙️'}
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{transaction.description}</div>
                  <div className="text-sm text-gray-600">{transaction.date}</div>
                </div>
              </div>
              <div className={`font-bold text-lg ${
                transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-6">
          <button className="px-6 py-3 text-white rounded-xl font-medium hover:opacity-90 transition-all" style={{backgroundColor: '#333333'}}>
            Xem tất cả giao dịch
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletDashboard; 