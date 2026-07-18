import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Plus, Filter, Search, MoreVertical, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/context/authStore';
import { appointmentService } from '@/lib/appointments';
import { Appointment } from '@/types';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

export default function AppointmentsPage() {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAppointments();
  }, [user, filter]);

  const loadAppointments = async () => {
    try {
      const filterObj: any = {};
      if (user?.role === 'patient') {
        filterObj.patientId = user.id;
      } else if (user?.role === 'doctor') {
        filterObj.doctorId = user.id;
      }
      if (filter !== 'all') {
        filterObj.status = filter;
      }
      const data = await appointmentService.getAppointments(filterObj);
      setAppointments(data);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await appointmentService.updateAppointment(id, { status });
      toast.success('Appointment updated');
      loadAppointments();
    } catch (error) {
      toast.error('Failed to update appointment');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await appointmentService.deleteAppointment(id);
        toast.success('Appointment cancelled');
        loadAppointments();
      } catch (error) {
        toast.error('Failed to cancel appointment');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-success-50 text-success-700 border-success-200';
      case 'pending':
        return 'bg-warning-50 text-warning-700 border-warning-200';
      case 'cancelled':
        return 'bg-error-50 text-error-700 border-error-200';
      case 'completed':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      apt.reason?.toLowerCase().includes(query) ||
      apt.patientId.toLowerCase().includes(query) ||
      apt.doctorId.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500 mt-1">Manage your healthcare appointments</p>
        </div>
        <Link to="/appointments/book" className="btn btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Book Appointment
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-primary-50 text-primary-700'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Appointments list */}
      {isLoading ? (
        <div className="card py-12 text-center">
          <div className="animate-spin w-10 h-10 border-2 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading appointments...</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="card py-12 text-center">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto" />
          <h3 className="text-lg font-medium text-gray-900 mt-4">No appointments found</h3>
          <p className="text-gray-500 mt-1">
            {searchQuery ? 'Try a different search term' : 'Book your first appointment'}
          </p>
          <Link to="/appointments/book" className="btn btn-primary mt-4 inline-block">
            Book Appointment
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <div key={appointment.id} className="flex overflow-hidden rounded-card border border-primary-50 bg-white shadow-sm">
              {/* Date stub */}
              <div className="flex w-20 shrink-0 flex-col items-center justify-center gap-0.5 bg-primary-800 text-primary-50">
                <span className="font-mono text-2xl font-medium leading-none">
                  {format(parseISO(appointment.date), 'd')}
                </span>
                <span className="font-mono text-[10px] tracking-widest text-primary-100/70">
                  {format(parseISO(appointment.date), 'MMM').toUpperCase()}
                </span>
              </div>
              <div className="relative hidden w-px shrink-0 bg-[repeating-linear-gradient(to_bottom,#e2e8e6_0,#e2e8e6_5px,transparent_5px,transparent_10px)] sm:block">
                <div className="ticket-notch absolute -top-1.5 left-0 h-3 w-3" />
              </div>

              <div className="flex flex-1 flex-col gap-4 p-4 md:flex-row md:items-center">
                <div>
                  <p className="font-medium text-primary-900">
                    {format(parseISO(appointment.date), 'EEEE')}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-primary-700/60 mt-1 font-mono">
                    <Clock className="w-4 h-4" />
                    {appointment.startTime} - {appointment.endTime}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 md:pl-4 md:border-l border-primary-50">
                  <p className="text-primary-700/50 text-sm">
                    {user?.role === 'patient' ? 'Doctor' : 'Patient'}
                  </p>
                  <p className="font-medium text-primary-900">
                    {user?.role === 'patient' ? `Dr. ${appointment.doctorId.slice(0, 8)}` : appointment.patientId.slice(0, 8)}
                  </p>
                  {appointment.reason && (
                    <p className="text-sm text-primary-700/50 mt-1">{appointment.reason}</p>
                  )}
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      appointment.status
                    )}`}
                  >
                    {appointment.status}
                  </span>

                  {appointment.status === 'pending' && user?.role === 'doctor' && (
                    <button
                      onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                      className="p-2 hover:bg-success-50 rounded-lg transition-colors"
                      title="Confirm"
                    >
                      <CheckCircle className="w-5 h-5 text-success-600" />
                    </button>
                  )}

                  {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                    <button
                      onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                      className="p-2 hover:bg-error-50 rounded-lg transition-colors"
                      title="Cancel"
                    >
                      <XCircle className="w-5 h-5 text-error-600" />
                    </button>
                  )}

                  {appointment.status === 'confirmed' && user?.role === 'doctor' && (
                    <button
                      onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                      className="btn btn-success text-sm"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
