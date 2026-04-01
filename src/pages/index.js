/* eslint-disable jsx-a11y/alt-text */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Image, PasswordInput } from "@mantine/core";
import axios from "axios";
import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import Cookies from "js-cookie";
import Swal from 'sweetalert2';
import useSwal from '@/hooks/useSwal';
import useDecrypt from "@/hooks/useDecrypt";


LoginPage.title = "Login Page";

export default function LoginPage() {

  const router = useRouter();
  const API = useApi();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { showAlert } = useSwal();
  const { decrypt } = useDecrypt();


  const { setUser } = useUser();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("!Email and password are required");
      return;
    }

    setLoading(true);


    try {
      const res = await axios.post(
        `${API.API_URL}/api/auth/login-user`,
        {
          email: email.trim(),
          password: password.trim(),
        }
      );

      const data = res.data;

      if (!data?.access_token) {
        setErrorMsg("Email atau password salah");
        return;
      }

      const userData = data.user;


      const encryptUserId = userData.id_user; // sementara tanpa encrypt

      const decryptPermission = decrypt(userData.permissions);
      const permissions = JSON.parse(decryptPermission);

      // konfersi type data
      const permissionsParse = permissions.map((p) => parseInt(p));

      Cookies.set("portal_user_db", encryptUserId, {
        expires: 1, // 1 hari
      });

      setUser({
        id: encryptUserId,
        name: userData.full_name,
        email: userData.email,
        username: userData.username,
        badge_no: userData.badge_no,
        token: data.access_token,
        permissions: permissionsParse,
      });

      Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: "Welcome to Mechanical Completion!",
        showConfirmButton: false,
        timer: 1500,
      }).then(() => {
        router.push("/Home/dashboard");
      });

    } catch (error) {
      console.log(error)
      if (error.response) {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: error.response.data.message || "Failed to login",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Server Error",
          text: "Server not responding",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">

      {/* LEFT SIDE */}
      <div className="flex items-center justify-center bg-white px-4 relative">

        <div className="w-full max-w-md">
          <Image
            className=""
            src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/mechanical-completion.png`}
            width={80}
            mb={40}
            alt="logo"
          />

          <div className="flex flex-col items-center justify-center min-h-[40vh] pt-12 mb-24">

            <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>

            <p className="text-gray-500 mb-6 text-center">
              Please login to your account
            </p>

            {errorMsg && (
              <div className="w-full bg-red-100 text-red-600 p-2 rounded mb-4 text-sm">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin} className="w-full space-y-5">

              <div>
                <label className="block text-sm font-medium mb-1">
                  Email :
                </label>

                <input
                  type="email"
                  required
                  className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Password :
                </label>

                <PasswordInput
                  required
                  w="100%"
                  size="md"
                  radius="sm"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50 font-medium"
              >
                {loading ? "Loading..." : "Sign In"}
              </button>

            </form>

            {/* <div className="justify-center mt-6">
              <span className="text-gray-500">
                Don`t have an account?
                <button
                  className="text-blue-500 font-medium ml-2"
                  onClick={() => router.push("/master_data_new/register")}
                >
                  Sign Up
                </button>
              </span>
            </div> */}

          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div
        className="hidden md:block bg-cover bg-center rounded-l-3xl"
        style={{
          backgroundImage:
            "url('https://i.pinimg.com/736x/b5/97/b6/b597b60b97cbad0bb1241cbe0b90b216.jpg')",
        }}
      />
    </div>
  );
}