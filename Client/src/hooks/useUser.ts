// // src/hooks/useUser.ts
// import { useState, useEffect } from "react";

// interface User {
//   role: "customer" | "rider" | "restaurant" | null;
//   [key: string]: any;
// }

// export const useUser = () => {
//   const [user, setUser] = useState<User | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const userRaw = localStorage.getItem("Food-App-user");
//     try {
//       const parsedUser = userRaw ? JSON.parse(userRaw) : null;
//       setUser(parsedUser);
//     } catch (error) {
//       console.error("Error parsing user data:", error);
//       localStorage.removeItem("Food-App-user");
//       setUser(null);
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   return { user, isLoading };
// };


// src/hooks/useUser.ts
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setCredentials } from "@/redux/feature/authSlice";

interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "rider" | "restaurant" | null;
  phone_number: string;
  profileImage: string;
  OWN_Restaurant?: string;
}

export const useUser = () => {
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const user = useSelector((state: { auth: { user: User | null } }) => state.auth.user);

  useEffect(() => {
    if (!user) {
      // Fallback to localStorage
      const userRaw = localStorage.getItem("Food-App-user");
      if (userRaw) {
        try {
          const parsedUser = JSON.parse(userRaw);
          // Sync with Redux
          dispatch(
            setCredentials({
              data: { user: parsedUser },
              token: localStorage.getItem("token") || "",
            })
          );
        } catch (error) {
          console.error("Error parsing user data:", error);
          localStorage.removeItem("Food-App-user");
          localStorage.removeItem("token");
        }
      }
    }
    setIsLoading(false);
  }, [dispatch]);

  return { user, isLoading };
};