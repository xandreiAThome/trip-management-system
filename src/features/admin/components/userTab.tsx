"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { useState } from "react";
import { toast, Toaster } from "sonner";
import { DriverType } from "@/features/driver/types/types";
import { StationType } from "@/features/station/types/types";
import { UserType } from "@/features/user/types/types";
import { CashierType } from "@/features/cashier/types/types";
import useUsersQuery from "@/features/user/hooks/useUsersQuery";
import useCashiersQuery from "@/features/cashier/hooks/useCashiersQuery";
import useStationsQuery from "@/features/station/hooks/useStationsQuery";
import useDeleteUserMutate from "@/features/user/hooks/useDeleteUserMutate";
import usePatchUserMutate from "@/features/user/hooks/usePatchUserMutate";
import usePatchCashierMutate from "@/features/cashier/hooks/usePatchCashierMutate";
import usePostCashierMutate from "@/features/cashier/hooks/usePostCashierMutate";
import useDriversQuery from "@/features/driver/hooks/useDriversQuery";
import usePostDriverMutate from "@/features/driver/hooks/usePostDriverMutate";

type UserTabProps = {
  users: UserType[];
  cashiers: CashierType[];
  stations: StationType[];
};

export default function UserTab({
  users: initUsers,
  cashiers: initCashiers,
  stations: initStations,
}: UserTabProps) {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editState, setEditState] = useState<
    Record<number, { role: UserType["role"]; station_id?: number | null }>
  >({});

  const {
    data: drivers = [],
    isLoading: driversLoading,
    error: driversError,
  } = useDriversQuery();

  const {
    data: users = [],
    isLoading: usersLoading,
    error: usersError,
  } = useUsersQuery(initUsers);

  const {
    data: cashiers = [],
    isLoading: cashiersLoading,
    error: cashierError,
  } = useCashiersQuery(initCashiers);

  const {
    data: stations = [],
    isLoading: stationsLoading,
    error: stationsError,
  } = useStationsQuery(initStations);

  const deleteUserMutation = useDeleteUserMutate();
  const patchUserMutation = usePatchUserMutate();
  const patchCashierMutation = usePatchCashierMutate();
  const postCashierMutation = usePostCashierMutate();
  const postDriversMutation = usePostDriverMutate();

  const handleRoleChange = (userId: number, newRole: UserType["role"]) => {
    setEditState(state => {
      let station_id: number | undefined = undefined;
      if (newRole === "cashier") {
        // Try to get station_id from cashier record if available
        const cashier = cashiers.find(c => c.user_id === userId);
        if (cashier) {
          station_id = cashier.station_id;
        } else if (state[userId]?.station_id) {
          station_id = state[userId].station_id;
        }
      }
      return {
        ...state,
        [userId]: {
          role: newRole,
          station_id: newRole === "cashier" ? station_id : undefined,
        },
      };
    });
  };

  const handleStationChange = (userId: number, stationId: string) => {
    setEditState(state => ({
      ...state,
      [userId]: {
        role: "cashier",
        station_id: Number(stationId),
      },
    }));
  };

  const handleSave = async (user: UserType) => {
    const update = editState[user.id] || { role: user.role };

    try {
      // First, update the user role and wait for completion
      await patchUserMutation.mutateAsync({
        id: user.id,
        update: { role: update.role },
      });

      // Then handle role-specific logic based on the new role
      if (update.role === "cashier") {
        const cashier = cashiers.find(c => c.user_id === user.id);
        const nameParts = user.name.split(" ");
        const first_name = nameParts[0] || "";
        const last_name =
          nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

        if (cashier) {
          // Update existing cashier's station assignment
          await patchCashierMutation.mutateAsync({
            id: cashier.id,
            update: { station_id: update.station_id ?? undefined },
          });
        } else {
          // Create new cashier entry
          if (
            typeof update.station_id === "number" &&
            !isNaN(update.station_id)
          ) {
            await postCashierMutation.mutateAsync({
              first_name,
              last_name,
              user_id: user.id,
              station_id: update.station_id,
            });
          } else {
            toast.error("Station must be assigned for cashier role.");
            return;
          }
        }
      }

      // Handle driver role
      if (update.role === "driver") {
        const [first_name, ...rest] = user.name.split(" ");
        const last_name = rest.join(" ");

        const driverExists =
          Array.isArray(drivers) &&
          drivers.some((d: DriverType) => d.user_id === user.id);

        if (!driverExists) {
          await postDriversMutation.mutateAsync({
            user_id: user.id,
            first_name,
            last_name,
          });
        }
      }

      // Clear edit state for this user after successful save
      setEditState(state => {
        const newState = { ...state };
        delete newState[user.id];
        return newState;
      });
    } catch (error) {
      // Let mutations handle their own error toasts
      console.error("Save operation failed:", error);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleteId(null);
    deleteUserMutation.mutate(id);
  };

  return (
    <>
      <h2 className="text-xl font-semibold mb-2">Manage User Roles</h2>

      {(usersError || cashierError || stationsError || driversError) && (
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
          <p className="text-red-700">
            Error loading data. Please refresh the page.
          </p>
        </div>
      )}

      {usersLoading || cashiersLoading || stationsLoading || driversLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-lg">Loading Users...</div>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Station</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user: UserType) => {
              const edit = editState[user.id] || { role: user.role };
              // Find cashier record for this user
              const cashier = cashiers.find(c => c.user_id === user.id);
              return (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Select
                      value={edit.role}
                      onValueChange={val =>
                        handleRoleChange(user.id, val as UserType["role"])
                      }
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue className="text-left" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">user</SelectItem>
                        <SelectItem value="admin">admin</SelectItem>
                        <SelectItem value="cashier">cashier</SelectItem>
                        <SelectItem value="driver">driver</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {edit.role === "cashier" ? (
                      <Select
                        value={
                          typeof edit.station_id === "number"
                            ? String(edit.station_id)
                            : cashier
                              ? String(cashier.station_id)
                              : ""
                        }
                        onValueChange={val => handleStationChange(user.id, val)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Assign station" />
                        </SelectTrigger>
                        <SelectContent>
                          {stations.map((station: StationType) => (
                            <SelectItem
                              key={station.id}
                              value={String(station.id)}
                            >
                              {station.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-gray-400 italic">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      onClick={() => handleSave(user)}
                      disabled={
                        postCashierMutation.isPending ||
                        postDriversMutation.isPending ||
                        patchCashierMutation.isPending ||
                        patchUserMutation.isPending
                      }
                    >
                      Save
                    </Button>
                    <Dialog
                      open={deleteId === user.id}
                      onOpenChange={open => setDeleteId(open ? user.id : null)}
                    >
                      <DialogTrigger asChild>
                        <Button variant="destructive">Delete</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete User</DialogTitle>
                        </DialogHeader>
                        <p>
                          Are you sure you want to delete <b>{user.name}</b>?
                        </p>
                        <DialogFooter>
                          <Button
                            variant="secondary"
                            onClick={() => setDeleteId(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleDelete(user.id)}
                            disabled={deleteUserMutation.isPending}
                          >
                            Delete
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {/* Sonner Toaster for notifications */}
      <Toaster position="top-right" richColors />
    </>
  );
}
