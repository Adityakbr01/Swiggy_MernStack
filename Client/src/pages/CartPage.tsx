

import AddressForm from "@/components/cart/AddressForm";
import CartItems from "@/components/cart/CartItems";
import OrderConfirmation from "@/components/cart/OrderConfirmation";
import OrderReview from "@/components/cart/OrderReview";
import PaymentForm from "@/components/cart/PaymentForm";
import { Button } from "@/components/ui/button";
import { clearCart } from "@/redux/feature/cartSlice";
import { useCreateOrderMutation } from "@/redux/services/orderApi";
import { useCreatePaymentMutation, useVerifyPaymentMutation } from "@/redux/services/paymentApi";
import { loadRazorpayScript } from "@/utils/loadRazorpay";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import React, { useState } from "react";
import Confetti from 'react-dom-confetti';
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "sonner";

// Define interfaces (same as original)
interface CartItem {
  id: string;
  name: string;
  price: number | string;
  quantity: number;
  image?: string;
  restaurantId: string;
}

interface DeliveryAddress {
  street: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  pincode: string;
  country: string;
  coordinates: {
    type: string;
    coordinates: [number, number];
  };
}

interface OrderData {
  deliveryAddress: DeliveryAddress;
  items: {
    itemId: string;
    quantity: number;
    price: number;
    restaurantId: string;
  }[];
  paymentMethod: string;
  notes: string;
  orderType: string;
  contactNumber: string;
}

interface RootState {
  cart: {
    items: CartItem[];
  };
  auth: {
    user?: {
      address: DeliveryAddress[];
      phone_number: string;
    };
  };
}

export default function CartPage() {
  const { items } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'address' | 'payment' | 'review'>('cart');
  const [createOrder] = useCreateOrderMutation();
  const [createPayment] = useCreatePaymentMutation();
  const [verifyPayment] = useVerifyPaymentMutation();

  const initialUser = user || { address: [], phone_number: '' };
  const initialAddress = initialUser.address?.[0] || {
    street: '',
    city: '',
    state: '',
    zip: '',
    pincode: '',
    country: 'India',
    coordinates: { type: 'Point', coordinates: [0, 0] }
  };


  console.log("initialAddress:", initialAddress);

  const [formData, setFormData] = useState<OrderData>({
    deliveryAddress: {
      street: initialAddress.street || '',
      address: initialAddress.street || '',
      city: initialAddress.city || '',
      state: initialAddress.state || '',
      zip: initialAddress.zip || '',
      pincode: initialAddress.pincode || '',
      country: initialAddress.country || 'India',
      coordinates: {
        type: 'Point',
        coordinates: initialAddress.coordinates?.coordinates || [0, 0]
      }
    },
    items: [],
    paymentMethod: 'razorpay',
    notes: '',
    orderType: 'delivery',
    contactNumber: initialUser.phone_number || '' 
  });

  if (!user && items.length === 0) {
    return <div>Loading...</div>;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('deliveryAddress.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        deliveryAddress: {
          ...prev.deliveryAddress,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const totalPrice = items.reduce((total: number, item: CartItem) => {
    const price = typeof item.price === "string" ? parseFloat(item.price.replace("₹", "")) : item.price;
    return total + (price * item.quantity);
  }, 0);

  const handleOrder = async () => {
    try {
      const orderData: OrderData = {
        ...formData,
        items: items.map((item: CartItem) => ({
          restaurantId: item.restaurantId,
          itemId: item.id,
          quantity: item.quantity,
          price: typeof item.price === "string"
            ? parseFloat(item.price.replace("₹", ""))
            : item.price
        }))
      };

      const { data: ordersData } = await createOrder(orderData).unwrap();
      const orderId = Array.isArray(ordersData) ? ordersData[0]?._id : ordersData?._id;
      if (!orderId) {
        toast.error("Order ID not found");
        return;
      }

      if (formData.paymentMethod !== 'cod') {
        const { data: paymentData } = await createPayment({
          orderId,
          method: formData.paymentMethod
        }).unwrap();

        const sdkLoaded = await loadRazorpayScript();
        if (!sdkLoaded) {
          toast.error("Razorpay SDK load failed");
          return;
        }

        const options = {
          key: paymentData.key,
          amount: paymentData.amount,
          currency: "INR",
          name: "Food App",
          order_id: paymentData.razorpayOrderId,
          handler: async function (response: any) {
            const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;
            try {
                await verifyPayment({
                orderId,
                razorpayPaymentId: razorpay_payment_id,
                razorpayOrderId: razorpay_order_id,
                razorpaySignature: razorpay_signature
              }).unwrap();
              toast.success("Payment Successful ✅");
              setTimeout(() => {
                setIsAnimating(false);
              }, 500);
              setOrderPlaced(true);
              setCheckoutStep('review');
              dispatch(clearCart());
            } catch (err) {
              toast.error("Payment verification failed ❌");
            }
          },
          prefill: {
            name: "Aditya",
            email: "aditya@gmail.com",
            contact: formData.contactNumber,
          },
          theme: {
            color: "#3399cc",
          },
        };

        const razorpayInstance = new (window as any).Razorpay(options);
        razorpayInstance.open();
        setCheckoutStep('payment');
        setIsAnimating(true);
        
      
      } else {
        toast.success("Order placed successfully (Cash on Delivery)");
      }
    } catch (error) {
      console.error("Order failed:", error);
      toast.error("Order placement failed 😔");
    }
  };

  const formatPrice = (price: number | string | undefined): string => {
    if (price === undefined) return "0.00";
    const numPrice = typeof price === "string" ? parseFloat(price.replace("₹", "")) : price;
    return numPrice.toFixed(2);
  };

  const confettiConfig = {
    angle: 90,
    spread: 180,
    startVelocity: 45,
    elementCount: 70,
    dragFriction: 0.1,
    duration: 3000,
    stagger: 3,
    width: "10px",
    height: "10px",
    colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"]
  };

  const renderStep = () => {
    switch (checkoutStep) {
      case 'cart':
        return <CartItems items={items} totalPrice={totalPrice} formatPrice={formatPrice} setCheckoutStep={setCheckoutStep} />;
      case 'address':
        return <AddressForm formData={formData} handleInputChange={handleInputChange} setCheckoutStep={setCheckoutStep} />;
      case 'payment':
        return <PaymentForm formData={formData} handleInputChange={handleInputChange} totalPrice={totalPrice} formatPrice={formatPrice} setCheckoutStep={setCheckoutStep} />;
      case 'review':
        return <OrderReview formData={formData} items={items} totalPrice={totalPrice} formatPrice={formatPrice} handleOrder={handleOrder} setCheckoutStep={setCheckoutStep} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="p-2 min-h-screen text-center pb-16 mb-16 relative overflow-hidden"
    >
      <header className="sticky top-0 bg-background z-10 border-b">
        <div className="container flex items-center px-1">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link to="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="font-semibold text-xl">
            {checkoutStep === 'cart' ? 'Cart' : 
             checkoutStep === 'address' ? 'Delivery Address' :
             checkoutStep === 'payment' ? 'Payment' : 'Review Order'}
          </h1>
        </div>
      </header>

      <AnimatePresence>
        {orderPlaced && (
          <OrderConfirmation setOrderPlaced={setOrderPlaced} setCheckoutStep={setCheckoutStep} />
        )}
      </AnimatePresence>

      {renderStep()}

      {isAnimating && (
        <>
          <motion.div 
            className="fixed top-0 left-0 right-0 h-1 bg-green-500 z-40"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.5 }}
          />
          <motion.div 
            className="fixed inset-0 bg-white opacity-30 z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            <Confetti active={isAnimating} config={confettiConfig} />
          </div>
        </>
      )}
    </motion.div>
  );
}