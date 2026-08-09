// Notifications Store & Manager

let notifications = [];
let unreadCount = 0;
let onUpdateCallback = null;

export function addNotification(title, body, icon = "🔔") {
  const notif = {
    id: "notif_" + Math.random().toString(36).substring(2, 9),
    title,
    body,
    icon,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    read: false
  };

  notifications.unshift(notif);
  unreadCount++;
  notify();
}

export function markAllAsRead() {
  unreadCount = 0;
  notifications.forEach(n => n.read = true);
  notify();
}

export function clearNotifications() {
  notifications = [];
  unreadCount = 0;
  notify();
}

export function listenToNotifications(callback) {
  onUpdateCallback = callback;
  notify();
}

function notify() {
  if (onUpdateCallback) {
    onUpdateCallback(notifications, unreadCount);
  }
}
