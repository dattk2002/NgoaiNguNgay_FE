# Wallet Components

💰 **Mô tả**: Hệ thống ví điện tử và thanh toán của NgoaiNguNgay - quản lý số dư, giao dịch, nạp tiền, rút tiền.

## 🏗️ Cấu trúc components

```
src/components/wallet/
├── WalletMain.jsx          # Layout chính wallet system
├── WalletDashboard.jsx     # Dashboard tổng quan ví
├── DepositWithdraw.jsx     # Nạp tiền và rút tiền
├── TransactionHistory.jsx  # Lịch sử giao dịch
├── BankCardManager.jsx     # Quản lý thẻ ngân hàng
└── PaymentReturn.jsx       # Xử lý kết quả thanh toán
```

## 🔧 Chi tiết components

### 🏠 WalletMain.jsx
**Mục đích**: Layout chính của wallet system với tab navigation

**Tab Structure**:
- 💰 **dashboard**: Tổng quan ví và thống kê
- 💸 **deposit-withdraw**: Nạp/rút tiền
- 📋 **history**: Lịch sử giao dịch
- 💳 **cards**: Quản lý thẻ ngân hàng

**Features**:
- 🔄 **Real-time Balance**: Cập nhật số dư theo thời gian thực
- 📱 **Responsive Design**: Mobile-friendly interface
- 🔐 **Security**: Secure wallet operations
- 🎨 **Modern UI**: Clean, financial-focused design

### 💰 WalletDashboard.jsx
**Mục đích**: Hiển thị tổng quan ví và thống kê tài chính

**Key Metrics**:
- 💵 **Available Balance**: Số dư có thể sử dụng
- 📊 **Total Deposits**: Tổng tiền đã nạp
- 📉 **Total Withdrawals**: Tổng tiền đã rút  
- 📈 **Monthly Transactions**: Giao dịch tháng này
- 💳 **Linked Cards**: Số thẻ đã liên kết

**Recent Transactions**:
```jsx
const getRecentTransactions = () => {
  // Combine wallet transactions, deposits, withdrawals
  const allTransactions = [
    ...walletTransactions,
    ...depositHistory.map(d => ({
      type: 'deposit',
      amount: d.amount,
      description: `Nạp tiền qua ${d.paymentGateway}`
    })),
    ...withdrawalHistory.map(w => ({
      type: 'withdraw', 
      amount: w.grossAmount,
      description: `Rút tiền về ${w.bankAccount?.bankName}`
    }))
  ];
  
  return allTransactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);
};
```

**Balance Display**:
- 🟢 **Available Balance**: Highlighted prominently
- 💎 **Total Balance**: If different from available
- 🕒 **Last Updated**: Timestamp của last sync
- 📊 **Visual Cards**: Card-based metrics layout

### 💸 DepositWithdraw.jsx
**Mục đích**: Xử lý nạp tiền và rút tiền

**Deposit Features**:
- 💳 **Payment Methods**: Multiple payment gateways
- 💰 **Amount Input**: With validation và formatting
- 🔒 **Secure Processing**: PCI-compliant payments
- ✅ **Confirmation**: Success/failure feedback

**Withdrawal Features**:
- 🏦 **Bank Selection**: Choose from saved accounts
- 💸 **Amount Limits**: Min/max withdrawal limits
- 📊 **Fee Calculation**: Transparent fee structure
- ⏳ **Processing Time**: Clear expectations

**Payment Flow**:
```jsx
const handleDeposit = async (amount, paymentMethod) => {
  // 1. Validate amount và payment method
  // 2. Create payment intent
  // 3. Redirect to payment gateway
  // 4. Handle payment callback
  // 5. Update wallet balance
};

const handleWithdrawal = async (amount, bankAccount) => {
  // 1. Validate withdrawal amount
  // 2. Check available balance
  // 3. Calculate fees
  // 4. Create withdrawal request
  // 5. Update pending balance
};
```

### 📋 TransactionHistory.jsx
**Mục đích**: Lịch sử giao dịch với filtering và search

**Transaction Types**:
- ⬇️ **Deposit**: Nạp tiền vào ví
- ⬆️ **Withdraw**: Rút tiền từ ví  
- 🔄 **Transfer**: Chuyển tiền internal
- 💰 **Payment**: Thanh toán for lessons
- 🎁 **Bonus**: Tiền thưởng/khuyến mãi

**Filter Options**:
```jsx
const filterOptions = [
  { key: 'all', label: 'Tất cả', icon: '📋' },
  { key: 'deposit', label: 'Nạp tiền', icon: '⬇️' },
  { key: 'withdraw', label: 'Rút tiền', icon: '⬆️' },
  { key: 'transaction', label: 'Giao dịch khác', icon: '🔄' },
  { key: 'success', label: 'Thành công', icon: '✅' },
  { key: 'pending', label: 'Đang xử lý', icon: '⏳' },
  { key: 'failed', label: 'Thất bại', icon: '❌' }
];
```

**Features**:
- 🔍 **Search**: Tìm kiếm theo description
- 🏷️ **Filter**: Multiple filter options
- 📄 **Pagination**: Efficient data loading
- 📊 **Summary Stats**: Quick overview calculations
- 📱 **Mobile Optimized**: Responsive table design

**Data Processing**:
```jsx
const loadTransactionData = async () => {
  // Fetch from multiple sources
  const [walletTxs, deposits, withdrawals] = await Promise.all([
    fetchWalletTransactions(),
    fetchDepositHistory(), 
    fetchWithdrawalRequests()
  ]);
  
  // Normalize và combine data
  const processedTransactions = [
    ...walletTxs.map(normalizeWalletTx),
    ...deposits.map(normalizeDeposit),
    ...withdrawals.map(normalizeWithdrawal)
  ];
  
  // Sort by date
  processedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
};
```

### 💳 BankCardManager.jsx
**Mục đích**: Quản lý thẻ ngân hàng và payment methods

**Card Management**:
- ➕ **Add Card**: Thêm thẻ ngân hàng mới
- ✏️ **Edit Info**: Cập nhật thông tin thẻ
- 🗑️ **Delete Card**: Xóa thẻ không dùng
- ⭐ **Set Default**: Đặt thẻ mặc định

**Security Features**:
- 🔒 **Card Masking**: Hiển thị **** last 4 digits
- 🛡️ **PCI Compliance**: Secure card storage
- 🔐 **2FA**: Two-factor authentication
- 📱 **OTP Verification**: SMS/Email verification

**Bank Information**:
```jsx
const bankCardInfo = {
  cardNumber: '****1234',
  bankName: 'Vietcombank',
  accountHolderName: 'NGUYEN VAN A',
  expiryDate: '12/25',
  isDefault: true
};
```

### 🔄 PaymentReturn.jsx
**Mục đích**: Xử lý kết quả trả về từ payment gateways

**Return Handling**:
- ✅ **Success**: Payment successful
- ❌ **Failed**: Payment failed
- ⏳ **Pending**: Payment processing
- 🔄 **Cancelled**: User cancelled

**Process Flow**:
```jsx
const handlePaymentReturn = async (paymentResult) => {
  // 1. Validate payment signature
  // 2. Update transaction status
  // 3. Update wallet balance if successful
  // 4. Send confirmation notification
  // 5. Redirect user appropriately
};
```

**Gateway Integration**:
- 🏧 **PayOS**: Primary payment gateway
- 💳 **VNPay**: Alternative payment option
- 🏦 **Banking**: Direct bank transfer
- 📱 **Mobile**: Mobile banking integration

## 🎨 UI/UX Features

### 💰 Financial Design
- **Currency Formatting**: VND với proper locale
- **Color Coding**: Green for income, red for expenses
- **Visual Hierarchy**: Clear information architecture
- **Trust Indicators**: Security badges và SSL certificates

### 📱 Responsive Design
```css
/* Desktop: Full feature set */
.grid-cols-1.lg:grid-cols-3

/* Tablet: Adjusted layout */
.grid-cols-1.md:grid-cols-2

/* Mobile: Single column */
.grid-cols-1
```

### ✨ Interactive Elements
- **Loading States**: Skeleton loading for data
- **Real-time Updates**: Live balance updates
- **Progress Indicators**: Transaction progress
- **Toast Notifications**: Success/error feedback

## 🔐 Security & Compliance

### 🛡️ Security Measures
- **PCI DSS Compliance**: Secure card processing
- **SSL Encryption**: All data in transit
- **Token Authentication**: Secure API access
- **Audit Logging**: Track all financial operations

### 🔒 Data Protection
```jsx
// Sensitive data masking
const maskAccountNumber = (accountNumber) => {
  if (!accountNumber || accountNumber.length <= 4) return accountNumber;
  return '****' + accountNumber.slice(-4);
};

// Secure API calls
const callSecureAPI = async (endpoint, data) => {
  const headers = {
    'Authorization': `Bearer ${getSecureToken()}`,
    'Content-Type': 'application/json'
  };
  // Make secure request
};
```

## 📊 State Management

### 💰 Wallet State
```jsx
// WalletMain
const [activeTab, setActiveTab] = useState('dashboard');
const [balance, setBalance] = useState(0);
const [availableBalance, setAvailableBalance] = useState(0);

// TransactionHistory
const [transactions, setTransactions] = useState([]);
const [filter, setFilter] = useState('all');
const [currentPage, setCurrentPage] = useState(1);

// DepositWithdraw
const [depositAmount, setDepositAmount] = useState('');
const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
const [withdrawalAmount, setWithdrawalAmount] = useState('');
const [selectedBank, setSelectedBank] = useState(null);
```

### 🔄 Data Synchronization
```jsx
// Real-time balance updates
useEffect(() => {
  const syncWalletData = async () => {
    const [balance, transactions] = await Promise.all([
      fetchWalletBalance(),
      fetchRecentTransactions()
    ]);
    
    setBalance(balance);
    setTransactions(transactions);
  };
  
  // Initial load
  syncWalletData();
  
  // Set up polling for updates
  const interval = setInterval(syncWalletData, 30000);
  return () => clearInterval(interval);
}, []);
```

## 📡 API Integration

### 💰 Wallet APIs
```javascript
// Balance management
GET /api/wallet/balance - Get current balance
GET /api/wallet/transactions - Get transaction history

// Deposit operations
POST /api/wallet/deposit - Create deposit request
GET /api/wallet/deposits - Get deposit history

// Withdrawal operations  
POST /api/wallet/withdraw - Create withdrawal request
GET /api/wallet/withdrawals - Get withdrawal history

// Bank account management
GET /api/wallet/bank-accounts - Get saved accounts
POST /api/wallet/bank-accounts - Add bank account
DELETE /api/wallet/bank-accounts/:id - Remove account
```

### 💳 Payment Gateway APIs
```javascript
// PayOS integration
POST /api/payments/payos/create - Create payment
GET /api/payments/payos/return - Handle return

// VNPay integration  
POST /api/payments/vnpay/create - Create payment
GET /api/payments/vnpay/return - Handle return
```

## 🔧 Business Logic

### 💰 Currency Formatting
```jsx
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

const formatPriceInput = (value) => {
  // Remove non-digits
  const numbers = value.replace(/\D/g, '');
  // Add thousand separators
  return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
```

### 📊 Transaction Processing
```jsx
const processTransaction = async (type, amount, details) => {
  // Validate transaction
  if (type === 'withdraw' && amount > availableBalance) {
    throw new Error('Insufficient balance');
  }
  
  // Create transaction record
  const transaction = {
    type,
    amount,
    status: 'pending',
    details,
    createdAt: new Date()
  };
  
  // Submit to API
  const result = await submitTransaction(transaction);
  
  // Update local state
  updateTransactionList(result);
  updateBalance(result);
  
  return result;
};
```

## 🚀 Usage Examples

### Basic Wallet Integration
```jsx
import { WalletMain } from './components/wallet';

const UserDashboard = () => {
  return (
    <div>
      <h1>Ví của tôi</h1>
      <WalletMain />
    </div>
  );
};
```

### Deposit Flow
```jsx
import { DepositWithdraw } from './components/wallet';

const PaymentPage = () => {
  const handleDepositSuccess = (transaction) => {
    console.log('Deposit successful:', transaction);
    // Update global balance state
    updateUserBalance(transaction.amount);
  };

  return (
    <DepositWithdraw 
      onDepositSuccess={handleDepositSuccess}
      defaultTab="deposit"
    />
  );
};
```

## 🔧 Development Guidelines

### 💰 Financial Data Handling
- **Precision**: Use proper decimal handling
- **Validation**: Strict input validation
- **Error Handling**: Graceful error recovery
- **Logging**: Comprehensive audit trails

### 🧪 Testing Strategy
- **Unit Tests**: Test financial calculations
- **Integration Tests**: Test payment flows
- **Security Tests**: Test authentication và authorization
- **Performance Tests**: Test với large transaction volumes

### 📊 Performance Optimization
- **Lazy Loading**: Load transaction history on demand
- **Caching**: Cache balance và recent transactions
- **Pagination**: Efficient data pagination
- **Real-time Updates**: WebSocket for balance updates

## 🔗 Related Components

- [Manager Dashboard](../manager/README.md) - Manager withdrawal approval
- [Modal Components](../modals/README.md) - Confirmation dialogs
- [API Authentication](../api/README.md) - Secure API calls
- [User Profile](../users/README.md) - User bank account management
