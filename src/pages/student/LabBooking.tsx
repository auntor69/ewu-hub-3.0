import React from "react";
import { FlaskConical, Clock, Cpu } from "lucide-react";
import {
  Card,
  Button,
  FormRow,
  Select,
  Input,
  TimeRangePicker,
  PageTransition,
} from "../../lib/ui";
import { useToast } from "../../lib/ui";
import { bookLabEquipment, getAvailableEquipment } from "../../actions/bookings";
import { supabase } from "../../lib/supabaseClient";
import dayjs from "dayjs";

export default function LabBooking() {
  const { addToast } = useToast();

  const [formData, setFormData] = React.useState({
    roomId: "",
    equipmentTypeId: "",
    date: "",
  });

  const [timeRange, setTimeRange] = React.useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });

  const [loading, setLoading] = React.useState(false);
  const [availableUnits, setAvailableUnits] = React.useState<number>(0);
  const [equipmentOptions, setEquipmentOptions] = React.useState<{ value: string; label: string }[]>([]);
  const [roomOptions, setRoomOptions] = React.useState<{ value: string; label: string }[]>([]);

  // Load rooms + equipment types
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: roomsData, error: roomError } = await supabase
          .from("rooms")
          .select("id, code")
          .in("id", [124, 125, 126, 127, 128]);
        if (roomError) throw roomError;

        setRoomOptions([{ value: "", label: "Select Room" }, ...roomsData.map((r) => ({ value: r.id.toString(), label: r.code }))]);

        const { data: equipData, error: equipError } = await supabase
          .from("equipment_types")
          .select("id, name");
        if (equipError) throw equipError;

        setEquipmentOptions([{ value: "", label: "Select Equipment Type" }, ...equipData.map((e) => ({ value: e.id.toString(), label: e.name }))]);
      } catch (err) {
        console.error(err);
        addToast({ type: "error", message: "Failed to load rooms or equipment types" });
      }
    };

    fetchData();
  }, [addToast]);

  const buildISO = (date: string, time: string) =>
    date && time ? dayjs(`${date}T${time}`).toISOString() : "";

  // Auto-check availability
  React.useEffect(() => {
    const fetchAvailability = async () => {
      if (!formData.roomId || !formData.equipmentTypeId || !formData.date || !timeRange.start || !timeRange.end) {
        setAvailableUnits(0);
        return;
      }

      try {
        const available = await getAvailableEquipment(
          Number(formData.roomId),
          Number(formData.equipmentTypeId),
          buildISO(formData.date, timeRange.start),
          buildISO(formData.date, timeRange.end)
        );
        setAvailableUnits(available.length);
      } catch (err) {
        console.error(err);
        addToast({ type: "error", message: "Failed to load equipment availability" });
        setAvailableUnits(0);
      }
    };

    fetchAvailability();
  }, [formData, timeRange, addToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.roomId || !formData.equipmentTypeId || !formData.date || !timeRange.start || !timeRange.end) {
      addToast({ type: "warning", message: "Please fill in all required fields" });
      return;
    }

    if (availableUnits < 1) {
      addToast({ type: "error", message: "No available units to book" });
      return;
    }

    setLoading(true);
    try {
      const chosen = await bookLabEquipment({
        roomId: Number(formData.roomId),
        equipmentTypeId: Number(formData.equipmentTypeId),
        start: buildISO(formData.date, timeRange.start),
        end: buildISO(formData.date, timeRange.end),
      });

      addToast({ type: "success", message: `Booked unit ${chosen.asset_tag}` });
      setAvailableUnits(0);
    } catch (err: any) {
      console.error(err);
      addToast({ type: "error", message: err.message || "Booking failed" });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    formData.roomId && formData.equipmentTypeId && formData.date && timeRange.start && timeRange.end && availableUnits > 0;

  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lab Equipment Booking</h1>
          <p className="text-gray-600 mt-2">Reserve equipment units for practical sessions and experiments.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card title="Equipment Booking">
              <form onSubmit={handleSubmit} className="space-y-6">
                <FormRow label="Room" required>
                  <Select
                    value={formData.roomId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, roomId: e.target.value }))}
                    options={roomOptions}
                  />
                </FormRow>

                <FormRow label="Equipment Type" required>
                  <Select
                    value={formData.equipmentTypeId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, equipmentTypeId: e.target.value }))}
                    options={equipmentOptions}
                  />
                </FormRow>

                <FormRow label="Date" required>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
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

          <div className="space-y-6">
            <Card title="Booking Summary">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Room:</span>
                  <span className="font-medium">{roomOptions.find((r) => r.value === formData.roomId)?.label || "-"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Equipment Type:</span>
                  <span className="font-medium">
                    {equipmentOptions.find((e) => e.value === formData.equipmentTypeId)?.label || "Not selected"}
                  </span>
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
                      : "Not selected"}
                  </span>
                </div>
              </div>
            </Card>

            <Card title="Quick Tips">
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <Clock className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <p>Book equipment 1–7 days in advance for better availability</p>
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
