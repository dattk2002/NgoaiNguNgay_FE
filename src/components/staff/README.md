# Staff Components

👨‍💻 **Mô tả**: Các components dành cho Staff Dashboard - quản lý gia sư và xử lý báo cáo trong hệ thống NgoaiNguNgay.

## 🏗️ Cấu trúc components

```
src/components/staff/
├── StaffDashboard.jsx       # Layout chính staff dashboard
├── DashboardOverview.jsx    # Tổng quan và thống kê
├── TutorManagement.jsx      # Quản lý gia sư và hồ sơ đăng ký
└── ReportManagement.jsx     # Quản lý báo cáo từ người dùng
```

## 🔧 Chi tiết components

### 🏠 StaffDashboard.jsx
**Mục đích**: Layout chính của staff dashboard với navigation

**Tính năng**:
- 🔵 Blue theme design (operational focus)
- 📋 3 tab navigation chính
- 🔐 Staff authentication management
- 📱 Responsive sidebar layout
- 🎨 Custom CSS reset cho focus outlines
- 🚪 Secure logout functionality

**Navigation Menu**:
- 📊 **overview**: Tổng quan
- 👩‍🏫 **tutor-management**: Quản lý gia sư
- 📋 **report-management**: Quản lý báo cáo

**CSS Customization**:
```javascript
// Global focus outline removal
const globalStyles = `
  * { outline: none !important; }
  button:focus { outline: none !important; }
`;
```

### 📊 DashboardOverview.jsx
**Mục đích**: Hiển thị thống kê tổng quan và hoạt động gần đây

**Key Statistics**:
- 👥 **Tổng số gia sư**: 156 (+12%)
- ⏳ **Gia sư chờ duyệt**: 23 (+5)
- 📋 **Báo cáo chờ xử lý**: 8 (-2)
- ✏️ **Yêu cầu thông tin**: 15 (+3)

**Recent Activities**:
```jsx
const recentActivities = [
  {
    type: 'tutor_approval',
    message: 'Gia sư Nguyễn Văn A đã được phê duyệt',
    time: '2 giờ trước',
    priority: 'success'
  },
  {
    type: 'report_received', 
    message: 'Nhận được báo cáo từ học viên về gia sư Trần Thị B',
    time: '3 giờ trước',
    priority: 'warning'
  }
];
```

**Quick Actions**:
- ✅ **Phê duyệt gia sư**: 23 pending
- ⚠️ **Xử lý báo cáo**: 8 pending
- 📝 **Yêu cầu thông tin**: 15 pending
- 👁️ **Xem hồ sơ**: 45 profiles

**Visual Elements**:
- 📊 **Registration Chart**: 6-month trend
- 📅 **Calendar Widget**: Current month view
- 🎨 **Color-coded priorities**: Green, yellow, red badges

### 👩‍🏫 TutorManagement.jsx
**Mục đích**: Quản lý hồ sơ gia sư và quy trình phê duyệt

**Main Features**:
- 📂 **Tab Navigation**: Pending, Approved, Need Info, Student Requests
- 🔍 **Search & Filter**: Tìm kiếm theo tên, lọc theo môn học
- 📊 **Statistics Overview**: Tổng đơn, đã duyệt, chờ xử lý
- 👁️ **Profile Viewer**: Modal chi tiết hồ sơ gia sư

**Tab Structure**:
```jsx
const tabs = [
  { id: 'pending', title: 'Chờ duyệt', count: pendingApplications.length },
  { id: 'approved', title: 'Đã duyệt', count: 156 },
  { id: 'need-info', title: 'Cần thông tin', count: 15 },
  { id: 'student-requests', title: 'Yêu cầu từ học viên', count: 0 }
];
```

**Tutor Actions**:
- ✅ **Approve**: Phê duyệt hồ sơ → Convert learner to tutor
- ❌ **Reject**: Từ chối với lý do cụ thể
- 📝 **Request Info**: Yêu cầu bổ sung thông tin
- 👁️ **View Profile**: Xem chi tiết đầy đủ

**Profile Detail Modal**:
- 👤 **Basic Info**: Tên, email, avatar
- 🏷️ **Languages**: Ngôn ngữ và trình độ
- 🎯 **Skills**: Hashtags và chứng chỉ
- 📄 **Documents**: File đính kèm với preview/download
- 📝 **Description**: Mô tả chi tiết

**API Integration**:
```jsx
// Fetch pending applications
const data = await fetchPendingApplications(currentPage, pageSize);

// Review tutor application
await reviewTutorApplication(tutorId, status, reviewNotes);
// status: 1=approve, 2=reject, 3=request_info
```

### 📋 ReportManagement.jsx
**Mục đích**: Xử lý báo cáo và khiếu nại từ người dùng

**Report Types**:
- ⚠️ **inappropriate_behavior**: Hành vi không phù hợp
- 📉 **poor_quality**: Chất lượng giảng dạy kém
- 📅 **schedule_issue**: Vấn đề lịch học
- 🔧 **technical_issue**: Sự cố kỹ thuật

**Priority Levels**:
- 🔴 **High**: Cần xử lý ngay lập tức
- 🟡 **Medium**: Xử lý trong ngày
- 🟢 **Low**: Xử lý khi có thời gian

**Report Management Flow**:
```jsx
const reportTypes = [
  { id: 'inappropriate_behavior', label: 'Hành vi không phù hợp' },
  { id: 'poor_quality', label: 'Chất lượng kém' },
  { id: 'schedule_issue', label: 'Vấn đề lịch học' },
  { id: 'technical_issue', label: 'Sự cố kỹ thuật' }
];
```

**Report Actions**:
- 👁️ **View Details**: Xem chi tiết báo cáo
- ✅ **Resolve**: Đánh dấu đã xử lý
- 📞 **Contact Reporter**: Liên hệ người báo cáo
- 📞 **Contact Tutor**: Liên hệ gia sư bị báo cáo

**Report Detail Modal**:
- 📝 **Report Info**: Tiêu đề, loại, mức độ ưu tiên
- 👤 **Reporter Info**: Thông tin người báo cáo
- 👩‍🏫 **Tutor Info**: Thông tin gia sư bị báo cáo
- 📄 **Content**: Nội dung chi tiết báo cáo
- 🛠️ **Resolution Form**: Form xử lý báo cáo

**Filter Options**:
- 🔍 **Search**: Tìm kiếm theo nội dung
- 🏷️ **Report Type**: Lọc theo loại báo cáo
- 📊 **Priority**: Lọc theo mức độ ưu tiên
- 📋 **Status**: Pending vs Resolved

## 🎨 UI/UX Features

### 🎯 Design System
- **Blue Theme**: Professional, trustworthy design
- **Card-based Layout**: Clean, organized information
- **Modal System**: Detailed views không làm mất context
- **Responsive Tables**: Mobile-friendly data display

### 📱 Responsive Design
```css
/* Desktop: Full feature set */
.grid-cols-1.md:grid-cols-2.lg:grid-cols-3

/* Tablet: Adjusted columns */
.grid-cols-1.md:grid-cols-2

/* Mobile: Stacked layout */
.grid-cols-1
```

### ✨ Interactive Elements
- **Hover Effects**: Subtle animations trên cards
- **Loading States**: Spinners during API calls
- **Toast Notifications**: Success/error feedback
- **Keyboard Navigation**: Accessible interactions

## 🔐 Permissions & Security

### 🛡️ Access Control
- **Role Required**: "Staff" role only
- **Tutor Data Access**: Read tutor applications và profiles
- **Report Processing**: Handle user complaints
- **Action Logging**: Track staff operations

### 🔒 Security Measures
```jsx
// Staff authentication
localStorage.removeItem('staffToken');
localStorage.removeItem('staffUser');

// API authorization
headers['Authorization'] = `Bearer ${staffToken}`;
```

## 📊 State Management

### 👩‍🏫 Tutor Management State
```jsx
// TutorManagement
const [activeTab, setActiveTab] = useState('pending');
const [pendingApplications, setPendingApplications] = useState([]);
const [selectedTutor, setSelectedTutor] = useState(null);
const [reviewingTutor, setReviewingTutor] = useState(null);
const [reviewNotes, setReviewNotes] = useState('');
```

### 📋 Report Management State  
```jsx
// ReportManagement
const [activeTab, setActiveTab] = useState('pending');
const [selectedReport, setSelectedReport] = useState(null);
const [pendingReports, setPendingReports] = useState([]);
const [resolvedReports, setResolvedReports] = useState([]);
```

## 📡 API Integration

### 👩‍🏫 Tutor APIs
```javascript
// Tutor management
GET /api/tutor-applications/pending - Fetch pending applications
GET /api/tutor-applications/:id - Get application details
PUT /api/tutor-applications/:id/review - Review application

// Student requests
GET /api/student-requests - Fetch student tutor requests
```

### 📋 Report APIs
```javascript
// Report management  
GET /api/reports/pending - Fetch pending reports
GET /api/reports/resolved - Fetch resolved reports
PUT /api/reports/:id/resolve - Mark report as resolved
POST /api/reports/:id/contact - Contact reporter/tutor
```

## 🔧 Business Logic

### ✅ Tutor Approval Process
```jsx
const handleApprove = async (tutor) => {
  // 1. Validate tutor application
  // 2. Update tutor status to approved
  // 3. Convert learner account to tutor role
  // 4. Send notification to tutor
  // 5. Update local state
};
```

### 📋 Report Resolution
```jsx
const handleResolveReport = async (reportId, resolution) => {
  // 1. Validate resolution details
  // 2. Update report status
  // 3. Log resolution action
  // 4. Notify involved parties
  // 5. Update UI state
};
```

## 🚀 Usage Examples

### Basic Staff Dashboard
```jsx
import StaffDashboard from './components/staff/StaffDashboard';

<ProtectedRoute allowedRoles={['Staff']}>
  <StaffDashboard />
</ProtectedRoute>
```

### Tutor Management Integration
```jsx
import { TutorManagement } from './components/staff';

const CustomStaffPanel = () => {
  const handleTutorApproved = (tutor) => {
    // Handle approved tutor
    console.log('Approved:', tutor.name);
  };

  return (
    <TutorManagement 
      onTutorApproved={handleTutorApproved}
    />
  );
};
```

## 🔧 Development Guidelines

### 📋 Workflow Standards
- **Review Process**: Structured approval workflow
- **Documentation**: Detailed review notes
- **Communication**: Clear feedback to tutors
- **Consistency**: Standardized review criteria

### 🧪 Testing Approach
- **Approval Flow**: Test complete tutor approval process
- **Report Handling**: Test report resolution workflow
- **Edge Cases**: Handle invalid/incomplete applications
- **Performance**: Test với large datasets

### 📊 Data Handling
- **File Management**: Handle tutor document uploads
- **Status Tracking**: Accurate state management
- **Search Performance**: Efficient filtering và pagination
- **Cache Strategy**: Optimize frequent queries

## 🔗 Related Components

- [Admin Dashboard](../admin/README.md) - Higher-level system management
- [Tutor Components](../tutors/README.md) - Tutor-facing features
- [Modal Components](../modals/README.md) - Shared modals
- [Student Request Management](../tutorManagement/README.md) - Student request handling
