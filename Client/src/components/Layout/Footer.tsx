import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Facebook, Twitter, Instagram, Mail } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

// Define Types
interface FooterLink {
  id: string;
  label: string;
  path: string;
}

const footerLinks: FooterLink[] = [
  { id: "1", label: "Home", path: "/" },
  { id: "2", label: "Restaurants", path: "/restaurants" },
  { id: "3", label: "About", path: "/about" },
  { id: "4", label: "Contact", path: "/contact" },
];

const socialLinks = [
  { id: "1", icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { id: "2", icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { id: "3", icon: Instagram, href: "https://instagram.com", label: "Instagram" },
];

const Footer: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Skeleton className="h-6 w-32 bg-gray-700 rounded-md mb-4" />
            <Skeleton className="h-4 w-48 bg-gray-700 rounded-md" />
          </div>
          <div>
            <Skeleton className="h-6 w-24 bg-gray-700 rounded-md mb-4" />
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-4 w-20 bg-gray-700 rounded-md mb-2" />
            ))}
          </div>
          <div>
            <Skeleton className="h-6 w-24 bg-gray-700 rounded-md mb-4" />
            <div className="flex space-x-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-8 w-8 bg-gray-700 rounded-full" />
              ))}
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-xl font-bold font-sans text-orange-600 mb-4">Food Delivery</h3>
          <p className="text-sm text-gray-400">
            Order delicious meals from your favorite restaurants with ease.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3 className="text-lg font-semibold font-sans text-white mb-4">Quick Links</h3>
          <ul className="space-y-2">
            {footerLinks.map((link) => (
              <li key={link.id}>
                <button
                  onClick={() => navigate(link.path)}
                  className="text-sm text-gray-400 hover:text-orange-600 transition-colors duration-200"
                  aria-label={`Navigate to ${link.label}`}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold font-sans text-white mb-4">Connect With Us</h3>
          <div className="flex space-x-4 mb-4">
            {socialLinks.map((social) => (
              <a
                key={social.id}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-orange-600 transition-colors duration-200"
                aria-label={social.label}
              >
                <social.icon className="h-6 w-6" />
              </a>
            ))}
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <Mail className="h-5 w-5 mr-2" />
            <a href="mailto:support@fooddelivery.com" className="hover:text-orange-600">
              support@fooddelivery.com
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;