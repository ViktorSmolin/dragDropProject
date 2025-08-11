import { useState, useEffect } from "react";
import { NotificationOptions } from "./types";


export const useNotifications = (): {
  showNotification: (
    title: string,
    options?: NotificationOptions
  ) => Notification | undefined;
  permission: NotificationPermission;
} => {
  const [permission, setPermission] = useState<NotificationPermission>(
    Notification.permission
  );

  useEffect(() => {
    if (permission === "default") {
      Notification.requestPermission().then((result) => {
        setPermission(result);
      });
    }
  }, [permission]);

  const showNotification = (
    title: string,
    options: NotificationOptions = {}
  ): Notification | undefined => {
    if (permission === "granted") {
      const notification = new Notification(title, {
        icon: "/vite.svg",
        body: options.body || "",
        tag: options.tag || "default",
        ...options,
      });

      setTimeout(() => {
        notification.close();
      }, 3000);

      return notification;
    } else {
      console.log("Разрешение на уведомление не предоставлено");
      return undefined;
    }
  };

  return { showNotification, permission };
};
