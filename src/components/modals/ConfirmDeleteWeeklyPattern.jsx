import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

const ConfirmDeleteWeeklyPattern = ({ open, onClose, onConfirm }) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle>Xác nhận xóa lịch trình</DialogTitle>
    <DialogContent>
      <Typography>
        Bạn có chắc chắn muốn xóa lịch trình này không? Hành động này không thể hoàn tác.
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Hủy</Button>
      <Button onClick={onConfirm} color="error" variant="contained">
        Xóa
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDeleteWeeklyPattern;
