# Tutors Components

Thư mục này chứa tất cả các component liên quan đến gia sư (tutors) trong hệ thống.

## 📁 Cấu trúc thư mục

```
tutors/
├── 📄 CalendarCustom.css          # CSS cho calendar component
├── 📄 RecommendTutorCard.jsx      # Card hiển thị gia sư được đề xuất
├── 📄 RecommendTutorList.jsx      # Danh sách gia sư được đề xuất
├── 📄 TutorCard.jsx               # Card hiển thị thông tin gia sư cơ bản
├── 📄 TutorDetail.jsx             # Chi tiết gia sư (modal/page)
├── 📄 TutorLanguageList.jsx       # Danh sách ngôn ngữ của gia sư
├── 📄 TutorProfile.jsx            # Re-export TutorProfile component
├── 📁 TutorProfile/               # Folder chứa TutorProfile components
└── 📄 README.md                   # File này
```

## 🎯 Mục đích từng component

### Core Components

- **`TutorProfile/`**: Folder chứa toàn bộ logic và UI cho trang profile gia sư
- **`TutorDetail.jsx`**: Component hiển thị thông tin chi tiết gia sư (có thể dùng trong modal)
- **`TutorCard.jsx`**: Component card nhỏ gọn để hiển thị gia sư trong danh sách

### List & Recommendation Components

- **`RecommendTutorList.jsx`**: Danh sách gia sư được hệ thống đề xuất
- **`RecommendTutorCard.jsx`**: Card hiển thị gia sư trong danh sách đề xuất
- **`TutorLanguageList.jsx`**: Component hiển thị danh sách ngôn ngữ mà gia sư giảng dạy

### Styling

- **`CalendarCustom.css`**: CSS tùy chỉnh cho calendar component

## 🚀 Cách sử dụng

### Import TutorProfile Component

```javascript
import TutorProfile from './components/tutors/TutorProfile';

// Sử dụng trong component
<TutorProfile 
  user={user}
  onRequireLogin={handleRequireLogin}
  fetchTutorDetail={fetchTutorDetail}
  requestTutorVerification={requestTutorVerification}
  uploadCertificate={uploadCertificate}
/>
```

### Import các component khác

```javascript
import TutorCard from './components/tutors/TutorCard';
import RecommendTutorList from './components/tutors/RecommendTutorList';
import TutorLanguageList from './components/tutors/TutorLanguageList';
```

## 🔄 Dependencies

Các component này sử dụng:

- **Material-UI**: Cho UI components
- **React Router**: Cho navigation
- **React Icons**: Cho icons
- **React Toastify**: Cho notifications
- **API services**: Từ `../api/auth.jsx`

## 📝 Quy tắc phát triển

### Khi thêm component mới:

1. **Đặt tên**: Sử dụng PascalCase và có tiền tố `Tutor`
2. **Props**: Định nghĩa rõ ràng PropTypes hoặc TypeScript
3. **Styling**: Sử dụng Material-UI styled components
4. **API calls**: Import từ `../api/auth.jsx`
5. **Documentation**: Cập nhật README này

### Quy tắc coding:

```javascript
// ✅ Tốt - Component với props rõ ràng
const TutorCard = ({ 
  tutor, 
  onViewDetail, 
  showRating = true,
  compact = false 
}) => {
  // Component logic
};

// ✅ Tốt - Sử dụng styled components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  transition: 'all 0.3s ease',
  // styles...
}));
```

## 🧪 Testing

### Unit Testing
```bash
npm test -- --testPathPattern=tutors
```

### E2E Testing
Các component này được test trong:
- User profile flows
- Tutor search flows
- Booking flows

## 🔍 Liên quan đến

- **`/pages/`**: Các trang sử dụng tutor components
- **`/api/auth.jsx`**: API services cho tutors
- **`/utils/`**: Utility functions được sử dụng
- **`/hooks/`**: Custom hooks cho tutor logic

## 📞 Hỗ trợ

Nếu có thắc mắc về các component này:
1. Đọc documentation trong từng file component
2. Xem folder `TutorProfile/` để hiểu cấu trúc chi tiết
3. Kiểm tra tests để hiểu cách sử dụng
4. Liên hệ team để được hỗ trợ
