import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useAvailableOrdersQuery,
  useUpdateOrderStatusMutation,
} from "@/redux/services/orderApi";
import { RootState } from "@/redux/store";
import socket from "@/Socket/socket"; // Fixed import path
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Bell, CheckCircle, RefreshCw, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

interface Order {
  orderId: string;
  restaurantName: string;
  status: string;
  deliveryAddress: string;
  totalAmount: number;
  createdAt: string;
}

interface User {
  id: string;
  role: string;
}

const AvailableOrders = () => {
  const [liveOrders, setLiveOrders] = useState<Order[]>([]);
  const [updatedOrderId, setUpdatedOrderId] = useState<string | null>(null);
  const {
    data: availableOrders = [],
    isLoading,
    refetch,
  } = useAvailableOrdersQuery(undefined);
  const { user } = useSelector((state: RootState) => state.auth) as {
    user: User | null;
  };
  const [acceptOrder] = useUpdateOrderStatusMutation();

  // Handle accepting an order
  const handleAcceptOrder = async (orderId: string) => {
    try {
      await acceptOrder({ id: orderId, status: "assigned", riderId: user?.id }).unwrap();
      setUpdatedOrderId(orderId);
      toast.success("Order accepted successfully!");
      setTimeout(() => {
        setLiveOrders((prev) => prev.filter((o) => o.orderId !== orderId));
        setUpdatedOrderId(null);
        refetch(); // Refresh API orders
      }, 3000);
    } catch (error: any) {
      
      toast.error(error.data.message ||"Failed to accept order. Try again.");
    }
  };

  // Socket.IO for real-time order updates
  useEffect(() => {
    if (user?.id) {
      socket.emit("joinRider", user.id); // Join rider-specific room
      socket.emit("joinRiders"); // Join global riders room
    }

    const handleOrderUpdate = (data: Order) => {
      console.log(`📦 Order update (${data.status}):`, data);
      setLiveOrders((prev) => {
        // Avoid duplicates
        if (prev.some((o) => o.orderId === data.orderId)) return prev;
        return [
          ...prev,
          {
            orderId: data.orderId,
            restaurantName: data.restaurantName || "Unknown Restaurant",
            status: data.status,
            deliveryAddress: data.deliveryAddress || "N/A",
            totalAmount: data.totalAmount || 0,
            createdAt: data.createdAt || new Date().toISOString(),
          },
        ];
      });
    };

    const handleOrderCancelled = (data: { orderId: string }) => {
      console.log("📪 Order cancelled:", data);
      setLiveOrders((prev) =>
        prev.filter((order) => order.orderId !== data.orderId)
      );
    };

    socket.on("orderAssigned", handleOrderUpdate);
    socket.on("orderAccepted", handleOrderUpdate);
    socket.on("orderPending", handleOrderCancelled);
    socket.on("orderPreparing", handleOrderCancelled);
    socket.on("orderCancelled", handleOrderCancelled);

    return () => {
      socket.off("orderAssigned", handleOrderUpdate);
      socket.off("orderAccepted", handleOrderUpdate);
      socket.off("orderPending", handleOrderCancelled);
      socket.off("orderPreparing", handleOrderCancelled);
      socket.off("orderCancelled", handleOrderCancelled);
    };
  }, [user?.id]);

  // Merge liveOrders and availableOrders, ensuring unique orderId
  const allOrders = [
    ...liveOrders,
    ...availableOrders.filter(
      (apiOrder: Order) =>
        !liveOrders.some((live) => live.orderId === apiOrder.orderId)
    ),
  ];

  if (!user || user.role !== "rider") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-amber-50"
      >
        <p className="text-rose-900 text-lg font-semibold">
          Please log in as a rider.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-amber-50 p-6"
    >
      <Card className="bg-white border-rose-300 shadow-lg max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-6 h-6 text-rose-900" />
              <CardTitle className="text-lg font-semibold text-rose-900">
                Available Orders
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => refetch()}
              title="Refresh Orders"
            >
              <RefreshCw className="w-5 h-5 text-rose-700" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <Bell className="w-10 h-10 text-rose-500 mx-auto" />
              </motion.div>
              <p className="text-rose-700 text-sm mt-2">Loading orders...</p>
            </div>
          ) : allOrders.length > 0 ? (
            <div className="space-y-4">
              {allOrders.map((order, index) => (
                <motion.div
                  key={order.orderId}
                  initial={{ y: 20, opacity: 0, scale: 0.95 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-rose-100/30 rounded-lg p-4 shadow-md relative"
                >
                  {order.status !== "assigned" && (
                    <span className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                      {order.status}
                    </span>
                  )}
                  <div className="flex items-center gap-3">
                    {updatedOrderId === order.orderId ? (
                      <CheckCircle
                        className="text-green-500 animate-ping"
                        size={24}
                      />
                    ) : (
                      <Bell className="text-rose-500 animate-pulse" size={24} />
                    )}
                    <h3 className="text-lg font-semibold text-rose-900">
                      {updatedOrderId === order.orderId
                        ? "Order Accepted!"
                        : "New Order Available"}
                    </h3>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setLiveOrders((prev) =>
                                prev.filter((o) => o.orderId !== order.orderId)
                              )
                            }
                            className="ml-auto"
                          >
                            <XCircle
                              className="text-rose-400 hover:text-rose-600"
                              size={20}
                            />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Dismiss order</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="text-rose-700 text-sm space-y-1 mt-2">
                    <p>
                      <strong>Order ID:</strong> #{order.orderId.slice(-6)}
                    </p>
                    <p>
                      <strong>Restaurant:</strong> {order.restaurantName}
                    </p>
                    <p>
  <strong>Delivery Address:</strong>{" "}
  {`${order.deliveryAddress?.street}, ${order.deliveryAddress?.city}, ${order.deliveryAddress?.state} - ${order.deliveryAddress?.pincode}`}
</p>

                    <p>
                      {/* <strong>Amount:</strong> ₹{order.totalAmount.toLocaleString("en-IN")} */}
                    </p>
                    <p>
                      <strong>Status:</strong> {order.status}
                    </p>
                    <p>
                      <strong>Created:</strong>{" "}
                      {order.createdAt
                        ? format(
                            new Date(order.createdAt),
                            "dd MMM yyyy, HH:mm"
                          )
                        : "N/A"}
                    </p>
                  </div>
                  {updatedOrderId !== order.orderId && (
                    <Button
                      onClick={() => handleAcceptOrder(order?.orderId)}
                      className="mt-4 w-full bg-rose-500 hover:bg-rose-600 text-white"
                      disabled={
                        order.status !== "assigned" &&
                        order.status !== "accepted" &&
                        order.status !== "preparing"
                      }
                    >
                      Accept Order {order.orderId}
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <Bell className="w-10 h-10 text-rose-500 mx-auto mb-2" />
              <p className="text-rose-700 text-sm">
                No orders available yet...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AvailableOrders;
