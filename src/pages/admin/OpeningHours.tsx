// TODO(Supabase): On Save → UPSERT opening_hours rows per dow

import React from 'react';
import { Clock, Save, Calendar } from 'lucide-react';
import { Card, Button, FormRow, Input, Badge, PageTransition } from '../../lib/ui';
import { useToast } from '../../lib/ui';
import { updateOpeningHours } from '../../actions/admin';

interface OpeningHour {
  dow: number; // 0=Sunday, 1=Monday, etc.
  open: string;
  close: string;
  closed: boolean;
}

export const OpeningHours: React.FC = () => {
  const { addToast } = useToast();
  const [hours, setHours] = React.useState<OpeningHour[]>([
    { dow: 0, open: '08:00', close: '19:00', closed: true }, // Sunday
    { dow: 1, open: '08:00', close: '19:00', closed: false }, // Monday
    { dow: 2, open: '08:00', close: '19:00', closed: false }, // Tuesday
    { dow: 3, open: '08:00', close: '19:00', closed: false }, // Wednesday
    { dow: 4, open: '08:00', close: '19:00', closed: false }, // Thursday
    { dow: 5, open: '08:00', close: '19:00', closed: true }, // Friday
    { dow: 6, open: '08:00', close: '19:00', closed: true }  // Saturday
  ]);
  const [loading, setLoading] = React.useState(false);
  const [hasChanges, setHasChanges] = React.useState(false);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const handleTimeChange = (dow: number, field: 'open' | 'close', value: string) => {
    setHours(prev => prev.map(h => 
      h.dow === dow ? { ...h, [field]: value } : h
    ));
    setHasChanges(true);
  };

  const toggleClosed = (dow: number) => {
    setHours(prev => prev.map(h => 
      h.dow === dow ? { ...h, closed: !h.closed } : h
    ));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setLoading(true);
    
    try {
      await updateOpeningHours(hours);
      setHasChanges(false);
    } catch (error) {
      if (error instanceof Error && error.message === "NOT_CONNECTED") {
        addToast({
          type: 'info',
          message: 'Not connected yet — Supabase wiring comes next'
        });
      } else {
        addToast({
          type: 'error',
          message: 'Failed to update opening hours'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const resetToDefaults = () => {
    setHours([
      { dow: 0, open: '08:00', close: '19:00', closed: true },
      { dow: 1, open: '08:00', close: '19:00', closed: false },
      { dow: 2, open: '08:00', close: '19:00', closed: false },
      { dow: 3, open: '08:00', close: '19:00', closed: false },
      { dow: 4, open: '08:00', close: '19:00', closed: false },
      { dow: 5, open: '08:00', close: '19:00', closed: true },
      { dow: 6, open: '08:00', close: '19:00', closed: true }
    ]);
    setHasChanges(true);
  };

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Opening Hours</h1>
            <p className="text-gray-600 mt-2">Configure system operating hours and availability.</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              onClick={resetToDefaults}
            >
              Reset to Default
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!hasChanges}
              loading={loading}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Current Status */}
        <Card title="Current Status">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">System is currently operational</span>
            </div>
            <Badge variant="success">8:00 AM - 7:00 PM</Badge>
          </div>
        </Card>

        {/* Opening Hours Configuration */}
        <Card title="Weekly Schedule">
          <div className="space-y-6">
            {hours.map((hour, index) => (
              <div key={hour.dow} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-20">
                    <span className="font-medium text-gray-900">{dayNames[hour.dow]}</span>
                  </div>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={hour.closed}
                      onChange={() => toggleClosed(hour.dow)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-600">Closed</span>
                  </label>
                </div>

                {!hour.closed && (
                  <div className="flex items-center space-x-4">
                    <FormRow label="Open">
                      <div className="relative">
                        <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          type="time"
                          value={hour.open}
                          onChange={(e) => handleTimeChange(hour.dow, 'open', e.target.value)}
                          className="pl-10 w-32"
                        />
                      </div>
                    </FormRow>
                    
                    <FormRow label="Close">
                      <div className="relative">
                        <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          type="time"
                          value={hour.close}
                          onChange={(e) => handleTimeChange(hour.dow, 'close', e.target.value)}
                          className="pl-10 w-32"
                        />
                      </div>
                    </FormRow>
                  </div>
                )}

                {hour.closed && (
                  <Badge variant="neutral">Closed</Badge>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Schedule Preview */}
        <Card title="Schedule Summary">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Operating Days</h4>
              <div className="space-y-2">
                {hours.filter(h => !h.closed).map(hour => (
                  <div key={hour.dow} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{dayNames[hour.dow]}</span>
                    <span className="font-medium">{hour.open} - {hour.close}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Closed Days</h4>
              <div className="space-y-2">
                {hours.filter(h => h.closed).map(hour => (
                  <div key={hour.dow} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{dayNames[hour.dow]}</span>
                    <Badge variant="neutral">Closed</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Administrative Notes */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">🕒 Schedule Management Guidelines</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Regular Operations</h4>
              <ul className="space-y-1">
                <li>• Standard hours: Monday-Thursday 8:00 AM - 7:00 PM</li>
                <li>• Weekend closures are typical for university resources</li>
                <li>• Changes take effect immediately after saving</li>
                <li>• Users will see updated availability in booking forms</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Special Considerations</h4>
              <ul className="space-y-1">
                <li>• Update hours before holidays and exam periods</li>
                <li>• Notify users in advance of schedule changes</li>
                <li>• Consider maintenance windows for closures</li>
                <li>• Coordinate with facility management for accuracy</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};