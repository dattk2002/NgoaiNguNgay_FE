import React from "react";
import { FcGoogle } from "react-icons/fc";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "./firebase";
import { toast } from "react-toastify";

// Define a key for storing user data
const USER_INFO_KEY = 'loggedInUserInfo';

export default function SignInWithGoogle({ onLoginSuccess }) {
  function googleLogin() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).then((result) => {
      if (result.user) {
        const { uid, displayName, email, photoURL } = result.user;
        const userData = {
          id: uid,
          name: displayName,
          email: email,
          avatarUrl: photoURL
        };

        // Store user data in localStorage (or use context/state management)
        try {
          localStorage.setItem(USER_INFO_KEY, JSON.stringify(userData));
        } catch (e) {
          console.error("Failed to save user data to localStorage", e);
        }

        toast.success("User login successfully!", {
          position: "top-center",
        });

        // Optionally call a success callback if provided
        if (onLoginSuccess) {
          onLoginSuccess(userData);
        }

        // Redirect or let the parent component handle it
        window.location.href = "/"; // Or remove if handled by parent/context

      }
    }).catch((error) => {
      console.error("Google Sign-In Error:", error); // Log the error
      toast.error(`Google Sign-In failed: ${error.message}`, { // Show specific error
        position: "top-center",
      });
    });
  }

  return (
    <div>
      <p className="text-center text-sm text-gray-500 my-3">-- Or continue with --</p>
      <div
        className="flex justify-center items-center cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
        onClick={googleLogin}
        role="button" // Add role for accessibility
        tabIndex={0} // Add tabIndex for accessibility
        onKeyPress={(e) => e.key === 'Enter' && googleLogin()} // Allow activation with Enter key
        title="Sign in with Google" // Add title attribute
      >
        <FcGoogle size={24} /> {/* Use size prop for consistency */}
        <span className="ml-2 text-sm font-medium text-gray-700">Continue with Google</span> {/* Add text */}
      </div>
    </div>
  );
}
