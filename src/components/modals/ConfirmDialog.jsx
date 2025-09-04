import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from "@mui/material";

// Rename to ConfirmDialog and make all content customizable via props
const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = "Xác nhận",
  description = "",
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  confirmColor = "error",
  children, // for custom content if needed
  requireAgreement = false, // New prop to require agreement checkbox
}) => {
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    if (open) {
      setAgreedToTerms(false);
    }
  }, [open]);

  const handleClose = () => {
    setAgreedToTerms(false);
    onClose();
  };

  const handleConfirm = () => {
    if (requireAgreement && !agreedToTerms) {
      return;
    }
    setAgreedToTerms(false);
    onConfirm();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {description && <Typography>{description}</Typography>}
        {children}
        
        {requireAgreement && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            <Typography variant="body2" sx={{ color: "#374151" }}>
              Tôi đồng ý với Điều khoản dịch vụ và Chính sách
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{cancelText}</Button>
        <Button 
          onClick={handleConfirm} 
          color={confirmColor} 
          variant="contained"
          disabled={requireAgreement && !agreedToTerms}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
