import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface OrderConfirmationProps {
  setOrderPlaced: (value: boolean) => void;
  setCheckoutStep: (step: 'cart' | 'address' | 'payment' | 'review') => void;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ setOrderPlaced, setCheckoutStep }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.2 }}
      className="fixed inset-0 flex items-center justify-center px-4 bg-black bg-opacity-50 z-50"
    >
      <motion.div 
        className="bg-white p-8 rounded-lg max-w-sm w-full text-center"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
      >
        <div className="flex justify-center mb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500 }}
            className="bg-green-500 rounded-full p-3"
          >
            <Check className="h-8 w-8 text-white" />
          </motion.div>
        </div>
        <h2 className="text-2xl font-bold mb-2">Order Placed Successfully!</h2>
        <p className="text-gray-600 mb-4">Your order has been confirmed</p>
        <Button className="text-white" onClick={() => {
          setOrderPlaced(false);
          setCheckoutStep('cart');
        }}>
          Continue Shopping
        </Button>
      </motion.div>
    </motion.div>
  );
}

export default OrderConfirmation;
