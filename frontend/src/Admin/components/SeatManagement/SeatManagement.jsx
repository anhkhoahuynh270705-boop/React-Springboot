import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  RefreshCw,
  Calendar,
  Clock,
  Film,
  MapPin
} from 'lucide-react';
import { getAllShowtimes } from '../../../services/showtimeService';
import { createSeat, createMultipleSeats, updateSeat, deleteSeat, deleteSeatsByShowtime, getSeatsByShowtime, checkApiConnection } from '../../../services/seatService';
import useToast from '../../hooks/useToast';
import styles from './SeatManagement.module.css';

const SeatManagement = () => {
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const [showtimes, setShowtimes] = useState([]);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seatsLoading, setSeatsLoading] = useState(false);
  const [editingSeat, setEditingSeat] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSeat, setNewSeat] = useState({ row: 'A', number: 1, booked: false });
  const [pendingSeats, setPendingSeats] = useState([]);
  const [saving, setSaving] = useState(false);
  const [apiConnected, setApiConnected] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  useEffect(() => {
    fetchShowtimes();
  }, []);

  useEffect(() => {
    if (selectedShowtime) {
      fetchSeats(selectedShowtime.id);
    }
  }, [selectedShowtime]);


  const fetchShowtimes = async () => {
    try {
      setLoading(true);
      const showtimesData = await getAllShowtimes();
      // Process and validate showtime data
      const processedShowtimes = showtimesData.map(showtime => ({
        ...showtime,
        movieTitle: showtime.movieTitle || showtime.movieName || showtime.movie?.title || 'Phim không có tên',
        showDate: showtime.showDate || showtime.date || new Date().toISOString().split('T')[0],
        showTime: showtime.showTime || showtime.time || '00:00',
        cinemaName: showtime.cinemaName || showtime.cinema?.name || 'Galaxy Studio',
        cinemaAddress: showtime.cinemaAddress || showtime.cinema?.address || '123 Đường ABC, Quận 1, TP.HCM'
      }));
      
      // Group showtimes by movie title for better organization
      const groupedShowtimes = processedShowtimes.reduce((acc, showtime) => {
        const movieTitle = showtime.movieTitle;
        if (!acc[movieTitle]) {
          acc[movieTitle] = [];
        }
        acc[movieTitle].push(showtime);
        return acc;
      }, {});
      
      // Flatten and sort by show date and time
      const sortedShowtimes = Object.values(groupedShowtimes)
        .flat()
        .sort((a, b) => {
          const dateA = new Date(a.showDate + ' ' + a.showTime);
          const dateB = new Date(b.showDate + ' ' + b.showTime);
          return dateA - dateB;
        });
      
      setShowtimes(sortedShowtimes);
      if (sortedShowtimes.length > 0) {
        setSelectedShowtime(sortedShowtimes[0]);
      }
    } catch (error) {
      console.error('Error fetching showtimes:', error);
      showError('Lỗi khi tải danh sách suất chiếu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSeats = async (showtimeId) => {
    if (!showtimeId) return;
    
    try {
      setSeatsLoading(true);
      const isConnected = await checkApiConnection();
      setApiConnected(isConnected);
      
      if (!isConnected) {
        setSeats([]);
        return;
      }
      
      const seatsData = await getSeatsByShowtime(showtimeId);
      setSeats(seatsData || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading seats:', error);
      setApiConnected(false);
      setSeats([]);
    } finally {
      setSeatsLoading(false);
    }
  };

  const handleShowtimeChange = (showtimeId) => {
    const showtime = showtimes.find(s => s.id === showtimeId);
    console.log('Selected showtime:', showtime);
    setSelectedShowtime(showtime);
    setPendingSeats([]);
    setShowAddForm(false);
    
    if (showtime) {
      showInfo(`Đã chuyển sang suất chiếu: ${showtime.movieTitle} - ${formatDate(showtime.showDate)} ${showtime.showTime}`);
    }
  };

  const addSeat = () => {
    if (!selectedShowtime) {
      showWarning('Vui lòng chọn suất chiếu trước');
      return;
    }

    const seat = {
      seatNumber: `${newSeat.row}${newSeat.number}`,
      showtimeId: selectedShowtime.id,
      booked: newSeat.booked,
      bookedBy: newSeat.booked ? 'admin' : null,
      bookedAt: newSeat.booked ? new Date().toISOString() : null,
      isPending: true
    };

    if (seats.find(s => s.seatNumber === seat.seatNumber) || 
        pendingSeats.find(s => s.seatNumber === seat.seatNumber)) {
      showWarning('Ghế này đã tồn tại!');
      return;
    }

    setPendingSeats(prev => [...prev, seat]);
    setNewSeat({ row: 'A', number: 1, booked: false });
  };

  const addAndSaveSeat = async () => {
    if (!selectedShowtime) {
      showWarning('Vui lòng chọn suất chiếu trước');
      return;
    }

    const seat = {
      seatNumber: `${newSeat.row}${newSeat.number}`,
      showtimeId: selectedShowtime.id,
      booked: newSeat.booked,
      bookedBy: newSeat.booked ? 'admin' : null,
      bookedAt: newSeat.booked ? new Date().toISOString() : null
    };

    if (seats.find(s => s.seatNumber === seat.seatNumber) || 
        pendingSeats.find(s => s.seatNumber === seat.seatNumber)) {
      showWarning('Ghế này đã tồn tại!');
      return;
    }

    try {
      setSaving(true);
      const createdSeat = await createSeat(seat);
      const updatedSeats = [...seats, createdSeat];
      setSeats(updatedSeats);
      setNewSeat({ row: 'A', number: 1, booked: false });
      showSuccess('Thêm ghế thành công!');
    } catch (error) {
      console.error('Error adding and saving seat:', error);
      
      if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
        const localSeat = {
          ...seat,
          id: `local-${Date.now()}-${Math.random()}`,
          isLocal: true
        };
        const updatedSeats = [...seats, localSeat];
        setSeats(updatedSeats);
        setNewSeat({ row: 'A', number: 1, booked: false });
        showWarning('Đã thêm ghế vào giao diện. Lưu ý: Ghế chưa được lưu vào database do lỗi kết nối API.');
      } else {
        showError('Lỗi khi thêm và lưu ghế: ' + error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteSeatHandler = async (seatId) => {
    if (!seatId) return;

    try {
      await deleteSeat(seatId);
      const updatedSeats = seats.filter(s => s.id !== seatId);
      setSeats(updatedSeats);
      showSuccess('Xóa ghế thành công!');
    } catch (error) {
      console.error('Error deleting seat:', error);
      
      if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
        const updatedSeats = seats.filter(s => s.id !== seatId);
        setSeats(updatedSeats);
      } else {
        showError('Lỗi khi xóa ghế: ' + error.message);
      }
    }
  };

  const toggleSeatStatus = async (seatId) => {
    const seat = seats.find(s => s.id === seatId);
    if (!seat) return;

    try {
      let updatedSeat;
      if (seat.booked) {
        updatedSeat = await updateSeat(seatId, { 
          ...seat, 
          booked: false, 
          bookedBy: null, 
          bookedAt: null 
        });
      } else {
        updatedSeat = await updateSeat(seatId, { 
          ...seat, 
          booked: true, 
          bookedBy: 'admin', 
          bookedAt: new Date().toISOString() 
        });
      }
      
      const updatedSeats = seats.map(s => 
        s.id === seatId ? updatedSeat : s
      );
      setSeats(updatedSeats);
    } catch (error) {
      console.error('Error updating seat:', error);
      showError('Lỗi khi cập nhật ghế: ' + error.message);
    }
  };

  const generateAllSeats = async () => {
    if (!selectedShowtime) {
      showWarning('Vui lòng chọn suất chiếu trước');
      return;
    }

    const allSeats = [];
    rows.forEach(row => {
      for (let num = 1; num <= 10; num++) {
        allSeats.push({
          seatNumber: `${row}${num}`,
          showtimeId: selectedShowtime.id,
          booked: false,
          bookedBy: null,
          bookedAt: null
        });
      }
    });

    try {
      setSaving(true);
      const createdSeats = await createMultipleSeats(allSeats);
      setSeats(createdSeats);
      showSuccess('Tạo tất cả ghế thành công!');
    } catch (error) {
      showError('Lỗi khi tạo ghế: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const clearAllSeats = async () => {
    if (!selectedShowtime) {
      showWarning('Vui lòng chọn suất chiếu trước');
      return;
    }

    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả ghế?')) {
      try {
        await deleteSeatsByShowtime(selectedShowtime.id);
        setSeats([]);
        setPendingSeats([]);
        showSuccess('Xóa tất cả ghế thành công!');
      } catch (error) {
        console.error('Error clearing all seats from database:', error);
        
        if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
          setSeats([]);
          setPendingSeats([]);
        } else {
          showError('Lỗi khi xóa tất cả ghế: ' + error.message);
        }
      }
    }
  };

  const savePendingSeats = async () => {
    if (pendingSeats.length === 0) return;

    try {
      setSaving(true);
      const createdSeats = await createMultipleSeats(pendingSeats);
      const updatedSeats = [...seats, ...createdSeats];
      setSeats(updatedSeats);
      setPendingSeats([]);
      showSuccess('Lưu tất cả ghế thành công!');
    } catch (error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
        const localSeats = pendingSeats.map(seat => ({
          ...seat,
          id: `local-${Date.now()}-${Math.random()}`,
          isLocal: true
        }));
        const updatedSeats = [...seats, ...localSeats];
        setSeats(updatedSeats);
        setPendingSeats([]);
      } else {
        showError('Lỗi khi lưu ghế: ' + error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const removePendingSeat = (seatNumber) => {
    setPendingSeats(prev => prev.filter(s => s.seatNumber !== seatNumber));
  };

  const refreshSeats = async () => {
    if (!selectedShowtime) return;
    
    try {
      const seatsData = await getSeatsByShowtime(selectedShowtime.id);
      setSeats(seatsData || []);
      setLastUpdated(new Date());
      showSuccess('Làm mới ghế thành công!');
    } catch (error) {
      console.error('Error refreshing seats:', error);

      if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
        showWarning('Không thể tải lại ghế từ database do lỗi kết nối API.');
      } else {
        showError('Lỗi khi tải lại ghế: ' + error.message);
        setSeats([]);
      }
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
        <p>Đang tải danh sách suất chiếu...</p>
      </div>
    );
  }

  return (
    <div className={styles.seatManagement}>
      <div className={styles.header}>
        <div className={styles.controls}>
          <select
            value={selectedShowtime?.id || ''}
            onChange={(e) => handleShowtimeChange(e.target.value)}
            className={styles.showtimeSelect}
          >
            <option value="">Chọn suất chiếu</option>
            {Object.entries(
              showtimes.reduce((acc, showtime) => {
                const movieTitle = showtime.movieTitle;
                if (!acc[movieTitle]) {
                  acc[movieTitle] = [];
                }
                acc[movieTitle].push(showtime);
                return acc;
              }, {})
            ).map(([movieTitle, movieShowtimes]) => (
              <optgroup key={movieTitle} label={`🎬 ${movieTitle}`}>
                {movieShowtimes.map(showtime => (
                  <option key={showtime.id} value={showtime.id}>
                    📅 {formatDate(showtime.showDate)} - ⏰ {showtime.showTime} - 🏢 {showtime.cinemaName}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <button 
            className={styles.refreshButton} 
            onClick={refreshSeats}
            disabled={!selectedShowtime}
            title="Làm mới ghế"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {selectedShowtime ? (
        <div className={styles.showtimeInfo}>
        <div className={styles.showtimeCard}>
          <div className={styles.movieInfo}>
            <h3>🎬 {selectedShowtime.movieTitle}</h3>
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
              <span className={styles.idLabel}>ID Suất chiếu:</span>
              <span className={styles.idValue}>{selectedShowtime.id}</span>
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
                <span className={styles.statLabel}>Tổng ghế:</span>
                <span className={styles.statValue}>{seats.length}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Đã đặt:</span>
                <span className={styles.statValue}>{seats.filter(s => s.booked).length}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Trống:</span>
                <span className={styles.statValue}>{seats.filter(s => !s.booked).length}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Suất chiếu ID:</span>
                <span className={styles.statValue}>{selectedShowtime.id}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
      <div className={styles.noShowtime}>
        <MapPin size={48} />
        <h3>Chọn suất chiếu để quản lý ghế</h3>
        <p>Vui lòng chọn một suất chiếu từ danh sách trên để bắt đầu quản lý ghế</p>
      </div>
      )}

      {selectedShowtime && (
        <div className={styles.seatManager}>
        <div className={styles.seatManagerHeader}>
          <div className={styles.headerInfo}>
            <h3>Quản lý ghế cho suất chiếu</h3>
            <p>{selectedShowtime.movieTitle} - {formatDate(selectedShowtime.showDate)} {selectedShowtime.showTime}</p>
          </div>
            <div className={styles.seatManagerActions}>
              <div className={styles.lastUpdated}>
                {lastUpdated && (
                  <span>Cập nhật lần cuối: {lastUpdated.toLocaleTimeString('vi-VN')}</span>
                )}
              </div>
              <button onClick={generateAllSeats} className={styles.btnGenerate} disabled={saving}>
                <Plus size={16} />
                Tạo tất cả ghế mới
              </button>
              <button onClick={clearAllSeats} className={styles.btnClear} disabled={saving}>
                <Trash2 size={16} />
                Xóa tất cả
              </button>
            </div>
          </div>

          <div className={styles.seatManagerContent}>
            <div className={styles.addSeatForm}>
              <h4>Thêm ghế mới</h4>
              <div className={styles.formRow}>
                <select 
                  value={newSeat.row} 
                  onChange={(e) => setNewSeat({...newSeat, row: e.target.value})}
                >
                  {rows.map(row => (
                    <option key={row} value={row}>{row}</option>
                  ))}
                </select>
                <input 
                  type="number" 
                  min="1" 
                  max="10" 
                  value={newSeat.number}
                  onChange={(e) => setNewSeat({...newSeat, number: parseInt(e.target.value)})}
                />
                <label>
                  <input 
                    type="checkbox" 
                    checked={newSeat.booked}
                    onChange={(e) => setNewSeat({...newSeat, booked: e.target.checked})}
                  />
                  Đã đặt
                </label>
                <button 
                  onClick={addAndSaveSeat} 
                  className={styles.btnSaveImmediate}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className={styles.loadingSpinnerSmall}></div>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Áp dụng 
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className={styles.seatsList}>
              <h4>Danh sách ghế ({seats.length})</h4>
              
              {pendingSeats.length > 0 && (
                <div className={styles.pendingSeatsSection}>
                  <div className={styles.pendingHeader}>
                    <h5>Ghế chờ lưu ({pendingSeats.length})</h5>
                    <button 
                      onClick={savePendingSeats}
                      className={styles.btnSave}
                      disabled={saving}
                    >
                      <Save size={16} />
                      {saving ? 'Đang lưu...' : 'Lưu tất cả'}
                    </button>
                  </div>
                  <div className={styles.seatsGridManager}>  
                    {pendingSeats.map((seat, index) => (
                      <div key={`pending-${index}`} className={`${styles.seatItem} ${styles.pending}`}>
                        <span className={styles.seatNumber}>{seat.seatNumber}</span>
                        <div className={styles.seatActions}>
                          <button 
                            onClick={() => removePendingSeat(seat.seatNumber)}
                            className={styles.btnDelete}
                            title="Xóa khỏi danh sách chờ"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {seatsLoading ? (
                <div className={styles.loadingSeats}>
                  <div className={styles.spinner}></div>
                  <p>Đang tải ghế...</p>
                </div>
              ) : seats.length === 0 ? (
                <div className={styles.noSeatsMessage}>
                  <div className={styles.noSeatsContent}>
                    <h3>Chưa có ghế nào cho suất chiếu này</h3>
                    <p>Hãy tạo ghế để bắt đầu quản lý</p>
                    <button 
                      className={styles.btnGenerateSeats}
                      onClick={generateAllSeats}
                      disabled={saving}
                    >
                      <Plus size={16} />
                      Tạo ghế tự động (100 ghế)
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.seatsGridManager}>   
                  {seats.map(seat => (
                    <div key={seat.id} className={`${styles.seatItem} ${seat.booked ? styles.booked : ''}`}>
                      <span className={styles.seatNumber}>{seat.seatNumber}</span>
                      {seat.booked && (
                        <div className={styles.seatBookedInfo}>
                          <span className={styles.bookedBy}>Đặt bởi: {seat.bookedBy || 'Admin'}</span>
                          <span className={styles.bookedAt}>
                            {seat.bookedAt ? new Date(seat.bookedAt).toLocaleString('vi-VN') : 'Vừa xong'}
                          </span>
                        </div>
                      )}
                      <div className={styles.seatActions}>
                        <button 
                          onClick={() => toggleSeatStatus(seat.id)}
                          className={`${styles.btnToggle} ${seat.booked ? styles.unbook : styles.book}`}
                          title={seat.booked ? 'Bỏ đặt' : 'Đặt ghế'}
                        >
                          {seat.booked ? '✓' : '○'}
                        </button>
                        <button 
                          onClick={() => deleteSeatHandler(seat.id)}
                          className={styles.deleteBtn} 
                          title="Xóa ghế"
                        >
                          <Trash2 size={14} />
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
    </div>
  );
};

export default SeatManagement;
