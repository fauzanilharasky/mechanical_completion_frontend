/* eslint-disable jsx-a11y/alt-text */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Image} from "@mantine/core";


LoginPage.title = "Login Page"

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error("Login gagal");
      }

      router.push("/dashboard");
    } catch (error) {
      alert("Email atau password salah");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      
      {/* LEFT SIDE - LOGIN FORM */}
     <div className="flex items-center justify-center bg-white px-4 relative">
        <div className="w-full max-w-md relative">
          {/* Positioned logo above centered form without affecting layout flow */}
          <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-0 pointer-events-none">
            <Image
              src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/commissioning-inspection.png`}
              width={80}
              alt="logo"
              className="block"
            />
          </div>

          {/* central container: keep content vertically centered */}
          <div className="flex flex-col items-center justify-center min-h-[60vh] pt-12">
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-gray-500 mb-6 text-center">
              Please login to your account
            </p>

            <form onSubmit={handleLogin} className="w-full space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50 font-medium"
              >
                {loading ? "Loading..." : "Login"}
              </button>

            </form>
              <div className="justify-center mt-6">
                <span className="text-gray-500 text-center mt-3">Don`t have an account?
                    <button type="submit" className="text-blue-500">
                        Sign Up
                    </button>
                </span>
              </div>
          </div>
        </div>
      </div>

      

      {/* RIGHT SIDE - BACKGROUND */}
      <div
        className="hidden md:block bg-cover bg-center"
        
        style={{
          backgroundImage:
            "url('https://i.pinimg.com/736x/b5/97/b6/b597b60b97cbad0bb1241cbe0b90b216.jpg')",
        }}
      >

        {/* <div className="w-full h-full bg-black/40 flex items-center justify-center">
          <h2 className="text-white text-4xl font-bold text-center px-10">
           Mechanical Completion
          </h2>
        </div> */}
      </div>
    </div>
  );
}