import AuthLayout from '@/components/layout/authLayout';
import useApi from '@/hooks/useApi';
import useSwal from '@/hooks/useSwal';
import useUser from '@/store/useUser';
import { Button, Paper, TextInput, Textarea, Select, Container, Checkbox, Accordion, Group, PasswordInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlignLeft, IconArrowBack, IconEdit, IconPlus, IconMinus, IconShield, IconShieldCheckered } from '@tabler/icons-react';
import axios from 'axios';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { userManagementList } from '@/data/sidebar/user_management';
import useEncrypt from '@/hooks/useEncrypt';
import { Icon } from 'lucide-react';



const groupPermissions = (permissions) => {
const grouped = {};

permissions?.forEach((perm) => {
  if (!grouped[perm.permission_group]) {
    grouped[perm.permission_group] = [];
  }

  grouped[perm.permission_group].push(perm);
});

return grouped;
};

export async function getServerSideProps({ params }) {


  return {
    props: { id_user: params.id_user },
  };
}

function Edit_User_Account({ id_user }) {
  const { user } = useUser();
  
  const router = useRouter();
  const API = useApi();
  const [roles, setRoles] = useState([]);
  const API_URL = API.API_URL;
  // const { decrypt } = useEncrypt();
  const {encrypt} = useEncrypt();
  const [realId, setRealId] = useState([]);
  const { showAlert } = useSwal();
  const [appPermissions, setAppPermissions] = useState([]);
  const [selectedPermission, setSelectedPermission] = useState([]);

  // Handle Permission
 const handlePermission = (id) => {

  let updatedPermission;

  if (selectedPermission.includes(id)) {
    updatedPermission = selectedPermission.filter((item) => item !== id);
  } else {
    updatedPermission = [...selectedPermission, id];
  }

  setSelectedPermission(updatedPermission);

  // AUTO SAVE KE DATABASE
  savePermission(updatedPermission);
};


  // SAVE PERMISSION

  const savePermission = async (permissions) => {
  try {
    await axios.post(
      `${API_URL}/api/portal_user_permission/save`,
      {
        id_user: id_user, // ✅ sudah encrypted dari URL
        permissions: permissions,
        create_by: encrypt(user.id), // ✅ WAJIB encrypt
        create_date: new Date(),
      },
      {
        headers: {
          Authorization: "Bearer " + user.token,
        },
      }
    );
  } catch (error) {
    console.error("Save permission failed", error.response?.data || error);
  }
};



  const form = useForm({
    initialValues: {
      full_name: '',
      badge_no: '',
      username: '',
      email: '',
      status_user: '',
      password: '',
      id_role: '',
    },
  });

  useEffect(() => {
  if (user.token) {
    const getRoles = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/portal_role_db`,
          {
            headers: {
              Authorization: 'Bearer ' + user.token,
            },
          }
        );

       const roleList = Array.isArray(res.data)
        ? res.data
        : res.data?.content || [];

      const roleOptions = roleList.map((role) => ({
        value: role.id_role.toString(),
        label: role.role_name,
      }));

      setRoles(roleOptions);

      } catch (error) {
        console.error("Failed to fetch roles", error);
      }
    };

    getRoles();
  }
}, [user.token, API_URL]);



useEffect(() => {
  if (!user.token) return;

  const getPermissions = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/portal_app_permission`,
        {
          headers: {
            Authorization: "Bearer " + user.token,
          },
        }
      );

      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.content || [];

      setAppPermissions(data);

    } catch (error) {
      console.error("Failed fetch permissions", error);
      setAppPermissions([]);
    }
  };

  getPermissions();
}, [user.token]);

// GET DATA PERMISSIONS ID APP USERS
useEffect(() => {
  if (!user.token || !id_user) return;

  const getUserPermission = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/portal_user_permission/user/${id_user}`,
        {
          headers: {
            Authorization: "Bearer " + user.token,
          },
        }
      );

      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.content || [];

     const permissionIds = data.map((p) =>
      Number(p.id_portal_permission)
    );

      setSelectedPermission(permissionIds);
    } catch (error) {
      console.error("Failed get user permission", error);
    }
  };

  getUserPermission();
}, [user.token, id_user]);



useEffect(() => {
  if (!user.token || !id_user) return;

  try {

    const getDetail = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/portal_user/${id_user}`,
          {
            headers: {
              Authorization: 'Bearer ' + user.token,
            },
          }
        );


        
        form.setValues({
          full_name: res.data.full_name || '',
          badge_no: res.data.badge_no || '',
          username: res.data.username || '',
          email: res.data.email || '',
          password: "",
          id_role: res.data.id_role?.toString() || '',
          status_user: res.data.status_user?.toString() || '',
        });
      } catch (error) {
        const data_error = error.response?.data || {};
        showAlert(
          data_error.message || 'Failed to retrieve data',
          'error',
          data_error.error || 'Fetch Failed'
        );
      }
    };


    getDetail();
  } catch (err) {
    console.error("Decrypt error:", err);
  }
}, [user.token, id_user]);


  const handleSubmit = async (values) => {

    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to Update Account Data?',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#ef4444',
      icon: 'question',
    });

    if (!confirm.isConfirmed) return;


    try {
      await axios.put(
        `${API_URL}/api/portal_user/account/${id_user}`,
        {
          ...values,
          permissions: selectedPermission,
          id_role: Number(values.id_role),
          last_update: new Date(),
          update_by: user.userId,
        },
        {
          headers: { Authorization: 'Bearer ' + user.token },
        }
      );

     showAlert('Data updated successfully!', 'success', 'Success');
      router.push('/master_data_new/user_management/edit/' + id_user);
    } catch (error) {
      const data_error = error.response?.data || {};
      showAlert(data_error.message || 'Error updating data', 'error', data_error.error || 'Update Failed');
    }
  };

  return (
    <AuthLayout sidebarList={userManagementList}>
      <div className="py-6">
        <div className="max-w-5xl mx-auto sm:px-6 lg:px-8 grid-cols-2">
          <div></div>
          <Paper radius="sm" mt="md" style={{ position: 'relative' }} withBorder>
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <h1 className="text-center font-bold text-xl mt-4 mb-4">EDIT ACCOUNT USER </h1>

              <div className="p-4">
                <TextInput label="Full Name" withAsterisk {...form.getInputProps('full_name')} />
              </div>

              <div className="p-4">
                <TextInput label="Username" withAsterisk {...form.getInputProps('username')} />
              </div>

              <div className="p-4">
                <TextInput label="Badge No" withAsterisk {...form.getInputProps('badge_no')} />
              </div>
              
              <div className="p-4">
                <TextInput label="Email" withAsterisk {...form.getInputProps('email')} />
              </div>

              <div className='p-4'>
             <Select
                label="Role ID"
                placeholder="Select Role"
                data={roles}
                {...form.getInputProps('id_role')}
              />
              </div>
            
              <div className="p-4">
                <PasswordInput placeholder='Change Your Password' label="Password" withAsterisk {...form.getInputProps('password')} />
              </div>


              <div className="p-4">
                <Select label="Status" placeholder="Select status" data={[ 
                  { value: '1', label: 'Active' }, { value: '0', label: 'Inactive' }, ]}
                  {...form.getInputProps('status_user')}
                  />
              </div>


              <div className="px-4 py-2 text-right">
                <Button
                  className="mr-2"
                  variant="outline"
                  color="red"
                  onClick={() => router.push('/master_data_new/user_management/user_system')}
                  leftSection = {<IconArrowBack/>}
                >
                  Cancel
                </Button>
                <Button type="submit" color="green" leftSection={<IconEdit />}>
                  Update
                </Button>
              </div>
            </form>

            <div>
            <Paper className='border-t-slate-500'>
             {/* Container Section Bawah */}
              <div className='flex justify-center text-center border-t-2 mt-4 font-bold'>
                <h1 className='mt-4 mb-6 text-xl'>Application Permission</h1>
              </div>
            <div className="flex w-full">
              <div className="px-6 pb-6 min-w-full">

              <Accordion
                multiple
                variant="separated"
                chevronPosition="right"
              >
                {Array.isArray (appPermissions) &&  
                appPermissions.map((app) => (
                  <Accordion.Item
                    key={app.id_application}
                    value={app.id_application.toString()}
                  >

                    {/* Title Accordion */}
                    <Accordion.Control  >
                      <h1 
                      className='font-bold text-lg'
                      leftSection={<IconShieldCheckered size={15}/>}
                      >
                      {app.app_name}
                      </h1>
                    </Accordion.Control>

                    {/* Detail Permissions */}
                    <Accordion.Panel>

                    {(() => {
                      const grouped = groupPermissions(app.permissions);

                      const groups = Object.keys(grouped);

                      return (
                        <div className="grid grid-cols-1 gap-6">

                          {groups.map((group) => (

                            <div key={group}>

                            <div className='border px-6 py-6'>
                              <h4 className="font-semibold mb-2 text-lg border-b pb-1">
                                {group}
                              </h4>

                              {grouped[group].map((perm) => (

                                <div
                                  key={perm.id_permission}
                                  className="flex items-center gap-2 mb-2"
                                >

                                  {/* Checkbox di kiri */}
                                  <Checkbox
                                    checked={selectedPermission.includes(perm.id_permission)}
                                    onChange={() => handlePermission(perm.id_permission)}
                                    className='p-2'
                                  />

                                  {/* Text */}
                                  <span>{perm.permission_name}</span>
                                
                                </div>

                              ))}

                            </div>
                            </div>
                          ))}

                        </div>
                      );
                    })()}

                    </Accordion.Panel>

                  </Accordion.Item>
                 ))}
              </Accordion>

              </div>
            </div>
            </Paper>
            </div>
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}

Edit_User_Account.title = 'Edit User Account';
export default Edit_User_Account;
