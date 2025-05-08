import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CreditCard, MessageSquare, Truck } from "lucide-react";

interface PaymentFormProps {
  formData: {
    paymentMethod: string;
    notes: string;
    orderType: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  totalPrice: number;
  formatPrice: (price: number | string | undefined) => string;
  setCheckoutStep: (step: 'cart' | 'address' | 'payment' | 'review') => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ formData, handleInputChange, totalPrice, formatPrice, setCheckoutStep }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="mt-4 space-y-4"
    >
      <h2 className="text-xl font-semibold flex items-center">
        <CreditCard className="h-5 w-5 mr-2" /> Payment Method
      </h2>
      <div className="space-y-3">
        <div className="flex items-center space-x-2 p-3 border rounded">
          <input
            type="radio"
            id="razorpay"
            name="paymentMethod"
            value="razorpay"
            checked={formData.paymentMethod === 'razorpay'}
            onChange={handleInputChange}
            className="h-4 w-4"
          />
          <label htmlFor="razorpay" className="flex-1">Razorpay</label>
        </div>
        <div className="flex items-center space-x-2 p-3 border rounded">
          <input
            type="radio"
            id="cod"
            name="paymentMethod"
            value="cod"
            checked={formData.paymentMethod === 'cod'}
            onChange={handleInputChange}
            className="h-4 w-4"
          />
          <label htmlFor="cod" className="flex-1">Cash on Delivery</label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <MessageSquare className="h-4 w-4 mr-1" /> Order Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            placeholder="Extra spicy, please!"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <Truck className="h-4 w-4 mr-1" /> Order Type
          </label>
          <select
            name="orderType"
            value={formData.orderType}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          >
            <option value="delivery">Delivery</option>
            <option value="pickup">Pickup</option>
          </select>
        </div>
      </div>
      <div className="mt-6 p-4 border-t">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-medium">Total:</span>
          <span className="text-xl font-bold">₹{formatPrice(totalPrice)}</span>
        </div>
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setCheckoutStep('address')}>
            Back
          </Button>
          <Button onClick={() => setCheckoutStep('review')}>
            Review Order
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default PaymentForm;
