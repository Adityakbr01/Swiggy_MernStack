import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, MapPin, Phone, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MobileNavbar } from "@/components/Layout/MobileNavbar";
import { useGetOrderByIdQuery } from "@/redux/services/orderApi";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import socket from "@/Socket/socket";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { toast } from "sonner";

// Interfaces
interface OrderItem {
  itemName?: string;
  name?: string;
  itemId: string;
  price: number;
  quantity: number;
  restaurantId?: string;
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

interface Restaurant {
  _id: string;
  name: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
}

interface Order {
  _id: string;
  userId: User;
  restaurantId: Restaurant[];
  items: OrderItem[];
  totalAmount: number;
  deliveryAddress: DeliveryAddress;
  status: string;
  riderId?: User | null;
  paymentStatus: string;
  contactNumber?: string;
  createdAt: string;
  updatedAt: string;
}

// interface OrderResponse {
//   success: boolean;
//   message: string;
//   data: Order;
// }

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function TrackOrderPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useGetOrderByIdQuery(id!);
  console.log("Data:", data);
  const order: Order | undefined = data;
  const [orderStatus, setOrderStatus] = useState("pending");

  // Sync status with order data
  useEffect(() => {
    if (order?.status) {
      setOrderStatus(order.status);
    }
  }, [order]);

  // WebSocket for real-time status updates
  useEffect(() => {
    if (user?.id) {
      socket.emit("joinRoom", { userId: user.id });
    }

    const handleOrderStatusUpdated = (payload: { orderId: string; status: string }) => {
      console.log(`Received status update:`, payload);
      if (payload.orderId === id) {
        setOrderStatus(payload.status);
        toast.success(`Your order is now ${payload.status}`);
      }
    };

    // List of all possible status events from backend
    const statusEvents = [
      "orderPending",
      "orderAccepted",
      "orderPreparing",
      "orderAssigned",
      "orderOutForDelivery",
      "orderDelivered",
      "orderCancelled",
    ];

    // Add listeners for all status events
    statusEvents.forEach((event) => {
      socket.on(event, handleOrderStatusUpdated);
    });

    // Cleanup listeners on unmount
    return () => {
      statusEvents.forEach((event) => {
        socket.off(event, handleOrderStatusUpdated);
      });
    };
  }, [user, id]);

  // Timeline steps for tracker
  const getTimelineSteps = (status: string) => {
    const statusOrder = [
      { key: "pending", name: "Pending" },
      { key: "accepted", name: "Accepted" },
      { key: "preparing", name: "Preparing" },
      { key: "assigned", name: "Assigned" },
      { key: "out-for-delivery", name: "Out for Delivery" },
      { key: "delivered", name: "Delivered" },
    ];
    const isCancelled = status === "cancelled";
    const currentIndex = isCancelled ? -1 : statusOrder.findIndex((s) => s.key === status);

    const steps = statusOrder.map((step, index) => ({
      key: step.key,
      name: step.name,
      time: index <= currentIndex ? (index === 0 ? order?.createdAt : order?.updatedAt) : null,
      completed: index <= currentIndex,
    }));

    if (isCancelled) {
      steps.push({
        key: "cancelled",
        name: "Cancelled",
        time: order?.updatedAt,
        completed: true,
      });
    }

    return steps;
  };

  // Format delivery address
  const formatAddress = (address?: DeliveryAddress) => {
    if (!address) return "N/A";
    return `${address.street}, ${address.city}, ${address.state}, ${address.country}, ${address.pincode}`;
  };

  // Estimate delivery time (30 minutes from createdAt)
  const estimateDelivery = (createdAt?: string) => {
    if (!createdAt) return "N/A";
    const date = new Date(createdAt);
    date.setMinutes(date.getMinutes() + 30);
    return format(date, "h:mm a");
  };

  // Calculate item total
  const getItemTotal = (items: OrderItem[]) => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  console.log("Order:", order);

  if (error || !order) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">Error loading order or order not found.</p>
      </div>
    );
  }

  const items = order.items.length > 0 ? order.items : [];
  const itemTotal = getItemTotal(items);
  const fees = 30 + 20;
  const gst = order.totalAmount - itemTotal - fees;

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0">
      <header className="sticky top-0 bg-white z-10 border-b">
        <div className="container flex items-center h-16 px-4">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link to="/orders">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="font-semibold">Track Order</h1>
        </div>
      </header>

      <main className="flex-1 container px-4 py-6">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <motion.div
              className="bg-rose-50 p-4 rounded-lg mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="font-semibold">
                    {order.restaurantId[0]?.name || "Restaurant"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Order #{order._id.slice(0, 8)}
                  </p>
                </div>
                <motion.div
                  className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                >
                  <Clock className="h-3 w-3" />
                  <span>
                    {orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}
                  </span>
                </motion.div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm">
                  Estimated delivery: {estimateDelivery(order.createdAt)}
                </p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    disabled={
                      orderStatus === "pending" ||
                      orderStatus === "delivered" ||
                      orderStatus === "cancelled"
                    }
                    variant="secondary"
                    size="sm"
                  >
                    <Phone className="mr-1 h-3 w-3" />
                    Call Restaurant
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Order Tracker</h2>
              <div className="relative">
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-muted-foreground/20"></div>
                <motion.div
                  className="space-y-8"
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  {getTimelineSteps(orderStatus).map((step, index) => (
                    <motion.div
                      key={step.key}
                      className="relative pl-10"
                      variants={item}
                    >
                      <motion.div
                        className={`absolute left-2 w-2 h-2 rounded-full ${
                          step.completed
                            ? step.key === "cancelled"
                              ? "bg-red-500 ring-4 ring-red-50"
                              : "bg-green-500 ring-4 ring-green-50"
                            : "bg-muted-foreground/20 ring-4 ring-muted"
                        }`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          delay: 0.2 * (index + 1),
                          type: "spring",
                          stiffness: 300,
                        }}
                      />
                      <h3
                        className={`font-medium ${
                          step.completed
                            ? step.key === "cancelled"
                              ? "text-red-500"
                              : ""
                            : "text-muted-foreground"
                        }`}
                      >
                        {step.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {step.time
                          ? format(new Date(step.time), "h:mm a")
                          : "Pending"}
                      </p>
                      {step.key === "out-for-delivery" &&
                        step.completed &&
                        order.riderId && (
                          <motion.div
                            className="mt-2 flex items-center gap-2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 * (index + 1) }}
                          >
                            <div className="h-10 w-10 rounded-full bg-muted overflow-hidden">
                              <img
                                src={
                                  order.riderId.profileImage ||
                                  "/placeholder-rider.jpg"
                                }
                                alt="Delivery Partner"
                                width={40}
                                height={40}
                                onError={(e) =>
                                  (e.currentTarget.src = "/placeholder-rider.jpg")
                                }
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {order.riderId.name || "Delivery Partner"}
                              </p>
                              <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0 text-xs"
                              >
                                Contact
                              </Button>
                            </div>
                          </motion.div>
                        )}
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>

            <motion.div
              className="bg-rose-50 p-4 rounded-lg mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <h3 className="font-medium mb-2">Delivery Address</h3>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-sm">{formatAddress(order.deliveryAddress)}</p>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="md:w-80"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-4">
              {items.map((item) => (
                <motion.div
                  key={item._id}
                  className="flex gap-3"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-5 text-center">{item.quantity}×</div>
                  <div className="flex-1">
                    <p className="font-medium">
                      {item.itemName || item.name || "Item"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ₹{item.price}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Item Total</span>
                <span>₹{itemTotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>₹30</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Fee</span>
                <span>₹20</span>
              </div>
              <div className="flex justify-between">
                <span>GST</span>
                <span>₹{gst >= 0 ? gst.toFixed(1) : "0.0"}</span>
              </div>
            </div>
            <Separator className="my-4" />
            <motion.div
              className="flex justify-between font-medium"
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ repeat: 3, duration: 0.8, delay: 1.5 }}
            >
              <span>Total</span>
              <span>₹{order.totalAmount}</span>
            </motion.div>
            <div className="mt-4 text-sm">
              <p className="font-medium">Payment Method</p>
              <p className="text-muted-foreground">
                {order.paymentStatus === "paid" ? "Paid Online" : "Pending"}
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <MobileNavbar />
    </div>
  );
}