import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Cpu, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getAvailableEquipment, bookLabEquipment } from "../../actions/bookings";
import { supabase } from "../../lib/supabaseClient";


type Room = { id: number; code: string };
type EquipmentType = { id: number; name: string };
type AvailableUnit = { resource_id: number; unit_id: number; asset_tag: string | null };

export default function LabBooking() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [availableUnits, setAvailableUnits] = useState<AvailableUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    room: "",
    equipmentType: "",
    units: 1,
    date: "",
    start: "",
    end: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: roomData } = await supabase.from("rooms").select("id, code");
        const { data: equipData } = await supabase.from("equipment_types").select("id, name");
        setRooms(roomData || []);
        setEquipmentTypes(equipData || []);
      } catch (e: any) {
        setError(e.message);
      }
    };
    fetchData();
  }, []);

  const buildTime = (date: string, time: string) => `${date}T${time}:00`;

  const validateTimes = () => {
    if (!formData.date || !formData.start || !formData.end) return "Select date and time.";
    const start = new Date(buildTime(formData.date, formData.start)).getTime();
    const end = new Date(buildTime(formData.date, formData.end)).getTime();
    if (end <= start) return "End time must be after start time.";
    return null;
  };

  const checkAvailability = async () => {
    setError(null); setOk(null); setAvailableUnits([]);
    const timeErr = validateTimes();
    if (timeErr) { setError(timeErr); return; }
    if (!formData.room || !formData.equipmentType) { setError("Select room and equipment type."); return; }

    setChecking(true);
    try {
      const startTime = buildTime(formData.date, formData.start);
      const endTime = buildTime(formData.date, formData.end);
      const data = await getAvailableEquipment(formData.room, Number(formData.equipmentType), startTime, endTime);
      setAvailableUnits(data);
      if (data.length === 0) setError("No units available.");
      else setOk(`${data.length} unit(s) available.`);
    } catch (e: any) {
      setError(e.message);
    } finally { setChecking(false); }
  };

  const handleBooking = async () => {
    setError(null); setOk(null);
    const timeErr = validateTimes();
    if (timeErr) { setError(timeErr); return; }
    if (availableUnits.length === 0) { setError("Check availability first."); return; }
    if (formData.units > availableUnits.length) { setError(`Only ${availableUnits.length} units available.`); return; }

    setLoading(true);
    try {
      await bookLabEquipment({
        roomCode: formData.room,
        equipmentTypeId: Number(formData.equipmentType),
        units: Number(formData.units),
        start: buildTime(formData.date, formData.start),
        end: buildTime(formData.date, formData.end),
      });
      setOk("Booking successful!");
      setAvailableUnits([]);
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto p-6"
    >
      <h1 className="text-2xl font-bold mb-6">Lab Equipment Booking</h1>

      <Card className="shadow-lg rounded-2xl">
        <CardContent className="space-y-6 p-6">

          {/* Room */}
          <div>
            <label className="text-sm font-medium">Room</label>
            <Select onValueChange={(val) => setFormData(p => ({ ...p, room: val }))}>
              <SelectTrigger className="mt-1 w-full"><SelectValue placeholder="Select room" /></SelectTrigger>
              <SelectContent>
                {rooms.map(r => <SelectItem key={r.id} value={r.code}>{r.code}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Equipment */}
          <div>
            <label className="text-sm font-medium">Equipment Type</label>
            <Select onValueChange={(val) => setFormData(p => ({ ...p, equipmentType: val }))}>
              <SelectTrigger className="mt-1 w-full"><SelectValue placeholder="Select equipment" /></SelectTrigger>
              <SelectContent>
                {equipmentTypes.map(e => <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium flex items-center gap-1"><Calendar size={16}/> Date</label>
              <Input type="date" className="mt-1" value={formData.date} onChange={e => setFormData(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium flex items-center gap-1"><Clock size={16}/> Start</label>
              <Input type="time" className="mt-1" value={formData.start} onChange={e => setFormData(p => ({ ...p, start: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium flex items-center gap-1"><Clock size={16}/> End</label>
              <Input type="time" className="mt-1" value={formData.end} onChange={e => setFormData(p => ({ ...p, end: e.target.value }))} />
            </div>
          </div>

          {/* Units */}
          <div>
            <label className="text-sm font-medium flex items-center gap-1"><Cpu size={16}/> Units</label>
            <Input type="number" min={1} className="mt-1" value={formData.units} onChange={e => setFormData(p => ({ ...p, units: Number(e.target.value) }))} />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button type="button" variant="outline" disabled={checking} onClick={checkAvailability}>
              {checking ? "Checking..." : "Check Availability"}
            </Button>
            <Button type="button" disabled={loading} onClick={handleBooking}>
              {loading ? "Booking..." : "Book Now"}
            </Button>
          </div>

          {/* Status */}
          {error && (
            <Alert variant="destructive" className="flex items-center gap-2">
              <AlertCircle size={16} />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {ok && (
            <Alert className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-600" />
              <AlertDescription>{ok}</AlertDescription>
            </Alert>
          )}

          {/* Available units */}
          {availableUnits.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-2">
              <h3 className="font-semibold mb-2">Available Units</h3>
              <ul className="space-y-2">
                {availableUnits.map(u => (
                  <li key={u.resource_id} className="border rounded p-2 text-sm flex justify-between">
                    <span>Unit #{u.unit_id}</span>
                    <span className="text-gray-500">{u.asset_tag || "(no tag)"}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
