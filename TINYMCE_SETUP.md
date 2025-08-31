# TinyMCE Integration Setup Guide

## Overview
This project uses TinyMCE as a rich text editor for the legal document management system. The editor is integrated into the "Nội dung" (Content) field in the "Tạo phiên bản mới" (Create New Version) modal.

## Current Status
- ✅ TinyMCE React component installed (`@tinymce/tinymce-react`)
- ✅ Editor integrated into LegalDocumentManagement.jsx
- ✅ Global configuration setup in App.jsx
- ✅ Context provider for configuration sharing
- ❌ **API Key needs to be updated** (currently using placeholder)

## How to Update the TinyMCE API Key

### Option 1: Update the Configuration File (Recommended)
1. Open `src/config/tinymce.js`
2. Replace `"your-tinymce-api-key-here"` with your actual TinyMCE API key
3. Save the file

### Option 2: Update App.jsx Directly
1. Open `src/App.jsx`
2. Find the `TINYMCE_CONFIG` import from `./config/tinymce`
3. Update the configuration in `src/config/tinymce.js` as described in Option 1

## Getting a TinyMCE API Key

1. Go to [https://www.tiny.cloud/](https://www.tiny.cloud/)
2. Sign up for a free account
3. Navigate to your dashboard
4. Copy your API key
5. Replace the placeholder in `src/config/tinymce.js`

## Features Configured

The TinyMCE editor includes the following features:
- **Text Formatting**: Bold, italic, text color
- **Alignment**: Left, center, right, justify
- **Lists**: Bullet and numbered lists
- **Indentation**: Increase/decrease indent
- **Undo/Redo**: Standard editing operations
- **Word Count**: Character and word counting
- **Clean Interface**: No branding, minimal toolbar

## File Structure

```
src/
├── App.jsx                          # Main app with TinyMCE context provider
├── config/
│   └── tinymce.js                   # TinyMCE configuration (UPDATE API KEY HERE)
└── components/
    └── admin/
        ├── LegalDocumentManagement.jsx  # Uses TinyMCE editor
        └── LegalDocumentManagement.css  # Custom styling for editor
```

## Troubleshooting

### "The editor is disabled because the API key could not be validated"
- **Solution**: Update the API key in `src/config/tinymce.js`
- Make sure you're using a valid TinyMCE API key from your Tiny Cloud account

### Editor not loading
- Check browser console for errors
- Verify the API key is correctly set
- Ensure you have an active internet connection (TinyMCE requires cloud validation)

### Styling issues
- The editor uses custom CSS in `LegalDocumentManagement.css`
- Check that the CSS file is properly imported

## Next Steps

1. **Get your TinyMCE API key** from [https://www.tiny.cloud/](https://www.tiny.cloud/)
2. **Update the configuration** in `src/config/tinymce.js`
3. **Test the editor** in the legal document management interface
4. **Customize features** if needed by modifying the configuration

## Support

For TinyMCE-specific issues, refer to:
- [TinyMCE Documentation](https://www.tiny.cloud/docs/)
- [TinyMCE React Integration](https://www.tiny.cloud/docs/integrations/react/)
- [TinyMCE API Reference](https://www.tiny.cloud/docs/api/)
