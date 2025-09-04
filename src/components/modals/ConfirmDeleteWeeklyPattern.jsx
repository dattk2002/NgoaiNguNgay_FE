import React from "react";
import ConfirmDialog from "./ConfirmDialog";

const ConfirmDeleteWeeklyPattern = ({ open, onClose, onConfirm }) => (
  <ConfirmDialog
    open={open}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Xác nhận xóa lịch trình"
    description="Bạn có chắc chắn muốn xóa lịch trình này không? Hành động này không thể hoàn tác."
    confirmText="Xóa"
    cancelText="Hủy"
    confirmColor="error"
    requireAgreement={true}
  />
);

export default ConfirmDeleteWeeklyPattern;
