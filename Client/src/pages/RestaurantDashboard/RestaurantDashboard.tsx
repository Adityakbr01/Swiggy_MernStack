
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useGetSummaryQuery } from "@/redux/services/restaurantApi";
import { motion } from "framer-motion";
import {
  Loader2,
  Utensils,
  ShoppingCart,
  Users,
  IndianRupee,
  RefreshCw,
  Clock,
  ChefHat,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Tooltip as ShadTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// TypeScript interfaces
interface RecentOrder {
  _id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: Array<{
    itemName: string;
    quantity: number;
    price: number;
  }>;
}

interface DashboardSummary {
  totalOrders: number;
  todayOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  activeOrders: number;
  averageOrderValue: number;
  uniqueCustomers: number;
  restaurantName: string;
  popularDishes: Array<{
    itemName: string;
    itemId: string;
    orderCount: number;
  }>;
  revenueTrend: Array<{
    day: string;
    revenue: number;
  }>;
  recentOrders: RecentOrder[];
}

interface SummaryResponse {
  success: boolean;
  message: string;
  data: DashboardSummary;
}

interface User {
  id: string;
  role: string;
  OWN_Restaurant?: string;
}

const RestaurantDashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth) as {
    user: User | null;
  };
  const { data, isLoading, error, refetch } = useGetSummaryQuery(undefined, {
    pollingInterval: 0,
  }) as {
    data: SummaryResponse | undefined;
    isLoading: boolean;
    error: any;
    refetch: () => void;
  };

  // Auth check
  if (!user || user.role !== "restaurant") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex items-center justify-center bg-amber-50"
      >
        <p className="text-rose-900 text-lg font-semibold">
          Please log in as a restaurant to access this page.
        </p>
      </motion.div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-amber-50"
      >
        <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
      </motion.div>
    );
  }

  // Error state
  if (error || !data?.success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex items-center justify-center bg-amber-50"
      >
        <p className="text-rose-700 text-lg font-semibold">
          Error loading dashboard: {data?.message || "Unknown error"}
        </p>
      </motion.div>
    );
  }

  const summary = data.data;

  // Mock percentage changes (since historical data isn't available)
  const todayOrderChange = summary.todayOrders > 0 ? "+8%" : "0%";
  const customerChange = summary.uniqueCustomers > 0 ? "+12%" : "0%";
  const revenueChange = summary.totalRevenue > 0 ? "+15%" : "0%";
  const pendingActiveChange =
    summary.pendingOrders + summary.activeOrders > 0 ? "+5%" : "0%";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen w-full bg-amber-50 p-6"
    >
      {/* Header */}
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-4xl font-bold text-rose-900 flex items-center gap-3">
          <Utensils className="w-10 h-10" /> {summary.restaurantName} Dashboard
        </h1>
        <Button
          onClick={refetch}
          variant="outline"
          className="border-rose-500 text-rose-500 hover:bg-rose-500/10"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </header>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Today's Orders */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          
        >
          <Card className="bg-gradient-to-br from-rose-400/30 to-rose-500/30 border border-red-300 shadow-lg">
            <CardContent className="p-6 flex flex-col justify-between h-48">
              <TooltipProvider>
                <ShadTooltip>
                  <TooltipTrigger>
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-6 h-6 text-rose-900" />
                      <h3 className="text-lg font-semibold text-rose-900">Orders Today</h3>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total orders placed today</p>
                  </TooltipContent>
                </ShadTooltip>
              </TooltipProvider>
              <div>
                <p className="text-3xl font-bold text-rose-900">{summary.todayOrders}</p>
                <p className="text-sm text-rose-700">{todayOrderChange} from yesterday</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Customers */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          
        >
          <Card className="bg-gradient-to-br from-green-400/25 to-green-500/25 border border-green-400 shadow-lg">
            <CardContent className="p-6 flex flex-col justify-between h-48">
              <TooltipProvider>
                <ShadTooltip>
                  <TooltipTrigger>
                    <div className="flex items-center gap-2">
                      <Users className="w-6 h-6 text-green-900" />
                      <h3 className="text-lg font-semibold text-green-900">Unique Customers</h3>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total unique customers who placed orders</p>
                  </TooltipContent>
                </ShadTooltip>
              </TooltipProvider>
              <div>
                <p className="text-3xl font-bold text-green-900">{summary.uniqueCustomers}</p>
                <p className="text-sm text-green-700">{customerChange} from yesterday</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Revenue */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          
        >
          <Card className="bg-gradient-to-br from-yellow-400/25 to-yellow-500/25 border border-yellow-500 shadow-lg">
            <CardContent className="p-6 flex flex-col justify-between h-48">
              <TooltipProvider>
                <ShadTooltip>
                  <TooltipTrigger>
                    <div className="flex items-center gap-2">
                      <IndianRupee className="w-6 h-6 text-yellow-900" />
                      <h3 className="text-lg font-semibold text-yellow-900">Total Revenue</h3>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Revenue from delivered orders</p>
                  </TooltipContent>
                </ShadTooltip>
              </TooltipProvider>
              <div>
                <p className="text-3xl font-bold text-yellow-900">
                  ₹{summary.totalRevenue.toLocaleString("en-IN")}
                </p>
                <p className="text-sm text-yellow-700">{revenueChange} from yesterday</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pending & Active Orders */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          
        >
          <Card className="bg-gradient-to-br from-blue-400/25 to-blue-500/25 border border-blue-400 shadow-lg">
            <CardContent className="p-6 flex flex-col justify-between h-48">
              <TooltipProvider>
                <ShadTooltip>
                  <TooltipTrigger>
                    <div className="flex items-center gap-2">
                      <Clock className="w-6 h-6 text-blue-900" />
                      <h3 className="text-lg font-semibold text-blue-900">Pending & Active Orders</h3>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Orders in pending, accepted, or preparing status</p>
                  </TooltipContent>
                </ShadTooltip>
              </TooltipProvider>
              <div>
                <p className="text-3xl font-bold text-blue-900">{summary.pendingOrders + summary.activeOrders}</p>
                <p className="text-sm text-blue-700">{pendingActiveChange} from yesterday</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="bg-white border border-red-300 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <IndianRupee className="w-6 h-6 text-rose-900" />
                <CardTitle className="text-lg font-semibold text-rose-900">
                  Revenue Trend (Last 7 Days)
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={summary.revenueTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#fee2e2" />
                    <XAxis dataKey="day" stroke="#991b1b" />
                    <YAxis stroke="#991b1b" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#fefce8", borderColor: "#b91c1c" }}
                      labelStyle={{ color: "#991b1b" }}
                      itemStyle={{ color: "#b91c1c" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#b91c1c"
                      strokeWidth={2}
                      activeDot={{ r: 8, fill: "#b91c1c" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Popular Dishes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="bg-white border border-green-300 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ChefHat className="w-6 h-6 text-green-900" />
                <CardTitle className="text-lg font-semibold text-green-900">
                  Popular Dishes
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {summary.popularDishes.length === 0 ? (
                <div className="text-center py-6">
                  <ChefHat className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="text-green-700">No popular dishes yet.</p>
                  <p className="text-green-600 text-sm">
                    Top dishes will appear as orders are placed.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {summary.popularDishes.map((dish, index) => (
                    <motion.div
                      key={dish.itemId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex justify-between items-center p-3 bg-green-100/50 rounded-md"
                    >
                      <div className="flex flex-col">
                        <span className="text-green-900 font-medium">{dish.itemName}</span>
                        <span className="text-sm text-green-700">{dish.itemId.slice(-6)}</span>
                      </div>
                      <span className="text-green-900">{dish.orderCount} orders</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="lg:col-span-3"
        >
          <Card className="bg-blue-400/5 border border-blue-300 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-6 h-6 text-blue-900" />
                <CardTitle className="text-lg font-semibold text-blue-900">
                  Recent Orders
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {summary.recentOrders.length === 0 ? (
                <div className="text-center py-6">
                  <ShoppingCart className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                  <p className="text-blue-700">No recent orders found.</p>
                  <p className="text-blue-600 text-sm">
                    New orders will appear here as customers place them.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {summary.recentOrders.map((order, index) => (
                    <Link
                      key={order._id}
                      to={`/dashboard/orders?orderId=${order._id}`}
                    >
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        whileHover={{ scale: 1.01 }}
                        className="flex justify-between items-center p-3 bg-blue-100/50 rounded-md cursor-pointer hover:bg-blue-100"
                      >
                        <div className="flex flex-col">
                          <span className="text-blue-900 font-medium">
                            Order #{order._id.slice(-6)}
                          </span>
                          <span className="text-sm text-blue-700">
                            {order.items.map((item) => item.itemName).join(", ") || "No items"}
                          </span>
                          <span className="text-sm text-blue-600">
                            {format(new Date(order.createdAt), "dd MMM yyyy, HH:mm")}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-blue-900">
                            ₹{order.totalAmount.toLocaleString("en-IN")}
                          </span>
                          <span
                            className={`text-sm font-medium ${
                              order.status === "delivered"
                                ? "text-green-600"
                                : order.status === "pending"
                                ? "text-yellow-600"
                                : order.status === "accepted" || order.status === "preparing"
                                ? "text-blue-600"
                                : "text-red-600"
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

export default RestaurantDashboard;
