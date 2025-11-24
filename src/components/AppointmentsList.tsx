import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface AppointmentsListProps {
  claimId: string;
}

export function AppointmentsList({ claimId }: AppointmentsListProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["appointments", claimId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("claim_id", claimId)
        .order("scheduled_time", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ appointmentId, status }: { appointmentId: string; status: string }) => {
      const { error } = await supabase
        .from("appointments")
        .update({ status })
        .eq("id", appointmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments", claimId] });
      toast.success("Appointment updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update appointment: ${error.message}`);
    },
  });

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading appointments...</div>;
  }

  if (appointments.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        No appointments scheduled yet
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "pending":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      case "cancelled":
        return "bg-red-500/10 text-red-700 dark:text-red-400";
      case "completed":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-3">
      {appointments.map((appointment) => {
        const isCreator = appointment.created_by === user?.id;
        const canConfirm = !isCreator && appointment.status === "pending";
        const canCancel = appointment.status !== "completed" && appointment.status !== "cancelled";

        return (
          <Card key={appointment.id} className="p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {format(new Date(appointment.scheduled_time), "EEEE, MMMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(appointment.scheduled_time), "h:mm a")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{appointment.location}</span>
                  </div>
                </div>
                <Badge className={getStatusColor(appointment.status)}>
                  {appointment.status}
                </Badge>
              </div>

              {appointment.notes && (
                <p className="text-sm text-muted-foreground border-l-2 border-muted pl-3">
                  {appointment.notes}
                </p>
              )}

              {(canConfirm || canCancel) && (
                <div className="flex gap-2 pt-2">
                  {canConfirm && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() =>
                        updateStatusMutation.mutate({
                          appointmentId: appointment.id,
                          status: "confirmed",
                        })
                      }
                      disabled={updateStatusMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Confirm
                    </Button>
                  )}
                  {canCancel && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateStatusMutation.mutate({
                          appointmentId: appointment.id,
                          status: "cancelled",
                        })
                      }
                      disabled={updateStatusMutation.isPending}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}