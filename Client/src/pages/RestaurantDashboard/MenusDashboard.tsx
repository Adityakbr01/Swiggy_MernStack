
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDeleteMenuItemMutation, useGetAllMyMenusQuery } from "@/redux/services/restaurantApi";
import { RootState } from "@/redux/store";
import { AnimatePresence, motion } from "framer-motion";
import { Edit, Loader2, PlusCircle, Search, Trash2, Utensils } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const MenusDashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  // Fetch menu items
  const { data, isLoading, error } = useGetAllMyMenusQuery(
    { restaurantId: user?.OWN_Restaurant },
    { skip: !user?.OWN_Restaurant }
  );

  const [deleteMenuItem, { isLoading: isDeleting }] = useDeleteMenuItemMutation();

  // Filter menu items based on search term
  const menuItems = (data?.data || []).filter(
    (item:any) =>
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle delete action
  const handleDelete = async () => {
    if (!user?.OWN_Restaurant || !deleteItemId) return;
    try {
      await deleteMenuItem({ restaurantId: user.OWN_Restaurant, itemId: deleteItemId }).unwrap();
      toast.success("Menu item deleted successfully!");
      setIsAlertOpen(false);
      setDeleteItemId(null);
    } catch (err) {
      toast.error("Failed to delete menu item. Please try again.");
    }
  };

  // Open delete confirmation
  const openDeleteConfirmation = (itemId:any) => {
    setDeleteItemId(itemId);
    setIsAlertOpen(true);
  };

  // Auth check
  if (!user || !user.OWN_Restaurant) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex items-center justify-center bg-amber-50"
      >
        <p className="text-rose-900 text-lg font-semibold">Please log in to access this page.</p>
      </motion.div>
    );
  }

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-amber-50"
      >
        <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex items-center justify-center bg-amber-50"
      >
        <p className="text-rose-700 text-lg font-semibold">Error loading menu items. Please try again.</p>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen w-full bg-amber-50 p-6"
      >
        {/* Header */}
        <header className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h1 className="text-4xl font-bold text-rose-900 flex items-center gap-3">
            <Utensils className="w-10 h-10" /> Menu Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-rose-500" />
              <Input
                type="text"
                placeholder="Search by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-lg border-red-300 focus:ring-rose-500 focus:border-rose-500 bg-white text-rose-900"
              />
            </div>
            <Link to="/restaurant/dashboard/add-menu">
              <Button className="bg-gradient-to-r from-rose-500/80 to-rose-600/80 text-white hover:from-rose-600/80 hover:to-rose-700/80 rounded-lg py-2 flex items-center gap-2 shadow-md">
                <PlusCircle className="w-5 h-5" /> Add Menu Item
              </Button>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <Card className="w-full rounded-xl pt-0 overflow-hidden shadow-lg border border-red-300 bg-gradient-to-br from-rose-400/30 to-rose-500/30">
          <CardHeader className="bg-rose-400/50 text-rose-900 p-6">
            <CardTitle className="text-2xl font-semibold">Your Menu Items</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {menuItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Utensils className="w-16 h-16 text-rose-500 mx-auto mb-4" />
                <p className="text-rose-700 text-lg font-medium">No menu items found.</p>
                <p className="text-rose-600">Add some delicious dishes to get started!</p>
                <Link to="/restaurant/dashboard/add-menu">
                  <Button className="mt-4 bg-rose-500/80 text-white hover:bg-rose-600/80 rounded-lg">
                    Add Your First Menu Item
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {menuItems.map((item: any, index: number) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ scale: 1.01, boxShadow: "0 2px 16px rgba(0, 0, 0, 0.1)" }}
                    className="bg-white rounded-lg shadow-md border border-red-300 overflow-hidden"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.itemName}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-rose-900 capitalize">{item.itemName}</h3>
                      <p className="text-rose-700 text-sm capitalize">{item.category}</p>
                      <p className="text-rose-800 font-medium mt-1">₹{item.price}</p>
                      <p className="text-rose-600 text-sm mt-2 line-clamp-2">{item.description}</p>
                      <div className="flex justify-between mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/restaurant/dashboard/update-menu/${item._id}`)}
                          className="border-rose-500 cursor-pointer text-rose-500 hover:bg-rose-500/10"
                        >
                          <Edit className="w-4 h-4 mr-2" /> Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteConfirmation(item._id)}
                          disabled={isDeleting && deleteItemId === item._id}
                          className="border-rose-500 cursor-pointer text-rose-500 hover:bg-rose-500/10"
                        >
                          {isDeleting && deleteItemId === item._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogContent className="bg-amber-50 border-red-300">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-rose-900">Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription className="text-rose-700">
                Are you sure you want to delete this menu item? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-red-300 text-rose-900 hover:bg-rose-400/20">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-rose-500/80 text-white hover:bg-rose-600/80"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
    </AnimatePresence>
  );
};

export default MenusDashboard;