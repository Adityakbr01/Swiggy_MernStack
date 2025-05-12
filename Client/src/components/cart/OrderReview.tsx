import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { MapPin, CreditCard } from "lucide-react";
import { CartItem, OrderData } from "@/types/types";
// import { CartItem } from "@/app/cart/page";
// import { OrderData } from "@/app/cart/page";

interface OrderReviewProps {
  formData: OrderData;
  items: CartItem[];
  totalPrice: number;
  formatPrice: (price: number | string | undefined) => string;
  handleOrder: () => void;
  setCheckoutStep: (step: "cart" | "address" | "payment" | "review") => void;
}

const OrderReview: React.FC<OrderReviewProps> = ({
  formData,
  items,
  totalPrice,
  formatPrice,
  handleOrder,
  setCheckoutStep,
}) => {
  console.log(formData);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="mt-4 space-y-4"
    >
      <h2 className="text-xl font-semibold">Review Your Order</h2>
      <div className="border rounded-lg p-4">
        <h3 className="font-medium flex items-center">
          <MapPin className="h-5 w-5 mr-2" /> Delivery Address
        </h3>
        <p className="mt-2 text-gray-600">
          {formData.deliveryAddress.address}, {formData.deliveryAddress.street}
          <br />
          {formData.deliveryAddress.city}, {formData.deliveryAddress.state}
          <br />
          {formData.deliveryAddress.pincode}, {formData.deliveryAddress.country}
        </p>
        <p className="mt-2">
          <span className="font-medium">Contact:</span> {formData.contactNumber}
        </p>
      </div>
      <div className="border rounded-lg p-4">
        <h3 className="font-medium flex items-center">
          <CreditCard className="h-5 w-5 mr-2" /> Payment Method
        </h3>
        <p className="mt-2 text-gray-600 capitalize">
          {formData.paymentMethod}
        </p>
        {formData.notes && (
          <p className="mt-2">
            <span className="font-medium">Notes:</span> {formData.notes}
          </p>
        )}
        <p className="mt-2">
          <span className="font-medium">Order Type:</span> {formData.orderType}
        </p>
      </div>
      <div className="border rounded-lg p-4">
        <h3 className="font-medium">Order Summary</h3>
        <div className="mt-2 space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>
                ₹
                {formatPrice(
                  (typeof item.price === "string"
                    ? parseFloat(item.price.replace("₹", ""))
                    : item.price) * item.quantity
                )}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-2 border-t flex justify-between font-medium">
          <span>Total:</span>
          <span>₹{formatPrice(totalPrice)}</span>
        </div>
      </div>
      <div className="flex justify-between mt-6 ">
        <Button variant="outline" onClick={() => setCheckoutStep("payment")}>
          Back
        </Button>
        <Button className="text-white" onClick={handleOrder}>Place Order</Button>
      </div>
    </motion.div>
  );
};

export default OrderReview;
