import { useEffect, useState } from 'react';
import { Bell, Check, Trash2, Calendar, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/context/authStore';
import { notificationService } from '@/lib/notifications';
import { Notification } from '@/types';
import { formatDistanceToNow, parseISO } from 'date-fns';

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    try {
      const data = await notificationService.getNotifications(user.id);
      setNotifications(data);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(
        notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        )
      );
    } catch (error) {
      toast.error('Failed to update notification');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    try {
      await notificationService.markAllAsRead(user.id);
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to update notifications');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(notifications.filter((n) => n.id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment_created':
        return <Calendar className="w-5 h-5 text-primary-600" />;
      case 'appointment_confirmed':
        return <CheckCircle className="w-5 h-5 text-success-600" />;
      case 'appointment_cancelled':
        return <XCircle className="w-5 h-5 text-error-600" />;
      case 'appointment_reminder':
        return <Clock className="w-5 h-5 text-warning-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'appointment_created':
        return 'bg-primary-50 border-primary-200';
      case 'appointment_confirmed':
        return 'bg-success-50 border-success-200';
      case 'appointment_cancelled':
        return 'bg-error-50 border-error-200';
      case 'appointment_reminder':
        return 'bg-warning-50 border-warning-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllAsRead} className="btn btn-secondary flex items-center gap-2">
            <Check className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications list */}
      {isLoading ? (
        <div className="card py-12 text-center">
          <div className="animate-spin w-10 h-10 border-2 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="card py-12 text-center">
          <Bell className="w-16 h-16 text-gray-300 mx-auto" />
          <h3 className="text-lg font-medium text-gray-900 mt-4">No notifications</h3>
          <p className="text-gray-500 mt-1">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`card border ${notification.isRead ? 'opacity-70' : ''} ${
                getNotificationColor(notification.type)
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{notification.title}</p>
                    {!notification.isRead && (
                      <span className="w-2 h-2 bg-primary-600 rounded-full" />
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                  <p className="text-gray-400 text-xs mt-2">
                    {formatDistanceToNow(parseISO(notification.createdAt))} ago
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="p-2 hover:bg-white rounded-lg transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4 text-gray-600" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="p-2 hover:bg-white rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-error-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
