
import  { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Utensils, Save, ImagePlus, Loader2 } from "lucide-react";
import { useGetMenuItemQuery, useUpdateMenuItemMutation } from "@/redux/services/restaurantApi";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { motion, AnimatePresence } from "framer-motion";

const UpdateMenuItem = () => {
  interface MenuItemState {
    itemName: string;
    price: string;
    category: string;
    description: string;
    itemImage: File | null;
  }

  const navigate = useNavigate();
  const { id } = useParams(); // Get menu item ID from URL params
  const { user } = useSelector((state: RootState) => state.auth);
  const [menuItem, setMenuItem] = useState<MenuItemState>({
    itemName: "",
    price: "",
    category: "",
    description: "",
    itemImage: null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch menu item data
  const { data, isLoading: isFetching, error } = useGetMenuItemQuery(
    { restaurantId: user?.OWN_Restaurant, itemId: id },
    { skip: !user?.OWN_Restaurant || !id }
  );

  // Mutation for updating menu item
  const [updateMenuItem, { isLoading: isUpdating }] = useUpdateMenuItemMutation();

  // Auto-fill form and set image preview when data is fetched
  useEffect(() => {
    if (data?.data) {
      setMenuItem({
        itemName: data.data.itemName || "",
        price: data.data.price ? String(data.data.price) : "",
        category: data.data.category || "",
        description: data.data.description || "",
        itemImage: null,
      });
      setImagePreview(data?.data?.imageUrl || null);
    }
  }, [data]);

  // Handle text input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMenuItem((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        setMenuItem((prev) => ({
          ...prev,
          itemImage: file,
        }));
        setImagePreview(URL.createObjectURL(file));
      } else {
        toast.error("Invalid file type. Please upload an image.");
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.OWN_Restaurant) return;

    const formData = new FormData();
    formData.append("itemName", menuItem.itemName);
    formData.append("price", menuItem.price);
    formData.append("category", menuItem.category);
    formData.append("description", menuItem.description);
    if (menuItem.itemImage) {
      formData.append("itemImage", menuItem.itemImage);
    }

    try {
      await updateMenuItem({
        restaurantId: user.OWN_Restaurant,
        itemId: id,
        data: formData,
      }).unwrap();
      toast.success("Menu item updated successfully");
      navigate("/restaurant/dashboard/settings");
    } catch (error) {
      toast.error("Failed to update menu item");
    }
  };

  // Auth check (replacing ProtectedRoute)
  if (!user || !user.OWN_Restaurant) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex items-center justify-center bg-amber-50"
      >
        <p className="text-rose-900 text-lg">Please log in to access this page.</p>
      </motion.div>
    );
  }

  if (isFetching) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-amber-50"
      >
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
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
        <p className="text-rose-700">Error loading menu item. Please try again.</p>
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
        className="min-h-screen w-full bg-amber-50 p-10 overflow-hidden"
      >
        {/* Header */}
        <header className="mb-6 flex items-center justify-center">
          <h1 className="text-3xl font-bold text-rose-900 flex items-center gap-2">
            <Utensils className="w-8 h-8" /> Update Menu Item
          </h1>
        </header>

        {/* Main Card */}
        <Card className="w-full max-w-2xl p-0 mx-auto rounded-xl overflow-hidden shadow-lg border border-red-300 bg-rose-400/30">
          <CardHeader className="bg-rose-400/50 text-rose-900 p-4">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Save className="w-6 h-6" /> Edit Menu Item Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 bg-amber-50">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-rose-900">Item Name</Label>
                <Input
                  type="text"
                  name="itemName"
                  value={menuItem.itemName}
                  onChange={handleChange}
                  required
                  className="rounded-lg border-red-300 focus:ring-rose-500 focus:border-rose-500 transition-all bg-white"
                  placeholder="e.g., Chicken Biryani"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-rose-900">Price (₹)</Label>
                <Input
                  type="number"
                  name="price"
                  value={menuItem.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="rounded-lg border-red-300 focus:ring-rose-500 focus:border-rose-500 transition-all bg-white"
                  placeholder="e.g., 250.00"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-rose-900">Category</Label>
                <Input
                  type="text"
                  name="category"
                  value={menuItem.category}
                  onChange={handleChange}
                  required
                  className="rounded-lg border-red-300 focus:ring-rose-500 focus:border-rose-500 transition-all bg-white"
                  placeholder="e.g., Main Course"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-rose-900">Description</Label>
                <textarea
                  name="description"
                  value={menuItem.description}
                  onChange={handleChange}
                  required
                  className="w-full h-24 p-3 rounded-lg border border-red-300 focus:ring-rose-500 focus:border-rose-500 transition-all resize-none bg-white"
                  placeholder="e.g., Spicy and flavorful chicken biryani with basmati rice"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-rose-900">Item Image (Optional)</Label>
                <div className="relative">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="itemImage"
                  />
                  <label
                    htmlFor="itemImage"
                    className="flex items-center justify-center w-full h-12 border-2 border-dashed border-red-300 rounded-lg cursor-pointer hover:border-rose-500 transition-all bg-white"
                  >
                    {menuItem.itemImage ? (
                      <span className="text-rose-900">{menuItem.itemImage.name}</span>
                    ) : (
                      <span className="text-rose-700 flex items-center gap-2">
                        <ImagePlus className="w-5 h-5" /> Upload New Image
                      </span>
                    )}
                  </label>
                </div>
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Menu Item Preview"
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              <motion.div
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  type="submit"
                  className="w-full cursor-pointer bg-rose-400/30 border border-red-300 text-rose-900 hover:bg-rose-400/50 rounded-lg py-3 flex items-center justify-center gap-2 transition-all"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" /> Update Menu Item
                    </>
                  )}
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default UpdateMenuItem;