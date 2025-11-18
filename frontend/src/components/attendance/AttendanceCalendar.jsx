import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle, XCircle, Clock, Coffee } from 'lucide-react';
import { getAttendance } from '../../api/attendance';

const AttendanceCalendar = ({ employeeId = null, onDateSelect = null }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    fetchAttendanceData();
  }, [currentDate, employeeId]);

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startDate = new Date(year, month, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

      const params = {
        startDate,
        endDate,
        ...(employeeId && { employeeId })
      };

      const response = await getAttendance(params);
      setAttendanceData(response.data || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const getAttendanceForDate = (day) => {
    const dateStr = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    ).toISOString().split('T')[0];

    return attendanceData.find(
      (att) => att.date.split('T')[0] === dateStr
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'late':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'absent':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'half-day':
        return <Coffee className="w-4 h-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 border-green-300 hover:bg-green-200';
      case 'late':
        return 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200';
      case 'absent':
        return 'bg-red-100 border-red-300 hover:bg-red-200';
      case 'half-day':
        return 'bg-blue-100 border-blue-300 hover:bg-blue-200';
      default:
        return 'bg-white border-gray-200 hover:bg-gray-50';
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const attendance = getAttendanceForDate(day);
    setSelectedDate({ date, attendance });
    
    if (onDateSelect) {
      onDateSelect(date, attendance);
    }
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const isCurrentMonth = 
    today.getMonth() === currentDate.getMonth() &&
    today.getFullYear() === currentDate.getFullYear();

  // Calculate statistics
  const stats = attendanceData.reduce(
    (acc, att) => {
      acc[att.status] = (acc[att.status] || 0) + 1;
      return acc;
    },
    { present: 0, late: 0, absent: 0, 'half-day': 0 }
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">{monthName}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleToday}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-300" />
              <span className="text-white/80 text-xs font-medium">Present</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.present}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-yellow-300" />
              <span className="text-white/80 text-xs font-medium">Late</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.late}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <XCircle className="w-4 h-4 text-red-300" />
              <span className="text-white/80 text-xs font-medium">Absent</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.absent}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Coffee className="w-4 h-4 text-blue-300" />
              <span className="text-white/80 text-xs font-medium">Half Day</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats['half-day']}</p>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            {/* Week Days Header */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-semibold text-gray-600 uppercase tracking-wide py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {/* Empty cells for days before month starts */}
              {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                <div key={`empty-${index}`} className="aspect-square" />
              ))}

              {/* Days of the month */}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;
                const attendance = getAttendanceForDate(day);
                const isToday = isCurrentMonth && today.getDate() === day;
                const isPast = new Date(currentDate.getFullYear(), currentDate.getMonth(), day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

                return (
                  <button
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className={`
                      aspect-square rounded-lg border-2 transition-all duration-200
                      flex flex-col items-center justify-center gap-1 p-2
                      ${attendance ? getStatusColor(attendance.status) : 'bg-white border-gray-200 hover:bg-gray-50'}
                      ${isToday ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}
                      ${!attendance && !isPast ? 'border-dashed' : ''}
                      hover:shadow-md hover:scale-105
                    `}
                  >
                    <span className={`text-sm font-semibold ${
                      isToday ? 'text-indigo-600' : attendance ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {day}
                    </span>
                    {attendance && (
                      <div className="flex items-center justify-center">
                        {getStatusIcon(attendance.status)}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Selected Date Details */}
      {selectedDate && selectedDate.attendance && (
        <div className="border-t border-gray-200 bg-gray-50 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            {selectedDate.date.toLocaleDateString('default', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Check In</p>
              <p className="text-lg font-bold text-gray-900">
                {selectedDate.attendance.checkInTime || '--:--'}
              </p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Check Out</p>
              <p className="text-lg font-bold text-gray-900">
                {selectedDate.attendance.checkOutTime || '--:--'}
              </p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Status</p>
              <div className="flex items-center gap-2">
                {getStatusIcon(selectedDate.attendance.status)}
                <span className="text-sm font-semibold text-gray-900 capitalize">
                  {selectedDate.attendance.status}
                </span>
              </div>
            </div>
          </div>
          {selectedDate.attendance.notes && (
            <div className="mt-3 bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Notes</p>
              <p className="text-sm text-gray-700">{selectedDate.attendance.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="border-t border-gray-200 bg-white p-6">
        <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
          Legend
        </h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-100 border-2 border-green-300"></div>
            <span className="text-sm text-gray-700">Present</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-100 border-2 border-yellow-300"></div>
            <span className="text-sm text-gray-700">Late</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-100 border-2 border-red-300"></div>
            <span className="text-sm text-gray-700">Absent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-100 border-2 border-blue-300"></div>
            <span className="text-sm text-gray-700">Half Day</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCalendar;