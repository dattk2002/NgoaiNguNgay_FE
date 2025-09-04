# TinyMCE Production Fix Guide

## Vấn đề hiện tại
TinyMCE hoạt động trên localhost nhưng không hoạt động trên production với 2 lỗi chính:
1. **Domain chưa được đăng ký trong TinyMCE Customer Portal**
2. **API key không thể được xác thực**

## Giải pháp từng bước

### Bước 1: Đăng ký Production Domain

1. **Truy cập TinyMCE Customer Portal:**
   - Đi tới: https://www.tiny.cloud/
   - Đăng nhập vào tài khoản của bạn

2. **Thêm Production Domain:**
   - Vào **Dashboard** → **API Keys**
   - Tìm API key: `4uk8zkbrrj3eyjdnhnq6lw1sndrla0tmn21z706wwlkzesmw`
   - Click **Edit** hoặc **Manage**
   - Trong phần **Approved Domains**, thêm:
     - Domain production của bạn (ví dụ: `yourdomain.com`)
     - Subdomain nếu có (ví dụ: `app.yourdomain.com`)
     - Vercel domain nếu deploy trên Vercel (ví dụ: `yourproject.vercel.app`)
   - **Lưu thay đổi**

### Bước 2: Kiểm tra API Key

1. **Xác minh API Key:**
   - Kiểm tra API key chưa hết hạn
   - Xác nhận quota sử dụng còn lại
   - Đảm bảo API key có quyền truy cập các tính năng cần thiết

2. **Nếu cần tạo API key mới:**
   - Tạo API key mới trong TinyMCE Customer Portal
   - Cập nhật trong `src/config/tinymce.js`

### Bước 3: Cập nhật cấu hình

Cấu hình đã được cập nhật với:
- Error handling tốt hơn
- Logging để debug
- Callback functions để theo dõi trạng thái

### Bước 4: Test và Deploy

1. **Test local:**
   ```bash
   npm run dev
   ```

2. **Build và deploy:**
   ```bash
   npm run build
   # Deploy lên production
   ```

3. **Kiểm tra console:**
   - Mở Developer Tools
   - Xem Console tab để kiểm tra log TinyMCE
   - Nếu vẫn có lỗi, kiểm tra Network tab

## Troubleshooting

### Lỗi "Domain not registered"
- **Nguyên nhân:** Domain production chưa được thêm vào Approved Domains
- **Giải pháp:** Thêm domain vào TinyMCE Customer Portal

### Lỗi "API key could not be validated"
- **Nguyên nhân:** API key không hợp lệ hoặc domain không match
- **Giải pháp:** 
  1. Kiểm tra API key trong Customer Portal
  2. Đảm bảo domain đã được approve
  3. Tạo API key mới nếu cần

### Editor không load
- **Nguyên nhân:** Network issues hoặc cấu hình sai
- **Giải pháp:**
  1. Kiểm tra internet connection
  2. Xem console errors
  3. Kiểm tra API key và domain settings

## Lưu ý quan trọng

1. **Domain matching:** Domain trong Approved Domains phải match chính xác với domain production
2. **HTTPS:** Production domain phải sử dụng HTTPS
3. **Subdomain:** Nếu sử dụng subdomain, cần thêm cả subdomain vào Approved Domains
4. **Wildcard:** TinyMCE không hỗ trợ wildcard domains

## Kiểm tra sau khi fix

1. ✅ TinyMCE editor load thành công
2. ✅ Không có warning messages
3. ✅ Editor có thể sử dụng được
4. ✅ Console không có errors liên quan đến TinyMCE

## Support

Nếu vẫn gặp vấn đề:
- Kiểm tra [TinyMCE Documentation](https://www.tiny.cloud/docs/)
- Liên hệ TinyMCE Support
- Kiểm tra [TinyMCE Community Forum](https://community.tiny.cloud/)
