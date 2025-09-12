import { useEffect, useState, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { Button } from "../ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { ScrollArea } from "../ui/scroll-area";
import { useToast } from "../ui/use-toast";
import { formatDistanceToNow } from 'date-fns';
import { useSession } from 'next-auth/react';
import io from 'socket.io-client';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  metadata: Record<string, any>;
  created_at: string;
  is_read: boolean;
}

interface NotificationCenterProps {
  agentId: string;
}

export function NotificationCenter({ agentId }: NotificationCenterProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      // Initialize socket connection
      const socketInstance = io({
        path: '/api/socket',
      });

      socketInstance.on('connect', () => {
        console.log('Socket connected');
        socketInstance.emit('join', session.user.id);
      });

      socketInstance.on('notification', (newNotification: Notification) => {
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
        toast({ description: newNotification.message });
      });

      return () => {
        socketInstance.disconnect();
      };
    }
    return undefined;
  }, [session?.user?.id, toast]);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch(`/api/notifications/${agentId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({ description: 'Failed to load notifications', variant: 'destructive' });
    }
  }, [agentId, toast]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to mark notification as read');
      
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
      toast({ description: 'Notification marked as read' });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({ description: 'Failed to mark notification as read', variant: 'destructive' });
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to mark all notifications as read');
      
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast({ description: 'All notifications marked as read' });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({ description: 'Failed to mark all notifications as read', variant: 'destructive' });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'feedback_received':
        return '📝';
      case 'negative_feedback':
        return '⚠️';
      case 'agent_needs_review':
        return '🔍';
      case 'feedback_trend_alert':
        return '📈';
      default:
        return '🔔';
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-muted/50 cursor-pointer ${
                    !notification.is_read ? 'bg-muted/30' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {notification.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
} 