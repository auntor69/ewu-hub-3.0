import React from 'react';
import { FlaskConical, Clock, Cpu, Wrench } from 'lucide-react';
import { Card, Button, FormRow, Select, Input, TimeRangePicker, PageTransition } from '../../lib/ui';
import { useToast } from '../../lib/ui';
import { bookLabEquipment } from '../../actions/bookings';

export const LabBooking: React.FC = () => {
  const { addToast } = useToast();
  const [formData, setFormData] = React.useState({
    equipmentType: '',
    units: 1
  });
  const [timeRange, setTimeRange] = React.useState<{ start: string; end: string }>({ start: '', end: '' });
  const [loading, setLoading] = React.useState(false);

  const equipmentOptions = [
    { value: '', label: 'Select Equipment Type' },
    { value: 'cse', label: 'CSE Equipment' },
    { value: 'engineering', label: 'Engineering Equipment' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.equipmentType || !timeRange.start || !timeRange.end) {
      addToast({
        type: 'warning',
        message: 'Please fill in all required fields'
      });
      return;
    }

    setLoading(true);
    
    try {
      await bookLabEquipment({
        equipmentType: formData.equipmentType,
        units: formData.units,
        start: timeRange.start,
        end: timeRange.end
      });

      addToast({
        type: 'success',
        message: 'Lab equipment booked successfully'
      });
    } catch (error) {
      console.error(error);
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to book lab equipment'
      });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.equipmentType && timeRange.start && timeRange.end;

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
                <FormRow label="Equipment Type" required>
                  <Select
                    value={formData.equipmentType}
                    onChange={(e) => setFormData(prev => ({ ...prev, equipmentType: e.target.value }))}
                    options={equipmentOptions}
                  />
                </FormRow>

                <FormRow label="Number of Units (1-20)" required>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={formData.units}
                    onChange={(e) => setFormData(prev => ({ ...prev, units: parseInt(e.target.value) || 1 }))}
                  />
                </FormRow>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Time Slot</h4>
                  <TimeRangePicker
                    onChange={setTimeRange}
                    maxMinutes={120}
                    value={timeRange}
                  />
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
            <Card title="Equipment Types">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Cpu className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">CSE Equipment</h4>
                    <p className="text-sm text-gray-600">
                      Computers, development boards, microcontrollers, and networking equipment.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Wrench className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Engineering Equipment</h4>
                    <p className="text-sm text-gray-600">
                      Mechanical tools, measuring instruments, and testing equipment.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Booking Summary">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Equipment:</span>
                  <span className="font-medium">
                    {formData.equipmentType ? 
                      equipmentOptions.find(opt => opt.value === formData.equipmentType)?.label 
                      : 'Not selected'
                    }
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Units:</span>
                  <span className="font-medium">{formData.units}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">
                    {timeRange.start && timeRange.end 
                      ? `${timeRange.start} - ${timeRange.end}`
                      : 'Not selected'
                    }
                  </span>
                </div>
              </div>
            </Card>

            <Card title="Quick Tips">
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Clock className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-600">
                    Book equipment 1-7 days in advance for better availability
                  </p>
                </div>
                
                <div className="flex items-start space-x-2">
                  <FlaskConical className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-600">
                    Check equipment condition before starting your session
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
