import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import UsersTab from "@/features/admin/components/userTab";
import BusesTab from "@/features/admin/components/busTab";
import StationTab from "@/features/admin/components/stationTab";
import { auth } from "@/features/auth/services/auth";
import { redirect } from "next/navigation";
import { getAllCashiers } from "@/features/cashier/services/crud";
import { getAllStations } from "@/features/station/services/crud";
import { getAllUsers } from "@/features/user/services/crud";

export default async function AdminDashboard() {
  const session = await auth();

  // Only allow admin users to access this page
  if (session?.user?.role !== "admin") {
    redirect("/unauthorized");
  }

  const users = await getAllUsers();
  const cashiers = await getAllCashiers();
  const stations = await getAllStations();
  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center px-2 sm:px-6 py-12">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-green-700 text-center drop-shadow">
        Admin Dashboard
      </h1>
      <div className="w-full max-w-5xl bg-white rounded-lg shadow-lg p-2 sm:p-6 border border-green-200">
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="flex w-full justify-center gap-2 bg-green-100 rounded mb-4">
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-green-800"
            >
              Users
            </TabsTrigger>
            <TabsTrigger
              value="buses"
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-green-800"
            >
              Buses
            </TabsTrigger>
            <TabsTrigger
              value="stations"
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-green-800"
            >
              Stations
            </TabsTrigger>
          </TabsList>
          <TabsContent value="users">
            <UsersTab users={users} cashiers={cashiers} stations={stations} />
          </TabsContent>
          <TabsContent value="buses">
            <BusesTab />
          </TabsContent>
          <TabsContent value="stations">
            <StationTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
