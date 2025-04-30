
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useGetRiderSummaryQuery, useUpdateAvailabilityMutation } from "@/redux/services/riderApi";
import { motion } from "framer-motion";
import { Loader2, Bike, Package, Wallet, RefreshCw, Clock, IndianRupee } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Tooltip as ShadTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";

interface RecentOrder {
  _id: string;
  restaurantName: string;
  totalAmount: number;
  deliveryFee: number;
  status: string;
  createdAt: string;
  deliveryAddress: string;
}

interface RiderDashboardSummary {
  todayDeliveries: number;
  pendingDeliveries: number;
  totalEarnings: number;
  activeOrders: number;
  riderName: string;
  availability: boolean;
  earningsTrend: Array<{ day: string; earnings: number }>;
  recentOrders: RecentOrder[];
}

interface SummaryResponse {
  success: boolean;
  message: string;
  data: RiderDashboardSummary;
}

interface User {
  id: string;
  role: string;
}

const RiderDashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth) as { user: User | null };
  const { data, isLoading, error, refetch } = useGetRiderSummaryQuery(undefined);

  console.log(data)
  const [updateAvailability] = useUpdateAvailabilityMutation();

  if (!user || user.role !== "rider") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex items-center justify-center bg-amber-50">
        <p className="text-rose-900 text-lg font-semibold">Please log in as a rider.</p>
      </motion.div>
    );
  }

  if (isLoading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex items-center justify-center bg-amber-50">
        <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
      </motion.div>
    );
  }

  if (error || !data?.success) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex items-center justify-center bg-amber-50">
        <p className="text-rose-700 text-lg font-semibold">Error: {data?.message || "Unknown error"}</p>
      </motion.div>
    );
  }

  const { todayDeliveries, pendingDeliveries, totalEarnings, activeOrders, riderName, availability, earningsTrend, recentOrders } = data.data;

  const handleAvailabilityToggle = async () => {
    try {
      await updateAvailability({ availability: !availability }).unwrap();
      refetch();
    } catch (err) {
      console.error("Failed to update availability:", err);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="min-h-screen bg-amber-50 p-6">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-rose-900 flex items-center gap-2">
          <Bike className="w-8 h-8" /> {riderName}'s Dashboard
        </h1>
        <div className="flex items-center gap-4">
          <TooltipProvider>
            <ShadTooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  <span className="text-rose-900">Availability</span>
                  <Switch checked={availability} onCheckedChange={handleAvailabilityToggle} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle to set your availability for new orders</p>
              </TooltipContent>
            </ShadTooltip>
          </TooltipProvider>
          <Button onClick={refetch} variant="outline" className="border-rose-500 text-rose-500 hover:bg-rose-500/10">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { icon: Package, title: "Today's Deliveries", value: todayDeliveries, change: todayDeliveries > 0 ? "+10%" : "0%", color: "rose", tooltip: "Orders delivered today" },
          { icon: Clock, title: "Pending Deliveries", value: pendingDeliveries, change: pendingDeliveries > 0 ? "+5%" : "0%", color: "yellow", tooltip: "Orders to pick up or deliver" },
          { icon: Wallet, title: "Total Earnings", value: `₹${totalEarnings.toLocaleString("en-IN")}`, change: totalEarnings > 0 ? "+12%" : "0%", color: "green", tooltip: "Earnings from delivered orders" },
          { icon: Bike, title: "Active Orders", value: activeOrders, change: activeOrders > 0 ? "+3%" : "0%", color: "blue", tooltip: "Orders currently being delivered" },
        ].map(({ icon: Icon, title, value, change, color, tooltip }, index) => (
          <motion.div key={title} initial={{ scale: 0.95 }} animate={{ scale: 1 }} transition={{ delay: index * 0.1 }} whileHover={{ scale: 1.02 }}>
            <Card className={`bg-gradient-to-br from-${color}-400/30 to-${color}-500/30 border-${color}-300 shadow-lg`}>
              <CardContent className="p-6 flex flex-col justify-between h-40">
                <TooltipProvider>
                  <ShadTooltip>
                    <TooltipTrigger>
                      <div className="flex items-center gap-2">
                        <Icon className={`w-6 h-6 text-${color}-900`} />
                        <h3 className={`text-lg font-semibold text-${color}-900`}>{title}</h3>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent><p>{tooltip}</p></TooltipContent>
                  </ShadTooltip>
                </TooltipProvider>
                <div>
                  <p className={`text-2xl font-bold text-${color}-900`}>{value}</p>
                  <p className={`text-sm text-${color}-700`}>{change} from yesterday</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }} className="lg:col-span-2">
          <Card className="bg-white border-red-300 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <IndianRupee className="w-6 h-6 text-rose-900" />
                <CardTitle className="text-lg font-semibold text-rose-900">Earnings Trend</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={earningsTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fee2e2" />
                  <XAxis dataKey="day" stroke="#991b1b" />
                  <YAxis stroke="#991b1b" />
                  <Tooltip contentStyle={{ backgroundColor: "#fefce8", borderColor: "#b91c1c" }} labelStyle={{ color: "#991b1b" }} itemStyle={{ color: "#b91c1c" }} />
                  <Line type="monotone" dataKey="earnings" stroke="#b91c1c" strokeWidth={2} activeDot={{ r: 8, fill: "#b91c1c" }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, delay: 0.1 }} className="lg:col-span-3">
          <Card className="bg-blue-400/5 border-blue-300 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Package className="w-6 h-6 text-blue-900" />
                <CardTitle className="text-lg font-semibold text-blue-900">Recent Orders</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="text-center py-4">
                  <Package className="w-10 h-10 text-blue-500 mx-auto mb-2" />
                  <p className="text-blue-700 text-sm">No recent orders.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentOrders.map((order, index) => (
                    <Link key={order._id} to={`/rider/dashboard/orders?orderId=${order._id}`}>
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex justify-between p-2 bg-blue-100/50 rounded-md hover:bg-blue-100"
                      >
                        <div>
                          <span className="text-blue-900 font-medium">#{order._id.slice(-6)}</span>
                          <p className="text-sm text-blue-700">{order.restaurantName}</p>
                          <p className="text-sm text-blue-600">{order.deliveryAddress}</p>
                          <p className="text-sm text-blue-600">{format(new Date(order.createdAt), "dd MMM yyyy, HH:mm")}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-blue-900">₹{order.totalAmount.toLocaleString("en-IN")}</p>
                            <p className="text-sm text-blue-700">Fee: ₹{order.deliveryFee}</p>
                          </div>
                          <span
                            className={`text-sm ${
                              order.status === "delivered"
                                ? "text-green-600"
                                : order.status === "assigned"
                                ? "text-yellow-600"
                                : "text-blue-600"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default RiderDashboard;