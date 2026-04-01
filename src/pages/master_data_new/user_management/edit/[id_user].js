import AuthLayout from '@/components/layout/authLayout';
import useApi from '@/hooks/useApi';
import useSwal from '@/hooks/useSwal';
import useUser from '@/store/useUser';
import { Button, Paper, TextInput, Textarea, Select } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlignLeft, IconArrowBack, IconEdit, IconPlus, IconMinus } from '@tabler/icons-react';
import axios from 'axios';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { masterDataList } from '@/data/sidebar/master-data';
import Swal from 'sweetalert2';
import { userManagementList } from '@/data/sidebar/user_management';




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
  const { showAlert } = useSwal();

  const form = useForm({
    initialValues: {
      full_name: '',
      badge_no: '',
      username: '',
      email: '',
      status_user: '',
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
  if (user.token && id_user) {
    const getDetail = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/portal_user/${id_user}`, {
          headers: {
            Authorization: 'Bearer ' + user.token,
          },
        });

        form.setValues({
          full_name: res.data.full_name || '',
          badge_no: res.data.badge_no || '',
          username: res.data.username || '',
          email: res.data.email || '',
          id_role: res.data.id_role?.toString() || 0,
          status_user: res.data.status_user?.toString() || 0,
        });
      } catch (error) {
        const data_error = error.response?.data || {};
        showAlert(data_error.message || 'Failed to retrieve data', 'error', data_error.error || 'Fetch Failed');
      }
    };
    getDetail();
  };
}, [user.token, API_URL, id_user]);


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
        `${API_URL}/api/portal_user/${id_user}`,
        {
          ...values,
          id_role: Number(values.id_role),
          last_update: new Date(),
          updated_by: user.id,
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
        <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
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
                label="Role"
                placeholder="Select Role"
                data={roles}
                {...form.getInputProps('id_role')}
              />
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
            <Paper>
              <form className='mt-4 container'>
              </form>
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
