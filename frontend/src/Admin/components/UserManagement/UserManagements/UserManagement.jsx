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
      showError('Lỗi khi tải danh sách người dùng: ' + error.message);
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
      showError('Tìm kiếm người dùng thất bại: ' + error.message);
    }
  };

  const handleViewUser = async (userId) => {
    try {
      const userData = await getUserById(userId);
      setSelectedUser(userData);
      setShowUserModal(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
      showError('Lỗi khi tải thông tin người dùng: ' + error.message);
    }
  };

  const handleEditUser = async (userId) => {
    try {
      const userData = await getUserById(userId);
      setSelectedUser(userData);
      setShowEditUserModal(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
      showError('Lỗi khi tải thông tin người dùng: ' + error.message);
    }
  };

  const handleUpdateUser = async (formData) => {
    try {
      await updateUser(selectedUser.id, formData);
      setShowEditUserModal(false);
      setSelectedUser(null);
      showSuccess('Cập nhật thông tin người dùng thành công!');
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      showError('Cập nhật thông tin người dùng thất bại: ' + error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        await deleteUser(userId);
        showSuccess('Delete user successfully!');
        await fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        showError('Xóa người dùng thất bại: ' + error.message);
      }
    }
  };

  const handleCreateUser = async (formData) => {
    try {
      await createUser(formData);
      setShowCreateUserModal(false);
      showSuccess('Tạo người dùng thành công!');
      await fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      showError('Tạo người dùng thất bại: ' + error.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
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
      return 'Chưa cập nhật';
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
              placeholder="Tìm kiếm người dùng..."
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
              title="Tạo người dùng mới"
            >
              <UserPlus size={18} />
              Tạo người dùng
            </button>
            <button
              className={styles.refreshButton}
              onClick={fetchUsers}
              title="Làm mới"
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
              <th>Tên đăng nhập</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Ngày tạo</th>
              <th>Cập nhật lần cuối</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.fullName || 'Chưa cập nhật'}</td>
                <td>{user.email}</td>
                <td>{user.phone || 'Chưa cập nhật'}</td>
                <td>{formatDate(user.createdAt)}</td>
                <td>{formatDate(user.updatedAt)}</td>
                <td>
                  <div className={styles.actions}>
                    <button
                      className={styles.actionBtn}
                      onClick={() => handleViewUser(user.id)}
                      title="Xem chi tiết"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className={styles.actionBtn}
                      onClick={() => handleEditUser(user.id)}
                      title="Chỉnh sửa"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.deleteBtn}`}
                      onClick={() => handleDeleteUser(user.id)}
                      title="Xóa"
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
              <h3>Chi tiết người dùng</h3>
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
                  <label>Tên đăng nhập:</label>
                  <span>{selectedUser.username}</span>
                </div>
                <div className={styles.infoRow}>
                  <label>Họ tên:</label>
                  <span>{selectedUser.fullName || 'Chưa cập nhật'}</span>
                </div>
                <div className={styles.infoRow}>
                  <label>Email:</label>
                  <span>{selectedUser.email}</span>
                </div>
                <div className={styles.infoRow}>
                  <label>Số điện thoại:</label>
                  <span>{selectedUser.phone || 'Chưa cập nhật'}</span>
                </div>
                <div className={styles.infoRow}>
                  <label>Địa chỉ:</label>
                  <span>{selectedUser.address || 'Chưa cập nhật'}</span>
                </div>
                <div className={styles.infoRow}>
                  <label>Ngày tạo:</label>
                  <span>{formatDate(selectedUser.createdAt)}</span>
                </div>
                <div className={styles.infoRow}>
                  <label>Cập nhật lần cuối:</label>
                  <span>{formatDate(selectedUser.updatedAt)}</span>
                </div>
                {selectedUser.notes && (
                  <div className={styles.infoRow}>
                    <label>Ghi chú:</label>
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

                  Chỉnh sửa
                </button>
                <button
                  className={`${styles.actionBtn} ${styles.closeBtn}`}
                  onClick={() => {
                    setShowUserModal(false);
                    setSelectedUser(null);
                  }}
                >
                  Đóng
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
              <h3>Chỉnh sửa người dùng</h3>
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
