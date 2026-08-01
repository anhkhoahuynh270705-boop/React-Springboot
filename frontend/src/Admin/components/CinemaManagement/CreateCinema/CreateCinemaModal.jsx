/* eslint-disable no-useless-escape */
import styles from './CreateCinemaModal.module.css';
import React from 'react';
import { useState } from 'react';
import { X, Upload, Image as ImageIcon, Plus, X as XIcon } from 'lucide-react';
const CreateCinemaModal = ({ onClose, onCinemaCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    description: '',
    facilities: [],
    imageUrl: '',
    status: 'ACTIVE',
    totalRooms: 1,
    totalSeats: 100,
    openingHours: '08:00-23:00',
    website: '',
    socialMedia: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newFacility, setNewFacility] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFacilityAdd = () => {
    if (newFacility.trim() && !formData.facilities.includes(newFacility.trim())) {
      setFormData(prev => ({
        ...prev,
        facilities: [...prev.facilities, newFacility.trim()]
      }));
      setNewFacility('');
    }
  };

  const handleFacilityRemove = (facilityToRemove) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.filter(facility => facility !== facilityToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên rạp chiếu là bắt buộc';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Địa chỉ là bắt buộc';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Thành phố là bắt buộc';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Mô tả rạp chiếu là bắt buộc';
    }

    if (!formData.email || !formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.phone || !formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
    } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (formData.totalRooms < 1) {
      newErrors.totalRooms = 'Số phòng phải lớn hơn 0';
    }

    if (formData.totalSeats < 1) {
      newErrors.totalSeats = 'Số ghế phải lớn hơn 0';
    }

    if (!formData.imageUrl) {
      newErrors.imageUrl = 'Hình ảnh rạp chiếu là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const cinemaData = {
        ...formData,
        totalRooms: parseInt(formData.totalRooms),
        totalSeats: parseInt(formData.totalSeats)
      };

      onCinemaCreated(cinemaData);
    } catch (error) {
      console.error('Error creating cinema:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, imageUrl: 'Chỉ chấp nhận file hình ảnh (jpg, png, webp...)' }));
        return;
      }

      setErrors(prev => ({ ...prev, imageUrl: '' }));

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 500;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);

          setFormData(prev => ({
            ...prev,
            imageUrl: compressedBase64
          }));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };


  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Thêm rạp chiếu mới</h2>
          <button onClick={onClose} className={styles.closeButton}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formSection}>
            <h3>Thông tin cơ bản</h3>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Tên rạp chiếu *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`${styles.formInput} ${errors.name ? styles.error : ''}`}
                  placeholder="VD: CINEVERSE Vincom Center"
                />
                {errors.name && <span className={styles.errorMessage}>{errors.name}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Thành phố *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={`${styles.formInput} ${errors.city ? styles.error : ''}`}
                  placeholder="VD: Hồ Chí Minh"
                />
                {errors.city && <span className={styles.errorMessage}>{errors.city}</span>}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Địa chỉ *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className={`${styles.formInput} ${errors.address ? styles.error : ''}`}
                placeholder="VD: 123 Đường ABC, Quận 1"
              />
              {errors.address && <span className={styles.errorMessage}>{errors.address}</span>}
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Số điện thoại*</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`${styles.formInput} ${errors.phone ? styles.error : ''}`}
                  placeholder="VD: 0123456789"
                />
                {errors.phone && <span className={styles.errorMessage}>{errors.phone}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email*</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`${styles.formInput} ${errors.email ? styles.error : ''}`}
                  placeholder="VD: info@cinema.com"
                />
                {errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Mô tả rạp chiếu *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={`${styles.formTextarea} ${errors.description ? styles.error : ''}`}
                placeholder="Nhập mô tả chi tiết về rạp chiếu, tiện ích, đặc điểm nổi bật..."
                rows={4}
              />
              {errors.description && <span className={styles.errorMessage}>{errors.description}</span>}
            </div>
          </div>

          <div className={styles.formSection}>
            <h3>Thông tin kỹ thuật</h3>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Số phòng *</label>
                <input
                  type="number"
                  name="totalRooms"
                  value={formData.totalRooms}
                  onChange={handleInputChange}
                  className={`${styles.formInput} ${errors.totalRooms ? styles.error : ''}`}
                  min="1"
                />
                {errors.totalRooms && <span className={styles.errorMessage}>{errors.totalRooms}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Tổng số ghế *</label>
                <input
                  type="number"
                  name="totalSeats"
                  value={formData.totalSeats}
                  onChange={handleInputChange}
                  className={`${styles.formInput} ${errors.totalSeats ? styles.error : ''}`}
                  min="1"
                />
                {errors.totalSeats && <span className={styles.errorMessage}>{errors.totalSeats}</span>}
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Giờ mở cửa</label>
                <input
                  type="text"
                  name="openingHours"
                  value={formData.openingHours}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  disabled={true}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Trạng thái</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={styles.formSelect}
                >
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="INACTIVE">Tạm dừng</option>
                  <option value="MAINTENANCE">Bảo trì</option>
                </select>
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <h3>Tiện ích</h3>

            <div className={styles.facilitiesContainer}>
              <div className={styles.addFacilityForm}>
                <input
                  type="text"
                  value={newFacility}
                  onChange={(e) => setNewFacility(e.target.value)}
                  className={styles.facilityInput}
                  placeholder="Thêm tiện ích (VD: Parking, Food Court, IMAX)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleFacilityAdd())}
                />
                <button
                  type="button"
                  onClick={handleFacilityAdd}
                  className={styles.addFacilityButton}
                ><X size={20} /></button>
              </div>

              {formData.facilities.length > 0 && (
                <div className={styles.facilitiesList}>
                  {formData.facilities.map((facility, index) => (
                    <div key={index} className={styles.facilityItem}>
                      <span>{facility}</span>
                      <button
                        type="button"
                        onClick={() => handleFacilityRemove(facility)}
                        className={styles.removeFacilityButton}
                      >
                        <XIcon size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles.formSection}>
            <h3>Hình ảnh *</h3>

            <div className={styles.imageUploadContainer}>
              <input
                type="file"
                id="imageUpload"
                accept="image/*"
                onChange={handleImageUpload}
                className={styles.fileInput}
              />
              <label htmlFor="imageUpload" className={`${styles.imageUploadButton} ${errors.imageUrl ? styles.error : ''}`}>
                <Upload size={20} />
                Tải lên hình ảnh
              </label>

              {errors.imageUrl && <span className={styles.errorMessage} style={{ display: 'block', marginTop: '8px' }}>{errors.imageUrl}</span>}

              {formData.imageUrl && (
                <div className={styles.imagePreview}>
                  <img src={formData.imageUrl} alt="Preview" />
                </div>
              )}
            </div>
          </div>

          <div className={styles.formSection}>
            <h3>Liên kết</h3>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  placeholder="VD: https://cinema.com"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Mạng xã hội</label>
                <input
                  type="text"
                  name="socialMedia"
                  value={formData.socialMedia}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  placeholder="VD: @cinema_official"
                />
              </div>
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.submitButton}
            >
              {isSubmitting ? 'Đang tạo...' : 'Tạo rạp chiếu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCinemaModal;
