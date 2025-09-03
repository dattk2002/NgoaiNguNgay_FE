# Hướng dẫn sử dụng LegalDocumentModal

## Tổng quan
`LegalDocumentModal` là component hiển thị điều khoản dịch vụ và chính sách bảo mật với yêu cầu người dùng phải đồng ý trước khi có thể đóng modal.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | boolean | ✅ | Trạng thái hiển thị modal |
| `onClose` | function | ✅ | Callback khi đóng modal |
| `category` | string | ✅ | Danh mục tài liệu ("Đăng nhập" hoặc "Đăng ký") |
| `onAgree` | function | ❌ | Callback khi người dùng đồng ý với điều khoản |

## Cách sử dụng cơ bản

```jsx
import LegalDocumentModal from './LegalDocumentModal';

const MyComponent = () => {
  const [showLegalModal, setShowLegalModal] = useState(false);

  const handleAgree = () => {
    // Logic xử lý khi người dùng đồng ý
    console.log('Người dùng đã đồng ý với điều khoản');
    
    // Có thể thêm logic khác như:
    // - Cập nhật state
    // - Gọi API
    // - Chuyển hướng trang
    // - v.v.
  };

  return (
    <>
      <button onClick={() => setShowLegalModal(true)}>
        Xem điều khoản
      </button>

      <LegalDocumentModal
        isOpen={showLegalModal}
        onClose={() => setShowLegalModal(false)}
        category="Đăng ký"
        onAgree={handleAgree}
      />
    </>
  );
};
```

## Ví dụ thực tế

### 1. Trong SignUpModal
```jsx
<LegalDocumentModal
  isOpen={showLegalDocumentModal}
  onClose={() => setShowLegalDocumentModal(false)}
  category="Đăng ký"
  onAgree={() => {
    // Có thể thêm logic xử lý ở đây
    console.log('Người dùng đã đồng ý với điều khoản đăng ký');
    
    // Ví dụ: Cập nhật trạng thái đồng ý
    // setTermsAgreed(true);
    
    // Hoặc gọi API xác nhận
    // await confirmTermsAgreement();
  }}
/>
```

### 2. Trong LoginModal
```jsx
<LegalDocumentModal
  isOpen={showLegalDocumentModal}
  onClose={() => setShowLegalDocumentModal(false)}
  category="Đăng nhập"
  onAgree={() => {
    // Logic xử lý khi đồng ý điều khoản đăng nhập
    console.log('Người dùng đã đồng ý với điều khoản đăng nhập');
    
    // Có thể thêm logic khác tùy theo yêu cầu
  }}
/>
```

## Tính năng bảo mật

- **Không thể đóng modal** bằng nút X, click backdrop, hoặc nút "Đóng" cho đến khi người dùng tick checkbox
- **Chỉ có thể đóng** khi người dùng tick checkbox và bấm "Tôi đồng ý"
- **Callback `onAgree`** được gọi trước khi modal đóng
- **State được reset** mỗi khi modal đóng

## Lưu ý quan trọng

1. **Luôn truyền `onAgree` callback** để xử lý logic khi người dùng đồng ý
2. **Callback `onAgree` sẽ tự động đóng modal** sau khi thực hiện xong
3. **Modal sẽ hiển thị thông báo cảnh báo** nếu người dùng cố gắng đóng mà chưa đồng ý
4. **State `agreed` được reset** mỗi khi modal mở lại

## Tùy chỉnh

Bạn có thể tùy chỉnh:
- **Nội dung thông báo** trong `handleClose` function
- **Styling** của checkbox và buttons
- **Logic xử lý** trong `onAgree` callback
- **Animation** và transition effects
