'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications');
        
        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }
        
        const data = await response.json();
        setNotifications(data.notifications);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching notifications');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNotifications();
  }, []);

  const markAsRead = async (id: number) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      
      // Update local state
      setNotifications(notifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while marking notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PUT',
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }
      
      // Update local state
      setNotifications(notifications.map(notification => ({ ...notification, read: true })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while marking all notifications as read');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
        {error}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
        <p className="mt-2 text-sm text-gray-500">
          You don't have any notifications yet.
        </p>
      </div>
    );
  }

  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Notifications
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Mark all as read
          </button>
        )}
      </div>
      <ul className="divide-y divide-gray-200">
        {notifications.map((notification) => (
          <li key={notification.id} className={`${!notification.read ? 'bg-blue-50' : ''}`}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                    notification.type === 'price_drop' ? 'bg-green-100 text-green-800' :
                    notification.type === 'ecredit_success' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {notification.type === 'price_drop' ? '↓' :
                     notification.type === 'ecredit_success' ? '$' :
                     'i'}
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {notification.message}
                    </p>
                  </div>
                </div>
                <div className="ml-2 flex-shrink-0 flex">
                  <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
