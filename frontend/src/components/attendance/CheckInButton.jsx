import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { checkIn, checkOut, getTodayStatus } from '../../api/attendance';

const CheckInButton = ({ onStatusChange }) => {
  const [loading, setLoading] = useState(false);
  const [todayStatus, setTodayStatus] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch today's attendance status on mount
  useEffect(() => {
    fetchTodayStatus();
  }, []);

  const fetchTodayStatus = async () => {
    try {
      const response = await getTodayStatus();
      setTodayStatus(response.data);
      if (onStatusChange) {
        onStatusChange(response.data);
      }
    } catch (err) {
      console.error('Error fetching today status:', err);
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await checkIn();
      setSuccess(response.message || 'Checked in successfully!');
      setTodayStatus(response.data);
      
      if (onStatusChange) {
        onStatusChange(response.data);
      }

      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.message || 'Failed to check in');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await checkOut();
      setSuccess(response.message || 'Checked out successfully!');
      setTodayStatus(response.data);
      
      if (onStatusChange) {
        onStatusChange(response.data);
      }

      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.message || 'Failed to check out');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'late':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'absent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'half-day':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const canCheckIn = !todayStatus || !todayStatus.checkInTime;
  const canCheckOut = todayStatus && todayStatus.checkInTime && !todayStatus.checkOutTime;

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 shadow-lg border border-indigo-100">
      {/* Current Time Display */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-md mb-4">
          <Clock className="w-10 h-10 text-indigo-600" />
        </div>
        <h2 className="text-4xl font-bold text-gray-900 mb-2">
          {formatTime(currentTime)}
        </h2>
        <p className="text-sm text-gray-600 font-medium">
          {formatDate(currentTime)}
        </p>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-fadeIn">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3 animate-fadeIn">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800 font-medium">{success}</p>
        </div>
      )}

      {/* Today's Status */}
      {todayStatus && (
        <div className="mb-6 p-5 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Today's Status
            </h3>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(todayStatus.status)}`}>
              {todayStatus.status.charAt(0).toUpperCase() + todayStatus.status.slice(1)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
              <p className="text-xs text-gray-600 mb-1 font-medium">Check In</p>
              <p className="text-xl font-bold text-gray-900">
                {todayStatus.checkInTime || '--:--'}
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
              <p className="text-xs text-gray-600 mb-1 font-medium">Check Out</p>
              <p className="text-xl font-bold text-gray-900">
                {todayStatus.checkOutTime || '--:--'}
              </p>
            </div>
          </div>

          {todayStatus.checkInTime && todayStatus.checkOutTime && (
            <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
              <p className="text-xs text-gray-600 mb-1 font-medium">Total Hours</p>
              <p className="text-lg font-bold text-indigo-900">
                {calculateHours(todayStatus.checkInTime, todayStatus.checkOutTime)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {canCheckIn && (
          <button
            onClick={handleCheckIn}
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Check In</span>
              </>
            )}
          </button>
        )}

        {canCheckOut && (
          <button
            onClick={handleCheckOut}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Clock className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Check Out</span>
              </>
            )}
          </button>
        )}

        {!canCheckIn && !canCheckOut && (
          <div className="text-center p-6 bg-white rounded-xl border border-gray-200">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-700 font-semibold mb-1">All Done for Today! 🎉</p>
            <p className="text-sm text-gray-500">You've completed your attendance</p>
          </div>
        )}
      </div>

      {/* Helper Text */}
      <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
        <p className="text-xs text-gray-600 text-center">
          {canCheckIn && "👋 Click 'Check In' to start your workday"}
          {canCheckOut && "⏰ Don't forget to check out when you leave"}
          {!canCheckIn && !canCheckOut && "✅ Your attendance for today is complete"}
        </p>
      </div>
    </div>
  );
};

// Helper function to calculate hours worked
const calculateHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return '0h 0m';
  
  const [inHour, inMinute] = checkIn.split(':').map(Number);
  const [outHour, outMinute] = checkOut.split(':').map(Number);
  
  const inMinutes = inHour * 60 + inMinute;
  const outMinutes = outHour * 60 + outMinute;
  
  const diffMinutes = outMinutes - inMinutes;
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  
  return `${hours}h ${minutes}m`;
};

export default CheckInButton;