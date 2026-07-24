/* eslint-disable no-unused-vars */
import {
  getAllUsers,
  updateUser,
  deleteUser,
  searchUsers,
  getUserById,
  createUser
} from '../../../../services/adminService';
import React from 'react';
import { useState, useEffect, useRef } from 'react';
import EditUserForm from '../EditUserForm/EditUserForm';
import {
  Users,
  Eye,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  XCircle,
  UserPlus
} from 'lucide-react';
import CreateUserModal from '../CreateUser/CreateUserModal';
import { useTranslation } from 'react-i18next';
import useToast from '../../../hooks/useToast';
import ToastContainer from '../../Toast/ToastContainer';
import styles from './UserManagement.module.css';

const UserManagement = () => {
  const { t } = useTranslation();
  const { showSuccess, showError, toasts, removeToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersData = await getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      showError('Error fetching users: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSearch = async (keyword) => {
    if (!keyword.trim()) {
      await fetchUsers();
      return;
    }

    try {
      const searchResults = await searchUsers(keyword);
      setUsers(searchResults);
    } catch (error) {
      console.error('Error searching users:', error);
      showError('Error searching users: ' + error.message);
    }
  };

  const handleViewUser = async (userId) => {
    try {
      const userData = await getUserById(userId);
      setSelectedUser(userData);
      setShowUserModal(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
      showError('Error fetching user details: ' + error.message);
    }
  };

  const handleEditUser = async (userId) => {
    try {
      const userData = await getUserById(userId);
      setSelectedUser(userData);
      setShowEditUserModal(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
      showError('Error fetching user details: ' + error.message);
    }
  };

  const handleUpdateUser = async (formData) => {
    try {
      await updateUser(selectedUser.id, formData);
      setShowEditUserModal(false);
      setSelectedUser(null);
      showSuccess('Update user successfully!');
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      showError('Update user failed: ' + error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
        showSuccess('Delete user successfully!');
        await fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        showError('Delete user failed: ' + error.message);
      }
    }
  };

  const handleCreateUser = async (formData) => {
    try {
      await createUser(formData);
      setShowCreateUserModal(false);
      showSuccess('Create user successfully!');
      await fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      showError('Create user failed: ' + error.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not updated';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Not updated';
    }
  };


  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>{t('Loading user list...')}</p>
      </div>
    );
  }

  return (
    <div className={styles.userManagement}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className={styles.header}>
        <div className={styles.controls}>
          <div className={styles.searchContainer}>
            <Search size={16} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search user..."
              value={userSearchTerm}
              onChange={(e) => {
                setUserSearchTerm(e.target.value);
                handleUserSearch(e.target.value);
              }}
            />
          </div>
          <div className={styles.actionButtons}>
            <button
              className={styles.createButton}
              onClick={() => setShowCreateUserModal(true)}
              title="Create new user"
            >
              <UserPlus size={18} />
              Create user
            </button>
            <button
              className={styles.refreshButton}
              onClick={fetchUsers}
              title="Refresh"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Full name</th>
              <th>Email</th>
              <th>Phone number</th>
              <th>Created at</th>
              <th>Updated at</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.fullName || 'Not updated'}</td>
                <td>{user.email}</td>
                <td>{user.phone || 'Not updated'}</td>
                <td>{formatDate(user.createdAt)}</td>
                <td>{formatDate(user.updatedAt)}</td>
                <td>
                  <div className={styles.actions}>
                    <button
                      className={styles.actionBtn}
                      onClick={() => handleViewUser(user.id)}
                      title="View details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className={styles.actionBtn}
                      onClick={() => handleEditUser(user.id)}
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.deleteBtn}`}
                      onClick={() => handleDeleteUser(user.id)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>User details</h3>
              <button
                className={styles.closeBtn}
                onClick={() => {
                  setShowUserModal(false);
                  setSelectedUser(null);
                }}
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.userInfo}>
                <div className={styles.infoRow}>
                  <label>ID:</label>
                  <span>{selectedUser.id}</span>
                </div>
                <div className={styles.infoRow}>
                  <label>Username:</label>
                  <span>{selectedUser.username}</span>
                </div>
                <div className={styles.infoRow}>
                  <label>Full name:</label>
                  <span>{selectedUser.fullName || 'Not updated'}</span>
                </div>
                <div className={styles.infoRow}>
                  <label>Email:</label>
                  <span>{selectedUser.email}</span>
                </div>
                <div className={styles.infoRow}>
                  <label>Phone number:</label>
                  <span>{selectedUser.phone || 'Not updated'}</span>
                </div>
                <div className={styles.infoRow}>
                  <label>Address:</label>
                  <span>{selectedUser.address || 'Not updated'}</span>
                </div>
                <div className={styles.infoRow}>
                  <label>Created at:</label>
                  <span>{formatDate(selectedUser.createdAt)}</span>
                </div>
                <div className={styles.infoRow}>
                  <label>Updated at:</label>
                  <span>{formatDate(selectedUser.updatedAt)}</span>
                </div>
                {selectedUser.notes && (
                  <div className={styles.infoRow}>
                    <label>Notes:</label>
                    <span>{selectedUser.notes}</span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <div className={styles.modalActions}>
                <button
                  className={`${styles.actionBtn} ${styles.editBtn}`}
                  onClick={() => {
                    setShowUserModal(false);
                    setShowEditUserModal(true);
                  }}
                >

                  Edit
                </button>
                <button
                  className={`${styles.actionBtn} ${styles.closeBtn}`}
                  onClick={() => {
                    setShowUserModal(false);
                    setSelectedUser(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && selectedUser && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Edit user</h3>
              <button
                className={styles.closeBtn}
                onClick={() => {
                  setShowEditUserModal(false);
                  setSelectedUser(null);
                }}
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <EditUserForm
                user={selectedUser}
                onSave={handleUpdateUser}
                onCancel={() => {
                  setShowEditUserModal(false);
                  setSelectedUser(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateUserModal && (
        <CreateUserModal
          onSave={handleCreateUser}
          onCancel={() => setShowCreateUserModal(false)}
        />
      )}
    </div>
  );
};

export default UserManagement;
