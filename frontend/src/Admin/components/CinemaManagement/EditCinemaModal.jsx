/* eslint-disable no-useless-escape */
import styles from './CreateCinema/CreateCinemaModal.module.css';
import React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { X, Upload, Plus, X as XIcon } from 'lucide-react';
const EditCinemaModal = ({ cinema, onClose, onCinemaUpdated }) => {
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
    socialMedia: '',
    movies: [],
    movieIds: []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newFacility, setNewFacility] = useState('');

  const cinemaData = useMemo(() => {
    if (!cinema) return null;
    return {
      name: cinema.name || '',
      address: cinema.address || '',
      city: cinema.city || '',
      phone: cinema.phone || '',
      email: cinema.email || '',
      description: cinema.description || '',
      facilities: cinema.facilities || [],
      imageUrl: cinema.imageUrl || '',
      status: cinema.status || 'ACTIVE',
      totalRooms: cinema.totalRooms || 1,
      totalSeats: cinema.totalSeats || 100,
      openingHours: cinema.openingHours || '08:00-23:00',
      website: cinema.website || '',
      socialMedia: cinema.socialMedia || '',
      movies: cinema.movies || [],
      movieIds: cinema.movieIds || []
    };
  }, [cinema]);

  useEffect(() => {
    if (cinemaData) {
      setFormData(cinemaData);
    }
  }, [cinemaData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      newErrors.name = 'Movie name is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Desscription is required';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (formData.phone && !/^[\d\s\-\+ (\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Phone number is invalid';
    }

    if (formData.totalRooms < 1) {
      newErrors.totalRooms = 'Room number must be at least 1';
    }

    if (formData.totalSeats < 1) {
      newErrors.totalSeats = 'Sear number must be at least 1';
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
        totalSeats: parseInt(formData.totalSeats),
        // Keep list of movies
        movies: formData.movies || [],
        movieIds: formData.movieIds || []
      };

      onCinemaUpdated(cinemaData);
    } catch (error) {
      console.error('Error updating cinema:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          imageUrl: event.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (!cinema) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Edit Cinema</h2>
          <button onClick={onClose} className={styles.closeButton}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formSection}>
            <h3>Basic Information</h3>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Cinema name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`${styles.formInput} ${errors.name ? styles.error : ''}`}
                  placeholder="Ex: CINEVERSE Vincom Center"
                />
                {errors.name && <span className={styles.errorMessage}>{errors.name}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={`${styles.formInput} ${errors.city ? styles.error : ''}`}
                  placeholder="Ex: Hồ Chí Minh"
                />
                {errors.city && <span className={styles.errorMessage}>{errors.city}</span>}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Address *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className={`${styles.formInput} ${errors.address ? styles.error : ''}`}
                placeholder="Ex: 123 ABC Street, District 1"
              />
              {errors.address && <span className={styles.errorMessage}>{errors.address}</span>}
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`${styles.formInput} ${errors.phone ? styles.error : ''}`}
                  placeholder="Ex: 0123456789"
                />
                {errors.phone && <span className={styles.errorMessage}>{errors.phone}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`${styles.formInput} ${errors.email ? styles.error : ''}`}
                  placeholder="Ex: info@cinema.com"
                />
                {errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Description of Cinema *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={`${styles.formTextarea} ${errors.description ? styles.error : ''}`}
                placeholder="Enter a detailed description of the cinema, its amenities, and its highlights...."
                rows={4}
              />
              {errors.description && <span className={styles.errorMessage}>{errors.description}</span>}
            </div>
          </div>

          <div className={styles.formSection}>
            <h3>Technical information</h3>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Room number *</label>
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
                <label className={styles.formLabel}>Total Seat Number *</label>
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
                <label className={styles.formLabel}>Opening hours</label>
                <input
                  type="text"
                  name="openingHours"
                  value={formData.openingHours}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  placeholder="Ex: 08:00-23:00"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={styles.formSelect}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">InActive</option>
                  <option value="MAINTENANCE">Maintanance</option>
                </select>
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <h3>Utilities</h3>

            <div className={styles.facilitiesContainer}>
              <div className={styles.addFacilityForm}>
                <input
                  type="text"
                  value={newFacility}
                  onChange={(e) => setNewFacility(e.target.value)}
                  className={styles.facilityInput}
                  placeholder="Add amenities (e.g., Parking, Food Court, IMAX)"
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
            <h3>Image</h3>

            <div className={styles.imageUploadContainer}>
              <input
                type="file"
                id="imageUpload"
                accept="image/*"
                onChange={handleImageUpload}
                className={styles.fileInput}
              />
              <label htmlFor="imageUpload" className={styles.imageUploadButton}>
                <Upload size={20} />
                Upload image
              </label>

              {formData.imageUrl && (
                <div className={styles.imagePreview}>
                  <img src={formData.imageUrl} alt="Preview" />
                </div>
              )}
            </div>
          </div>

          <div className={styles.formSection}>
            <h3>Link</h3>

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
                <label className={styles.formLabel}>Social Media</label>
                <input
                  type="text"
                  name="socialMedia"
                  value={formData.socialMedia}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  placeholder="Ex: @cinema_official"
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
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.submitButton}
            >
              {isSubmitting ? 'Updating...' : 'Update Cinema'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCinemaModal;
