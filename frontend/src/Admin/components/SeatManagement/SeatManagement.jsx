import { getAllShowtimes } from '../../../services/showtimeService';
import {
  updateSeat,
  deleteSeat,
  deleteSeatsByShowtime,
  getSeatsByShowtime,
  applyLayoutToShowtime
} from '../../../services/seatService';
import { getSeatLayouts } from '../../../services/seatLayoutService';
import LayoutManagement from './LayoutManagement';
import useToast from '../../hooks/useToast';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import {
  Trash2,
  RefreshCw,
  Calendar,
  Clock,
  MapPin
} from 'lucide-react';
import styles from './SeatManagement.module.css';

const SeatManagement = () => {
  const { t } = useTranslation();
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  const [showtimes, setShowtimes] = useState([]);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [seats, setSeats] = useState([]);
  const [layouts, setLayouts] = useState([]);
  const [selectedLayoutId, setSelectedLayoutId] = useState('');

  const [loading, setLoading] = useState(true);
  const [seatsLoading, setSeatsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [seatTab, setSeatTab] = useState('layout');

  useEffect(() => {
    fetchShowtimes();
    fetchLayouts();
  }, []);

  useEffect(() => {
    if (selectedShowtime?.id) {
      setSelectedLayoutId(selectedShowtime.layoutId || '');
      fetchSeats(selectedShowtime.id);
    } else {
      setSeats([]);
      setSelectedLayoutId('');
    }
  }, [selectedShowtime?.id]);

  const normalizeShowtime = (showtime) => ({
    ...showtime,
    movieTitle:
      showtime.movieTitle ||
      showtime.movieName ||
      showtime.movie?.title ||
      'Phim không có tên',
    showDate:
      showtime.showDate ||
      showtime.date ||
      new Date().toISOString().split('T')[0],
    showTime:
      showtime.showTime ||
      showtime.time ||
      '00:00',
    cinemaName:
      showtime.cinemaName ||
      showtime.cinema?.name ||
      'Galaxy Studio',
    cinemaAddress:
      showtime.cinemaAddress ||
      showtime.cinema?.address ||
      ''
  });

  const fetchShowtimes = async () => {
    try {
      setLoading(true);

      const showtimesData = await getAllShowtimes();
      const processedShowtimes = (showtimesData || []).map(normalizeShowtime);

      const sortedShowtimes = processedShowtimes.sort((a, b) => {
        const dateA = new Date(`${a.showDate} ${a.showTime}`);
        const dateB = new Date(`${b.showDate} ${b.showTime}`);
        return dateA - dateB;
      });

      setShowtimes(sortedShowtimes);

      if (sortedShowtimes.length > 0) {
        setSelectedShowtime(sortedShowtimes[0]);
        setSelectedLayoutId(sortedShowtimes[0].layoutId || '');
      }
    } catch (error) {
      console.error('Error fetching showtimes:', error);
      showError('Error fetching showtimes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLayouts = async () => {
    try {
      const data = await getSeatLayouts();
      setLayouts(data || []);
    } catch (error) {
      console.error('Error fetching seat layouts:', error);
      showError('Error fetching seat layouts: ' + error.message);
    }
  };

  const fetchSeats = async (showtimeId) => {
    if (!showtimeId) return;

    try {
      setSeatsLoading(true);

      const seatsData = await getSeatsByShowtime(showtimeId);
      setSeats(seatsData || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading seats:', error);
      showError('Error loading seats: ' + error.message);
      setSeats([]);
    } finally {
      setSeatsLoading(false);
    }
  };

  const syncShowtimeStats = (updatedSeats, extraData = {}) => {
    if (!selectedShowtime) return;

    const updatedShowtime = {
      ...selectedShowtime,
      ...extraData,
      totalSeats: updatedSeats.length,
      availableSeats: updatedSeats.filter((seat) => !seat.booked).length
    };

    setSelectedShowtime(updatedShowtime);

    setShowtimes((prev) =>
      prev.map((showtime) =>
        showtime.id === updatedShowtime.id ? updatedShowtime : showtime
      )
    );
  };

  const handleShowtimeChange = (showtimeId) => {
    const showtime = showtimes.find((item) => item.id === showtimeId);

    setSelectedShowtime(showtime || null);
    setSelectedLayoutId(showtime?.layoutId || '');
    setLastUpdated(null);

    if (showtime) {
      showInfo(
        `Changed to showtime: ${showtime.movieTitle} - ${formatDate(showtime.showDate)} ${showtime.showTime}`
      );
    }
  };

  const handleLayoutChange = async (layoutId) => {
    const previousLayoutId = selectedLayoutId;
    setSelectedLayoutId(layoutId);

    if (!selectedShowtime) {
      showWarning('Please select a showtime first');
      return;
    }

    if (!layoutId) {
      return;
    }

    const selectedLayout = layouts.find((layout) => layout.id === layoutId);

    if (!selectedLayout) {
      showWarning('Layout does not exist');
      setSelectedLayoutId(previousLayoutId);
      return;
    }

    const confirmApply = window.confirm(
      'Selecting a new layout will apply it immediately to this showtime. If no seats have been booked, the old seats will be replaced. Are you sure?'
    );

    if (!confirmApply) {
      setSelectedLayoutId(previousLayoutId);
      return;
    }

    try {
      setSaving(true);

      const createdSeats = await applyLayoutToShowtime(
        selectedShowtime.id,
        layoutId
      );

      const updatedSeats = createdSeats || [];

      setSeats(updatedSeats);
      setLastUpdated(new Date());

      syncShowtimeStats(updatedSeats, {
        layoutId: selectedLayout.id,
        layoutName: selectedLayout.name,
        totalRows: selectedLayout.totalRows,
        totalCols: selectedLayout.totalCols
      });

      showSuccess('Apply layout successfully!');
    } catch (error) {
      console.error('Error applying layout:', error);
      setSelectedLayoutId(previousLayoutId);
      showError('Error applying layout: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const clearAllSeats = async () => {
    if (!selectedShowtime) {
      showWarning('Please select a showtime first');
      return;
    }

    if (!window.confirm(t('Are you sure you want to delete all seats?'))) {
      return;
    }

    try {
      setSaving(true);

      await deleteSeatsByShowtime(selectedShowtime.id);

      setSeats([]);
      setSelectedLayoutId('');
      setLastUpdated(new Date());

      syncShowtimeStats([], {
        layoutId: null,
        layoutName: null,
        totalRows: 0,
        totalCols: 0
      });

      showSuccess('Delete all seats successfully!');
    } catch (error) {
      console.error('Error clearing all seats:', error);
      showError('Error deleting all seats: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const refreshSeats = async () => {
    if (!selectedShowtime) {
      showWarning('Please select a showtime first');
      return;
    }

    await fetchSeats(selectedShowtime.id);
    showSuccess('Refresh seats successfully!');
  };

  const deleteSeatHandler = async (seatId) => {
    if (!seatId) return;

    if (!window.confirm('Bạn có chắc chắn muốn xóa ghế này?')) {
      return;
    }

    try {
      await deleteSeat(seatId);

      const updatedSeats = seats.filter((seat) => seat.id !== seatId);

      setSeats(updatedSeats);
      syncShowtimeStats(updatedSeats);
      showSuccess('Delete seat successfully!');
    } catch (error) {
      console.error('Error deleting seat:', error);
      showError('Error deleting seat: ' + error.message);
    }
  };

  const toggleSeatStatus = async (seatId) => {
    const seat = seats.find((item) => item.id === seatId);
    if (!seat) return;

    try {
      const updatedSeat = await updateSeat(seatId, {
        ...seat,
        booked: !seat.booked,
        bookedBy: seat.booked ? null : 'admin',
        bookedAt: seat.booked ? null : new Date().toISOString()
      });

      const updatedSeats = seats.map((item) =>
        item.id === seatId ? updatedSeat : item
      );

      setSeats(updatedSeats);
      syncShowtimeStats(updatedSeats);
    } catch (error) {
      console.error('Error updating seat:', error);
      showError('Error updating seat: ' + error.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not Updated yet';

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
      console.error('Error formatting date:', error);
      return 'Not Updated yet';
    }
  };

  const getSeatGridTotalCols = () => {
    const selectedLayout = layouts.find(
      (layout) => layout.id === selectedLayoutId
    );

    const maxSeatCol =
      seats.length > 0
        ? Math.max(...seats.map((seat) => Number(seat.colIndex || 0)))
        : 0;

    return (
      Number(selectedShowtime?.totalCols) ||
      Number(selectedLayout?.totalCols) ||
      maxSeatCol ||
      10
    );
  };

  const getSeatTypeClass = (seat) => {
    const type = (seat.seatType || 'REGULAR').toUpperCase();

    if (type === 'VIP') 
      return styles.vip;
    if (type === 'COUPLE') 
      return styles.couple;

    return styles.regular;
  };

  const groupedShowtimes = showtimes.reduce((acc, showtime) => {
    const movieTitle = showtime.movieTitle || 'Movie without title';

    if (!acc[movieTitle]) {
      acc[movieTitle] = [];
    }

    acc[movieTitle].push(showtime);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Đang tải danh sách suất chiếu...</p>
      </div>
    );
  }

  return (
    <div className={styles.seatManagement}>
      <div className={styles.subTabs}>
        <button
          className={`${styles.subTabButton} ${
            seatTab === 'layout' ? styles.activeSubTab : ''
          }`}
          onClick={() => setSeatTab('layout')}
        >
          Layout Management
        </button>

        <button
          className={`${styles.subTabButton} ${
            seatTab === 'seats' ? styles.activeSubTab : ''
          }`}
          onClick={() => setSeatTab('seats')}
        >
          Seat By Showtime
        </button>
      </div>

      {seatTab === 'layout' && (
        <LayoutManagement onLayoutCreated={fetchLayouts} />
      )}

      {seatTab === 'seats' && (
        <>
          <div className={styles.header}>
            <div className={styles.controls}>
              <select
                value={selectedShowtime?.id || ''}
                onChange={(e) => handleShowtimeChange(e.target.value)}
                className={styles.showtimeSelect}
              >
                <option value="">Select a showtime</option>

                {Object.entries(groupedShowtimes).map(
                  ([movieTitle, movieShowtimes]) => (
                    <optgroup key={movieTitle} label={movieTitle}>
                      {movieShowtimes.map((showtime) => (
                        <option key={showtime.id} value={showtime.id}>
                          {formatDate(showtime.showDate)} - {showtime.showTime} -{' '}
                          {showtime.cinemaName}
                        </option>
                      ))}
                    </optgroup>
                  )
                )}
              </select>

              <button
                className={styles.refreshButton}
                onClick={refreshSeats}
                disabled={!selectedShowtime || seatsLoading}
                title="Refresh Seats"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>

          {selectedShowtime ? (
            <div className={styles.showtimeInfo}>
              <div className={styles.showtimeCard}>
                <div className={styles.movieInfo}>
                  <h3>{selectedShowtime.movieTitle}</h3>

                  <div className={styles.showtimeDetails}>
                    <div className={styles.detailItem}>
                      <Calendar size={16} />
                      <span>{formatDate(selectedShowtime.showDate)}</span>
                    </div>

                    <div className={styles.detailItem}>
                      <Clock size={16} />
                      <span>{selectedShowtime.showTime}</span>
                    </div>

                    <div className={styles.detailItem}>
                      <MapPin size={16} />
                      <span>{selectedShowtime.cinemaName}</span>
                    </div>
                  </div>

                  <div className={styles.showtimeId}>
                    <span className={styles.idLabel}>ID Showtime:</span>
                    <span className={styles.idValue}>
                      {selectedShowtime.id}
                    </span>
                  </div>

                  {selectedShowtime.cinemaAddress && (
                    <div className={styles.cinemaAddress}>
                      <MapPin size={14} />
                      <span>{selectedShowtime.cinemaAddress}</span>
                    </div>
                  )}
                </div>

                <div className={styles.seatStats}>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Total Seats:</span>
                    <span className={styles.statValue}>{seats.length}</span>
                  </div>

                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Booked:</span>
                    <span className={styles.statValue}>
                      {seats.filter((seat) => seat.booked).length}
                    </span>
                  </div>

                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Available:</span>
                    <span className={styles.statValue}>
                      {seats.filter((seat) => !seat.booked).length}
                    </span>
                  </div>

                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Layout:</span>
                    <span className={styles.statValue}>
                      {selectedShowtime.layoutName || 'Not applied'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.noShowtime}>
              <MapPin size={48} />
              <h3>Select a showtime to manage seats</h3>
              <p>
                Please select a showtime from the list above to start managing seats
              </p>
            </div>
          )}

          {selectedShowtime && (
            <div className={styles.seatManager}>
              <div className={styles.seatManagerHeader}>
                <div className={styles.headerInfo}>
                  <h3>Manage Seats for Showtime</h3>
                  <p>
                    {selectedShowtime.movieTitle} -{' '}
                    {formatDate(selectedShowtime.showDate)}{' '}
                    {selectedShowtime.showTime}
                  </p>
                </div>

                <div className={styles.seatManagerActions}>
                  <div className={styles.lastUpdated}>
                    {lastUpdated && (
                      <span>
                        Last updated:{' '}
                        {lastUpdated.toLocaleTimeString('vi-VN')}
                      </span>
                    )}
                  </div>

                  <select
                    value={selectedLayoutId}
                    onChange={(e) => handleLayoutChange(e.target.value)}
                    className={styles.showtimeSelect}
                    disabled={!selectedShowtime || saving}
                  >
                    <option value="">Select a seat layout to apply</option>

                    {layouts.map((layout) => (
                      <option key={layout.id} value={layout.id}>
                        {layout.name} - {layout.totalRows} rows x{' '}
                        {layout.totalCols} cols
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={clearAllSeats}
                    className={styles.btnClear}
                    disabled={saving}
                  >
                    <Trash2 size={16} />
                    Delete all seats
                  </button>
                </div>
              </div>

              <div className={styles.seatManagerContent}>
                <div className={styles.seatsList}>
                  <h4>Seat List ({seats.length})</h4>

                  {seatsLoading ? (
                    <div className={styles.loadingSeats}>
                      <div className={styles.spinner}></div>
                      <p>Loading seats...</p>
                    </div>
                  ) : seats.length === 0 ? (
                    <div className={styles.noSeatsMessage}>
                      <div className={styles.noSeatsContent}>
                        <h3>No seats available for this showtime</h3>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={styles.managerSeatMap}
                      style={{
                        gridTemplateColumns: `repeat(${getSeatGridTotalCols()}, 64px)`
                      }}
                    >
                      {seats.map((seat) => (
                        <div
                          key={seat.id}
                          className={`${styles.managerSeat} ${getSeatTypeClass(
                            seat
                          )} ${seat.booked ? styles.booked : ''}`}
                          style={{
                            gridRow: seat.rowIndex || 'auto',
                            gridColumn: seat.colIndex
                              ? `${seat.colIndex} / span ${seat.colSpan || 1}`
                              : 'auto'
                          }}
                        >
                          <div className={styles.seatNumber}>
                            {seat.seatNumber}
                          </div>

                          <div className={styles.seatTypeText}>
                            {(seat.seatType || 'REGULAR').toUpperCase()}
                          </div>

                          <div className={styles.seatPriceText}>
                            {Number(seat.price || 0).toLocaleString('vi-VN')}đ
                          </div>

                          {seat.booked && (
                            <div className={styles.seatBookedInfo}>
                              <span className={styles.bookedBy}>
                                Booked by: {seat.bookedBy || 'Admin'}
                              </span>

                              <span className={styles.bookedAt}>
                                {seat.bookedAt
                                  ? new Date(seat.bookedAt).toLocaleString('vi-VN')
                                  : 'Just now'}
                              </span>
                            </div>
                          )}

                          <div className={styles.seatActions}>
                            <button
                              className={`${styles.btnToggle} ${seat.booked ? styles.unbook : styles.book}`}
                              onClick={() => toggleSeatStatus(seat.id)}
                              title={seat.booked ? 'Unbook Seat' : 'Book Seat'}
                            >
                              {seat.booked ? '✓' : '○'}
                            </button>

                            <button
                              className={styles.deleteBtn}
                              onClick={() => deleteSeatHandler(seat.id)}
                              title="Delete Seat"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SeatManagement;