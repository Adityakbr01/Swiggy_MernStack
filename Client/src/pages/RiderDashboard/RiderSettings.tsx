
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
import { Bell, CheckCircle, History, User } from "lucide-react";
import { useEffect, useState } from "react";
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

// Utility to format deliveryAddress
const formatDeliveryAddress = (address: DeliveryAddress): string => {
  const { street = "N/A", city = "N/A", pincode = "N/A" } = address || {};
  return `${street}, ${city}, ${pincode}`;
};

const RiderSettings = () => {
  const { user } = useSelector((state: RootState) => state.auth) as { user: User | null };
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [updateOrderStatus] = useUpdateOrderStatusMutation();
  const [updateAvailability] = useUpdateAvailabilityMutation();
  const { data: activeOrders = { data: [] }, isLoading: activeLoading } = useAvailableordersQuery(undefined);
  const {
    data: orderHistory,
    isLoading: historyLoading,
    error: historyError,
  } = useGetAllOrdersForRiderQuery({
    page,
    limit: 10,
    status: statusFilter === "all" ? undefined : statusFilter,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });
  const { data, isLoading: summaryLoading, error: summaryError, refetch } = useGetRiderSummaryQuery(undefined);

  // Debug logs
  useEffect(() => {
    console.log("orderHistory:", orderHistory);
    console.log("activeOrders:", activeOrders);
    console.log("statusFilter:", statusFilter);
    console.log("riderSummary:", data);
    if (historyError) {
      console.error("Order history error:", historyError);
      toast.error("Failed to load order history");
    }
    if (summaryError) {
      console.error("Rider summary error:", summaryError);
      toast.error("Failed to load rider summary");
    }
  }, [orderHistory, activeOrders, historyError, statusFilter, data, summaryError]);

  // Socket.IO for real-time order updates
  useEffect(() => {
    if (user?.id) {
      socket.emit("joinRider", user.id);
      socket.emit("joinRiders");
    }

    const handleOrderUpdate = (data: Order) => {
      toast.success(`New order assigned: #${data._id.slice(-6)}`);
    };

    socket.on("orderAssigned", handleOrderUpdate);

    return () => {
      socket.off("orderAssigned", handleOrderUpdate);
    };
  }, [user?.id]);

  // Handle availability toggle
  const handleAvailabilityToggle = async (checked: boolean) => {
    try {
      await updateAvailability({ availability: checked }).unwrap();
      refetch();
      toast.success(`Availability set to ${checked ? "Online" : "Offline"}`);
    } catch (error) {
      toast.error("Failed to update availability");
    }
  };

  // Handle order status update
  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus({ orderId, status }).unwrap();
      toast.success(`Order #${orderId.slice(-6)} status updated to ${status}`);
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  // Handle filter reset
  const handleResetFilters = () => {
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

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

  if (summaryLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-amber-50"
      >
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
          <Bell className="w-10 h-10 text-rose-500" />
        </motion.div>
      </motion.div>
    );
  }

  if (summaryError || !data?.success) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-amber-50"
      >
        <p className="text-rose-700 text-lg font-semibold">Error: {data?.message || "Failed to load rider summary"}</p>
      </motion.div>
    );
  }

  const {
    todayDeliveries = 0,
    pendingDeliveries = 0,
    totalEarnings = 0,
    riderName = user.name,
    availability = false,
    earningsTrend = [],
    recentOrders = [],
  } = data.data || {};

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
              <div className="text-center py-4">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                  <Bell className="w-10 h-10 text-rose-500 mx-auto" />
                </motion.div>
                <p className="text-rose-700 text-sm mt-2">Loading orders...</p>
              </div>
            ) : activeOrders?.data?.length > 0 ? (
              <div className="space-y-4">
                {activeOrders.data.map((order: Order, index: number) => (
                  <motion.div
                    key={order._id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-rose-100/30 rounded-lg p-4 shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="text-rose-500" size={24} />
                      <h3 className="text-lg font-semibold text-rose-900">Order #{order._id.slice(-6)}</h3>
                    </div>
                    <div className="text-rose-700 text-sm space-y-1 mt-2">
                      <p>
                        <strong>Restaurant:</strong> {order.restaurantName}
                      </p>
                      <p>
                        <strong>Address:</strong> {formatDeliveryAddress(order.deliveryAddress)}
                      </p>
                      <p>
                        <strong>Customer:</strong> {order.customerName} ({order.customerPhone})
                      </p>
                      <p>
                        <strong>Amount:</strong> ₹{order.totalAmount.toLocaleString("en-IN")} + ₹
                        {order.deliveryFee} (Fee)
                      </p>
                      <p>
                        <strong>Status:</strong> {order.status}
                      </p>
                      <p>
                        <strong>Created:</strong>{" "}
                        {order.createdAt ? format(new Date(order.createdAt), "dd MMM yyyy, HH:mm") : "N/A"}
                      </p>
                    </div>
                    <Select
                      onValueChange={(value) => handleStatusChange(order._id, value)}
                      defaultValue={order.status}
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
                <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                />
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  placeholder="To Date"
                  className="w-full sm:w-1/3 border-rose-300"
                />
              </div>
              <Button onClick={handleResetFilters} variant="outline" className="text-rose-700 border-rose-300">
                Reset Filters
              </Button>
            </div>
            {historyLoading ? (
              <div className="text-center py-4">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                  <History className="w-10 h-10 text-rose-500 mx-auto" />
                </motion.div>
                <p className="text-rose-700 text-sm mt-2">Loading history...</p>
              </div>
            ) : historyError ? (
              <div className="text-center py-4">
                <History className="w-10 h-10 text-rose-500 mx-auto mb-2" />
                <p className="text-rose-700 text-sm">Failed to load order history.</p>
              </div>
            ) : orderHistory?.data?.orders?.length > 0 ? (
              <div className="space-y-4">
                {orderHistory.data.orders.map((order: Order, index: number) => (
                  <motion.div
                    key={order._id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-rose-100/30 rounded-lg p-4 shadow-md"
                  >
                    <div className="text-rose-700 text-sm space-y-1">
                      <p>
                        <strong>Order ID:</strong> #{order._id.slice(-6)}
                      </p>
                      <p>
                        <strong>Restaurant:</strong> {order.restaurantName} ({order.restaurantAddress})
                      </p>
                      <p>
                        <strong>Customer:</strong> {order.customerName} ({order.customerPhone})
                      </p>
                      <p>
                        <strong>Status:</strong> {order.status}
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
                  >
                    Previous
                  </Button>
                  <p className="text-rose-700 text-sm">
                    Page {orderHistory?.data?.pagination?.page || 1} of{" "}
                    {orderHistory?.data?.pagination?.totalPages || 1}
                  </p>
                  <Button
                    disabled={page === orderHistory?.data?.pagination?.totalPages}
                    onClick={() => setPage(page + 1)}
                    variant="outline"
                    className="text-rose-700 border-rose-300"
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
