import React, { useState } from 'react';

const BankCardManager = () => {
  const [cards, setCards] = useState([
    {
      id: 1,
      bankName: 'Techcombank',
      cardNumber: '**** **** **** 1234',
      cardType: 'Visa',
      expiryDate: '12/25',
      isDefault: true,
      color: 'from-slate-600 to-slate-700'
    },
    {
      id: 2,
      bankName: 'Vietcombank',
      cardNumber: '**** **** **** 5678',
      cardType: 'MasterCard',
      expiryDate: '08/26',
      isDefault: false,
      color: 'from-emerald-600 to-emerald-700'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newCard, setNewCard] = useState({
    bankName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  const handleAddCard = () => {
    if (newCard.bankName && newCard.cardNumber && newCard.expiryDate) {
      const card = {
        id: Date.now(),
        bankName: newCard.bankName,
        cardNumber: `**** **** **** ${newCard.cardNumber.slice(-4)}`,
        cardType: 'Visa',
        expiryDate: newCard.expiryDate,
        isDefault: cards.length === 0,
        color: 'from-gray-600 to-gray-700'
      };
      
      setCards([...cards, card]);
      setNewCard({ bankName: '', cardNumber: '', expiryDate: '', cvv: '', cardholderName: '' });
      setShowAddForm(false);
    }
  };

  const handleRemoveCard = (cardId) => {
    setCards(cards.filter(card => card.id !== cardId));
  };

  const handleSetDefault = (cardId) => {
    setCards(cards.map(card => ({
      ...card,
      isDefault: card.id === cardId
    })));
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">💳 Quản lý thẻ ngân hàng</h2>
          <p className="text-gray-600 mt-1">Thêm và quản lý các thẻ thanh toán của bạn</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-6 py-3 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-all duration-200 flex items-center gap-2 outline-none"
        >
          <span className="text-lg">+</span>
          Thêm thẻ mới
        </button>
      </div>

      {/* Add Card Form */}
      {showAddForm && (
        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Thêm thẻ ngân hàng mới</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên ngân hàng</label>
              <input
                type="text"
                value={newCard.bankName}
                onChange={(e) => setNewCard({...newCard, bankName: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-gray-800 transition-all outline-none"
                placeholder="VD: Techcombank"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên chủ thẻ</label>
              <input
                type="text"
                value={newCard.cardholderName}
                onChange={(e) => setNewCard({...newCard, cardholderName: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-gray-800 transition-all outline-none"
                placeholder="NGUYEN VAN A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số thẻ</label>
              <input
                type="text"
                value={newCard.cardNumber}
                onChange={(e) => setNewCard({...newCard, cardNumber: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-gray-800 transition-all outline-none"
                placeholder="1234 5678 9012 3456"
                maxLength="19"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ngày hết hạn</label>
                <input
                  type="text"
                  value={newCard.expiryDate}
                  onChange={(e) => setNewCard({...newCard, expiryDate: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-gray-800 transition-all outline-none"
                  placeholder="MM/YY"
                  maxLength="5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                <input
                  type="text"
                  value={newCard.cvv}
                  onChange={(e) => setNewCard({...newCard, cvv: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-gray-800 transition-all outline-none"
                  placeholder="123"
                  maxLength="4"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-4 mt-8">
            <button
              onClick={handleAddCard}
              className="px-8 py-3 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-all duration-200 outline-none"
            >
              Thêm thẻ
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all duration-200 outline-none"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div key={card.id} className="relative group">
            {/* Card */}
            <div className={`bg-gradient-to-br ${card.color} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
              {card.isDefault && (
                <div className="absolute -top-2 -right-2 bg-amber-400 text-amber-900 px-3 py-1 rounded-full text-xs font-bold">
                  Mặc định
                </div>
              )}
              
              <div className="flex justify-between items-start mb-8">
                <div className="text-sm opacity-90 font-medium">{card.bankName}</div>
                <div className="text-sm font-bold bg-white bg-opacity-20 px-2 py-1 rounded text-gray-700">{card.cardType}</div>
              </div>
              
              <div className="mb-6">
                <div className="text-xl font-mono tracking-wider mb-3">{card.cardNumber}</div>
                <div className="text-sm opacity-90">Hết hạn: {card.expiryDate}</div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-xs opacity-75 font-medium">CARD HOLDER</div>
                <div className="w-12 h-8 bg-amber-400 rounded opacity-90 flex items-center justify-center">
                  <div className="w-6 h-4 bg-amber-300 rounded-sm"></div>
                </div>
              </div>
            </div>
            
            {/* Card Actions */}
            <div className="mt-4 flex gap-2">
              {!card.isDefault && (
                <button
                  onClick={() => handleSetDefault(card.id)}
                  className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-all duration-200 outline-none"
                  style={{ backgroundColor: '#374151', color: '#ffffff' }}
                >
                  Đặt mặc định
                </button>
              )}
              <button
                onClick={() => handleRemoveCard(card.id)}
                className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600 transition-all duration-200 outline-none"
              >
                Xóa thẻ
              </button>
            </div>
          </div>
        ))}
      </div>

      {cards.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200">
          <div className="text-gray-300 text-6xl mb-4">💳</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Chưa có thẻ nào</h3>
          <p className="text-gray-500 mb-8">Thêm thẻ ngân hàng để bắt đầu sử dụng</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-8 py-3 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-all duration-200 outline-none"
          >
            Thêm thẻ đầu tiên
          </button>
        </div>
      )}
    </div>
  );
};

export default BankCardManager; 