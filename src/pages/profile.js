import { useEffect, useState } from "react";
import useUser from "@/store/useUser";
import { useRouter } from "next/router";
import useApi from "@/hooks/useApi";
import axios from "axios";
import Swal from "sweetalert2";
import useEncrypt from '@/hooks/useEncrypt';
import { Button, Paper, TextInput, Textarea, Select, Container, Checkbox, Accordion, Group, ActionIcon } from '@mantine/core';
import AuthLayout from '@/components/layout/authLayout';
import { IconArrowBack, IconEdit, IconEye, IconEyeOff } from "@tabler/icons-react";
import { userManagementList } from '@/data/sidebar/user_management';



ProfilePage.title = 'Edit Profile Account';
export default function ProfilePage() {
  const { user } = useUser();
  const API = useApi();
  const {encrypt} = useEncrypt();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  
  const [form, setForm] = useState({
  full_name: "",
  email: "",
  username: "",
  badge_no: "",
  password: "",
});


  

 useEffect(() => {
  if (!user || !user.id) return;

  getDetailUser();
}, [user?.id]); // 🔥 lebih spesifik

  const getDetailUser = async () => {
    try {
      const res = await axios.get(
        `${API.API_URL}/api/portal_user/${encrypt(user.id)}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`, 
          },
        }
      );


      setForm({
        full_name: res.data.full_name,
        email: res.data.email,
        username: res.data.username,
        badge_no: res.data.badge_no,
        password: "",
      });
    } catch (err) {
      console.error("GET ERROR:", err);
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `${API.API_URL}/api/portal_user/${user.id}`, 
        form,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Profile updated!",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update",
      });
    }
  };

  return (
    <AuthLayout sidebarList={userManagementList}>
      <div className="py-6">
        <div className="max-w-5xl mx-auto sm:px-6 lg:px-8 grid-cols-2">
          <div></div>
          <Paper radius="sm" mt="md" style={{ position: 'relative' }} withBorder>
           <form
            onSubmit={(e) => { e.preventDefault(); 
                handleUpdate();
            }}>
              <h1 className="text-center font-bold text-xl mt-4 mb-4">EDIT ACCOUNT PROFILE </h1>

              <div className="p-4">
                <TextInput label="Full Name" withAsterisk value={form.full_name}
                 onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              </div>
              
              <div className="p-4">
                <TextInput label="Role" withAsterisk disabled value={form.badge_no}
                 onChange={(e) => setForm({ ...form, badge_no: e.target.value })} />
              </div>

              <div className="p-4">
                <TextInput label="Username" withAsterisk value={form.username}
                 onChange={(e) => setForm({ ...form, username: e.target.value })} />
              </div>

              <div className="p-4">
                <TextInput label="Email" withAsterisk value={form.email}
                 onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>

              <div className="p-4">
               <TextInput
                    label="Password"
                    placeholder="Change your password"
                    withAsterisk
                    type={showPassword ? "text" : "password"} // 🔥 toggle disini
                    value={form.password}
                    onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                    }
                    rightSection={
                    <ActionIcon
                        variant="subtle"
                        onClick={() => setShowPassword((prev) => !prev)}
                    >
                        {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                    </ActionIcon>
                    }
                />
              </div>



              <div className="px-4 py-8 text-right">
                <Button
                  className="mr-2"
                  variant="outline"
                  color="red"
                  onClick={() => router.push('/Home/dashboard')}
                  leftSection = {<IconArrowBack/>}
                >
                  Back
                </Button>
                <Button type="submit" color="green" leftSection={<IconEdit />}>
                  Update
                </Button>
              </div>
            </form>

          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}
