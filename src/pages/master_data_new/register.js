/* eslint-disable jsx-a11y/alt-text */
import { formRootRule, useForm, isNotEmpty } from '@mantine/form'
import { useState } from "react";

import { useRouter } from "next/navigation";
import { Button, Image, PasswordInput} from "@mantine/core";
import useApi from "@/hooks/useApi";
import useSwal from "@/hooks/useSwal";
import useUser from "@/store/useUser";
import axios from 'axios';


RegisterPage.title = "Register Page"

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const API = useApi()
  const {showAlert} = useSwal();
  const { user } = useUser()

    const form = useForm({
      initialValues: {
        full_name: '',
        badge_no: '',
        username: '',
        email: '',
        password: '',
        status: 'Active',
        }
        
    });



  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
     await axios.post(
        `${API.API_URL}/api/portal_user/register`, 
        {
            ...form.values,
            status_user: 1,
            created_date: new Date()
        },
        {
        headers: { Authorization: `Bearer ${user.token}` },
        });


      showAlert('Registered account data successfully saved!', 'success');
      router.push('/master_data_new/login');
    } catch (error) {
      alert("Incorrect email or password");
    } finally {
      setLoading(false);
    }
  };

return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 rounded-3xl">

      {/* Background */}
      <div
        className="hidden md:block bg-cover bg-center rounded-r-3xl"
        style={{
          backgroundImage:
            "url('https://i.pinimg.com/1200x/87/0a/6c/870a6c4ea083b3ac1b1525ef079a2819.jpg')",
        }}
      />

      {/* Form */}
      <div className="flex items-center justify-center bg-white px-4">
        <div className="w-full max-w-md items-center justify-center">
            <div className='flex flex-col items-center pointer-events-none'>
            <h1 className="text-3xl font-semibold text-center">
                Create New Account
            </h1>
            <p className="font-normal text-gray-500">Please fill in the data clearly and accurately!</p>
          </div>



          <form onSubmit={handleRegister} className="space-y-5 mt-20">
            
            {/* <label>Full name</label> */}
            <div>
                 <label className="block text-sm font-medium mb-1">
                  full name :
                </label>
                <input
                type="text"
                required
                {...form.getInputProps("full_name")}
                className="w-full border rounded-lg px-4 py-2"
                placeholder="Enter your Full Name"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">
                    Username :
                </label>
                <input
                type="text"
                required
                {...form.getInputProps("username")}
                className="w-full border rounded-lg px-4 py-2"
                placeholder="Enter your Username"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">
                    Badge No :
                </label>
                <input
                type="text"
                required
                {...form.getInputProps("badge_no")}
                className="w-full border rounded-lg px-4 py-2"
                placeholder="Enter your Badge No"
                />
            </div>

            <div>
                 <label className="block text-sm font-medium mb-1">
                    Email :
                </label>
                <input
                type="email"
                required
                {...form.getInputProps("email")}
                className="w-full border rounded-lg px-4 py-2"
                placeholder="Enter your Email"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">
                    Password :
                </label>
                <PasswordInput
                required
                {...form.getInputProps("password")}
                placeholder="Enter your Password"
                className='w-full rounded-2xl'
                />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
            >
              {loading ? "Loading..." : "Sign Up"}
            </button>

          </form>
         <div className="flex justify-center items-center mt-6">
            <p className="text-gray-500 text-center mt-3">
              Do you already have an account?
              <button
                type="button"
                className="text-blue-500 font-medium ml-2"
                onClick={() => router.push('/')}
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}