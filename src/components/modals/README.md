# Dispute Management System

## Tổng quan

Hệ thống quản lý khiếu nại cho phép học viên tạo khiếu nại, gia sư phản hồi, và nhân viên giải quyết các tranh chấp trong hệ thống đặt lịch học.

## Flow khiếu nại

### 1. Learner Flow (Luồng học viên)

#### 1.1 Tạo khiếu nại
- **Component**: `CreateDisputeModal.jsx`
- **Trigger**: Từ `LessonManagement.jsx` hoặc `MyBookingPage.jsx`
- **API**: `POST /api/disputes`
- **Payload**:
  ```json
  {
    "bookingId": "string",
    "reason": "string (min 10 chars)",
    "evidenceUrls": ["string"]
  }
  ```
- **Features**:
  - Hiển thị thông tin khóa học (tên, giáo viên, ngày tạo, số buổi, tổng tiền)
  - Nhập lý do khiếu nại (tối thiểu 10 ký tự)
  - Thêm liên kết hỗ trợ (URL)
  - Upload tài liệu hỗ trợ (JPG, PNG, GIF, PDF, MP4, max 10MB/file, 5 files)
  - Validation form real-time

#### 1.2 Xem danh sách khiếu nại
- **Component**: `MyDisputes.jsx`
- **API**: `GET /api/disputes/learner?onlyActive=true|false`
- **Features**:
  - Hiển thị danh sách khiếu nại với thống kê
  - Filter theo trạng thái (active/inactive)
  - Xem chi tiết từng khiếu nại

#### 1.3 Xem chi tiết khiếu nại
- **Component**: `DisputeDetailModal.jsx` (learner view)
- **API**: `GET /api/disputes/learner/{disputeId}`
- **Features**:
  - Hiển thị đầy đủ thông tin khiếu nại
  - Thông tin khóa học bị khiếu nại
  - Lý do khiếu nại và tài liệu hỗ trợ
  - Trạng thái và timeline
  - Nút "Rút khiếu nại" với confirm modal

#### 1.4 Rút khiếu nại
- **API**: `POST /api/disputes/withdraw`
- **Payload**:
  ```json
  {
    "disputeId": "string"
  }
  ```

### 2. Tutor Flow (Luồng gia sư)

#### 2.1 Xem danh sách khiếu nại
- **Component**: `TutorDisputes.jsx`
- **Location**: Tab "Quản lý khiếu nại" trong `TutorManagementDashboard.jsx`
- **API**: `GET /api/disputes/tutor?page=1&pageSize=10&status=string`
- **Features**:
  - Hiển thị danh sách khiếu nại từ học viên
  - Thống kê (Total, Pending, Resolved)
  - Xem chi tiết từng khiếu nại

#### 2.2 Xem chi tiết khiếu nại
- **Component**: `DisputeDetailModal.jsx` (tutor view)
- **API**: `GET /api/disputes/tutor/{disputeId}`
- **Features**:
  - Hiển thị thông tin khiếu nại
  - Thông tin học viên và khóa học
  - Lý do khiếu nại và tài liệu hỗ trợ
  - Form phản hồi (nếu có thể)

#### 2.3 Phản hồi khiếu nại
- **API**: `POST /api/disputes/respond`
- **Payload**:
  ```json
  {
    "disputeId": "string",
    "response": "string (min 10 chars)"
  }
  ```
- **Constraints**:
  - Chỉ phản hồi được khi trạng thái = `PendingReconciliation` (0)
  - Chỉ trong 24h kể từ khi nhận khiếu nại
  - Response phải có ít nhất 10 ký tự

### 3. Staff Flow (Luồng nhân viên)

#### 3.1 Xem danh sách khiếu nại
- **Component**: `StaffDisputes.jsx` (cần tạo)
- **Location**: Tab "Quản lý khiếu nại" trong Staff Dashboard
- **API**: `GET /api/disputes/staff?status=string&search=string`
- **Features**:
  - Hiển thị tất cả khiếu nại trong hệ thống
  - Filter theo trạng thái và tìm kiếm
  - Thống kê tổng quan

#### 3.2 Xem chi tiết khiếu nại
- **Component**: `DisputeDetailModal.jsx` (staff view)
- **API**: `GET /api/disputes/staff/{disputeId}`
- **Features**:
  - Hiển thị đầy đủ thông tin khiếu nại
  - Thông tin học viên và gia sư
  - Lý do khiếu nại và phản hồi
  - Form giải quyết khiếu nại

#### 3.3 Giải quyết khiếu nại
- **API**: `POST /api/disputes/resolve`
- **Payload**:
  ```json
  {
    "disputeId": "string",
    "resolution": 3|4|5,
    "notes": "string (required)"
  }
  ```
- **Resolution Options**:
  - `3`: StaffLearnerWin (Học viên thắng)
  - `4`: StaffTutorWin (Gia sư thắng)
  - `5`: StaffDraw (Hòa)

## Components

### Core Components

#### `CreateDisputeModal.jsx`
- Modal tạo khiếu nại cho học viên
- Props: `{ isOpen, onClose, bookingData, booking, onSuccess }`
- Features: Form validation, file upload, URL input

#### `DisputeDetailModal.jsx`
- Modal xem chi tiết khiếu nại (multi-role)
- Props: `{ isOpen, onClose, dispute, disputeId, isTutorView, isStaffView, onDisputeUpdated, disputeMetadata }`
- Features: Conditional rendering theo role, actions theo trạng thái

#### `LegalDocumentModal.jsx`
- Modal hiển thị tài liệu pháp lý theo category
- Props: `{ isOpen, onClose, category }`
- Features: Fetch và hiển thị legal document, responsive design, loading states
- Usage: Được sử dụng trong LoginModal và SignUpModal để hiển thị điều khoản dịch vụ

#### `MyDisputes.jsx`
- Component hiển thị danh sách khiếu nại cho học viên
- Features: Filter, statistics, dispute list

#### `TutorDisputes.jsx`
- Component hiển thị danh sách khiếu nại cho gia sư
- Features: Statistics, dispute list, tutor view

### Integration Points

#### `LessonManagement.jsx`
- Hiển thị nút "Khiếu nại" hoặc badge "Đã khiếu nại"
- Logic kiểm tra khiếu nại đã tồn tại
- Trigger `CreateDisputeModal`

#### `TutorManagementDashboard.jsx`
- Thêm tab "Quản lý khiếu nại"
- Render `TutorDisputes` component

## API Functions (auth.jsx)

### Learner APIs
```javascript
createDispute(disputeData)
fetchLearnerDisputes(onlyActive)
fetchLearnerDisputeDetail(disputeId)
withdrawDispute(withdrawData)
```

### Tutor APIs
```javascript
fetchTutorDisputes(page, pageSize, status)
fetchTutorDisputeDetail(disputeId)
respondToDispute(responseData)
```

### Staff APIs
```javascript
fetchStaffDisputes(params)
fetchStaffDisputeDetail(disputeId)
resolveDispute(resolveData)
fetchDisputeMetadata()
```

### Utility APIs
```javascript
fetchBookingInfo(bookingId)
```

## Data Structures

### Dispute Status
- `0`: PendingReconciliation (Chờ hòa giải)
- `1`: ReconciliationInProgress (Đang hòa giải)
- `2`: ReconciliationCompleted (Hòa giải hoàn tất)
- `3`: StaffLearnerWin (Học viên thắng)
- `4`: StaffTutorWin (Gia sư thắng)
- `5`: StaffDraw (Hòa)

### Booking Data Structure
```javascript
{
  id: "string",
  LessonName: "string",
  tutorName: "string",
  createdTime: "ISO string",
  bookedSlots: [...], // Array để đếm số buổi
  totalPrice: number,
  lessonSnapshot: {
    name: "string"
  }
}
```

## UI/UX Features

### Responsive Design
- Mobile-friendly modals
- Grid layout cho thông tin khóa học
- Scrollable content areas

### User Experience
- Loading states với spinners
- Toast notifications cho actions
- Confirm modals cho critical actions
- Real-time form validation
- Drag & drop file upload

### Visual Indicators
- Status badges với màu sắc
- Progress indicators
- Icon-based actions
- Conditional button states

## Error Handling

### API Error Handling
- Consistent error parsing trong `callApi`
- User-friendly error messages
- Graceful degradation

### Form Validation
- Client-side validation
- Real-time feedback
- Character count limits
- File type/size validation

### Fallback UI
- Loading states
- Error states với retry buttons
- Empty states
- N/A values cho missing data

## Authentication

### Token Management
- `accessToken` cho learner/tutor
- `staffToken` cho staff operations
- Automatic token fallback

### Role-based Access
- Conditional rendering theo user role
- API endpoint protection
- UI element visibility control

## Future Enhancements

### Potential Improvements
1. **Real-time Updates**: WebSocket cho live dispute updates
2. **File Upload**: Direct upload to cloud storage
3. **Email Notifications**: Auto-notify parties of status changes
4. **Dispute Templates**: Pre-defined dispute reasons
5. **Escalation System**: Auto-escalate unresolved disputes
6. **Analytics Dashboard**: Dispute statistics và trends
7. **Multi-language Support**: Internationalization
8. **Mobile App**: Native mobile experience

### Technical Debt
1. **Code Splitting**: Lazy load dispute components
2. **State Management**: Consider Redux/Zustand for complex state
3. **Testing**: Unit tests cho dispute logic
4. **Performance**: Optimize large dispute lists
5. **Accessibility**: ARIA labels và keyboard navigation

## Troubleshooting

### Common Issues
1. **Modal không hiển thị**: Check `isOpen` prop và z-index
2. **Data không load**: Verify API endpoints và authentication
3. **Form validation fails**: Check character limits và required fields
4. **File upload errors**: Verify file types và size limits
5. **Role-based access issues**: Check token type và user permissions

### Debug Tools
- Console logging trong components
- Network tab cho API calls
- React DevTools cho state inspection
- Browser dev tools cho UI debugging
