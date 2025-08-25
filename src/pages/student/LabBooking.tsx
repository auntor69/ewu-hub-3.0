// src/pages/student/LabBooking.tsx
import React from 'react';
import { FlaskConical, Clock, Cpu } from 'lucide-react';
import {
  Card,
  Button,
  FormRow,
  Select,
  Input,
  TimeRangePicker,
  PageTransition,
} from '../../lib/ui';
import { useToast } from '../../lib/ui';
import { bookLabEquipment, getAvailableEquipment } from '../../actions/bookings';
import { supabase } from '../../lib/supabaseClient';
import dayjs from 'dayjs';

export default function LabBooking() {
  const { addToast } = useToast();

  const [formData, setFormData] = React.useState({
    roomCode: '',
    equipmentType: '',
    date: '',
  });

  const [timeRange, setTimeRange] = React.useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });
  const [loading, setLoading] = React.useState(false);
  const [availableUnits, setAvailableUnits] = React.useState<number>(0);
  const [equipmentOptions, setEquipmentOptions] = React.useState<{ value: string; label: string }[]>([]);
  const [roomOptions, setRoomOptions] = React.useState<{ value: string; label: string }[]>([]);

  // Load rooms and equipment types
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: roomsData, error: roomError } = await supabase
          .from('rooms')
          .select('code')
          .eq('type', 'lab');
        if (roomError) throw roomError;
        setRoomOptions([{ value: '', label: 'Select Room' }, ...roomsData.map(r => ({ value: r.code, label: r.code }))]);

        const { data: equipData, error: equipError } = await supabase.from('equipment_types').select('name');
        if (equipError) throw equipError;
        setEquipmentOptions([{ value: '', label: 'Select Equipment Type' }, ...equipData.map(d => ({ value: d.name, label: d.name }))]);
      } catch (err: any) {
        console.error(err);
        addToast({ type: 'error', message: 'Failed to load rooms or equipment types' });
      }
    };
    fetchData();
  }, [addToast]);

  // Build ISO string with date + time
  const buildISOTime = (date: string, time: string) => {
    if (!date || !time) return '';
    return dayjs(`${date}T${time}`).toISOString();
  };

  // Fetch availability automatically
  React.useEffect(() => {
    const fetchAvailability = async () => {
      if (!formData.roomCode || !formData.equipmentType || !formData.date || !timeRange.start || !timeRange.end) {
        setAvailableUnits(0);
        return;
      }

      try {
        const available = await getAvailableEquipment(
          formData.roomCode,
          formData.equipmentType,
          buildISOTime(formData.date, timeRange.start),
          buildISOTime(formData.date, timeRange.end)
        );
        setAvailableUnits(available.length);
      } catch (err: any) {
        console.error(err);
        addToast({ type: 'error', message: 'Failed to load equipment availability' });
        setAvailableUnits(0);
      }
    };

    fetchAvailability();
  }, [formData, timeRange, addToast]);

  // Handle booking submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.roomCode || !formData.equipmentType || !formData.date || !timeRange.start || !timeRange.end) {
      addToast({ type: 'warning', message: 'Please fill in all required fields' });
      return;
    }

    if (availableUnits < 1) {
      addToast({ type: 'error', message: 'No available equipment units to book' });
      return;
    }

    setLoading(true);
    try {
      await bookLabEquipment({
        roomCode: formData.roomCode,
        equipmentType: formData.equipmentType,
        units: 1,
        start: buildISOTime(formData.date, timeRange.start),
        end: buildISOTime(formData.date, timeRange.end),
      });

      addToast({ type: 'success', message: 'Lab equipment booked successfully' });
      setAvailableUnits(0);
    } catch (err: any) {
      console.error(err);
      addToast({ type: 'error', message: err.message || 'Booking failed' });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    formData.roomCode && formData.equipmentType && formData.date && timeRange.start && timeRange.end && availableUnits > 0;

  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lab Equipment Booking</h1>
          <p className="text-gray-600 mt-2">Reserve equipment units for practical sessions and experiments.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card title="Equipment Booking">
              <form onSubmit={handleSubmit} className="space-y-6">
                <FormRow label="Room Code" required>
                  <Select
                    value={formData.roomCode}
                    onChange={e => setFormData(prev => ({ ...prev, roomCode: e.target.value }))}
                    options={roomOptions}
                  />
                </FormRow>

                <FormRow label="Equipment Type" required>
                  <Select
                    value={formData.equipmentType}
                    onChange={e => setFormData(prev => ({ ...prev, equipmentType: e.target.value }))}
                    options={equipmentOptions}
                  />
                </FormRow>

                <FormRow label="Date" required>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </FormRow>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Time Slot</h4>
                  <TimeRangePicker value={timeRange} onChange={setTimeRange} maxMinutes={120} />
                  {availableUnits > 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      {availableUnits} unit(s) available – 1 will be auto-assigned
                    </p>
                  )}
                  {availableUnits === 0 && (
                    <p className="text-sm text-red-500 mt-2">No units available for selected slot</p>
                  )}
                </div>

                <Button type="submit" variant="primary" size="lg" disabled={!isFormValid} loading={loading} className="w-full">
                  <FlaskConical className="w-4 h-4 mr-2" />
                  Confirm Booking
                </Button>
              </form>
            </Card>
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            <Card title="Booking Summary">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Room:</span>
                  <span className="font-medium">{formData.roomCode || '-'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Equipment:</span>
                  <span className="font-medium">{formData.equipmentType || 'Not selected'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Units:</span>
                  <span className="font-medium">1 (auto-assigned)</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Date & Time:</span>
                  <span className="font-medium">
                    {formData.date && timeRange.start && timeRange.end
                      ? `${formData.date} ${timeRange.start} - ${timeRange.end}`
                      : 'Not selected'}
                  </span>
                </div>
              </div>
            </Card>

            <Card title="Quick Tips">
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <Clock className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <p>Book equipment 1-7 days in advance for better availability</p>
                </div>
                <div className="flex items-start space-x-2">
                  <Cpu className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <p>Check equipment condition before starting your session</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
