import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Save, X, RefreshCw } from 'lucide-react';
import { createSeat, createMultipleSeats, updateSeat, deleteSeat,deleteSeatsByShowtime,getSeatsByShowtime,checkApiConnection } from '../../services/seatService';
import './SeatManager.css';

const SeatManager = ({ onSeatsChange, showtimeId }) => {
  const [seats, setSeats] = useState([]);
  const [editingSeat, setEditingSeat] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSeat, setNewSeat] = useState({ row: 'A', number: 1, booked: false });
  const [pendingSeats, setPendingSeats] = useState([]);
  const [saving, setSaving] = useState(false);
  const [apiConnected, setApiConnected] = useState(true);

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  useEffect(() => {
    const loadSeats = async () => {
      if (!showtimeId) return;
      const isConnected = await checkApiConnection();
      setApiConnected(isConnected);
      
      if (!isConnected) {
        console.log('API not connected, skipping database load');
        return;
      }
      
      try {
        const seatsData = await getSeatsByShowtime(showtimeId);
        setSeats(seatsData || []);
        onSeatsChange(seatsData || []);
      } catch (error) {
        console.error('Error loading seats:', error);
        setApiConnected(false);
        // Reset seats when there's an error
        setSeats([]);
        onSeatsChange([]);
      }
    };

    loadSeats();
  }, [showtimeId, onSeatsChange]);

  const addSeat = () => {
    const seat = {
      seatNumber: `${newSeat.row}${newSeat.number}`,
      showtimeId: showtimeId || 'default',
      booked: newSeat.booked,
      bookedBy: newSeat.booked ? 'admin' : null,
      bookedAt: newSeat.booked ? new Date().toISOString() : null,
      isPending: true
    };

    if (seats.find(s => s.seatNumber === seat.seatNumber) || 
        pendingSeats.find(s => s.seatNumber === seat.seatNumber)) {
      alert('Ghế này đã tồn tại!');
      return;
    }

    setPendingSeats(prev => [...prev, seat]);
    setNewSeat({ row: 'A', number: 1, booked: false });
  };

  const addAndSaveSeat = async () => {
    const seat = {
      seatNumber: `${newSeat.row}${newSeat.number}`,
      showtimeId: showtimeId || 'default',
      booked: newSeat.booked,
      bookedBy: newSeat.booked ? 'admin' : null,
      bookedAt: newSeat.booked ? new Date().toISOString() : null
    };

    if (seats.find(s => s.seatNumber === seat.seatNumber) || 
        pendingSeats.find(s => s.seatNumber === seat.seatNumber)) {
      alert('Ghế này đã tồn tại!');
      return;
    }

    try {
      setSaving(true);
      const createdSeat = await createSeat(seat);
      const updatedSeats = [...seats, createdSeat];
      setSeats(updatedSeats);
      onSeatsChange(updatedSeats);
      setNewSeat({ row: 'A', number: 1, booked: false });
      console.log('Seat added and saved successfully:', createdSeat);
    } catch (error) {
      console.error('Error adding and saving seat:', error);
      
      if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
        console.log('API not available, adding to local state only');
        const localSeat = {
          ...seat,
          id: `local-${Date.now()}-${Math.random()}`,
          isLocal: true
        };
        const updatedSeats = [...seats, localSeat];
        setSeats(updatedSeats);
        onSeatsChange(updatedSeats);
        setNewSeat({ row: 'A', number: 1, booked: false });
        alert('Đã thêm ghế vào giao diện. Lưu ý: Ghế chưa được lưu vào database do lỗi kết nối API.');
      } else {
        alert('Lỗi khi thêm và lưu ghế: ' + error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteSeatHandler = async (seatId) => {
    if (!seatId) {
      return;
    }

    try {
      await deleteSeat(seatId);
      const updatedSeats = seats.filter(s => s.id !== seatId);
      setSeats(updatedSeats);
      onSeatsChange(updatedSeats);
    } catch (error) {
      console.error('Error deleting seat:', error);
      
      if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
        const updatedSeats = seats.filter(s => s.id !== seatId);
        setSeats(updatedSeats);
        onSeatsChange(updatedSeats);
      } else {
        alert('Lỗi khi xóa ghế: ' + error.message);
      }
    }
  };

  const toggleSeatStatus = async (seatId) => {
    const seat = seats.find(s => s.id === seatId);
    if (!seat) return;

    try {
      let updatedSeat;
      if (seat.booked) {
        // Hủy đặt ghế
        updatedSeat = await updateSeat(seatId, { 
          ...seat, 
          booked: false, 
          bookedBy: null, 
          bookedAt: null 
        });
      } else {
        // Đặt ghế
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
      onSeatsChange(updatedSeats);
    } catch (error) {
      console.error('Error updating seat:', error);
      alert('Lỗi khi cập nhật ghế: ' + error.message);
    }
  };

  const generateAllSeats = async () => {
    const allSeats = [];
    rows.forEach(row => {
      for (let num = 1; num <= 10; num++) {
        allSeats.push({
          seatNumber: `${row}${num}`,
          showtimeId: showtimeId || 'default',
          booked: false,
          bookedBy: null,
          bookedAt: null
        });
      }
    });

    try {
      const createdSeats = await createMultipleSeats(allSeats);
      setSeats(createdSeats);
      onSeatsChange(createdSeats);
    } catch (error) {
      alert('Lỗi khi tạo ghế: ' + error.message);
    }
  };

  const clearAllSeats = async () => {
    if (!showtimeId) {
      alert('Không thể xóa ghế: thiếu showtimeId');
      return;
    }

    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả ghế?')) {
      try {
        // Thử xóa từ database trước
        await deleteSeatsByShowtime(showtimeId);
        setSeats([]);
        setPendingSeats([]);
        onSeatsChange([]);
      } catch (error) {
        console.error('Error clearing all seats from database:', error);
        
        if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
          setSeats([]);
          setPendingSeats([]);
          onSeatsChange([]);
        } else {
          alert('Lỗi khi xóa tất cả ghế: ' + error.message);
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
      onSeatsChange(updatedSeats);
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
        onSeatsChange(updatedSeats);
      } else {
        alert('Lỗi khi lưu ghế: ' + error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const removePendingSeat = (seatNumber) => {
    setPendingSeats(prev => prev.filter(s => s.seatNumber !== seatNumber));
  };

  const refreshSeats = async () => {
    if (!showtimeId) return;
    
    try {
      const seatsData = await getSeatsByShowtime(showtimeId);
      setSeats(seatsData || []);
      onSeatsChange(seatsData || []);
      console.log('Seats refreshed from database');
    } catch (error) {
      console.error('Error refreshing seats:', error);

      if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
        alert('Không thể tải lại ghế từ database do lỗi kết nối API. Giao diện sẽ hiển thị dữ liệu hiện tại.');
      } else {
        alert('Lỗi khi tải lại ghế: ' + error.message);
        setSeats([]);
        onSeatsChange([]);
      }
    }
  };

  return (
    <div className="seat-manager">
      <div className="seat-manager-header">
        <div className="header-info">
          <h3>Quản lý ghế</h3>
        </div>
        <div className="seat-manager-actions">
          <button onClick={generateAllSeats} className="btn-generate">
            <Plus size={16} />
            Tạo tất cả ghế mới
          </button>
          <button onClick={clearAllSeats} className="btn-clear">
            <Trash2 size={16} />
            Xóa tất cả
          </button>
        </div>
      </div>

      <div className="seat-manager-content">
        <div className="add-seat-form">
          <h4>Thêm ghế mới</h4>
          <div className="form-row">
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
            <button onClick={addSeat} className="btn-add">
              <Plus size={16} />
              Thêm
            </button>
            <button 
              onClick={addAndSaveSeat} 
              className="btn-save-immediate"
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="loading-spinner-small"></div>
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

        <div className="seats-list">
          <h4>Danh sách ghế ({seats.length})</h4>
          
          {pendingSeats.length > 0 && (
            <div className="pending-seats-section">
              <div className="pending-header">
                <h5>Ghế chờ lưu ({pendingSeats.length})</h5>
                <button 
                  onClick={savePendingSeats}
                  className="btn-save"
                  disabled={saving}
                >
                  <Save size={16} />
                  {saving ? 'Đang lưu...' : 'Lưu tất cả'}
                </button>
              </div>
              <div className="seats-grid-manager pending">  
                {pendingSeats.map((seat, index) => (
                  <div key={`pending-${index}`} className="seat-item pending">
                    <span className="seat-number">{seat.seatNumber}</span>
                    <div className="seat-actions">
                      <button 
                        onClick={() => removePendingSeat(seat.seatNumber)}
                        className="btn-delete"
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

          {seats.length === 0 ? (
            <div className="no-seats-message">
              <div className="no-seats-content">
                <h3>Chưa có ghế nào cho suất chiếu này</h3>
                <p>Hãy tạo ghế để bắt đầu quản lý</p>
                <button 
                  className="btn-generate-seats"
                  onClick={generateAllSeats}
                  disabled={saving}
                >
                  <Plus size={16} />
                  Tạo ghế tự động (100 ghế)
                </button>
              </div>
            </div>
          ) : (
            <div className="seats-grid-manager booked">   
              {seats.map(seat => (
                <div key={seat.id} className={`seat-item ${seat.booked ? 'booked' : ''}`}>
                  <span className="seat-number">{seat.seatNumber}</span>
                  <div className="seat-actions">
                    <button 
                      onClick={() => toggleSeatStatus(seat.id)}
                      className={`btn-toggle ${seat.booked ? 'unbook' : 'book'}`}
                      title={seat.booked ? 'Bỏ đặt' : 'Đặt ghế'}
                    >
                      {seat.booked ? '✓' : '○'}
                    </button>
                    <button 
                      onClick={() => deleteSeatHandler(seat.id)}
                      className="btn-delete" 
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
  );
};

export default SeatManager;
