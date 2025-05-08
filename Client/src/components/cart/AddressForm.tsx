import { Button } from '@/components/ui/button'; // Adjust path as needed
import { OrderData } from '@/pages/CartPage';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';


interface AddressFormProps {
    formData: OrderData;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    setCheckoutStep: (step: 'cart' | 'address' | 'payment' | 'review') => void;
  }

// Define the shape of your form data if using TypeScript. Otherwise skip this in JS.
const AddressForm = ({ formData, handleInputChange, setCheckoutStep }:AddressFormProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="mt-4 space-y-4"
    >
      <h2 className="text-xl font-semibold flex items-center">
        <MapPin className="h-5 w-5 mr-2" /> Delivery Address
      </h2>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
          <input
            type="text"
            name="deliveryAddress.street"
            value={formData.deliveryAddress.street}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            placeholder="MG Road"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input
            type="text"
            name="deliveryAddress.address"
            value={formData.deliveryAddress.address}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            placeholder="123, MG Road"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              name="deliveryAddress.city"
              value={formData.deliveryAddress.city}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              placeholder="Mumbai"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input
              type="text"
              name="deliveryAddress.state"
              value={formData.deliveryAddress.state}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              placeholder="Maharashtra"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
            <input
              type="text"
              name="deliveryAddress.pincode"
              value={formData.deliveryAddress.pincode}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              placeholder="400001"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input
              type="text"
              name="deliveryAddress.country"
              value={formData.deliveryAddress.country}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              placeholder="India"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
          <input
            type="tel"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            placeholder="+919876543210"
            required
          />
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => setCheckoutStep('cart')}>
          Back
        </Button>
        <Button onClick={() => setCheckoutStep('payment')}>
          Continue to Payment
        </Button>
      </div>
    </motion.div>
  );
};

export default AddressForm;
