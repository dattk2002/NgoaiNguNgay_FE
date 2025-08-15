# Tutor Application Metadata Documentation

## Tổng quan
File này mô tả metadata cho quy trình xác thực gia sư, bao gồm các trạng thái (status) và hành động (action) được sử dụng trong hệ thống.

## Application Status (Trạng thái hồ sơ)

| Numeric Value | Name | Description | Vietnamese Text |
|---------------|------|-------------|-----------------|
| 0 | UnSubmitted | Chưa gửi hồ sơ | Chưa gửi hồ sơ |
| 1 | PendingVerification | Đang chờ xác minh | Đang chờ xác minh |
| 2 | RevisionRequested | Yêu cầu chỉnh sửa | Yêu cầu chỉnh sửa |
| 3 | PendingReverification | Đang chờ xác minh lại | Đang chờ xác minh lại |
| 4 | Verified | Đã xác minh | Đã xác minh |

### Mô tả chi tiết:
- **UnSubmitted (0)**: Hồ sơ đã được tạo nhưng chưa gửi cho hệ thống xác minh
- **PendingVerification (1)**: Hồ sơ đã gửi và đang chờ nhân viên xác minh
- **RevisionRequested (2)**: Nhân viên yêu cầu chỉnh sửa hồ sơ
- **PendingReverification (3)**: Hồ sơ đã chỉnh sửa và đang chờ xác minh lại
- **Verified (4)**: Hồ sơ đã được xác minh thành công

## Revision Action (Hành động xem xét)

| Numeric Value | Name | Description | Vietnamese Text |
|---------------|------|-------------|-----------------|
| 0 | RequestRevision | Yêu cầu chỉnh sửa | Yêu cầu chỉnh sửa |
| 1 | Approve | Phê duyệt | Phê duyệt |
| 2 | Reject | Từ chối | Từ chối |

### Mô tả chi tiết:
- **RequestRevision (0)**: Yêu cầu gia sư chỉnh sửa hồ sơ
- **Approve (1)**: Phê duyệt hồ sơ và xác minh gia sư
- **Reject (2)**: Từ chối hồ sơ

## Hardcopy Submit Status (Trạng thái hồ sơ giấy)

| Numeric Value | Name | Description | Vietnamese Text |
|---------------|------|-------------|-----------------|
| 0 | Pending | Đang chờ xử lý | Đang chờ xử lý |
| 1 | Processing | Đang xử lý | Đang xử lý |
| 2 | Verified | Đã xác minh | Đã xác minh |
| 3 | Rejected | Đã từ chối | Đã từ chối |

### Mô tả chi tiết:
- **Pending (0)**: Hồ sơ giấy đang chờ xử lý
- **Processing (1)**: Hồ sơ giấy đang được xem xét
- **Verified (2)**: Hồ sơ giấy đã được xác minh
- **Rejected (3)**: Hồ sơ giấy đã bị từ chối

## Cách sử dụng trong code

### Import constants:
```javascript
import { 
    APPLICATION_STATUS, 
    REVISION_ACTION, 
    getStatusText, 
    getStatusColorClass,
    getActionText 
} from '../../utils/tutorApplicationConstants';
```

### Sử dụng trong API calls:
```javascript
// Phê duyệt hồ sơ
await reviewTutorApplication(applicationId, REVISION_ACTION.APPROVE, notes);

// Từ chối hồ sơ
await reviewTutorApplication(applicationId, REVISION_ACTION.REJECT, notes);

// Yêu cầu chỉnh sửa
await reviewTutorApplication(applicationId, REVISION_ACTION.REQUEST_REVISION, notes);
```

### Hiển thị trạng thái:
```javascript
// Lấy text hiển thị
const statusText = getStatusText(application.status);

// Lấy class CSS cho màu sắc
const colorClass = getStatusColorClass(application.status);
```

## Lưu ý quan trọng

1. **Tất cả các giá trị numeric phải khớp chính xác** với metadata từ API
2. **Không được thay đổi các giá trị numeric** mà chỉ thay đổi text hiển thị
3. **Sử dụng constants** thay vì hardcode các giá trị số
4. **Cập nhật metadata** khi API thay đổi

## Files liên quan

- `src/utils/tutorApplicationConstants.js` - Chứa các constants và helper functions
- `src/components/staff/TutorManagement.jsx` - Component quản lý hồ sơ gia sư
- `src/components/api/auth.jsx` - API functions cho tutor application
