import React from 'react';
import { useDispatch } from 'react-redux';
import { Minus, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button'; // Adjust path as needed
import { CartItem} from '@/types/types'; // Define your CartItem type
import { decrementQuantity, updateQuantity, removeFromCart } from '@/redux/feature/cartSlice'; // Adjust path as needed

interface CartItemsProps {
  items: CartItem[];
  totalPrice: number;
  formatPrice: (price: number | string | undefined) => string;
  setCheckoutStep: (step: 'cart' | 'address' | 'payment' | 'review') => void;
}

const CartItems: React.FC<CartItemsProps> = ({ items, totalPrice, formatPrice, setCheckoutStep }) => {
  const dispatch = useDispatch();

  const handleDecrement = (id: string) => {
    const item = items.find((item) => item.id === id);
    if (!item) return;
    if (item.quantity === 1) {
      dispatch(removeFromCart(id));
    } else {
      dispatch(decrementQuantity({ id, quantity: 1 }));
    }
  };

  const handleIncrement = (id: string) => {
    dispatch(updateQuantity({ id }));
  };

  return (
    <>
      <div className="mt-4 space-y-4">
        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-500 py-16"
          >
            <p>Your cart is empty</p>
            <a href="/" className="text-blue-500 mt-2 inline-block">
              Continue Shopping
            </a>
          </motion.div>
        ) : (
          items.map((item) => (
            <motion.div
              key={item.id}
              className="flex items-center p-3 border rounded-lg gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {item.image && (
                <div className="relative h-16 w-16 flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="object-cover rounded"
                    style={{ width: '64px', height: '64px' }}
                  />
                </div>
              )}
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <div className="text-left">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      ₹{formatPrice(item.price)} each
                    </p>
                  </div>
                  <p className="font-semibold">
                    ₹{formatPrice(
                      typeof item.price === 'string'
                        ? parseFloat(item.price.replace('₹', ''))
                        : item.price
                    )}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDecrement(item.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="font-medium">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleIncrement(item.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {items.length > 0 && (
        <div className="mt-6 p-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">Total:</span>
            <span className="text-xl font-bold">₹{formatPrice(totalPrice)}</span>
          </div>
          <Button
            className="w-full mt-4 text-white"
            onClick={() => setCheckoutStep('address')}
          >
            Proceed to Checkout
          </Button>
        </div>
      )}
    </>
  );
};

export default CartItems;
