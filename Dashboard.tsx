'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DashboardProps {
  userId: number;
}

interface DashboardStats {
  totalFlights: number;
  activeFlights: number;
  flightsWithPriceDrops: number;
  totalSavings: number;
  pendingEcreditRequests: number;
  completedEcreditRequests: number;
  upcomingFlights: number;
}

interface RecentActivity {
  id: number;
  type: string;
  title: string;
  message: string;
  date: string;
}

export default function Dashboard({ userId }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch dashboard stats
        const statsResponse = await fetch('/api/dashboard/stats');
        if (!statsResponse.ok) {
          throw new Error('Failed to fetch dashboard stats');
        }
        const statsData = await statsResponse.json();
        setStats(statsData.stats);

        // Fetch recent activity
        const activityResponse = await fetch('/api/dashboard/activity');
        if (!activityResponse.ok) {
          throw new Error('Failed to fetch recent activity');
        }
        const activityData = await activityResponse.json();
        setRecentActivity(activityData.activity);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId]);

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

  if (!stats) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No data available</h3>
        <p className="mt-2 text-sm text-gray-500">
          We couldn't load your dashboard data. Please try again later.
        </p>
      </div>
    );
  }

  // Data for flight status pie chart
  const flightStatusData = [
    { name: 'Active Flights', value: stats.activeFlights },
    { name: 'Inactive Flights', value: stats.totalFlights - stats.activeFlights },
  ];

  // Data for ecredit requests pie chart
  const ecreditStatusData = [
    { name: 'Pending', value: stats.pendingEcreditRequests },
    { name: 'Completed', value: stats.completedEcreditRequests },
  ];

  // Colors for pie charts
  const COLORS = ['#3b82f6', '#93c5fd', '#60a5fa', '#2563eb'];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Flights</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalFlights}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Flights with Price Drops</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.flightsWithPriceDrops}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Savings</dt>
            <dd className="mt-1 text-3xl font-semibold text-green-600">${stats.totalSavings.toFixed(2)}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Upcoming Flights</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.upcomingFlights}</dd>
          </div>
        </div>
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Charts */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Flight Status</h3>
            <div className="mt-5 h-64">
              {stats.totalFlights > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={flightStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {flightStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Flights']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex justify-center items-center h-full">
                  <p className="text-sm text-gray-500">No flight data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
            <div className="mt-5 flow-root">
              {recentActivity.length > 0 ? (
                <ul className="-my-5 divide-y divide-gray-200">
                  {recentActivity.map((activity) => (
                    <li key={activity.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <span className={`inline-flex items-center justify-center h-8 w-8 rounded-full ${
                            activity.type === 'price_drop' ? 'bg-green-100' :
                            activity.type === 'ecredit_success' ? 'bg-blue-100' :
                            'bg-gray-100'
                          }`}>
                            {activity.type === 'price_drop' ? '↓' :
                             activity.type === 'ecredit_success' ? '$' :
                             'i'}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {activity.title}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {activity.message}
                          </p>
                        </div>
                        <div className="flex-shrink-0 whitespace-nowrap text-sm text-gray-500">
                          {new Date(activity.date).toLocaleDateString()}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No recent activity</p>
              )}
            </div>
            <div className="mt-6">
              <Link
                href="/notifications"
                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                View all activity
              </Link>
            </div>
          </div>
        </div>

        {/* Ecredit Requests */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Ecredit Requests</h3>
            <div className="mt-5 h-64">
              {(stats.pendingEcreditRequests + stats.completedEcreditRequests) > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ecreditStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {ecreditStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Requests']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex justify-center items-center h-full">
                  <p className="text-sm text-gray-500">No ecredit requests yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
            <div className="mt-5 grid grid-cols-1 gap-5">
              <Link
                href="/flights/add"
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add New Flight
              </Link>
              <Link
                href="/flights"
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View All Flights
              </Link>
              <Link
                href="/account/settings"
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Account Settings
              </Link>
              <Link
                href="/account/delta-credentials"
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Update Delta Credentials
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
