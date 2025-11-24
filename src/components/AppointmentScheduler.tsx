import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface AppointmentSchedulerProps {
  claimId: string;
  itemTitle: string;
}

export function AppointmentScheduler({ claimId, itemTitle }: AppointmentSchedulerProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const createAppointmentMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDate || !selectedTime || !location || !user) {
        throw new Error("Please fill all required fields");
      }

      const [hours, minutes] = selectedTime.split(":");
      const scheduledTime = new Date(selectedDate);
      scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const { error } = await supabase.from("appointments").insert({
        claim_id: claimId,
        scheduled_time: scheduledTime.toISOString(),
        location: location,
        notes: notes || null,
        created_by: user.id,
        status: "pending",
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Appointment scheduled successfully!");
      queryClient.invalidateQueries({ queryKey: ["appointments", claimId] });
      setOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(`Failed to schedule appointment: ${error.message}`);
    },
  });

  const resetForm = () => {
    setSelectedDate(undefined);
    setSelectedTime("");
    setLocation("");
    setNotes("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAppointmentMutation.mutate();
  };

  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, "0");
    return [`${hour}:00`, `${hour}:30`];
  }).flat();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <CalendarIcon className="mr-2 h-4 w-4" />
          Schedule Appointment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Meetup</DialogTitle>
          <DialogDescription>
            Schedule a time and place to meet for "{itemTitle}"
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Select Date</Label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              className="rounded-md border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Select Time</Label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger id="time">
                <Clock className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Choose time" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Meeting Location *</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Main Campus Library Entrance"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions or details..."
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedDate || !selectedTime || !location || createAppointmentMutation.isPending}
              className="flex-1"
            >
              {createAppointmentMutation.isPending ? "Scheduling..." : "Schedule"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}