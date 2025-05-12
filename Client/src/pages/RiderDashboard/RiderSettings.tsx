import socket from "@/Socket/socket";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useUpdateOrderStatusMutation } from "@/redux/services/orderApi";
import {
  useAvailableordersQuery,
  useGetAllOrdersForRiderQuery,
  useGetRiderSummaryQuery,
  useUpdateAvailabilityMutation,
} from "@/redux/services/riderApi";
import { RootState } from "@/redux/store";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Bell, CheckCircle, History, RefreshCw, User } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  coordinates: { lat: number; lng: number };
}

interface Order {
  _id: string;
  restaurantName: string;
  restaurantAddress: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  deliveryFee: number;
  status: string;
  createdAt: string;
  deliveryAddress: DeliveryAddress;
}

interface User {
  id: string;
  name: string;
  role: string;
  contactNumber?: string;
}

interface RiderSummaryResponse {
  success: boolean;
  message: string;
  data: {
    riderName: string;
    todayDeliveries: number;
    pendingDeliveries: number;
    totalEarnings: number;
    availability: boolean;
    earningsTrend: Array<{ day: string; earnings: number }>;
    recentOrders: Order[];
  };
}


// Loading spinner component
const LoadingSpinner = () => (
  <motion.div
    className="text-center py-4"
    animate={{ rotate: 360 }}
    transition={{ repeat: Infinity, duration: 1 }}
  >
    <Bell className="w-10 h-10 text-rose-500 mx-auto" />
    <p className="text-rose-700 text-sm mt-2">Loading...</p>
  </motion.div>
);

const RiderSettings = () => {
  const { user } = useSelector((state: RootState) => state.auth) as { user: User | null };
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  // API hooks with skip condition to prevent unnecessary calls
  const [updateOrderStatus] = useUpdateOrderStatusMutation();
  const [updateAvailability] = useUpdateAvailabilityMutation();
  const { data: activeOrders = { data: [] }, isLoading: activeLoading } = useAvailableordersQuery(undefined, {
    skip: !user?.id || user?.role !== "rider",
  });
  const {
    data: orderHistory,
    isLoading: historyLoading,
    error: historyError,
    refetch: refetchHistory,
  } = useGetAllOrdersForRiderQuery(
    {
      page,
      limit: 10,
      status: statusFilter === "all" ? undefined : statusFilter,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    },
    { skip: !user?.id || user?.role !== "rider" }
  );
  const {
    data: summary,
    isLoading: summaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useGetRiderSummaryQuery({isDelivered: false}, { skip: !user?.id || user?.role !== "rider" });

  // Debug logs
  useEffect(() => {
    console.log("User:", user);
    console.log("Order history:", orderHistory);
    console.log("Active orders:", activeOrders?.data);
    console.log("Rider summary:", summary);
    console.log("Query params:", { page, statusFilter, dateFrom, dateTo });
    if (historyError) {
      console.error("Order history error:", historyError);
      toast.error("Failed to load order history. Please try again.");
    }
    if (summaryError) {
      console.error("Rider summary error:", summaryError);
      toast.error("Failed to load rider summary. Please try again.");
    }
  }, [orderHistory, activeOrders, historyError, statusFilter, summary, summaryError, user, page, dateFrom, dateTo]);

  // Socket.IO for real-time order updates
  useEffect(() => {
    if (!user?.id) return;

    socket.emit("joinRider", user.id);
    socket.emit("joinRiders");

    const handleOrderUpdate = (data: Order) => {
      if (!data?._id) {
        console.error("Invalid order ID received:", data);
        toast.error("Received invalid order data");
        return;
      }
      console.log("Order assigned:", data);
      toast.success(`New order assigned: #${data._id.slice(-6)}`);
      refetchSummary(); // Refresh summary to update recent orders
    };

    socket.on("orderAssigned", handleOrderUpdate);

    return () => {
      socket.off("orderAssigned", handleOrderUpdate);
    };
  }, [user?.id, refetchSummary]);

  // Handle availability toggle
  const handleAvailabilityToggle = useCallback(async (checked: boolean) => {
    try {
      await updateAvailability({ availability: checked }).unwrap();
      refetchSummary();
      toast.success(`Availability set to ${checked ? "Online" : "Offline"}`);
    } catch (error: any) {
      console.error("Error updating availability:", error);
      toast.error(`Failed to update availability: ${error?.data?.message || "Unknown error"}`);
    }
  }, [updateAvailability, refetchSummary]);

  // Handle order status update
  const handleStatusChange = useCallback(
    async (orderId: string, status: string) => {
      if (!orderId) {
        console.error("Invalid order ID:", orderId);
        toast.error("Invalid order ID");
        return;
      }
      try {
        await updateOrderStatus({ id: orderId, status }).unwrap();
        toast.success(`Order #${orderId.slice(-6)} status updated to ${status}`);
        refetchSummary(); // Refresh summary to update recent orders
        refetchHistory(); // Refresh history to reflect status change
      } catch (error: any) {
        console.error("Error updating order status:", error);
        toast.error(`Failed to update order status: ${error?.data?.message || "Unknown error"}`);
      }
    },
    [updateOrderStatus, refetchSummary, refetchHistory]
  );

  // Handle filter reset
  const handleResetFilters = useCallback(() => {
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }, []);

  // Render unauthorized state
  if (!user || user.role !== "rider") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-amber-50"
      >
        <p className="text-rose-900 text-lg font-semibold">Please log in as a rider.</p>
      </motion.div>
    );
  }

  // Render loading state for summary
  if (summaryLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-amber-50"
      >
        <LoadingSpinner />
      </motion.div>
    );
  }

  // Render error state for summary
  if (summaryError || !summary?.success) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-amber-50"
      >
        <div className="text-center">
          <p className="text-rose-700 text-lg font-semibold mb-4">
            Error: {summary?.message || "Failed to load rider summary"}
          </p>
          <Button
            onClick={() => refetchSummary()}
            variant="outline"
            className="text-rose-700 border-rose-300"
            aria-label="Retry loading rider summary"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </motion.div>
    );
  }

  const {
    todayDeliveries = 0,
    pendingDeliveries = 0,
    totalEarnings = 0,
    riderName = user.name,
    availability = false,
    recentOrders = [],
  } = (summary as RiderSummaryResponse).data || {};

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-amber-50 p-6"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Rider Summary */}
        <Card className="bg-white border-rose-300 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-6 h-6 text-rose-900" />
              <CardTitle className="text-lg font-semibold text-rose-900">Rider Summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-rose-700 text-sm space-y-2">
              <p>
                <strong>Name:</strong> {riderName}
              </p>
              <p>
                <strong>Today's Deliveries:</strong> {todayDeliveries}
              </p>
              <p>
                <strong>Pending Deliveries:</strong> {pendingDeliveries}
              </p>
              <p>
                <strong>Total Earnings:</strong> ₹{totalEarnings.toLocaleString("en-IN")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Availability Toggle */}
        <Card className="bg-white border-rose-300 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-6 h-6 text-rose-900" />
              <CardTitle className="text-lg font-semibold text-rose-900">Availability</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-rose-700 text-sm">
                Status: <strong>{availability ? "Online" : "Offline"}</strong>
              </p>
              <Switch
                checked={availability}
                onCheckedChange={handleAvailabilityToggle}
                className="data-[state=checked]:bg-rose-500"
                aria-label={`Toggle availability to ${availability ? "Offline" : "Online"}`}
              />
            </div>
          </CardContent>
        </Card>

        {/* Active Orders */}
        <Card className="bg-white border-rose-300 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-6 h-6 text-rose-900" />
              <CardTitle className="text-lg font-semibold text-rose-900">Active Orders</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {activeLoading ? (
              <LoadingSpinner />
            ) : recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order: Order, index: number) => (
                  <motion.div
                    key={order._id || `order-${index}`}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-rose-100/30 rounded-lg p-4 shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="text-rose-500" size={24} />
                      <h3 className="text-lg font-semibold text-rose-900">
                        Order #{order._id ? order._id.slice(-6) : "N/A"}
                      </h3>
                    </div>
                    <div className="text-rose-700 text-sm space-y-1 mt-2">
                      <p>
                        <strong>Restaurant:</strong> {order.restaurantName || "N/A"}
                      </p>
                      <p>
                        {/* <strong>Address:</strong> {order.deliveryAddress} */}
                      </p>
                      <p>
                        <strong>Customer:</strong> {order.customerName || "N/A"} ({order.customerPhone || "N/A"})
                      </p>
                      <p>
                        <strong>Amount:</strong> ₹{order.totalAmount?.toLocaleString("en-IN") || "0"} + ₹
                        {order.deliveryFee || 0} (Fee)
                      </p>
                      <p>
                        <strong>Status:</strong> {order.status || "N/A"}
                      </p>
                      <p>
                        <strong>Created:</strong>{" "}
                        {order.createdAt ? format(new Date(order.createdAt), "dd MMM yyyy, HH:mm") : "N/A"}
                      </p>
                    </div>
                    <Select
                      onValueChange={(value) => handleStatusChange(order._id, value)}
                      defaultValue={order.status}
                      disabled={!order._id || !["assigned", "out-for-delivery"].includes(order.status)}
                      aria-label={`Change status for order ${order._id.slice(-6)}`}
                    >
                      <SelectTrigger className="mt-4 w-full border-rose-300">
                        <SelectValue placeholder="Change Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="out-for-delivery">Out for Delivery</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Bell className="w-10 h-10 text-rose-500 mx-auto mb-2" />
                <p className="text-rose-700 text-sm">No active orders.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order History */}
        <Card className="bg-white border-rose-300 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <History className="w-6 h-6 text-rose-900" />
              <CardTitle className="text-lg font-semibold text-rose-900">Order History</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter} aria-label="Filter by status">
                  <SelectTrigger className="w-full sm:w-1/3 border-rose-300">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="out-for-delivery">Out for Delivery</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  placeholder="From Date"
                  className="w-full sm:w-1/3 border-rose-300"
                  aria-label="Filter by start date"
                />
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  placeholder="To Date"
                  className="w-full sm:w-1/3 border-rose-300"
                  aria-label="Filter by end date"
                />
              </div>
              <Button
                onClick={handleResetFilters}
                variant="outline"
                className="text-rose-700 border-rose-300"
                aria-label="Reset filters"
              >
                Reset Filters
              </Button>
            </div>
            {historyLoading ? (
              <LoadingSpinner />
            ) : historyError ? (
              <div className="text-center py-4">
                <History className="w-10 h-10 text-rose-500 mx-auto mb-2" />
                <p className="text-rose-700 text-sm mb-4">Failed to load order history.</p>
                <Button
                  onClick={() => refetchHistory()}
                  variant="outline"
                  className="text-rose-700 border-rose-300"
                  aria-label="Retry loading order history"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            ) : orderHistory?.data?.orders && orderHistory?.data?.orders?.length > 0 ? (
              <div className="space-y-4">
                {(orderHistory as any).data.orders.map((order: Order, index: number) => (
                  <motion.div
                    key={order._id || `history-${index}`}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-rose-100/30 rounded-lg p-4 shadow-md"
                  >
                    <div className="text-rose-700 text-sm space-y-1">
                      <p>
                        <strong>Order ID:</strong> #{order._id ? order._id.slice(-6) : "N/A"}
                      </p>
                      <p>
                        <strong>Restaurant:</strong> {order.restaurantName || "N/A"} ({order.restaurantAddress || "N/A"})
                      </p>
                      <p>
                        <strong>Customer:</strong> {order.customerName || "N/A"} ({order.customerPhone || "N/A"})
                      </p>
                      <p>
                        <strong>Status:</strong> {order.status || "N/A"}
                      </p>
                      <p>
                        <strong>Completed:</strong>{" "}
                        {order.createdAt ? format(new Date(order.createdAt), "dd MMM yyyy, HH:mm") : "N/A"}
                      </p>
                    </div>
                  </motion.div>
                ))}
                <div className="flex justify-between mt-4">
                  <Button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    variant="outline"
                    className="text-rose-700 border-rose-300"
                    aria-label="Previous page"
                  >
                    Previous
                  </Button>
                  <p className="text-rose-700 text-sm">
                    Page {(orderHistory as any)?.data?.pagination?.page || 1} of{" "}
                    {(orderHistory as any)?.data?.pagination?.totalPages || 1}
                  </p>
                  <Button
                    disabled={page === (orderHistory as any)?.data?.pagination?.totalPages}
                    onClick={() => setPage(page + 1)}
                    variant="outline"
                    className="text-rose-700 border-rose-300"
                    aria-label="Next page"
                  >
                    Next
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <History className="w-10 h-10 text-rose-500 mx-auto mb-2" />
                <p className="text-rose-700 text-sm">No order history yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default RiderSettings;