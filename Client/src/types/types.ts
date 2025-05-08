export interface CartItemsProps {
  items: CartItem[];
  totalPrice: number;
  formatPrice: (price: number | string | undefined) => string;
  setCheckoutStep: (step: "cart" | "address" | "payment" | "review") => void;
}

export interface CartItem {
  id: string;
  name: string;
  price: number | string;
  quantity: number;
  image?: string;
  restaurantId: string;
}


export interface DeliveryAddress {
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
  

  
  export interface OrderData {
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



 export    interface RootState {
        cart: {
          items: CartItem[];
        };
        auth: {
          user?: {
            address: DeliveryAddress[];
            phone_number: string;
            role: string;
          };
        };
      }
      