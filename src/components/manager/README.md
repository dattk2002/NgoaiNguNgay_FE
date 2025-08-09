# Manager Components

💰 **Mô tả**: Các components dành cho Manager Dashboard - quản lý tài chính và doanh thu của nền tảng NgoaiNguNgay.

## 🏗️ Cấu trúc components

```
src/components/manager/
├── ManagerDashboard.jsx      # Layout chính manager dashboard
├── ManagerOverview.jsx       # Tổng quan doanh thu và thống kê
├── RevenueAnalysis.jsx       # Phân tích chi tiết doanh thu
├── FinancialReports.jsx      # Tạo và quản lý báo cáo tài chính
└── WithdrawalManagement.jsx  # Quản lý các lệnh rút tiền
```

## 🔧 Chi tiết components

### 🏠 ManagerDashboard.jsx
**Mục đích**: Layout chính của manager dashboard với navigation

**Tính năng**:
- 💚 Sidebar với green theme (financial focus)
- 🗂️ 4 tab navigation chính
- 🔐 Manager authentication management
- 📱 Responsive design
- 🚪 Secure logout với token cleanup

**Navigation Menu**:
- 📊 **overview**: Tổng quan doanh thu
- 📈 **revenue-analysis**: Phân tích doanh thu
- 📋 **financial-reports**: Báo cáo tài chính
- 💸 **withdrawal-management**: Quản lý rút tiền

**Color Scheme**: Green-focused design để phản ánh financial management

### 📊 ManagerOverview.jsx
**Mục đích**: Dashboard tổng quan với KPIs và metrics chính

**Key Metrics**:
- 💰 **Tổng doanh thu**: 2,450,000 VND
- 📅 **Doanh thu tháng này**: 850,000 VND  
- 📈 **Tăng trưởng**: +12.5%
- 🧾 **Tổng giao dịch**: 1,234 transactions
- 💳 **AOV**: 1,987 VND trung bình

**Revenue Breakdown**:
- 🇬🇧 **Tiếng Anh**: 40% (980,000 VND)
- 🔢 **Toán học**: 30% (735,000 VND)
- 🇨🇳 **Tiếng Trung**: 20% (490,000 VND)
- 📚 **Khác**: 10% (245,000 VND)

**Top Performing Tutors**:
```jsx
const topTutors = [
  { name: 'Nguyễn Thị Mai', revenue: 125000, sessions: 45 },
  { name: 'Trần Văn Nam', revenue: 98000, sessions: 38 },
  // ...more tutors
];
```

### 📈 RevenueAnalysis.jsx
**Mục đích**: Phân tích chi tiết doanh thu với filters và breakdowns

**Filter Options**:
- ⏰ **Thời gian**: 7 ngày, 30 ngày, 3 tháng, 12 tháng
- 📚 **Danh mục**: Tất cả, Tiếng Anh, Toán, Tiếng Trung, Vật lý
- 📊 **Export**: Xuất báo cáo

**Daily Revenue Table**:
```jsx
const dailyRevenue = [
  { date: '2024-01-01', revenue: 45000, sessions: 12 },
  { date: '2024-01-02', revenue: 52000, sessions: 15 },
  // ...daily data
];
```

**Category Performance**:
- 📊 **Revenue by category** với growth rates
- 📉 **Performance insights** (best/worst performing)
- 🎯 **Recommendations** based on data

**Insights Section**:
- 🏆 **Danh mục tăng trưởng mạnh**: Tiếng Trung (+22.1%)
- 💰 **Doanh thu cao nhất**: Tiếng Anh
- ⚠️ **Cần cải thiện**: Vật lý (-3.2%)

### 📋 FinancialReports.jsx
**Mục đích**: Tạo và quản lý các báo cáo tài chính

**Report Types**:
- 💰 **Báo cáo doanh thu**: Chi tiết theo thời gian và danh mục
- 💸 **Báo cáo hoa hồng**: Hoa hồng gia sư và phí nền tảng
- 💳 **Báo cáo thanh toán**: Trạng thái và phương thức thanh toán
- 📊 **Báo cáo thuế**: Tổng hợp cho khai báo thuế

**Export Formats**:
- 📄 **PDF**: Định dạng in ấn và chia sẻ
- 📊 **Excel**: Định dạng phân tích dữ liệu  
- 📈 **CSV**: Định dạng dữ liệu thô

**Report Generation**:
```jsx
const handleGenerateReport = () => {
  const reportType = selectedReportType;
  const timeRange = dateRange;
  // Generate report logic
};
```

**Recent Reports Table**:
- 📝 Tên báo cáo và loại
- 📅 Ngày tạo
- ✅ Trạng thái (Hoàn thành/Đang xử lý)
- 📦 Kích thước file
- ⬇️ Download actions

### 💸 WithdrawalManagement.jsx
**Mục đích**: Quản lý các yêu cầu rút tiền từ gia sư

**Key Features**:
- 📋 **Danh sách withdrawal requests** với pagination
- 🔍 **Filter**: Theo trạng thái và số lượng per page
- ⚡ **Actions**: Approve, reject withdrawal requests
- 💳 **Bank details**: Hiển thị thông tin ngân hàng (masked)
- 📊 **Real-time updates** sau khi xử lý

**Status Management**:
```jsx
const statusOptions = [
  { name: 'Pending', value: 0, label: 'Chờ xử lý' },
  { name: 'Processing', value: 1, label: 'Đang xử lý' },
  { name: 'Completed', value: 2, label: 'Hoàn thành' },
  { name: 'Failed', value: 3, label: 'Từ chối' }
];
```

**Withdrawal Actions**:
- ✅ **Approve**: Xác nhận rút tiền
- ❌ **Reject**: Từ chối với lý do
- 👁️ **View Details**: Xem chi tiết request

**Table Columns**:
- 👤 Thông tin người dùng
- 🏦 Thông tin ngân hàng
- 💰 Số tiền (gross/net)
- 📊 Trạng thái
- 📅 Ngày tạo/hoàn thành
- ⚙️ Thao tác

## 🎨 UI/UX Features

### 🎯 Design Philosophy
- **Green Theme**: Represents financial/money management
- **Data-First**: Focus on numbers and metrics
- **Professional**: Clean, business-oriented design

### 📊 Data Visualization
- **Currency Formatting**: VND với proper locale
- **Charts**: Placeholder for future chart integration
- **Tables**: Sortable, filterable data tables
- **Progress Bars**: Visual revenue comparisons

### 📱 Responsive Design
```css
/* Desktop: Full sidebar + charts */
.grid-cols-1.md:grid-cols-2.lg:grid-cols-4

/* Mobile: Stacked layout */
@media (max-width: 768px) {
  /* Mobile-optimized tables và charts */
}
```

## 🔐 Permissions & Security

### 🛡️ Access Control
- **Role Required**: "Manager" role only
- **Financial Data**: Sensitive revenue/payment data
- **Action Logging**: Track financial operations

### 🔒 Security Features
```jsx
// Manager token management
localStorage.removeItem('managerToken');
localStorage.removeItem('managerUser');

// API security
headers['Authorization'] = `Bearer ${managerToken}`;
```

## 📊 State Management

### 💰 Revenue State
```jsx
// ManagerOverview
const [stats] = useState({
  totalRevenue: 2450000,
  monthlyRevenue: 850000,
  growth: 12.5,
  totalTransactions: 1234
});

// RevenueAnalysis  
const [dateFilter, setDateFilter] = useState('month');
const [selectedCategory, setSelectedCategory] = useState('all');
```

### 💸 Withdrawal State
```jsx
// WithdrawalManagement
const [withdrawalRequests, setWithdrawalRequests] = useState([]);
const [currentPage, setCurrentPage] = useState(1);
const [filters, setFilters] = useState({
  status: '',
  pageSize: 10
});
```

## 📡 API Integration

### 💰 Revenue APIs
```javascript
// Revenue data
GET /api/revenue/overview
GET /api/revenue/analysis?period=month&category=all
GET /api/revenue/reports

// Export functionality
POST /api/reports/generate
GET /api/reports/download/:id
```

### 💸 Withdrawal APIs
```javascript
// Withdrawal management
GET /api/withdrawals - Fetch withdrawal requests
PUT /api/withdrawals/:id/approve - Approve withdrawal
PUT /api/withdrawals/:id/reject - Reject withdrawal
GET /api/withdrawals/:id - Get withdrawal details
```

## 🔧 Business Logic

### 💰 Revenue Calculations
```jsx
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

// Revenue by category calculation
const categoryRevenue = categories.reduce((acc, cat) => {
  return acc + cat.revenue;
}, 0);
```

### 📊 Growth Calculations
```jsx
const calculateGrowth = (current, previous) => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};
```

## 🚀 Usage Examples

### Basic Manager Dashboard
```jsx
import ManagerDashboard from './components/manager/ManagerDashboard';

<ProtectedRoute allowedRoles={['Manager']}>
  <ManagerDashboard />
</ProtectedRoute>
```

### Revenue Analysis Integration  
```jsx
import { RevenueAnalysis } from './components/manager';

const CustomDashboard = () => {
  return (
    <div>
      <RevenueAnalysis 
        defaultPeriod="month"
        onExport={handleExport}
      />
    </div>
  );
};
```

## 🔧 Development Guidelines

### 💼 Business Requirements
- **Accuracy**: Financial data phải chính xác 100%
- **Performance**: Fast loading cho large datasets
- **Security**: Secure handling của sensitive data
- **Compliance**: Meet financial reporting standards

### 📊 Data Handling
- **Number Formatting**: Consistent currency display
- **Timezone**: Proper handling của date/time
- **Precision**: Exact calculations cho financial data
- **Validation**: Strict input validation

### 🧪 Testing Strategy
- **Financial Calculations**: Unit tests cho accuracy
- **API Integration**: Mock financial APIs
- **Edge Cases**: Handle missing/invalid data
- **Performance**: Test với large datasets

## 🔗 Related Components

- [Admin Dashboard](../admin/README.md) - Tổng quan hệ thống
- [Staff Dashboard](../staff/README.md) - Quản lý operations
- [Wallet Components](../wallet/README.md) - User wallet system
- [Withdrawal Modals](../modals/README.md) - Withdrawal detail modals
