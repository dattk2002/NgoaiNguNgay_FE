import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

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
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      {description && <Typography>{description}</Typography>}
      {children}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>{cancelText}</Button>
      <Button onClick={onConfirm} color={confirmColor} variant="contained">
        {confirmText}
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog;
