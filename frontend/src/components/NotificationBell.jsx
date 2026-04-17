import { useEffect, useState } from "react";
import { getNotifications, getUnreadCount, markAsRead } from "../api/notificationApi";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await getUnreadCount();
      setUnreadCount(res.data.unread_count);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggle = () => {
    setOpen(!open);
    if (!open) {
      fetchNotifications();
    }
  };

  const handleMarkAsRead = async (id) => {
    await markAsRead(id);
    fetchUnreadCount();
    fetchNotifications();
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Bell Button */}
      <div
        onClick={handleToggle}
        style={{
          cursor: "pointer",
          position: "relative",
          fontSize: "20px"
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-8px",
              right: "-10px",
              background: "red",
              color: "white",
              borderRadius: "50%",
              padding: "2px 6px",
              fontSize: "11px",
              fontWeight: "bold"
            }}
          >
            {unreadCount}
          </span>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "35px",
            right: "0",
            width: "320px",
            background: "white",
            color: "black",
            borderRadius: "8px",
            boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
            maxHeight: "350px",
            overflowY: "auto",
            zIndex: 9999
          }}
        >
          {notifications.length === 0 ? (
            <div style={{ padding: "15px" }}>
              No notifications
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleMarkAsRead(n.id)}
                style={{
                  padding: "12px",
                  borderBottom: "1px solid #eee",
                  background: n.is_read ? "#fff" : "#f0f9ff",
                  cursor: "pointer"
                }}
              >
                <div style={{ fontSize: "14px" }}>
                  {n.message}
                </div>
                <div style={{ fontSize: "11px", color: "gray", marginTop: "4px" }}>
                  {new Date(n.created_at).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
