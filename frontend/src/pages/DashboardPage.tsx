import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { useAuthStore } from '@/context/authStore';
import { appointmentService } from '@/lib/appointments';
import { Appointment } from '@/types';
import { format, parseISO, isToday, isFuture } from 'date-fns';

interface StatCard {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bg: string;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, [user]);

  const loadAppointments = async () => {
    try {
      const filter: any = {};
      if (user?.role === 'patient') {
        filter.patientId = user.id;
      } else if (user?.role === 'doctor') {
        filter.doctorId = user.id;
      }
      const data = await appointmentService.getAppointments(filter);
      setAppointments(data);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const upcomingAppointments = appointments.filter(
    (a) => (a.status === 'confirmed' || a.status === 'pending') && isFuture(parseISO(a.date))
  );

  const todayAppointments = appointments.filter(
    (a) => (a.status === 'confirmed' || a.status === 'pending') && isToday(parseISO(a.date))
  );

  const completedAppointments = appointments.filter((a) => a.status === 'completed');

  const cancelledAppointments = appointments.filter((a) => a.status === 'cancelled');

  const stats: StatCard[] = [
    {
      title: 'Upcoming',
      value: upcomingAppointments.length,
      icon: Calendar,
      color: 'text-primary-600',
      bg: 'bg-primary-50',
    },
    {
      title: 'Today',
      value: todayAppointments.length,
      icon: Clock,
      color: 'text-warning-600',
      bg: 'bg-warning-50',
    },
    {
      title: 'Completed',
      value: completedAppointments.length,
      icon: CheckCircle,
      color: 'text-success-600',
      bg: 'bg-success-50',
    },
    {
      title: 'Cancelled',
      value: cancelledAppointments.length,
      icon: XCircle,
      color: 'text-error-600',
      bg: 'bg-error-50',
    },
  ];

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

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="bg-primary-800 rounded-card p-6 text-white">
        <h1 className="text-2xl font-display font-semibold">Welcome back, {user?.firstName}!</h1>
        <p className="text-primary-100/70 mt-1">
          {user?.role === 'doctor' ? 'Manage your patient appointments' : 'Book and track your appointments'}
        </p>
        <div className="mt-4 flex items-center gap-4">
          <Link
            to="/appointments/book"
            className="bg-accent-500 text-white px-4 py-2 rounded-md font-medium hover:bg-accent-600 transition-colors"
          >
            Book Appointment
          </Link>
          <Link
            to="/appointments"
            className="text-primary-100/80 hover:text-white font-medium transition-colors"
          >
            View all
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="card hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upcoming appointments */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
          <Link to="/appointments" className="text-sm link">View all</Link>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-gray-500">
            <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2">Loading appointments...</p>
          </div>
        ) : upcomingAppointments.length === 0 ? (
          <div className="py-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto" />
            <p className="text-gray-500 mt-2">No upcoming appointments</p>
            <Link to="/appointments/book" className="btn btn-primary mt-4 inline-block">
              Book now
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingAppointments.slice(0, 5).map((appointment) => (
              <div
                key={appointment.id}
                className="flex overflow-hidden rounded-lg border border-primary-50"
              >
                <div className="flex w-20 shrink-0 flex-col items-center justify-center gap-0.5 bg-primary-800 py-3 text-primary-50">
                  <span className="font-mono text-xl font-medium leading-none">
                    {format(parseISO(appointment.date), 'd')}
                  </span>
                  <span className="font-mono text-[10px] tracking-widest text-primary-100/70">
                    {format(parseISO(appointment.date), 'MMM').toUpperCase()}
                  </span>
                </div>
                <div className="relative w-px shrink-0 bg-[repeating-linear-gradient(to_bottom,#e2e8e6_0,#e2e8e6_5px,transparent_5px,transparent_10px)]">
                  <div className="ticket-notch absolute -top-1.5 left-0 h-3 w-3" />
                </div>
                <div className="flex flex-1 items-center justify-between gap-4 px-4 py-3">
                  <div>
                    <p className="font-medium text-primary-900">
                      {format(parseISO(appointment.date), 'EEEE')}
                    </p>
                    <p className="font-mono text-sm text-primary-700/60">
                      {appointment.startTime} - {appointment.endTime}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      appointment.status
                    )}`}
                  >
                    {appointment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card hover:shadow-md transition-all cursor-pointer group">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-primary-50 rounded-xl group-hover:bg-primary-100 transition-colors">
              <TrendingUp className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Appointment History</h3>
              <p className="text-sm text-gray-500">View all past appointments</p>
            </div>
          </div>
        </div>
        <Link to="/notifications" className="card hover:shadow-md transition-all cursor-pointer group">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-primary-50 rounded-xl group-hover:bg-primary-100 transition-colors">
              <Calendar className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Notifications</h3>
              <p className="text-sm text-gray-500">Check your messages</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
