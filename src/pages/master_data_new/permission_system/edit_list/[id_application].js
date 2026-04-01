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
    props: { id_application: params.id_application },
  };
}

function Edit_Portal({ id_application }) {
  const { user } = useUser();
  const router = useRouter();
  const API = useApi();
  const API_URL = API.API_URL;
  const { showAlert } = useSwal();

  const form = useForm({
    initialValues: {
      app_name: '', 
    },
    validate: {
      app_name: (value) => (value.trim().length > 0 ? null : 'Application Name is required'),
    },
  });


 useEffect(() => {
  if (user.token && id_application) {
    const getDetail = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/portal_app_permission/${id_application}`, {
          headers: {
            Authorization: 'Bearer ' + user.token,
          },
        });

      form.setValues({
        app_name: res.data.app_name || '-',
        created_date: res.data.created_date
          ? new Date(res.data.created_date).toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '-',
      });

      } catch (error) {
        const data_error = error.response?.data || {};
        showAlert(data_error.message || 'Failed to retrieve data', 'error', data_error.error || 'Fetch Failed');
      }
    };

    

    getDetail();
  };
}, [user.token, API_URL, id_application]);




  const handleSubmit = async (values) => {

    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to Update Title Application?',
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
        `${API_URL}/api/portal_app_permission/${id_application}`,
        {
          ...values,
          created_date: new Date(),
          app_name: values.app_name 
        },
        {
          headers: { Authorization: 'Bearer ' + user.token },
        }
      );

     showAlert('Data updated successfully!', 'success', 'Success');
      router.push('/master_data_new/permission_system/edit_list/' + id_application);
    } catch (error) {
      const data_error = error.response?.data || {};
      showAlert(data_error.message || 'Error updating data', 'error', data_error.error || 'Update Failed');
    }
  };

  return (
    <AuthLayout sidebarList={userManagementList}>
      <div className="py-6">
        <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" style={{ position: 'relative' }} withBorder>
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <h1 className="text-center font-bold text-xl mt-2">EDIT APPLICATION NAME</h1>

              <div className="p-4">
                <TextInput label="App Name" withAsterisk  {...form.getInputProps('app_name')} />
              </div>

              <div className="p-4">
                <TextInput label="Date" withAsterisk readOnly {...form.getInputProps('created_date')} />
              </div>

              <div className="px-4 py-2 text-right">
                <Button
                  className="mr-2"
                  variant="outline"
                  color="red"
                  onClick={() => router.push('/master_data_new/permission_system/permission_list')}
                  leftSection = {<IconArrowBack/>}
                >
                  Cancel
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

Edit_Portal.title = 'Edit Master Permission';
export default Edit_Portal;
