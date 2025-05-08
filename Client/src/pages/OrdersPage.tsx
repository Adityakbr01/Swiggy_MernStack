import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Package,
  Clock,
  Calendar,
  Truck,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useGetMyOrdersQuery } from "@/redux/services/orderApi";
import socket from "@/Socket/socket"; // adjust relative path
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface Order {
  _id: string;
  status: string;
  createdAt: string;
  items: { _id: string; quantity: number; name: string; price: number }[];
  totalAmount: number;
  deliveryAddress: any;
}

export default function OrdersPages() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const { data: orders, isLoading } = useGetMyOrdersQuery(undefined);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user?.id) {
      socket.emit("joinRoom", { userId: user.id });
    }
  
    const handleOrderStatusUpdated = (payload: { orderId: string; status: string }) => {
      console.log("Received payload:", payload);
      setFilteredOrders((prev) =>
        prev.map((order) =>
          order._id === payload.orderId ? { ...order, status: payload.status } : order
        )
      );
      toast.success(`Order ${payload.orderId.slice(0, 8)} is now ${payload.status}`);
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
  }, [user]);

  useEffect(() => {
    if (!orders) return;
    if (activeTab === "all") {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter((order: Order) => order.status === activeTab));
    }
  }, [activeTab, orders]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Pending</Badge>;
      case "accepted":
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Accepted</Badge>;
      case "preparing":
      case "assigned":
      case "out-for-delivery":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">{status.replace(/-/g, " ")}</Badge>;
      case "delivered":
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Delivered</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processing":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "assigned":
        return <Truck className="h-5 w-5 text-yellow-500" />;
      case "cancelled":
        return <Package className="h-5 w-5 text-red-500" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();
  const formatAddress = (address: any) => address ? `${address.street}, ${address.city}, ${address.state}, ${address.country}` : "N/A";

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-rose-500" /></div>;
  }

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0">
      <header className="sticky top-0 bg-background z-10 border-b">
        <div className="container flex items-center h-16 px-4">
          <Button variant="ghost" size="icon" className="mr-2" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold">Your Orders</h1>
        </div>
      </header>

      <main className="flex-1 container px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="all">All Orders</TabsTrigger>
              <TabsTrigger value="pending">Processing</TabsTrigger>
              <TabsTrigger value="delivered">Delivered</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-4"
                  >
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(order.status)}
                            <CardTitle className="text-lg">
                              #{order._id.slice(0, 8)}
                            </CardTitle>
                          </div>
                          {getStatusBadge(order.status)}
                        </div>
                        <CardDescription className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Ordered on {formatDate(order.createdAt)}</span>
                        </CardDescription>
                      </CardHeader>

                      <CardContent>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item._id} className="flex justify-between text-sm">
                              <span>{item.quantity}x {item.name}</span>
                              <span>₹{item.price}</span>
                            </div>
                          ))}
                          <Separator className="my-2" />
                          <div className="flex justify-between font-semibold">
                            <span>Total</span>
                            <span>₹{order.totalAmount}</span>
                          </div>
                        </div>
                        <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
                          <Truck className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <div>
                            <p>Delivery to: {formatAddress(order.deliveryAddress)}</p>
                          </div>
                        </div>
                      </CardContent>

                      <CardFooter>
                        <Link to={`/orders/${order._id}`} className="w-full">
                          <Button variant="outline" size="sm" className="w-full">
                            View Order Details
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No orders found</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    You don&apos;t have any {activeTab !== "all" ? activeTab : ""} orders yet.
                  </p>
                  <Link to="/">
                    <Button className="mt-4">Browse Menu</Button>
                  </Link>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
