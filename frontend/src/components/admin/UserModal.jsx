import React, { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import FormInput from '../common/FormInput';

const emptyForm = {
  name: '',
  email: '',
  phone: ''
};

const UserModal = ({ isOpen, user, loading = false, onClose, onSubmit }) => {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!isOpen) return;

    setForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || ''
    });
  }, [isOpen, user]);

  const submit = async (event) => {
    event.preventDefault();
    await onSubmit({
      name: form.name,
      email: form.email,
      phone: form.phone
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit User" maxWidth="max-w-lg">
      <form onSubmit={submit} className="space-y-3">
        <FormInput
          label="Name"
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          required
        />

        <FormInput
          label="Email"
          type="email"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          required
        />

        <FormInput
          label="Phone"
          value={form.phone}
          onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UserModal;
