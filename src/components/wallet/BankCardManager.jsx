import React, { useState, useEffect } from 'react';
import { fetchBankAccounts as apiFetchBankAccounts, createBankAccount as apiCreateBankAccount, deleteBankAccount as apiDeleteBankAccount } from '../api/auth';
import { showSuccess, showError } from '../../utils/toastManager.js';
import ConfirmDeleteBankAccountModal from '../modals/ConfirmDeleteBankAccountModal';
import NoFocusOutLineButton from '../../utils/noFocusOutlineButton';

// Danh sách các ngân hàng Việt Nam
const VIETNAM_BANKS = [
  'Vietcombank (VCB)',
  'VietinBank (CTG)',
  'BIDV',
  'Agribank',
  'Techcombank (TCB)',
  'MB Bank (MBB)',
  'ACB',
  'VPBank',
  'TPBank',
  'HDBank',
  'Sacombank (STB)',
  'Eximbank (EIB)',
  'MSB',
  'VIB',
  'SeABank',
  'LienVietPostBank',
  'VietABank',
  'ABBank',
  'NamABank',
  'PGBank',
  'GPBank',
  'BacABank',
  'SCB',
  'OCB',
  'DongABank',
  'Kienlongbank',
  'NCB',
  'SHB',
  'VietBank',
  'PVcomBank'
];

const BankCardManager = () => {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAccount, setNewAccount] = useState({
    bankName: '',
    accountNumber: '',
    accountHolderName: ''
  });
  
  // Validation errors state
  const [validationErrors, setValidationErrors] = useState({
    bankName: '',
    accountNumber: '',
    accountHolderName: ''
  });
  
  // Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // API Functions for Bank Accounts
  const fetchBankAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiFetchBankAccounts();
      setBankAccounts(data || []);
    } catch (err) {
      console.error('Failed to fetch bank accounts:', err);
      setError('Không thể tải danh sách tài khoản ngân hàng');
      setBankAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const createBankAccount = async (accountData) => {
    try {
      setSubmitting(true);
      setError(null);
      setValidationErrors({ bankName: '', accountNumber: '', accountHolderName: '' });
      
      const response = await apiCreateBankAccount(accountData);
      
      if (response) {
        await fetchBankAccounts(); // Refresh the list
        showSuccess('Thêm tài khoản ngân hàng thành công!');
        return response;
      }
    } catch (err) {
      console.error('Failed to create bank account:', err);
      
      // Handle validation errors from API
      if (err.response && err.response.data && err.response.data.errors) {
        const apiErrors = err.response.data.errors;
        setValidationErrors({
          bankName: apiErrors.bankName || '',
          accountNumber: apiErrors.accountNumber || '',
          accountHolderName: apiErrors.accountHolderName || ''
        });
      } else {
        // Handle general error
        const errorMessage = err.response?.data?.message || err.message || 'Không thể tạo tài khoản ngân hàng';
        setError(errorMessage);
      }
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  // Validation function
  const validateForm = () => {
    const errors = {
      bankName: '',
      accountNumber: '',
      accountHolderName: ''
    };

    if (!newAccount.bankName.trim()) {
      errors.bankName = 'Vui lòng chọn tên ngân hàng';
    }

    if (!newAccount.accountNumber.trim()) {
      errors.accountNumber = 'Vui lòng nhập số tài khoản';
    } else if (!/^\d+$/.test(newAccount.accountNumber.trim())) {
      errors.accountNumber = 'Số tài khoản chỉ được chứa số';
    } else if (newAccount.accountNumber.trim().length !== 12) {
      errors.accountNumber = 'Số tài khoản phải có đúng 12 chữ số';
    }

    if (!newAccount.accountHolderName.trim()) {
      errors.accountHolderName = 'Vui lòng nhập tên chủ tài khoản';
    } else if (newAccount.accountHolderName.trim().length < 2) {
      errors.accountHolderName = 'Tên chủ tài khoản phải có ít nhất 2 ký tự';
    }

    setValidationErrors(errors);
    return !Object.values(errors).some(error => error !== '');
  };

  const handleAddAccount = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await createBankAccount({
        bankName: newAccount.bankName,
        accountNumber: newAccount.accountNumber,
        accountHolderName: newAccount.accountHolderName
      });
      
      setNewAccount({ bankName: '', accountNumber: '', accountHolderName: '' });
      setValidationErrors({ bankName: '', accountNumber: '', accountHolderName: '' });
      setShowAddForm(false);
    } catch (err) {
      // Error is already handled in createBankAccount
    }
  };

  const handleRemoveAccount = (account) => {
    setAccountToDelete(account);
    setShowDeleteModal(true);
  };

  const confirmDeleteAccount = async () => {
    if (!accountToDelete) return;

    setDeleting(true);
    try {
      await apiDeleteBankAccount(accountToDelete.id);
      
      // Remove from local state
      setBankAccounts(bankAccounts.filter(account => account.id !== accountToDelete.id));
      
      // Close modal and reset state
      setShowDeleteModal(false);
      setAccountToDelete(null);
      
      // Show success toast
      showSuccess('Xóa tài khoản ngân hàng thành công!');
    } catch (error) {
      console.error('Failed to delete bank account:', error);
      showError(error.message || 'Không thể xóa tài khoản ngân hàng. Vui lòng thử lại.');
    } finally {
      setDeleting(false);
    }
  };

  const cancelDeleteAccount = () => {
    setShowDeleteModal(false);
    setAccountToDelete(null);
  };

  const handleSetDefault = async (accountId) => {
    // Note: Set default API endpoint might need to be implemented on backend
    setBankAccounts(bankAccounts.map(account => ({
      ...account,
      isDefault: account.id === accountId
    })));
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">🏦 Quản lý tài khoản ngân hàng</h2>
          <p className="text-gray-600 mt-1">Thêm và quản lý các tài khoản ngân hàng để rút tiền</p>
        </div>
        <NoFocusOutLineButton
          onClick={() => setShowAddForm(!showAddForm)}
          disabled={submitting}
          className="px-6 py-3 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
        >
          <span className="text-lg">+</span>
          Thêm tài khoản mới
        </NoFocusOutLineButton>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600 text-sm">{error}</p>
          <NoFocusOutLineButton
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 text-xs mt-1 underline"
          >
            Đóng
          </NoFocusOutLineButton>
        </div>
      )}

      {/* Add Account Form */}
      {showAddForm && (
        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Thêm tài khoản ngân hàng mới</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên ngân hàng *</label>
              <select
                value={newAccount.bankName}
                onChange={(e) => {
                  setNewAccount({...newAccount, bankName: e.target.value});
                  if (validationErrors.bankName) {
                    setValidationErrors({...validationErrors, bankName: ''});
                  }
                }}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-gray-800 transition-all focus:outline-none ${
                  validationErrors.bankName ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={submitting}
              >
                <option value="">Chọn ngân hàng</option>
                {VIETNAM_BANKS.map((bank) => (
                  <option key={bank} value={bank}>
                    {bank}
                  </option>
                ))}
              </select>
              {validationErrors.bankName && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.bankName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên chủ tài khoản *</label>
              <input
                type="text"
                value={newAccount.accountHolderName}
                onChange={(e) => {
                  setNewAccount({...newAccount, accountHolderName: e.target.value});
                  if (validationErrors.accountHolderName) {
                    setValidationErrors({...validationErrors, accountHolderName: ''});
                  }
                }}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-gray-800 transition-all focus:outline-none ${
                  validationErrors.accountHolderName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="NGUYEN VAN A"
                disabled={submitting}
              />
              {validationErrors.accountHolderName && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.accountHolderName}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Số tài khoản *</label>
              <input
                type="text"
                value={newAccount.accountNumber}
                onChange={(e) => {
                  setNewAccount({...newAccount, accountNumber: e.target.value});
                  if (validationErrors.accountNumber) {
                    setValidationErrors({...validationErrors, accountNumber: ''});
                  }
                }}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-gray-800 transition-all focus:outline-none ${
                  validationErrors.accountNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="123456789012"
                disabled={submitting}
              />
              {validationErrors.accountNumber && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.accountNumber}</p>
              )}
            </div>
          </div>
          <div className="flex gap-4 mt-8">
            <NoFocusOutLineButton
              onClick={handleAddAccount}
              disabled={submitting || !newAccount.bankName || !newAccount.accountNumber || !newAccount.accountHolderName}
              className="px-8 py-3 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Đang thêm...' : 'Thêm tài khoản'}
            </NoFocusOutLineButton>
            <NoFocusOutLineButton
              onClick={() => {
                setShowAddForm(false);
                setNewAccount({ bankName: '', accountNumber: '', accountHolderName: '' });
                setValidationErrors({ bankName: '', accountNumber: '', accountHolderName: '' });
                setError(null);
              }}
              disabled={submitting}
              className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all duration-200 disabled:opacity-50"
            >
              Hủy
            </NoFocusOutLineButton>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
          <p className="text-gray-600 mt-4">Đang tải danh sách tài khoản...</p>
        </div>
      )}

      {/* Bank Accounts List */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bankAccounts.map((account) => (
            <div key={account.id} className="relative group">
              {/* Bank Account Card */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                {account.isDefault && (
                  <div className="absolute -top-2 -right-2 bg-amber-400 text-amber-900 px-3 py-1 rounded-full text-xs font-bold">
                    Mặc định
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-8">
                  <div className="text-sm opacity-90 font-medium">{account.bankName}</div>
                  <div className="text-sm font-bold bg-white bg-opacity-20 px-2 py-1 rounded text-gray-600">TK Ngân hàng</div>
                </div>
                
                <div className="mb-6">
                  <div className="text-lg font-mono tracking-wider mb-3">
                    {account.accountNumber ? `**** **** **** ${account.accountNumber.slice(-4)}` : 'N/A'}
                  </div>
                  <div className="text-sm opacity-90">Chủ TK: {account.accountHolderName}</div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-xs opacity-75 font-medium">BANK ACCOUNT</div>
                  <div className="w-12 h-8 bg-white bg-opacity-20 rounded flex items-center justify-center">
                    <div className="text-xs font-bold">🏦</div>
                  </div>
                </div>
              </div>
              
              {/* Account Actions */}
              <div className="mt-4 flex gap-2">
                {!account.isDefault && (
                  <NoFocusOutLineButton
                    onClick={() => handleSetDefault(account.id)}
                    className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-all duration-200"
                  >
                    Đặt mặc định
                  </NoFocusOutLineButton>
                )}
                <NoFocusOutLineButton
                  onClick={() => handleRemoveAccount(account)}
                  className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600 transition-all duration-200"
                >
                  Xóa tài khoản
                </NoFocusOutLineButton>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && bankAccounts.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200">
          <div className="text-gray-300 text-6xl mb-4">🏦</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Chưa có tài khoản nào</h3>
          <p className="text-gray-500 mb-8">Thêm tài khoản ngân hàng để có thể rút tiền</p>
          <NoFocusOutLineButton
            onClick={() => setShowAddForm(true)}
            className="px-8 py-3 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-all duration-200"
          >
            Thêm tài khoản đầu tiên
          </NoFocusOutLineButton>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteBankAccountModal
        isOpen={showDeleteModal}
        onClose={cancelDeleteAccount}
        onConfirm={confirmDeleteAccount}
        bankAccount={accountToDelete}
        isLoading={deleting}
      />
    </div>
  );
};

export default BankCardManager; 