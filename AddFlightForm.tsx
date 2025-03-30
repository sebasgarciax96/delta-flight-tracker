'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AddFlightFormProps {
  onSuccess?: (flightId: number) => void;
}

export default function AddFlightForm({ onSuccess }: AddFlightFormProps) {
  const [formData, setFormData] = useState({
    airline: 'delta',
    flightNumber: '',
    departureAirport: '',
    arrivalAirport: '',
    departureDate: '',
    originalPrice: '',
    confirmationCode: '',
    bookingDate: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/flights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          originalPrice: parseFloat(formData.originalPrice),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to add flight');
      }

      const data = await response.json();
      
      if (onSuccess) {
        onSuccess(data.flight.id);
      } else {
        router.push('/flights');
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while adding the flight');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Add a new flight to track</h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>Enter your flight details below to start tracking prices and get automatic ecredits.</p>
        </div>

        {error && (
          <div className="mt-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
            {error}
          </div>
        )}

        <form className="mt-5 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="airline" className="block text-sm font-medium text-gray-700">
                Airline
              </label>
              <select
                id="airline"
                name="airline"
                value={formData.airline}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="delta">Delta Airlines</option>
                {/* More airlines can be added here in the future */}
              </select>
            </div>

            <div>
              <label htmlFor="flightNumber" className="block text-sm font-medium text-gray-700">
                Flight Number
              </label>
              <input
                type="text"
                name="flightNumber"
                id="flightNumber"
                required
                placeholder="DL1234"
                value={formData.flightNumber}
                onChange={handleChange}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label htmlFor="departureAirport" className="block text-sm font-medium text-gray-700">
                Departure Airport
              </label>
              <input
                type="text"
                name="departureAirport"
                id="departureAirport"
                required
                placeholder="JFK"
                value={formData.departureAirport}
                onChange={handleChange}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label htmlFor="arrivalAirport" className="block text-sm font-medium text-gray-700">
                Arrival Airport
              </label>
              <input
                type="text"
                name="arrivalAirport"
                id="arrivalAirport"
                required
                placeholder="LAX"
                value={formData.arrivalAirport}
                onChange={handleChange}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label htmlFor="departureDate" className="block text-sm font-medium text-gray-700">
                Departure Date
              </label>
              <input
                type="date"
                name="departureDate"
                id="departureDate"
                required
                value={formData.departureDate}
                onChange={handleChange}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700">
                Original Price ($)
              </label>
              <input
                type="number"
                name="originalPrice"
                id="originalPrice"
                required
                step="0.01"
                min="0"
                placeholder="299.99"
                value={formData.originalPrice}
                onChange={handleChange}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label htmlFor="confirmationCode" className="block text-sm font-medium text-gray-700">
                Confirmation Code
              </label>
              <input
                type="text"
                name="confirmationCode"
                id="confirmationCode"
                placeholder="ABC123"
                value={formData.confirmationCode}
                onChange={handleChange}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label htmlFor="bookingDate" className="block text-sm font-medium text-gray-700">
                Booking Date
              </label>
              <input
                type="date"
                name="bookingDate"
                id="bookingDate"
                value={formData.bookingDate}
                onChange={handleChange}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Adding...' : 'Add Flight'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
