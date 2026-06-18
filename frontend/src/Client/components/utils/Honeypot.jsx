export const HoneypotLink = ({ 
  href = '/api/honeypot-trap', 
  text = 'Admin Panel', 
  children 
}) => {
  const handleClick = (e) => {
    e.preventDefault();
    const botData = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      url: window.location.href,
      type: 'honeypot_link_click'
    };   
    try {
      const botLogs = JSON.parse(localStorage.getItem('honeypot_bot_logs') || '[]');
      botLogs.push(botData);
      if (botLogs.length > 50) botLogs.shift();
      localStorage.setItem('honeypot_bot_logs', JSON.stringify(botLogs));
    } catch (err) {
      console.error('Failed to log bot detection:', err);
    }
    
    return false;
  };

  const hiddenStyle = {
    position: 'absolute',
    left: '-9999px',
    top: '-9999px',
    width: '1px',
    height: '1px',
    opacity: 0,
    visibility: 'hidden',
    pointerEvents: 'none',
    overflow: 'hidden',
    zIndex: -1
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      style={hiddenStyle}
      aria-hidden="true"
      tabIndex="-1"
      rel="nofollow noopener noreferrer"
    >
      {children || text}
    </a>
  );
};

export const HoneypotButton = ({ onClick, text = 'Submit', children }) => {
  const handleClick = (e) => {
    e.preventDefault();
    const botData = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      url: window.location.href,
      type: 'honeypot_button_click'
    };
    
    console.warn('HONEYPOT TRIGGERED: Bot detected via hidden button!', botData);
    
    try {
      const botLogs = JSON.parse(localStorage.getItem('honeypot_bot_logs') || '[]');
      botLogs.push(botData);
      if (botLogs.length > 50) botLogs.shift();
      localStorage.setItem('honeypot_bot_logs', JSON.stringify(botLogs));
    } catch (err) {
      console.error('Failed to log bot detection:', err);
    }
    
    if (onClick) onClick(e);
    return false;
  };

  const hiddenStyle = {
    position: 'absolute',
    left: '-9999px',
    top: '-9999px',
    width: '1px',
    height: '1px',
    opacity: 0,
    visibility: 'hidden',
    pointerEvents: 'none',
    overflow: 'hidden',
    zIndex: -1
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      style={hiddenStyle}
      aria-hidden="true"
      tabIndex="-1"
    >
      {children || text}
    </button>
  );
};

export const HoneypotField = ({ value, onChange, name = 'website' }) => {
  const hiddenStyle = {
    position: 'absolute',
    left: '-9999px',
    top: '-9999px',
    width: '1px',
    height: '1px',
    opacity: 0,
    visibility: 'hidden',
    pointerEvents: 'none',
    overflow: 'hidden',
    zIndex: -1
  };

  return (
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      autoComplete="off"
      tabIndex="-1"
      style={hiddenStyle}
      aria-hidden="true"
    />
  );
};

export const HoneypotUrlField = ({ value, onChange, name = 'url' }) => {
  const hiddenStyle = {
    position: 'absolute',
    left: '-9999px',
    top: '-9999px',
    width: '1px',
    height: '1px',
    opacity: 0,
    visibility: 'hidden',
    pointerEvents: 'none',
    overflow: 'hidden',
    zIndex: -1
  };

  return (
    <input
      type="url"
      name={name}
      value={value}
      onChange={onChange}
      autoComplete="off"
      tabIndex="-1"
      style={hiddenStyle}
      aria-hidden="true"
    />
  );
};
