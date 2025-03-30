-- Initial database schema for Delta Flight Tracker Web Application

-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone_number TEXT,
    notification_preference TEXT DEFAULT 'email',
    delta_username TEXT,
    delta_password_encrypted TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Flights table
CREATE TABLE flights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    airline TEXT NOT NULL,
    flight_number TEXT NOT NULL,
    departure_airport TEXT NOT NULL,
    arrival_airport TEXT NOT NULL,
    departure_date TEXT NOT NULL,
    original_price REAL NOT NULL,
    confirmation_code TEXT,
    booking_date TEXT,
    active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Price history table
CREATE TABLE price_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    flight_id INTEGER NOT NULL,
    price REAL NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (flight_id) REFERENCES flights (id)
);

-- Ecredit requests table
CREATE TABLE ecredit_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    flight_id INTEGER NOT NULL,
    original_price REAL NOT NULL,
    new_price REAL NOT NULL,
    price_difference REAL NOT NULL,
    status TEXT NOT NULL,
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completion_date TIMESTAMP,
    ecredit_amount REAL,
    ecredit_code TEXT,
    ecredit_expiration_date TEXT,
    notes TEXT,
    FOREIGN KEY (flight_id) REFERENCES flights (id)
);

-- Notifications table
CREATE TABLE notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Create indexes for performance
CREATE INDEX idx_flights_user_id ON flights(user_id);
CREATE INDEX idx_price_history_flight_id ON price_history(flight_id);
CREATE INDEX idx_ecredit_requests_flight_id ON ecredit_requests(flight_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
