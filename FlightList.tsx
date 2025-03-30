'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Flight {
  id: number;
  airline: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureDate: string;
  originalPrice: number;
  latestPrice?: number;
  priceDifference?: number;
  percentChange?: number;
}

export default function FlightList() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const response = await fetch('/api/flights');
        
        if (!response.ok) {
          throw new Error('Failed to fetch flights');
        }
        
        const data = await response.json();
        setFlights(data.flights);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching flights');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFlights();
  }, []);

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

  if (flights.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No flights found</h3>
        <p className="mt-2 text-sm text-gray-500">
          You haven't added any flights to track yet.
        </p>
        <div className="mt-6">
          <Link
            href="/flights/add"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add your first flight
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {flights.map((flight) => (
          <li key={flight.id}>
            <Link href={`/flights/${flight.id}`} className="block hover:bg-gray-50">
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <p className="truncate text-sm font-medium text-blue-600">
                      {flight.airline} {flight.flightNumber}
                    </p>
                    <div className="ml-2 flex flex-shrink-0">
                      <p className="inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold leading-5 text-blue-800">
                        {new Date(flight.departureDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="ml-2 flex flex-shrink-0">
                    {flight.priceDifference ? (
                      flight.priceDifference > 0 ? (
                        <p className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                          Price drop: ${flight.priceDifference.toFixed(2)} ({flight.percentChange?.toFixed(1)}%)
                        </p>
                      ) : (
                        <p className="inline-flex rounded-full bg-red-100 px-2 text-xs font-semibold leading-5 text-red-800">
                          Price increase: ${Math.abs(flight.priceDifference).toFixed(2)} ({Math.abs(flight.percentChange || 0).toFixed(1)}%)
                        </p>
                      )
                    ) : null}
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      {flight.departureAirport} → {flight.arrivalAirport}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <p>
                      Original: ${flight.originalPrice.toFixed(2)}
                      {flight.latestPrice && (
                        <span className="ml-2">
                          Current: ${flight.latestPrice.toFixed(2)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
