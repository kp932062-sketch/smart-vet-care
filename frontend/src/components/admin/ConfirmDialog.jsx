import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';

const ConfirmDialog = ({
  isOpen,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false,
  onCancel,
  onConfirm
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} maxWidth="max-w-md">
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            onClick={onCancel}
            variant="ghost"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            variant="danger"
            loading={loading}
          >
            {loading ? 'Please wait...' : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
