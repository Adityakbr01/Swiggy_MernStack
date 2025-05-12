
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Utensils, PlusCircle, ImagePlus, Loader2 } from "lucide-react";
import { useAddMenuItemMutation } from "@/redux/services/restaurantApi";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { motion, AnimatePresence } from "framer-motion";

const AddMenuItem = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  interface MenuItemState {
    itemName: string;
    price: string;
    category: string;
    description: string;
    itemImage: File | null;
  }

  const [menuItem, setMenuItem] = useState<MenuItemState>({
    itemName: "",
    price: "",
    category: "",
    description: "",
    itemImage: null,
  });

  const [addMenuItem, { isLoading }] = useAddMenuItemMutation();

  // Handle text input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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
      } else {
        toast.error("Invalid file type. Please upload an image.");
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.OWN_Restaurant) {
      toast.error("Restaurant not found!");
      return;
    }

    const formData = new FormData();
    formData.append("itemName", menuItem.itemName);
    formData.append("price", menuItem.price);
    formData.append("category", menuItem.category);
    formData.append("description", menuItem.description);
    if (menuItem.itemImage) {
      formData.append("itemImage", menuItem.itemImage);
    }

    try {
      await addMenuItem({ restaurantId: user.OWN_Restaurant, data: formData }).unwrap();
      toast.success("Menu item added successfully!");
      setMenuItem({
        itemName: "",
        price: "",
        category: "",
        description: "",
        itemImage: null,
      });
      navigate("/restaurant/dashboard/settings");
    } catch (err:any) {
      const errorMessage =
        err?.message || err?.error || err?.data?.message || "Failed to add menu item. Please try again.";
      toast.error(errorMessage);
    }
  };

  // Auth check
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

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen w-full bg-amber-50 p-4"
      >
        {/* Header */}
        <header className="mb-6 flex items-center justify-center">
          <h1 className="text-3xl font-bold text-rose-900 flex items-center gap-2">
            <Utensils className="w-8 h-8" /> Add Menu Item
          </h1>
        </header>

        {/* Main Card */}
        <Card className="w-full max-w-2xl p-0 mx-auto overflow-hidden rounded-xl shadow-lg border border-red-300 bg-rose-400/30">
          <CardHeader className="bg-rose-400/50 text-rose-900 p-4">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <PlusCircle className="w-6 h-6" /> Menu Item Details
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
                <Label className="text-sm font-medium text-rose-900">Item Image</Label>
                <div className="relative">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
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
                        <ImagePlus className="w-5 h-5" /> Upload Image
                      </span>
                    )}
                  </label>
                </div>
                {menuItem.itemImage && (
                  <div className="mt-2">
                    <img
                      src={URL.createObjectURL(menuItem.itemImage)}
                      alt="Item Image"
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  type="submit"
                  className="w-full bg-rose-400/30 border border-red-300 text-rose-900 hover:bg-rose-400/50 rounded-lg py-3 flex items-center justify-center gap-2 transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <PlusCircle className="w-5 h-5" /> Add Menu Item
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

export default AddMenuItem;
