import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "sonner";

interface CartState {
  items: any[];
}

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<any>) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
    
      if (existingItem) {
        existingItem.quantity += 1;
      } else if (state.items.length > 0 && state.items[0].restaurantId !== action.payload.restaurantId) {
        // ⛔ Don't add the new product from another restaurant
        toast.error("Please order the first added product before adding another.");
      } else {
        // ✅ Add new item if cart is empty or from same restaurant
        state.items.push({ ...action.payload, quantity: 1, restaurantId: action.payload.restaurantId });
      }
    }
    ,
    updateQuantity: (state, action: PayloadAction<{ id: string }>) => {
      const item = state.items.find(item => item.id === action.payload.id);
      if (item) {
        item.quantity = item.quantity + 1;
        
      }
    },
    decrementQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.items.find(item => item.id === action.payload.id);
      if (item) {
        item.quantity -= 1;
      }
    },

    removeFromCart: (state, action: PayloadAction<any>) => {
      state.items = state.items.filter(item => item.id !== action.payload.id);
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addToCart, removeFromCart, clearCart, updateQuantity, decrementQuantity } = cartSlice.actions;
export default cartSlice.reducer;
