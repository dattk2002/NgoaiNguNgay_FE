# TutorProfile Components

Folder này chứa tất cả các component đã được refactor từ file `TutorProfile.jsx` gốc (4566 dòng) để dễ quản lý và bảo trì.

## 🎯 Tổng quan

TutorProfile là một component phức tạp bao gồm:
- 3 tabs chính (Thông tin chung, Kỹ năng & Ngôn ngữ, Bài học)
- Nhiều dialogs/modals
- Quản lý lịch trình tuần
- CRUD operations cho bài học
- Upload và quản lý chứng chỉ
- Booking management

## 📁 Cấu trúc Components

```
TutorProfile/
├── 📄 TutorProfileMain.jsx          # Component chính (~900 dòng)
├── 📄 GeneralInfoTab.jsx            # Tab 1: Thông tin chung
├── 📄 SkillsLanguagesTab.jsx        # Tab 2: Kỹ năng & Ngôn ngữ
├── 📄 LessonsTab.jsx                # Tab 3: Bài học (table format)
├── 📄 BookingDetailDialog.jsx       # Dialog booking details
├── 📄 LessonDialog.jsx              # Dialog tạo/sửa bài học
├── 📄 LessonSelectionDialog.jsx     # Dialog chọn bài học cho offer
├── 📄 EditPatternDialog.jsx         # Dialog chỉnh sửa lịch trình
├── 📄 Skeletons.jsx                 # Loading skeleton components
├── 📄 utils.js                      # Utility functions
├── 📄 constants.js                  # Constants và configs
├── 📄 index.js                      # Export central
└── 📄 README.md                     # File này
```

## 🧩 Chi tiết từng Component

### 1. **TutorProfileMain.jsx** - Component chính
**Mục đích**: Điều phối tất cả các component con và quản lý state chính

**Props**:
```javascript
{
  user: Object,              // Current user info
  onRequireLogin: Function,  // Callback khi cần login
  fetchTutorDetail: Function,// API call để lấy tutor data
  requestTutorVerification: Function, // API call xác minh
  uploadCertificate: Function // API call upload chứng chỉ
}
```

**State quản lý**:
- `tutorData`: Thông tin gia sư
- `lessons`: Danh sách bài học
- `documents`: Danh sách chứng chỉ
- `weeklyPatterns`: Lịch trình tuần
- `learnerRequests`: Yêu cầu từ học viên

### 2. **GeneralInfoTab.jsx** - Tab thông tin chung
**Nội dung**:
- Email gia sư
- Giới thiệu về tôi
- Phương pháp giảng dạy
- Lịch trình khả dụng (calendar view)
- Yêu cầu từ học viên (chỉ owner)

### 3. **SkillsLanguagesTab.jsx** - Tab kỹ năng
**Nội dung**:
- Danh sách ngôn ngữ và trình độ
- Trạng thái xác minh
- Quản lý chứng chỉ (CRUD)

### 4. **LessonsTab.jsx** - Tab bài học
**Nội dung**:
- Table hiển thị lessons
- CRUD operations cho lessons
- Format: mỗi lesson = 1 hàng, thông tin theo cột

### 5. **BookingDetailDialog.jsx** - Dialog booking
**Mục đích**: 
- Xem chi tiết yêu cầu từ học viên
- Chọn time slots để tạo offer
- Navigate qua các tuần

**Features**:
- Hiển thị slots đã chọn trước đó
- Chọn thêm slots mới
- Temporary slots với localStorage

### 6. **LessonDialog.jsx** - Dialog CRUD lesson
**Mục đích**: Tạo mới hoặc chỉnh sửa bài học

**Fields**:
- Tên bài học
- Ngôn ngữ (dropdown with flags)
- Danh mục
- Giá (với format số)
- Đối tượng học
- Yêu cầu tiên quyết
- Mô tả

**Validation**: Tất cả fields bắt buộc + giá phải > 0

### 7. **LessonSelectionDialog.jsx** - Dialog chọn lesson
**Mục đích**: Chọn bài học khi gửi offer cho học viên

### 8. **EditPatternDialog.jsx** - Dialog chỉnh sửa lịch trình
**Mục đích**: 
- Chỉnh sửa lịch trình khả dụng theo tuần
- Interactive calendar grid
- Save/Delete patterns

### 9. **Skeletons.jsx** - Loading states
**Components**:
- `WeeklyScheduleSkeleton`: Cho calendar
- `BookingDetailSkeleton`: Cho booking dialog
- `TutorProfileSkeleton`: Cho toàn bộ page

## 🛠 Utility Files

### **utils.js** - Helper functions
```javascript
// Date utilities
getNextMondayDateUTC()
getWeekRange(date)
formatDateRange(start, end)

// Calendar utilities  
getPatternForWeek(patterns, weekStart)
buildAvailabilityData(pattern, timeRanges)
getSlotDateTime(weekStart, dayInWeek, slotIndex)

// LocalStorage utilities
saveTemporarySlots(weekStart, learnerId, slots)
loadTemporarySlots(weekStart, learnerId)
clearTemporarySlots(weekStart, learnerId)

// Format utilities
getProficiencyLabel(level)
getLanguageName(code)
formatDate(date)
```

### **constants.js** - Cấu hình
```javascript
// Time slots cho calendar
timeRanges = ["8:00", "8:30", ..., "22:30"]

// Days of week
daysOfWeek = ["Thứ 2", ..., "Chủ nhật"]

// Status options cho offers
statusOptions = [CONFIRMED, PENDING, REJECTED, CANCELLED]

// Default form data
defaultLessonForm = { name: "", description: "", ... }
```

## 🔄 Data Flow

### 1. **Component Initialization**
```
TutorProfileMain loads
→ Fetch tutor data
→ Fetch lessons, documents, patterns
→ Set up state
→ Render tabs
```

### 2. **Tab Navigation**
```
User clicks tab
→ handleTabChange()
→ selectedTab state updates
→ Conditional rendering of tab content
```

### 3. **Lesson Management**
```
Create: handleCreateLesson() 
→ Open LessonDialog 
→ Fill form 
→ handleSaveLesson() 
→ API call 
→ Update lessons state

Edit: handleEditLesson(lesson)
→ Pre-fill form with lesson data
→ Same flow as create

Delete: handleDeleteLesson(lesson)
→ Show ConfirmDialog
→ API call
→ Remove from lessons state
```

### 4. **Booking Flow**
```
Click learner request
→ handleOpenBookingDetail()
→ Fetch offer details
→ Show BookingDetailDialog
→ Select time slots
→ handleProceedWithOffer()
→ Show LessonSelectionDialog
→ Select lesson
→ handleSendOffer()
→ Create/Update offer via API
```

## 🎨 Styling Guidelines

### **Styled Components Pattern**
```javascript
const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: "8px",
  textTransform: "none",
  fontWeight: 500,
  // ...
}));
```

### **Consistent Spacing**
- Margin bottom: `mb: 4` cho sections
- Padding: `p: 3` cho dialogs
- Gap: `gap: 2` cho flex layouts

### **Color Scheme**
- Primary: Material-UI primary
- Success: `success.main` cho verified status
- Warning: `warning.main` cho pending
- Error: `error.main` cho failed/rejected

## 🔧 API Integration

### **Imported from `../../api/auth.jsx`**
```javascript
// Lesson APIs
fetchTutorLesson(tutorId)
createLesson(lessonData)
updateLesson(lessonId, lessonData)  
deleteLesson(lessonId)

// Pattern APIs
fetchTutorWeeklyPattern(tutorId)
editTutorWeeklyPattern(patternData)
deleteTutorWeeklyPattern(patternId)

// Booking APIs
tutorBookingTimeSlotFromLearner()
createTutorBookingOffer(offerData)
updateTutorBookingOfferByOfferId(offerId, data)

// Document APIs
fetchDocumentsByTutorId(tutorId)
deleteDocument(documentId)
```

## 🧪 Testing Strategy

### **Unit Tests**
```javascript
// Test utility functions
describe('utils', () => {
  test('getNextMondayDateUTC should return next Monday', () => {
    // test logic
  });
});

// Test component rendering
describe('GeneralInfoTab', () => {
  test('should render tutor email', () => {
    // test logic
  });
});
```

### **Integration Tests**
- Test tab switching
- Test lesson CRUD flow
- Test booking flow
- Test form validation

## 🚀 Cách sử dụng

### **Import và sử dụng**
```javascript
// Main component
import TutorProfile from './TutorProfile';

// Individual components (nếu cần)
import { GeneralInfoTab, LessonsTab } from './TutorProfile';

// Sử dụng
<TutorProfile 
  user={currentUser}
  fetchTutorDetail={fetchTutorDetailAPI}
  // other props...
/>
```

### **Extend với component mới**
1. Tạo component trong folder này
2. Export trong `index.js`  
3. Import và sử dụng trong `TutorProfileMain.jsx`
4. Cập nhật README này

### **Thêm tab mới**
1. Tạo component `NewTab.jsx`
2. Thêm vào imports trong `TutorProfileMain.jsx`
3. Thêm Tab trong `<Tabs>` component
4. Thêm conditional rendering trong tab content

## 🐛 Debugging

### **Common Issues**

1. **State không update**: Kiểm tra dependencies trong useEffect
2. **API calls fail**: Check network tab và error handling
3. **LocalStorage issues**: Clear browser storage và test lại
4. **Calendar not rendering**: Check weeklyPatterns và availabilityData

### **Debug Tools**
```javascript
// Enable debug logs
console.log("Fetched lessons:", lessonData);
console.log("Current pattern:", currentPattern);
console.log("Temporary slots:", temporarilySelectedSlots);
```

## 📈 Performance Optimization

### **Already Implemented**
- Memoized calculations với `useMemo`
- Conditional rendering để tránh re-render không cần thiết
- Skeleton loading states
- Debounced API calls (nếu cần)

### **Future Improvements**
- React.memo cho các component con
- Virtual scrolling cho large lesson lists
- Image lazy loading cho certificates
- Code splitting per tab

## 🔮 Future Enhancements

### **Planned Features**
- Real-time notifications
- Advanced filtering cho lessons
- Bulk operations
- Export data functionality
- Mobile-responsive improvements

### **Architecture Improvements**
- Move to React Query cho API state management
- Add TypeScript support
- Implement MSW cho testing
- Add Storybook stories

## 📞 Support

**Khi cần hỗ trợ:**
1. Đọc documentation này
2. Check code comments trong từng file
3. Review git history để hiểu changes
4. Contact team lead nếu cần thiết

**Contribution Guidelines:**
1. Follow existing code style
2. Add JSDoc comments cho complex functions
3. Update this README khi thêm features mới
4. Write tests cho new components
5. Test thoroughly trước khi commit
