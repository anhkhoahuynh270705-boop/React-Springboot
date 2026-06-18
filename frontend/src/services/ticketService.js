  /* eslint-disable no-unused-vars */
  import { authFetch, adminFetch } from './apiClient';

  // get all tickets by user
  export const getTicketsByUser = async (userId) => {
    try {
      const response = await authFetch(`/tickets/user/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching user tickets:', error);
      throw error;
    }
  };

  // get ticket by ID
  export const getTicketById = async (ticketId) => {
    try {
      const response = await authFetch(`/tickets/${ticketId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching ticket:', error);
      throw error;
    }
  };

  // book new ticket
  export const bookTicket = async (ticketData) => {
    try {
      const response = await authFetch(`/tickets/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticketData)
      });
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.text();
          console.error('Error response:', errorData);
          errorMessage = errorData || errorMessage;
        } catch (e) {
          console.error('Could not parse error response');
        }
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      
      // save ticket to localStorage after booking successfully
      try {
        const existingTickets = JSON.parse(localStorage.getItem('userTickets') || '[]');
        const newTicket = {
          ...ticketData,
          id: result.id || result._id || Date.now().toString(), 
          ticketNumber: result.ticketNumber || ticketData.ticketNumber,
          qrCode: result.qrCode || ticketData.qrCode,
          status: result.status || ticketData.status,
          paymentStatus: result.paymentStatus || ticketData.paymentStatus,
          bookingTime: result.bookingTime || new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const updatedTickets = [...existingTickets, newTicket];
        localStorage.setItem('userTickets', JSON.stringify(updatedTickets));
        
        // dispatch custom event to let other components listen
        window.dispatchEvent(new CustomEvent('userTicketsUpdated', {
          detail: {
            key: 'userTickets',
            newValue: JSON.stringify(updatedTickets),
            oldValue: JSON.stringify(existingTickets)
          }
        }));
        
        console.log('Ticket saved to localStorage:', newTicket);
      } catch (localStorageError) {
        console.error('Error saving ticket to localStorage:', localStorageError);
      }
      
      return result;
    } catch (error) {
      console.error('Error booking ticket:', error);
      throw error;
    }
  };



  // cancel ticket
  export const cancelTicket = async (ticketId) => {
    try {
      const response = await authFetch(`/tickets/${ticketId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error cancelling ticket:', error);
      throw error;
    }
  };

  // get user ticket stats
  export const getUserTicketStats = async (userId) => {
    try {
      const response = await authFetch(`/tickets/user/${userId}/stats`, {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching user ticket stats:', error);
      throw error;
    }
  };

  // get tickets by status
  export const getTicketsByStatus = async (status) => {
    try {
      const response = await authFetch(`/tickets/status/${status}`, {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching tickets by status:', error);
      throw error;
    }
  };

  // get tickets by showtime
  export const getTicketsByShowtime = async (showtimeId) => {
    try {
      const response = await authFetch(`/tickets/showtime/${showtimeId}`, {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching tickets by showtime:', error);
      throw error;
    }
  };

  // cancel ticket with reason
  export const cancelTicketWithReason = async (ticketId, reason) => {
    try {
      const response = await authFetch(`/tickets/${ticketId}/cancel?reason=${encodeURIComponent(reason)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error cancelling ticket with reason:', error);
      throw error;
    }
  };

  // mark ticket as used
  export const markTicketAsUsed = async (ticketId) => {
    try {
      const response = await authFetch(`/tickets/${ticketId}/use`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error marking ticket as used:', error);
      throw error;
    }
  };

  export const getTicketDetails = async (ticketId) => {
    try {
      const response = await authFetch(`/tickets/${ticketId}/details`, {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      throw error;
    }
  };

  // get ticket payment info
  export const getTicketPaymentInfo = async (ticketId) => {
    try {
      const response = await authFetch(`/tickets/${ticketId}/payment-info`, {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching ticket payment info:', error);
      throw error;
    }
  };

  // refund ticket
  export const refundTicket = async (ticketId, refundAmount, refundReason) => {
    try {
      const response = await authFetch(`/tickets/${ticketId}/refund?refundAmount=${refundAmount}&refundReason=${encodeURIComponent(refundReason)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error refunding ticket:', error);
      throw error;
    }
  };

  // get refunded tickets
  export const getRefundedTickets = async () => {
    try {
      const response = await authFetch(`/tickets/refunded`, {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching refunded tickets:', error);
      throw error;
    }
  };

  // get user refund stats
  export const getUserRefundStats = async (userId) => {
    try {
      const response = await authFetch(`/tickets/user/${userId}/refund-stats`, {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching user refund stats:', error);
      throw error;
    }
  };



  // get tickets by payment method
  export const getTicketsByPaymentMethod = async (paymentMethod) => {
    try {
      const response = await authFetch(`/tickets/payment-method/${encodeURIComponent(paymentMethod)}`, {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching tickets by payment method:', error);
      throw error;
    }
  };

  // get tickets by cinema address
  export const getTicketsByCinemaAddress = async (address) => {
    try {
      const response = await authFetch(`/tickets/cinema-address/${encodeURIComponent(address)}`, {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching tickets by cinema address:', error);
      throw error;
    }
  };

  // utility function to download file
  export const downloadFile = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // approve ticket (admin)
  export async function approveTicket(ticketId) {
    try {
      const response = await adminFetch(`/tickets/${ticketId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error approving ticket:', error);
      throw error;
    }
  };
