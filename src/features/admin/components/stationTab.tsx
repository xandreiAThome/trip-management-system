"use client";

import { Button } from "@/components/ui/button";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "@/components/ui/table";
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
import { useState } from "react";
import { Toaster } from "sonner";

import { StationType } from "@/features/station/types/types";
import useStationsQuery from "@/features/station/hooks/useStationsQuery";
import usePostStationMutate from "@/features/station/hooks/usePostStationMutate";
import useDeleteStationMutate from "@/features/station/hooks/useDeleteStatonMutate";
import usePatchStationMutate from "@/features/station/hooks/usePatchStationMutate";

type StationTabProps = {
  stations: StationType[];
};

export default function StationTab({
  stations: initStations,
}: StationTabProps) {
  const [adding, setAdding] = useState(false);
  const [newStation, setNewStation] = useState({ name: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStation, setEditStation] = useState({ name: "" });
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const {
    data: stations = [],
    isLoading: stationsLoading,
    error: stationsError,
  } = useStationsQuery(initStations);

  const postStationMutation = usePostStationMutate();
  const deleteStationMutation = useDeleteStationMutate();
  const patchStationMutation = usePatchStationMutate();

  const handleAdd = async () => {
    if (!newStation.name) return;
    setAdding(true);
    await postStationMutation.mutateAsync(newStation);
    setNewStation({ name: "" });
    setAdding(false);
  };

  const handleDelete = async (id: number) => {
    await deleteStationMutation.mutateAsync(id);
    setDeleteId(null);
  };

  const handleEdit = (station: StationType) => {
    setEditingId(station.id);
    setEditStation({ name: station.name });
  };

  const handleEditSave = async (id: number) => {
    await patchStationMutation.mutateAsync({
      id,
      update: { name: editStation.name },
    });

    setEditingId(null);
    setEditStation({ name: "" });
  };

  return (
    <>
      <h2 className="text-xl font-semibold mb-2">Manage Stations</h2>
      {stationsLoading ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-lg">Loading stations...</p>
        </div>
      ) : stationsError ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-red-500">
            Error loading stations, please refresh the browser
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stations.map(station => (
              <TableRow key={station.id}>
                {editingId === station.id ? (
                  <>
                    <TableCell>
                      <input
                        className="border rounded px-2 py-1 w-full"
                        value={editStation.name}
                        onChange={e =>
                          setEditStation(s => ({ ...s, name: e.target.value }))
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleEditSave(station.id)}
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
                    <TableCell>{station.name}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleEdit(station)}
                        className="mr-2"
                      >
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            onClick={() => setDeleteId(station.id)}
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
          placeholder="Station name"
          value={newStation.name}
          onChange={e => setNewStation(s => ({ ...s, name: e.target.value }))}
        />
        <Button onClick={handleAdd} disabled={adding || !newStation.name}>
          {adding ? "Adding..." : "Add Station"}
        </Button>
      </div>
      <Toaster position="top-right" richColors />
    </>
  );
}
