
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  useDeleteMenuItemMutation,
  useDeleteRestaurantMutation,
  useGetRestaurantByIdQuery,
  useUpdateRestaurantMutation
} from "@/redux/services/restaurantApi";
import { RootState } from "@/redux/store";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ChevronDown, ChevronUp, Clock, Edit, Loader2, MapPin, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "sonner";




const RestaurantSetting = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const [isMenuExpanded, setIsMenuExpanded] = useState(true);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [openDeleteRestaurantDialog, setOpenDeleteRestaurantDialog] = useState(false);

  

  const { data, error, isLoading } = useGetRestaurantByIdQuery(user?.OWN_Restaurant, {
    skip: !user?.OWN_Restaurant
  });

  console.log(data?.data?.restaurant?.menu)

  const [deleteMenuItem, { isLoading: isDeleting }] = useDeleteMenuItemMutation();
  const [updateRestaurant, { isLoading: isUpdating }] = useUpdateRestaurantMutation();
  const [deleteRestaurant] = useDeleteRestaurantMutation();

  const handleDeleteMenuItem = (itemId:any) => {
    setItemToDelete(itemId);
    setOpenDeleteDialog(true);
  };

  const confirmDeleteMenuItem = async () => {
    if (!itemToDelete) return;

    try {
      await deleteMenuItem({ restaurantId: user?.OWN_Restaurant, itemId: itemToDelete }).unwrap();
      toast.success("Menu item deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete menu item: " + (err as any)?.data?.message);
    } finally {
      setOpenDeleteDialog(false);
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setOpenDeleteDialog(false);
    setItemToDelete(null);
  };

  const handleDeleteRestaurant = () => {
    setOpenDeleteRestaurantDialog(true);
  };

  const confirmDeleteRestaurant = async () => {
    try {
      if (!user?.OWN_Restaurant) {
        toast.error("Restaurant not found!");
        return;
      }
      await deleteRestaurant(user?.OWN_Restaurant).unwrap();
      toast.success("Restaurant deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete restaurant: " + (err as any)?.data?.message);
    } finally {
      setOpenDeleteRestaurantDialog(false);
    }
  };

  const cancelDeleteRestaurant = () => {
    setOpenDeleteRestaurantDialog(false);
  };

  const handleStatusChange = async (value:any) => {
    if (!data?.data) {
      toast.error("Restaurant data not available!");
      return;
    }

    try {
      const formDataToSend = new FormData();
      const restaurant = data?.data?.restaurant;
      formDataToSend.append("name", restaurant.name);
      formDataToSend.append("location[street]", restaurant.location.street);
      formDataToSend.append("location[city]", restaurant.location.city);
      formDataToSend.append("location[state]", restaurant.location.state);
      formDataToSend.append("location[country]", restaurant.location.country);
      formDataToSend.append("location[pincode]", restaurant.location.pincode);
      formDataToSend.append("location[coordinates][type]", "Point");
      formDataToSend.append("location[coordinates][coordinates][0]", restaurant.location.coordinates.coordinates[0].toString());
      formDataToSend.append("location[coordinates][coordinates][1]", restaurant.location.coordinates.coordinates[1].toString());
      formDataToSend.append("isActive", value.toString());

      await updateRestaurant({ restaurantId: user?.OWN_Restaurant!, data: formDataToSend }).unwrap();
      toast.success("Restaurant status updated successfully!");
    } catch (err) {
      toast.error("Failed to update restaurant status: " + (err as any)?.data?.message);
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center justify-center min-h-screen bg-amber-50"
      >
        <Loader2 className="w-14 h-14 animate-spin text-rose-500" />
        <p className="mt-4 text-rose-900 text-lg font-medium">Loading your restaurant settings...</p>
      </motion.div>
    );
  }

  if (!user?.OWN_Restaurant) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center min-h-screen bg-amber-50"
      >
        <div className="bg-rose-400/30 border border-red-300 p-8 rounded-2xl shadow-lg flex flex-col items-center space-y-4 max-w-md">
          <AlertCircle className="w-12 h-12 text-rose-600" />
          <p className="text-rose-900 text-xl font-semibold">No Restaurant Found</p>
          <p className="text-rose-700 text-center">
            Looks like you haven’t set up your restaurant yet. Let’s get started!
          </p>
          <Link to="/restaurant/dashboard/add-restaurant">
            <Button className="bg-rose-400/30 border border-red-300 text-rose-900 px-6 py-3 rounded-md hover:bg-rose-400/50 transition font-medium shadow-md">
              Create Your Restaurant
            </Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  if (error || !data?.success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center min-h-screen bg-amber-50"
      >
        <div className="bg-rose-400/30 border border-red-300 p-8 rounded-2xl shadow-lg flex flex-col items-center space-y-4 max-w-md">
          <AlertCircle className="w-12 h-12 text-rose-600" />
          <p className="text-rose-900 text-xl font-semibold">Oops! Something Went Wrong</p>
          <p className="text-rose-700 text-center">
            {error ? (error as any).message : data?.message}
          </p>
        </div>
      </motion.div>
    );
  }

  const restaurant = data?.data?.restaurant;
  console.log(restaurant)

  return (
    <div>
      <div className="w-full min-h-screen p-6 bg-amber-50">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-6"
        >
          <h1 className="text-3xl font-bold text-rose-900 flex items-center gap-3">
            <img
              src={restaurant.restaurantImage || "https://images.unsplash.com/photo-1742800073948-fccfaccf46e1?q=80&w=1976&auto=format&fit=crop"}
              alt={restaurant.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            {restaurant?.name}
          </h1>
          <div className="flex items-center gap-4">
            <Link to="/restaurant/dashboard/update-restaurant">
              <Button className="bg-rose-400/30 border border-red-300 text-rose-900 px-6 py-2 rounded-md hover:bg-rose-400/50 transition flex items-center gap-2">
                <Edit className="w-5 h-5" />
                <span>Edit Restaurant</span>
              </Button>
            </Link>
            <Button
              onClick={handleDeleteRestaurant}
              className="bg-rose-400/30 border border-red-300 text-rose-900 px-6 py-2 rounded-md hover:bg-rose-400/50 transition flex items-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              <span>Delete Restaurant</span>
            </Button>
          </div>
        </motion.div>

        {/* Overview Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.2, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-48 rounded-md bg-rose-400/30 border border-red-300 p-6 flex flex-col justify-between"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-6 h-6 text-rose-900" />
              <h3 className="text-lg font-semibold text-rose-900">Location</h3>
            </div>
            <div>
              <p className="text-rose-700">{`${restaurant?.location?.street}, ${restaurant?.location?.city}`}</p>
              <p className="text-sm text-rose-600">{restaurant?.location?.pincode}</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-48 rounded-md bg-green-400/25 border border-green-400 p-6 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-6 h-6 text-green-900" />
                <h3 className="text-lg font-semibold text-green-900">Status</h3>
              </div>
              <Switch
                checked={restaurant?.isActive}
                onCheckedChange={handleStatusChange}
                disabled={isUpdating}
              />
            </div>
            <div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  restaurant?.isActive ? "bg-green-100 text-green-700" : "bg-rose-100 text-rose-700"
                }`}
              >
                {restaurant?.isActive ? "Live" : "Offline"}
              </span>
              <p className="text-sm text-green-700">
                Updated: {new Date(restaurant?.updatedAt).toLocaleTimeString()}
              </p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-48 rounded-md bg-yellow-400/25 border border-yellow-500 p-6 flex flex-col justify-between"
          >
            <div className="flex items-center gap-2">
              <Clock className="w-6 h-6 text-yellow-900" />
              <h3 className="text-lg font-semibold text-yellow-900">Since</h3>
            </div>
            <p className="text-yellow-700">{new Date(restaurant?.createdAt).toLocaleDateString()}</p>
          </motion.div>
        </motion.div>

        {/* Menu Section */}
        <div className="rounded-md bg-white border border-gray-300 p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-between items-center mb-4"
          >
            <h2 className="text-2xl font-bold text-rose-900">Your Menu</h2>
            <div className="flex items-center gap-4">
              <Link to="/restaurant/dashboard/add-menu">
                <Button className="bg-rose-400/30 border border-red-300 text-rose-900 px-4 py-2 rounded-md hover:bg-rose-400/50 transition flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  <span>Add Item</span>
                </Button>
              </Link>
              {isMenuExpanded ? (
                <ChevronUp
                  className="w-6 h-6 text-rose-900 cursor-pointer"
                  onClick={() => setIsMenuExpanded(false)}
                />
              ) : (
                <ChevronDown
                  className="w-6 h-6 text-rose-900 cursor-pointer"
                  onClick={() => setIsMenuExpanded(true)}
                />
              )}
            </div>
          </motion.div>

          <AnimatePresence>
            {isMenuExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {restaurant?.menu?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-rose-400/10">
                          <th className="p-4 font-semibold text-rose-900">Item</th>
                          <th className="p-4 font-semibold text-rose-900">Price</th>
                          <th className="p-4 font-semibold text-rose-900">Description</th>
                          <th className="p-4 font-semibold text-rose-900">Category</th>
                          <th className="p-4 font-semibold text-rose-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data?.data?.restaurant?.menu.map((item:any) => (
                          <motion.tr
                            key={item._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="border-b hover:bg-rose-400/5"
                          >
                            <td className="p-4 text-rose-900 font-medium">{item.itemName}</td>
                            <td className="p-4 text-rose-700">₹{item.price.toFixed(2)}</td>
                            <td className="p-4 text-rose-700 max-w-sm truncate">{item.description || "—"}</td>
                            <td className="p-4 text-rose-700">{item.category || "—"}</td>
                            <td className="p-4 flex gap-3">
                              <Link to={`/restaurant/dashboard/update-menu/${item._id}`}>
                                <Button className="bg-rose-400/30 border border-red-300 text-rose-900 px-4 py-2 rounded-md hover:bg-rose-400/50 transition flex items-center gap-1">
                                  <Edit className="w-4 h-4" />
                                  <span>Edit</span>
                                </Button>
                              </Link>
                              <Button
                                onClick={() => handleDeleteMenuItem(item._id)}
                                disabled={isDeleting}
                                className={`bg-rose-400/30 border border-red-300 text-rose-900 px-4 py-2 rounded-md hover:bg-rose-400/50 transition flex items-center gap-1 ${
                                  isDeleting ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>{isDeleting ? "Deleting..." : "Delete"}</span>
                              </Button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center py-8"
                  >
                    <p className="text-rose-700 text-lg font-medium">Your menu is empty!</p>
                    <Link to="/dashboard/add-menu">
                      <Button className="mt-4 bg-rose-400/30 border border-red-300 text-rose-900 px-6 py-2 rounded-md hover:bg-rose-400/50 transition">
                        Add Your First Item
                      </Button>
                    </Link>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Delete Menu Item Dialog */}
        <AnimatePresence>
          {openDeleteDialog && (
            <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <AlertDialogContent className="bg-amber-50 border border-rose-300">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-rose-900">Delete Menu Item</AlertDialogTitle>
                    <AlertDialogDescription className="text-rose-700">
                      Are you sure you want to delete this menu item? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogAction
                      onClick={confirmDeleteMenuItem}
                      disabled={isDeleting}
                      className="bg-rose-400/30 border border-red-300 text-rose-900 hover:bg-rose-400/50"
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                    <Button
                      variant="outline"
                      onClick={cancelDelete}
                      className="border-rose-300 text-rose-900 hover:bg-rose-400/10"
                    >
                      Cancel
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </motion.div>
            </AlertDialog>
          )}
        </AnimatePresence>

        {/* Delete Restaurant Dialog */}
        <AnimatePresence>
          {openDeleteRestaurantDialog && (
            <AlertDialog open={openDeleteRestaurantDialog} onOpenChange={setOpenDeleteRestaurantDialog}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <AlertDialogContent className="bg-amber-50 border border-rose-300">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-rose-900">Delete Restaurant</AlertDialogTitle>
                    <AlertDialogDescription className="text-rose-700">
                      Are you sure you want to delete this restaurant? This action cannot be undone and
                      will permanently remove all associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogAction
                      onClick={confirmDeleteRestaurant}
                      className="bg-rose-400/30 border border-red-300 text-rose-900 hover:bg-rose-400/50"
                    >
                      Delete Restaurant
                    </AlertDialogAction>
                    <Button
                      variant="outline"
                      onClick={cancelDeleteRestaurant}
                      className="border-rose-300 text-rose-900 hover:bg-rose-400/10"
                    >
                      Cancel
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </motion.div>
            </AlertDialog>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RestaurantSetting;