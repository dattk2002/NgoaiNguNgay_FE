// TinyMCE Configuration
// Update the apiKey below with your actual TinyMCE API key
// You can get a free API key from: https://www.tiny.cloud/

export const TINYMCE_CONFIG = {
  apiKey: "4edfl3lb245i1ku8tb832qgrfz3ruh178zjbiiugid97vr36", // Replace this with your actual API key
  height: 400,
  menubar: false,
  plugins: [
    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
    'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
  ],
  toolbar: 'undo redo | blocks | ' +
    'bold italic forecolor | alignleft aligncenter ' +
    'alignright alignjustify | bullist numlist outdent indent | ' +
    'removeformat | help',
  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
  placeholder: 'Nhập nội dung tài liệu pháp lý...',
  branding: false,
  elementpath: false,
  resize: false
};

// Function to update the API key
export const updateTinyMCEApiKey = (newApiKey) => {
  TINYMCE_CONFIG.apiKey = newApiKey;
};

// Function to get the current configuration
export const getTinyMCEConfig = () => {
  return { ...TINYMCE_CONFIG };
};
