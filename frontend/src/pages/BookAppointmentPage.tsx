import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Search, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/context/authStore';
import { appointmentService } from '@/lib/appointments';
import { TimeSlot } from '@/types';
import { format, addDays, startOfWeek, isSameDay, parseISO } from 'date-fns';

const DOCTORS = [
  { id: 'doctor-1', name: 'Dr. Sarah Johnson', specialty: 'General Practice' },
  { id: 'doctor-2', name: 'Dr. Michael Chen', specialty: 'Internal Medicine' },
  { id: 'doctor-3', name: 'Dr. Emily Williams', specialty: 'Pediatrics' },
  { id: 'doctor-4', name: 'Dr. James Brown', specialty: 'Cardiology' },
];

export default function BookAppointmentPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [reason, setReason] = useState('');
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      loadSlots();
    }
  }, [selectedDoctor, selectedDate]);

  const loadSlots = async () => {
    setIsLoadingSlots(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const data = await appointmentService.getAvailableSlots(selectedDoctor!, dateStr);
      setSlots(data.filter(s => s.isAvailable));
    } catch (error) {
      toast.error('Failed to load available slots');
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handlePrevWeek = () => {
    setSelectedDate(addDays(weekStart, -7));
    setSelectedSlot(null);
  };

  const handleNextWeek = () => {
    setSelectedDate(addDays(weekStart, 7));
    setSelectedSlot(null);
  };

  const handleSubmit = async () => {
    if (!selectedDoctor || !selectedSlot || !user) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await appointmentService.createAppointment({
        patientId: user.id,
        doctorId: selectedDoctor,
        date: format(selectedDate, 'yyyy-MM-dd'),
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        reason: reason || undefined,
      });

      toast.success('Appointment booked successfully!');
      navigate('/appointments');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to book appointment';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const doctor = DOCTORS.find(d => d.id === selectedDoctor);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-24 h-1 rounded-full ${step >= s ? 'bg-primary-600' : 'bg-gray-200'}`}
              />
            ))}
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex justify-between text-sm">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary-600 font-medium' : 'text-gray-400'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary-100' : 'bg-gray-100'}`}>
              {step > 1 ? <Check className="w-4 h-4" /> : <span>1</span>}
            </div>
            Select Doctor
          </div>
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary-600 font-medium' : 'text-gray-400'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary-100' : 'bg-gray-100'}`}>
              {step > 2 ? <Check className="w-4 h-4" /> : <span>2</span>}
            </div>
            Choose Time
          </div>
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary-600 font-medium' : 'text-gray-400'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary-100' : 'bg-gray-100'}`}>
              <span>3</span>
            </div>
            Confirm
          </div>
        </div>
      </div>

      {/* Step 1: Select Doctor */}
      {step === 1 && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Select a Doctor</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {DOCTORS.map((doc) => (
              <button
                key={doc.id}
                onClick={() => {
                  setSelectedDoctor(doc.id);
                }}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedDoctor === doc.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{doc.name}</p>
                    <p className="text-sm text-gray-500">{doc.specialty}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="flex justify-end mt-6">
            <button
              onClick={() => selectedDoctor && setStep(2)}
              disabled={!selectedDoctor}
              className="btn btn-primary disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Choose Time */}
      {step === 2 && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Select Date & Time</h2>

          {/* Week selector */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={handlePrevWeek} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-medium">
              {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
            </span>
            <button onClick={handleNextWeek} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-2 mb-6">
            {weekDays.map((day) => {
              const isSelected = isSameDay(day, selectedDate);
              const isPast = day < new Date() && !isSameDay(day, new Date());
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => !isPast && handleDateSelect(day)}
                  disabled={isPast}
                  className={`p-2 rounded-xl text-center transition-colors ${
                    isSelected
                      ? 'bg-primary-600 text-white'
                      : isPast
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="text-xs font-medium">{format(day, 'EEE')}</div>
                  <div className="text-lg font-bold">{format(day, 'd')}</div>
                </button>
              );
            })}
          </div>

          {/* Time slots */}
          <h3 className="font-medium mb-3">Available Time Slots</h3>
          {isLoadingSlots ? (
            <div className="py-8 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : slots.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No available slots for this day
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.startTime}
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedSlot?.startTime === slot.startTime
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {slot.startTime}
                </button>
              ))}
            </div>
          )}

          <div className="flex justify-between mt-6">
            <button onClick={() => setStep(1)} className="btn btn-secondary">
              Back
            </button>
            <button
              onClick={() => selectedSlot && setStep(3)}
              disabled={!selectedSlot}
              className="btn btn-primary disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Confirm Appointment</h2>

          <div className="space-y-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500">Doctor</p>
              <p className="font-medium text-gray-900">{doctor?.name}</p>
              <p className="text-sm text-gray-500">{doctor?.specialty}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500">Date & Time</p>
              <p className="font-medium text-gray-900">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </p>
              <p className="text-sm text-gray-500">
                {selectedSlot?.startTime} - {selectedSlot?.endTime}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for visit (optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="input h-24 resize-none"
                placeholder="Describe your symptoms or reason for the appointment"
              />
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(2)} className="btn btn-secondary">
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn btn-primary disabled:opacity-50"
            >
              {isSubmitting ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
