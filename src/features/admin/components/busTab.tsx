"use client";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "@/components/ui/table";

import { useState } from "react";
import { Toaster } from "sonner";
import useBusesQuery from "@/features/bus/hooks/useBusesQuery";
import useStationsQuery from "@/features/station/hooks/useStationsQuery";
import useCreateBusMutation from "@/features/bus/hooks/useCreateBusMutation";
import useUpdateBusMutation from "@/features/bus/hooks/useUpdateBusMutation";
import useDeleteBusMutation from "@/features/bus/hooks/useDeleteBusMutation";
import { AggregatedBusType } from "@/features/bus/types/types";

export default function BusesTab() {
  // TanStack Query hooks
  const {
    data: buses = [],
    isLoading: loadingBuses,
    error: busesError,
  } = useBusesQuery();
  const { data: stations = [], isLoading: loadingStations } =
    useStationsQuery();

  // Mutation hooks
  const createBusMutation = useCreateBusMutation();
  const updateBusMutation = useUpdateBusMutation();
  const deleteBusMutation = useDeleteBusMutation();

  // Local state for UI
  const [adding, setAdding] = useState(false);
  const [newBus, setNewBus] = useState({
    plate_number: "",
    station_id: -1,
    capacity: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editBus, setEditBus] = useState({
    plate_number: "",
    station_id: -1,
    capacity: "",
  });
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleAdd = async () => {
    if (
      !newBus.plate_number ||
      newBus.station_id === -1 ||
      newBus.capacity === "" ||
      isNaN(Number(newBus.capacity))
    )
      return;

    setAdding(true);
    try {
      await createBusMutation.mutateAsync({
        ...newBus,
        capacity: Number(newBus.capacity),
      });
      setNewBus({ plate_number: "", station_id: -1, capacity: "" });
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteBusMutation.mutateAsync(id);
      setDeleteId(null);
    } catch {
      // Error is already handled by the mutation
    }
  };

  const handleEdit = (bus: AggregatedBusType) => {
    setEditingId(bus.id);
    setEditBus({
      plate_number: bus.plate_number,
      station_id: bus.station.id,
      capacity: String(bus.capacity),
    });
  };

  const handleEditSave = async (id: number) => {
    if (editBus.capacity === "" || isNaN(Number(editBus.capacity))) return;
    try {
      await updateBusMutation.mutateAsync({
        id,
        ...editBus,
        capacity: Number(editBus.capacity),
      });
      setEditingId(null);
      setEditBus({ plate_number: "", station_id: -1, capacity: "" });
    } catch {
      // Error is already handled by the mutation
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Manage Buses</h2>
      {loadingBuses || loadingStations ? (
        <div>Loading buses and stations...</div>
      ) : busesError ? (
        <div className="text-red-500">Failed to load buses</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plate Number</TableHead>
              <TableHead>Station</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {buses.map(bus => (
              <TableRow key={bus.id}>
                {editingId === bus.id ? (
                  <>
                    <TableCell>
                      <input
                        className="border rounded px-2 py-1 w-full"
                        value={editBus.plate_number}
                        onChange={e =>
                          setEditBus(s => ({
                            ...s,
                            plate_number: e.target.value,
                          }))
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <select
                        className="border rounded px-2 py-1 w-full"
                        value={editBus.station_id}
                        onChange={e =>
                          setEditBus(s => ({
                            ...s,
                            station_id: Number(e.target.value),
                          }))
                        }
                      >
                        <option value={-1}>Select station</option>
                        {stations.map(station => (
                          <option key={station.id} value={station.id}>
                            {station.name}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell>
                      <input
                        type="number"
                        className="border rounded px-2 py-1 w-full"
                        value={editBus.capacity}
                        onChange={e =>
                          setEditBus(s => ({
                            ...s,
                            capacity: e.target.value,
                          }))
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleEditSave(bus.id)}
                        className="mr-2"
                      >
                        Save
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>{bus.plate_number}</TableCell>
                    <TableCell>{bus.station?.name || "No station"}</TableCell>
                    <TableCell>{bus.capacity}</TableCell>
                    <TableCell>
                      <Button onClick={() => handleEdit(bus)} className="mr-2">
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            onClick={() => setDeleteId(bus.id)}
                          >
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Bus</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this bus? This
                              action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel
                              onClick={() => setDeleteId(null)}
                            >
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                deleteId !== null && handleDelete(deleteId)
                              }
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <div className="flex gap-2 mt-4 items-center">
        <input
          className="border rounded px-2 py-1"
          placeholder="Plate number"
          value={newBus.plate_number}
          onChange={e =>
            setNewBus(s => ({ ...s, plate_number: e.target.value }))
          }
        />
        <select
          className="border rounded px-2 py-1"
          value={newBus.station_id}
          onChange={e =>
            setNewBus(s => ({ ...s, station_id: Number(e.target.value) }))
          }
        >
          <option value={-1}>Select station</option>
          {stations.map(station => (
            <option key={station.id} value={station.id}>
              {station.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          className="border rounded px-2 py-1"
          placeholder="Capacity"
          value={newBus.capacity}
          onChange={e => setNewBus(s => ({ ...s, capacity: e.target.value }))}
        />
        <Button
          onClick={handleAdd}
          disabled={
            adding ||
            !newBus.plate_number ||
            newBus.station_id === -1 ||
            newBus.capacity === "" ||
            isNaN(Number(newBus.capacity))
          }
        >
          {adding ? "Adding..." : "Add Bus"}
        </Button>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}
