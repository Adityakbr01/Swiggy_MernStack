import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { logout } from "@/redux/feature/authSlice";
import { useLogoutMutation, useUpdateProfileMutation } from "@/redux/services/authApi";
import { RootState } from "@/redux/store";
import { ROUTES } from "@/utils/routesConfig";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, Edit2, Loader2, Mail, Phone, Power, Save, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  bio: z.string().max(200, "Bio must be less than 200 characters").optional(),
  profileImage: z.any().optional(),
});

// Simple ProtectedRoute wrapper for React
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useSelector((state: RootState) => state.auth);

  

  return user ? <>{children}</> : null;
};

const ProfilePage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // RTK Query hooks
  const [updateProfile] = useUpdateProfileMutation();
  const [logoutMutation] = useLogoutMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone_number || "",
      profileImage: user?.profileImage || "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        phone: user.phone_number,
      });

      // Update image preview if user has a profile image
      if (user.profileImage) {
        setImagePreview(user.profileImage);
      }
    }
  }, [user, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      // Create form data for API call
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("phone_number", values.phone);

      // If there's a new image preview and it's a data URL, convert it to a file
      if (imagePreview && imagePreview.startsWith("data:")) {
        const response = await fetch(imagePreview);
        const blob = await response.blob();
        const file = new File([blob], "profile-image.jpg", { type: "image/jpeg" });
        formData.append("profileImage", file);
      }

      const result = await updateProfile(formData).unwrap();

      if (result) {
        toast.success("Profile updated successfully!");
        setIsEditing(false);
      }
    } catch (error: any) {
      console.error("Update profile error:", error);
      toast.error(
        error?.data?.message ||
        "Failed to update profile. Please check your information and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        phone: user.phone_number,
      });
    }
    setIsEditing(false);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
      dispatch(logout());
      localStorage.removeItem("Food-App-user");
      toast.success("Logged out successfully");
      navigate(ROUTES.LOGIN);
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout. Please try again.");
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col pb-16 md:pb-0">
        <header className="sticky top-0 bg-background z-10 border-b">
          <div className="container flex items-center h-16 px-4">
            <Button variant="ghost" size="icon" className="mr-2">
              <Link to="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="font-semibold">Your Profile</h1>
            {!isEditing && (
              <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-5 w-5" />
              </Button>
            )}
          </div>
        </header>

        <main className="flex-1 container px-4 py-6">
          <div className="max-w-3xl mx-auto">
            {isEditing ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Edit Profile</CardTitle>
                    <CardDescription>
                      Make changes to your profile information here. Click save when you're done.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="flex flex-col items-center mb-6">
                          <div className="relative">
                            <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-background shadow-md">
                              <img
                                src={imagePreview || "/placeholder.svg"}
                                alt="Profile"
                                className="object-cover w-full h-full"
                              />
                            </div>
                            <label
                              htmlFor="profileImageInput"
                              className="absolute bottom-0 right-0 bg-rose-500 text-white p-1.5 rounded-full cursor-pointer shadow-md hover:bg-rose-600 transition-colors"
                            >
                              <Camera className="h-4 w-4" />
                              <span className="sr-only">Change profile picture</span>
                            </label>
                            <input
                              id="profileImageInput"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageChange}
                            />
                          </div>
                          <CardDescription className="mt-2 text-center">
                            Click the camera icon to upload a new profile picture
                          </CardDescription>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={handleCancel}>
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                    <Button onClick={form.handleSubmit(onSubmit)} disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save changes
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col items-center mb-8">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="relative"
                  >
                    <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Profile"
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </motion.div>
                  <h2 className="text-2xl font-bold mt-4">{user?.name}</h2>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Your personal information and preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Name</p>
                        <p className="text-sm text-muted-foreground">{user?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <p className="text-sm text-muted-foreground">{user?.phone_number}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-2">
                    <Button variant="outline" className="w-full cursor-pointer" onClick={() => setIsEditing(true)}>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full text-red-500 hover:text-red-500 cursor-pointer"
                      onClick={handleLogout}
                    >
                      <Power className="mr-2 h-4 w-4" color="red" />
                      Logout
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default ProfilePage;