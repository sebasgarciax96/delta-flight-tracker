'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface FlightDetailsProps {
  flightId: number;
}

interface Flight {
  id: number;
  airline: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureDate: string;
  originalPrice: number;
  confirmationCode?: string;
  bookingDate?: string;
  active: boolean;
}

interface PriceHistory {
  id: number;
  flightId: number;
  price: number;
  timestamp: string;
}

interface EcreditRequest {
  id: number;
  flightId: number;
  originalPrice: number;
  newPrice: number;
  priceDifference: number;
  status: string;
  requestDate: string;
  completionDate?: string;
  ecreditAmount?: number;
  ecreditCode?: string;
  ecreditExpirationDate?: string;
  notes?: string;
}

export default function FlightDetails({ flightId }: FlightDetailsProps) {
  const [flight, setFlight] = useState<Flight | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [ecreditRequests, setEcreditRequests] = useState<EcreditRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchFlightData = async () => {
      try {
        // Fetch flight details
        const flightResponse = await fetch(`/api/flights/${flightId}`);
        if (!flightResponse.ok) {
          throw new Error('Failed to fetch flight details');
        }
        const flightData = await flightResponse.json();
        setFlight(flightData.flight);

        // Fetch price history
        const priceHistoryResponse = await fetch(`/api/flights/${flightId}/price-history`);
        if (!priceHistoryResponse.ok) {
          throw new Error('Failed to fetch price history');
        }
        const priceHistoryData = await priceHistoryResponse.json();
        setPriceHistory(priceHistoryData.priceHistory);

        // Fetch ecredit requests
        const ecreditRequestsResponse = await fetch(`/api/flights/${flightId}/ecredit-requests`);
        if (!ecreditRequestsResponse.ok) {
          throw new Error('Failed to fetch ecredit requests');
        }
        const ecreditRequestsData = await ecreditRequestsResponse.json();
        setEcreditRequests(ecreditRequestsData.ecreditRequests);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching flight data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlightData();
  }, [flightId]);

  const handleDeleteFlight = async () => {
    if (!confirm('Are you sure you want to delete this flight? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/flights/${flightId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete flight');
      }

      router.push('/flights');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting the flight');
    }
  };

  const handleRequestEcredit = async () => {
    try {
      const response = await fetch(`/api/flights/${flightId}/request-ecredit`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to request ecredit');
      }

      // Refresh ecredit requests
      const ecreditRequestsResponse = await fetch(`/api/flights/${flightId}/ecredit-requests`);
      if (!ecreditRequestsResponse.ok) {
        throw new Error('Failed to fetch updated ecredit requests');
      }
      const ecreditRequestsData = await ecreditRequestsResponse.json();
      setEcreditRequests(ecreditRequestsData.ecreditRequests);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while requesting ecredit');
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

  if (!flight) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Flight not found</h3>
        <p className="mt-2 text-sm text-gray-500">
          The flight you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <div className="mt-6">
          <Link
            href="/flights"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to flights
          </Link>
        </div>
      </div>
    );
  }

  // Format price history data for chart
  const chartData = priceHistory.map(entry => ({
    date: new Date(entry.timestamp).toLocaleDateString(),
    price: entry.price,
  }));

  // Get latest price
  const latestPrice = priceHistory.length > 0 
    ? priceHistory[0].price 
    : flight.originalPrice;

  // Calculate price difference
  const priceDifference = flight.originalPrice - latestPrice;
  const percentChange = (priceDifference / flight.originalPrice) * 100;

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {flight.airline} {flight.flightNumber}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {flight.departureAirport} → {flight.arrivalAirport}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleRequestEcredit}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Request Ecredit
          </button>
          <Link
            href={`/flights/${flightId}/edit`}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Edit
          </Link>
          <button
            onClick={handleDeleteFlight}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete
          </button>
        </div>
      </div>
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Departure Date</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {new Date(flight.departureDate).toLocaleDateString()}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Original Price</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              ${flight.originalPrice.toFixed(2)}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Current Price</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              ${latestPrice.toFixed(2)}
              {priceDifference !== 0 && (
                <span className={`ml-2 ${priceDifference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {priceDifference > 0 ? '↓' : '↑'} ${Math.abs(priceDifference).toFixed(2)} ({Math.abs(percentChange).toFixed(1)}%)
                </span>
              )}
            </dd>
          </div>
          {flight.confirmationCode && (
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Confirmation Code</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {flight.confirmationCode}
              </dd>
            </div>
          )}
          {flight.bookingDate && (
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Booking Date</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(flight.bookingDate).toLocaleDateString()}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Price History Chart */}
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Price History</h3>
        <div className="mt-4 h-64">
          {chartData.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={['dataMin - 50', 'dataMax + 50']} />
                <Tooltip formatter={(value) => [`$${value}`, 'Price']} />
                <Line type="monotone" dataKey="price" stroke="#3b82f6" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex justify-center items-center h-full">
              <p className="text-sm text-gray-500">Not enough price data to display chart</p>
            </div>
          )}
        </div>
      </div>

      {/* Ecredit Requests */}
      <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Ecredit Requests</h3>
        {ecreditRequests.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">No ecredit requests have been made for this flight.</p>
        ) : (
          <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Date</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Original Price</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">New Price</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Difference</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Ecredit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {ecreditRequests.map((request) => (
                  <tr key={request.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {new Date(request.requestDate).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">${request.originalPrice.toFixed(2)}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">${request.newPrice.toFixed(2)}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-green-600">${request.priceDifference.toFixed(2)}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        request.status === 'completed' ? 'bg-green-100 text-green-800' :
                        request.status === 'failed' ? 'bg-red-100 text-red-800' :
                        request.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {request.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {request.ecreditAmount ? `$${request.ecreditAmount.toFixed(2)}` : '-'}
                      {request.ecreditCode && ` (${request.ecreditCode})`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
