import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { mockNotifications } from "@/data/mockData";

export function NotificationsDropdown() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(
    mockNotifications.filter(n => n.user_id === user?.id)
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
    navigate(`/item/${notification.matched_item_id}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">{unreadCount}</Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto animate-scale-in">
        {notifications.length === 0 ? (
          <DropdownMenuItem disabled>No notifications</DropdownMenuItem>
        ) : (
          notifications.map(notification => (
            <DropdownMenuItem key={notification.id} onClick={() => handleNotificationClick(notification)} className={`flex flex-col items-start gap-1 cursor-pointer ${!notification.read ? "bg-primary/10" : ""}`}>
              <span className="font-semibold text-sm">{notification.title}</span>
              <span className="text-xs text-muted-foreground">{notification.message}</span>
              <span className="text-xs text-muted-foreground">{new Date(notification.created_at).toLocaleDateString()}</span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
