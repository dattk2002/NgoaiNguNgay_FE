# TinyMCE Setup Guide

## Cài đặt

TinyMCE đã được cài đặt thông qua npm:
```bash
npm install @tinymce/tinymce-react
```

## API Key

Để sử dụng đầy đủ tính năng của TinyMCE, bạn cần đăng ký API key miễn phí tại: https://www.tiny.cloud/

Sau khi có API key, thay thế `"your-tinymce-api-key"` trong file `LegalDocumentManagement.jsx` với API key thực của bạn.

## Tính năng đã được cấu hình

### Toolbar
- **Undo/Redo**: Hoàn tác/làm lại
- **Blocks**: Định dạng đoạn văn (H1, H2, H3, etc.)
- **Bold/Italic**: In đậm/in nghiêng
- **Forecolor**: Màu chữ
- **Alignment**: Căn lề (trái, giữa, phải, đều)
- **Lists**: Danh sách có dấu đầu dòng và số
- **Indent/Outdent**: Thụt lề
- **Remove Format**: Xóa định dạng
- **Help**: Trợ giúp

### Plugins
- **advlist**: Danh sách nâng cao
- **autolink**: Tự động tạo link
- **lists**: Danh sách
- **link**: Chèn link
- **image**: Chèn hình ảnh
- **charmap**: Ký tự đặc biệt
- **preview**: Xem trước
- **anchor**: Neo
- **searchreplace**: Tìm và thay thế
- **visualblocks**: Hiển thị khối
- **code**: Chế độ code
- **fullscreen**: Toàn màn hình
- **insertdatetime**: Chèn ngày giờ
- **media**: Chèn media
- **table**: Bảng
- **help**: Trợ giúp
- **wordcount**: Đếm từ

## Tùy chỉnh

### Thêm tính năng mới
Để thêm tính năng mới, chỉnh sửa trong `init` object:

```javascript
init={{
    // ... existing config
    plugins: [
        // ... existing plugins
        'newplugin'
    ],
    toolbar: 'existing toolbar | newbutton'
}}
```

### Thay đổi giao diện
Chỉnh sửa file `LegalDocumentManagement.css` để tùy chỉnh giao diện.

### Thay đổi chiều cao
Thay đổi giá trị `height` trong `init` object.

## Lưu ý

1. **HTML Content**: TinyMCE tạo ra HTML content, vì vậy khi hiển thị cần sử dụng `dangerouslySetInnerHTML`
2. **Validation**: Khi validate content, cần loại bỏ HTML tags bằng regex: `content.replace(/<[^>]*>/g, '')`
3. **Security**: Đảm bảo content được sanitize trước khi lưu vào database
4. **Performance**: TinyMCE có thể làm chậm trang nếu có nhiều editor cùng lúc

## Troubleshooting

### Editor không hiển thị
- Kiểm tra console để xem lỗi
- Đảm bảo API key hợp lệ
- Kiểm tra CSS conflicts

### Content không lưu
- Kiểm tra validation logic
- Đảm bảo `onEditorChange` được gọi đúng cách

### Styling issues
- Kiểm tra CSS specificity
- Sử dụng `!important` nếu cần thiết
- Đảm bảo CSS được import đúng cách
