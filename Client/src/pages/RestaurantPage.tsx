import  { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Clock, MapPin, Star, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGetMenusQuery, useGetRestaurantByIdQuery } from '../redux/services/restaurantApi';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { MenuSection } from '../components/menuSection';
import { MobileNavbar } from '@/components/Layout/MobileNavbar';

const RestaurantPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [totalAmount, setTotalAmount] = useState(0);

  const { items } = useSelector((state: any) => state.cart);

  useEffect(() => {
    const calculateTotal = () => {
      const total = items?.reduce((acc: number, item: any) => {
        const priceString = item?.price?.toString().replace(/[^\d.]/g, "");
        const price = Number(priceString);
        const quantity = Number(item?.quantity);

        if (isNaN(price) || isNaN(quantity)) return acc;
        return acc + price * quantity;
      }, 0);
      setTotalAmount(total);
    };
    calculateTotal();
  }, [items]);

  const { data: menus } = useGetMenusQuery(id);
  const { data: Restaurant } = useGetRestaurantByIdQuery(id);
  const data = Restaurant;

  if (!menus) {
    return <div>Product not found</div>;
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0">
      <header className="sticky top-0 bg-background z-10 border-b">
        <div className="container flex items-center h-16 px-4">
          <Button variant="ghost" size="icon" className="mr-2">
            <Link to="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="font-semibold">{data?.data?.restaurant?.name}</h1>
        </div>
      </header>

      <main className="flex-1">
        <motion.div
          className="relative h-48 md:h-64 w-full"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <img
            src={data?.data?.restaurant?.restaurantImage}
            alt={data?.data?.restaurant?.name}
            className="object-cover w-full h-full"
          />
        </motion.div>

        <div className="container px-4 py-6">
          <motion.div
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div>
              <h1 className="text-2xl font-bold mb-1">{data?.data?.restaurant?.name}</h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                <p>{data?.data?.restaurant?.location?.coordinates?.coordinates[0]}</p>
                <div className="hidden sm:block h-1 w-1 rounded-full bg-muted-foreground"></div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{data?.data?.restaurant?.location?.coordinates?.coordinates[1]}</span>
                </div>
                <div className="hidden sm:block h-1 w-1 rounded-full bg-muted-foreground"></div>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span>{data?.restaurant?.rating === 0 ? 'New' : data?.data?.restaurant?.rating}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <motion.div
                className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded"
                whileHover={{ scale: 1.05 }}
              >
                <Clock className="h-3 w-3" />
                <span>{data?.data?.restaurant?.deliveryTime} min</span>
              </motion.div>
              {data?.data?.restaurant?.deliveryFee && (
                <motion.div className="px-2 py-1 bg-blue-50 text-blue-700 rounded" whileHover={{ scale: 1.05 }}>
                  ₹{data?.data?.restaurant?.deliveryFee} delivery
                </motion.div>
              )}
            </div>
          </motion.div>

          <Tabs defaultValue="menu">
            <TabsList className="mb-6">
              <TabsTrigger value="menu">Menu</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="info">Info</TabsTrigger>
            </TabsList>
            <TabsContent value="menu">
              <motion.div className="space-y-8 pb-16" variants={container} initial="hidden" animate="show">
                <MenuSection
                  title="Recommended"
                  items={menus?.data?.map((menu:any) => ({
                    id: menu._id.toString(),
                    name: menu.itemName,
                    description: menu.description,
                    price: `₹${menu.price}`,
                    image: menu.imageUrl,
                    isVeg: menu.isVeg,
                    isBestseller: menu.isBestseller,
                  }))}
                />
              </motion.div>
            </TabsContent>
            <TabsContent value="reviews">
              <div className="text-center py-12">
                <p className="text-muted-foreground">Reviews coming soon</p>
              </div>
            </TabsContent>
            <TabsContent value="info">
              <div className="text-center py-12">
                <p className="text-muted-foreground">Restaurant information coming soon</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <motion.div
        className="fixed bottom-16 md:bottom-0 left-0 right-0 p-4 bg-background border-t"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.5 }}
      >
        <Button onClick={() => navigate('/cart')} className="w-full">
          View Cart • ₹{totalAmount}
        </Button>
      </motion.div>

      <MobileNavbar />
    </div>
  );
};

export default RestaurantPage;
