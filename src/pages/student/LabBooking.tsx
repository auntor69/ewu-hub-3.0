// src/pages/student/LabBooking.tsx
import React from 'react';
import { FlaskConical, Clock, Cpu, Wrench } from 'lucide-react';
import { Card, Button, FormRow, Select, Input, TimeRangePicker, PageTransition } from '../../lib/ui';
import { useToast } from '../../lib/ui';
import { bookLabEquipment, getAvailableEquipment } from '../../actions/bookings';

export default function LabBooking() {
  const { addToast } = useToast();

  const [formData, setFormData] = React.useState({
    roomCode: '',
    equipmentType: '',
    units: 1,
    date: ''
  });

  const [timeRange, setTimeRange] = React.useState<{ start: string; end: string }>({ start: '', end: '' });
  const [loading, setLoading] = React.useState(false);
  const [availableUnits, setAvailableUnits] = React.useState<number>(0);

  const equipmentOptions = [
    { value: '', label: 'Select Equipment Type' },
    { value: 'cse', label: 'CSE Equipment' },
    { value: 'engineering', label: 'Engineering Equipment' }
  ];

  // helper to build ISO time
  const buildISOTime = (time: string) => {
    if (!formData.date || !time) return '';
    return `${formData.date}T${time}:00`;
  };

  const fetchAvailability = async () => {
    if (!formData.roomCode || !formData.equipmentType || !formData.date || !timeRange.start || !timeRange.end) {
      return;
    }
    try {
      const available = await getAvailableEquipment(
        formData.roomCode,
        formData.equipmentType,
        buildISOTime(timeRange.start),
        buildISOTime(timeRange.end)
      );
      setAvailableUnits(available.length);
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', message: 'Failed to load equipment availability' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.roomCode || !formData.equipmentType || !formData.date || !timeRange.start || !timeRange.end) {
      addToast({ type: 'warning', message: 'Please fill in all required fields' });
      return;
    }

    setLoading(true);
    try {
      await bookLabEquipment({
        roomCode: formData.roomCode,
        equipmentType: formData.equipmentType,
        units: formData.units,
        start: buildISOTime(timeRange.start),
        end: buildISOTime(timeRange.end)
      });

      addToast({ type: 'success', message: 'Lab equipment booked successfully' });
      setAvailableUnits(0);
    } catch (error) {
      console.error(error);
      addToast({ type: 'error', message: error instanceof Error ? error.message : 'Booking failed' });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.roomCode && formData.equipmentType && formData.date && timeRange.start && timeRange.end;

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
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
                  <Input
                    value={formData.roomCode}
                    onChange={e => setFormData(prev => ({ ...prev, roomCode: e.target.value }))}
                    placeholder="e.g. LAB101"
                  />
                </FormRow>

                <FormRow label="Equipment Type" required>
                  <Select
                    value={formData.equipmentType}
                    onChange={e => setFormData(prev => ({ ...prev, equipmentType: e.target.value }))}
                    options={equipmentOptions}
                  />
                </FormRow>

                <FormRow label="Number of Units (1-20)" required>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={formData.units}
                    onChange={e => setFormData(prev => ({ ...prev, units: parseInt(e.target.value) || 1 }))}
                  />
                  {availableUnits > 0 && (
                    <p className="text-sm text-gray-500 mt-1">{availableUnits} unit(s) available</p>
                  )}
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
                  <Button
                    type="button"
                    variant="secondary"
                    className="mt-2"
                    onClick={fetchAvailability}
                    disabled={!isFormValid}
                  >
                    Check Availability
                  </Button>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={!isFormValid}
                  loading={loading}
                  className="w-full"
                >
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
                  <span className="font-medium">
                    {formData.equipmentType
                      ? equipmentOptions.find(opt => opt.value === formData.equipmentType)?.label
                      : 'Not selected'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Units:</span>
                  <span className="font-medium">{formData.units}</span>
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
