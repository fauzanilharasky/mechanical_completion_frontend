import AuthLayout from '@/components/layout/authLayout';
import useApi from '@/hooks/useApi';
import useSwal from '@/hooks/useSwal';
import useUser from '@/store/useUser';
import { Button, Paper, TextInput, Textarea, Select } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconArrowBack, IconArrowLeft, IconEdit, IconPlus } from '@tabler/icons-react';
import axios from 'axios';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { masterDataList } from '@/data/sidebar/master-data';

export async function getServerSideProps({ params }) {
  return {
    props: { id_master: params.id },
  };
}

function Edit_checklist({ id_master }) {
  const { user } = useUser();
  const router = useRouter();
  const API = useApi();
  const API_URL = API.API_URL;
  const { showAlert } = useSwal();

  const form = useForm({
    initialValues: {
      group_name: '',
      item_no: '',
      description: '',
      status_delete: '',
    },
  });

 useEffect(() => {
  if (user.token && id_master) {
    const getDetail = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/master_checklist/${id_master}`, {
          headers: {
            Authorization: 'Bearer ' + user.token,
          },
        });


        form.setValues({
          group_name: res.data.group_name || '',
          item_no: res.data.item_no?.toString() || '',
          description: res.data.description || '',
          status_delete: res.data.status_delete?. toString() || '',
        });

      } catch (error) {
        const data_error = error.response?.data || {};
        showAlert(data_error.message || 'Gagal ambil data', 'error', data_error.error || 'Fetch Failed');
      }
    };

    getDetail();
  }
}, [user.token, API_URL, id_master]);


  const handleSubmit = async (values) => {
    try {

      const payload = {
      ...values,
      status_delete: Number(values.status_delete),
      updated_by: user.id,
    };

      await axios.put(
        `${API_URL}/api/master_checklist/${id_master}`, payload, {
          headers: { Authorization: 'Bearer ' + user.token },
        }
      );

      showAlert('Data updated successfully!', 'success', 'Update Success').then(() => {
      router.push(`/master_data_new/master_data_itr/form_checklist/${id_master}`);
    });

  } catch (error) {
    const data_error = error.response?.data || {};
    showAlert(
      data_error.message || 'Error updating data',
      'error',
      data_error.error || 'Update Failed'
    );
  }
};

  return (
    <AuthLayout sidebarList={masterDataList}>
      <div className="py-6">
        <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" style={{ position: 'relative' }} withBorder>
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <h1 className="text-center font-bold text-xl mt-2">EDIT FORM MASTER CHECKLIST  </h1>

              <div className="p-4">
                <TextInput label="Item No" {...form.getInputProps('item_no')} />
              </div>

              <div className="p-4">
                <TextInput label="Group Name"  {...form.getInputProps('group_name')} />
              </div>

              <div className="p-4">
                <Textarea label=" Description" {...form.getInputProps('description')} />
              </div>

              <div className="p-4">
                <Select label="Status" placeholder="Select status" data={[
                  { value: '1', label: 'Active' }, { value: '0', label: 'Inactive' }, ]}
                  {...form.getInputProps('status_delete')}
                />
              </div>

              <div className="px-4 py-2 text-right">
                <Button
                  className="mr-2"
                  variant="outline"
                  color="red"
                  onClick={() => router.push(`/master_data_new/master_data_itr/details/${id_master}`)}
                leftSection = {<IconArrowBack/>}>
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

Edit_checklist.title = 'Edit Master Checklist';
export default Edit_checklist;