
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetAllOrdersQuery, useUpdateOrderStatusMutation } from "@/redux/services/orderApi";
import { RootState } from "@/redux/store";
import socket from "@/Socket/socket";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Loader2, Search, Utensils } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

// TypeScript interfaces
interface OrderItem {
  itemName?: string;
  itemId: string;
  price: number;
  quantity: number;
  _id?: string;
}

interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  coordinates: {
    type: string;
    coordinates: [number, number];
  };
}

interface Order {
  _id: string;
  userId: string;
  restaurantId: string[];
  items: OrderItem[];
  totalAmount: number;
  deliveryAddress: DeliveryAddress;
  status: string;
  riderId?: string | null;
  paymentStatus: string;
  contactNumber?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrdersResponse {
  success: boolean;
  message: string;
  data: Order[];
}

interface User {
  id: string;
  role: string;
  OWN_Restaurant?: string;
}

interface SocketPayload {
  orderId: string;
  status: string;
}

const statusOptions: string[] = ["pending", "accepted", "preparing", "cancelled"];

const RestaurantOrders = () => {
  const { user } = useSelector((state: RootState) => state.auth) as { user: User | null };
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortBy, setSortBy] = useState<"createdAt" | "totalAmount">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);
  const ordersPerPage: number = 10;

  const { data, error, isLoading } = useGetAllOrdersQuery(undefined) as {
    data: OrdersResponse | undefined;
    error: any;
    isLoading: boolean;
  };
  const [updateOrderStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

  // Filter and sort orders
  useEffect(() => {
    if (data?.data) {
      let orders: Order[] = [...data.data];
      // Filter by search term
      if (searchTerm) {
        orders = orders.filter(
          (order) =>
            order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.status.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      // Sort orders
      orders.sort((a: Order, b: Order) => {
        const isAsc = sortOrder === "asc";
        if (sortBy === "createdAt") {
          return isAsc
            ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else if (sortBy === "totalAmount") {
          return isAsc ? a.totalAmount - b.totalAmount : b.totalAmount - a.totalAmount;
        }
        return 0;
      });
      setFilteredOrders(orders);
    }
  }, [data, searchTerm, sortBy, sortOrder]);

  // Socket.io for real-time updates
  useEffect(() => {
    if (user?.id) {
      socket.emit("joinRoom", { restaurantId: user.id });
      console.log("User joined room:", user.id);
    }

    const handleOrderStatusUpdated = (payload: SocketPayload) => {
      setFilteredOrders((prev: Order[]) =>
        prev.map((order) =>
          order._id === payload.orderId ? { ...order, status: payload.status } : order
        )
      );
      toast.success(`Order ${payload.orderId.slice(0, 8)} is now ${payload.status}`);
    };

    socket.on("orderStatusUpdated", handleOrderStatusUpdated);

    return () => {
      socket.off("orderStatusUpdated", handleOrderStatusUpdated);
    };
  }, [user]);

  // Handle status change
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (user?.role === "restaurant" && !statusOptions.includes(newStatus)) {
      toast.error("Invalid status for restaurant role");
      return;
    }

    const updatedOrders = filteredOrders.map((order: Order) =>
      order._id === orderId ? { ...order, status: newStatus } : order
    );
    setFilteredOrders(updatedOrders);

    try {
      await updateOrderStatus({ id: orderId, status: newStatus }).unwrap();
      toast.success("Order status updated successfully");
    } catch (err) {
      toast.error("Failed to update order status");
      setFilteredOrders(filteredOrders); // Revert on error
    }
  };

  // Handle sort change
  const handleSortChange = (field: "createdAt" | "totalAmount") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  // Pagination
  const totalOrders: number = filteredOrders.length;
  const totalPages: number = Math.ceil(totalOrders / ordersPerPage);
  const paginatedOrders: Order[] = filteredOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

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

  if (error || !data?.success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex items-center justify-center bg-amber-50"
      >
        <p className="text-rose-700 text-lg font-semibold">
          Error loading orders: {data?.message || "Unknown error"}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen w-full bg-amber-50 p-6"
    >
      {/* Header */}
      <header className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-4xl font-bold text-rose-900 flex items-center gap-3">
          <Utensils className="w-10 h-10" /> Orders Dashboard
        </h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-rose-500" />
            <Input
              type="text"
              placeholder="Search by order ID or status..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-lg border-red-300 focus:ring-rose-500 focus:border-rose-500 bg-white text-rose-900"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <Card className="w-full rounded-xl pt-0 overflow-hidden shadow-lg border border-red-300 bg-gradient-to-br from-rose-400/30 to-rose-500/30">
        <CardHeader className="bg-rose-400/50 text-rose-900 p-6">
          <CardTitle className="text-2xl font-semibold">Your Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {filteredOrders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Utensils className="w-16 h-16 text-rose-500 mx-auto mb-4" />
              <p className="text-rose-700 text-lg font-medium">No orders found.</p>
              <p className="text-rose-600">Orders will appear here once customers place them.</p>
            </motion.div>
          ) : (
            <>
              {/* Sorting Controls */}
              <div className="flex items-center gap-4 mb-6">
                <Button
                  variant="outline"
                  onClick={() => handleSortChange("createdAt")}
                  className="border-rose-500 text-rose-500 hover:bg-rose-500/10"
                >
                  Sort by Date {sortBy === "createdAt" && (sortOrder === "asc" ? "↑" : "↓")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSortChange("totalAmount")}
                  className="border-rose-500 text-rose-500 hover:bg-rose-500/10"
                >
                  Sort by Total {sortBy === "totalAmount" && (sortOrder === "asc" ? "↑" : "↓")}
                </Button>
              </div>

              {/* Orders Grid */}
              <div className="space-y-4">
                {paginatedOrders.map((order: Order, index: number) => (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white rounded-lg shadow-md border border-red-300"
                  >
                    <Collapsible
                      open={openOrderId === order._id}
                      onOpenChange={() =>
                        setOpenOrderId(openOrderId === order._id ? null : order._id)
                      }
                    >
                      <CollapsibleTrigger className="w-full p-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <span className="text-lg font-semibold text-rose-900">
                            Order #{order._id.slice(-6)}
                          </span>
                          <Badge
                            className={
                              order.status === "pending"
                                ? "bg-yellow-400"
                                : order.status === "accepted" || order.status === "preparing"
                                ? "bg-green-400"
                                : "bg-red-400"
                            }
                            variant="secondary"
                          >
                            {order.status}
                          </Badge>
                        </div>
                        {openOrderId === order._id ? (
                          <ChevronUp className="w-5 h-5 text-rose-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-rose-500" />
                        )}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-4 border-t border-red-300">
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-rose-900">Items</h4>
                            {order.items.map((item: OrderItem) => (
                              <p key={item._id} className="text-rose-700">
                                {item.itemName || "Unknown Item"} (x{item.quantity}) - ₹{item.price}
                              </p>
                            ))}
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-rose-900">Total</h4>
                            <p className="text-rose-800 font-medium">₹{order.totalAmount}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-rose-900">Payment Status</h4>
                            <Badge
                              className={order.paymentStatus === "paid" ? "bg-green-400" : "bg-red-400"}
                              variant="secondary"
                            >
                              {order.paymentStatus}
                            </Badge>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-rose-900">Delivery Address</h4>
                            <p className="text-rose-700">
                              {order.deliveryAddress.street}, {order.deliveryAddress.city},{" "}
                              {order.deliveryAddress.state}, {order.deliveryAddress.country},{" "}
                              {order.deliveryAddress.pincode}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-rose-900">Contact</h4>
                            <p className="text-rose-700">{order.contactNumber || "N/A"}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-rose-900">Created At</h4>
                            <p className="text-rose-700">
                              {format(new Date(order.createdAt), "PPP HH:mm")}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-rose-900">Update Status</h4>
                            <Select
                              onValueChange={(value: string) => handleStatusChange(order._id, value)}
                              defaultValue={order.status}
                              disabled={isUpdating}
                            >
                              <SelectTrigger className="w-[180px] border-red-300 focus:ring-rose-500">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent className="bg-amber-50 border-red-300">
                                {statusOptions.map((status: string) => (
                                  <SelectItem key={status} value={status} className="text-rose-900">
                                    {status}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6">
                  <Button
                    onClick={() => setCurrentPage((prev: number) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="bg-rose-500/80 text-white hover:bg-rose-600/80"
                  >
                    Previous
                  </Button>
                  <span className="text-rose-900">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    onClick={() => setCurrentPage((prev: number) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="bg-rose-500/80 text-white hover:bg-rose-600/80"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RestaurantOrders;
