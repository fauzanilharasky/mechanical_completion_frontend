import AuthLayout from '@/components/layout/authLayout';
import useApi from '@/hooks/useApi';
import useSwal from '@/hooks/useSwal';
import useUser from '@/store/useUser';
import { Button, Paper, TextInput, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconEdit, IconPlus } from '@tabler/icons-react';
import axios from 'axios';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { masterDataList } from '@/data/sidebar/master-data';
import useDecrypt from '@/hooks/useDecrypt';
import { icons } from 'lucide-react';
import Swal from 'sweetalert2';

export async function getServerSideProps({ params }) {
  return {
    props: { id_master: params.id },
  };
}

function Edit_master({ id_master }) {
  const { user } = useUser();
  const router = useRouter();
  const API = useApi();
  const API_URL = API.API_URL;
  const { showAlert } = useSwal();
  const {decrypt} = useDecrypt();

  const form = useForm({
    initialValues: {
      project_id: '',
      system_name: '',
      description: '',
      project_name: '',
      },
    validate: {
  project_id: (value) =>
    value ? null : 'Project ID is required',
},
  });

  const [options, setOptions] = useState(['']); // default satu input kosong

  useEffect(() => {
    if (user.token && id_master) {
      const getDetail = async () => {
        try {
          const res = await axios.get(`${API_URL}/api/master_system/${id_master}`, {
            headers: {
              Authorization: 'Bearer ' + user.token,
            },
          });

          const optionData = Array.isArray(res.data.options)
            ? res.data.options
            : res.data.options
            ? [res.data.options]
            : [''];

          setOptions(optionData);

          form.setValues({
            project_id: res.data.project_id || '',
            project_name: res.data.project_name || '-',
            system_name: res.data.system_name || '',
            description: res.data.description || '',
          });
        } catch (error) {
          const data_error = error.response?.data || {};
          showAlert(data_error.message || 'Failed to get data', 'error', data_error.error || 'Fetch Failed');
        }
      };

      getDetail();
    }
  }, [user.token, API_URL, id_master]);

  const handleAddOption = () => {
    if (options.length < 3) {
      setOptions([...options, '']);
    }
  };

  const handleOptionChange = (value, index) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
    form.setFieldValue('options', newOptions);
  };

  const handleSubmit = async (values) => {
    
    const confirm = await Swal.fire({
      title: 'Are sou sure?',
      text: "Do you want to update this data?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    });

    if (!confirm.isConfirmed) return;


    try {
      const {project_name, ...data} = values
      await axios.put(
        `${API_URL}/api/master_system/${id_master}`,
        {
          ...data,
          // options,
          updated_by: user.id.toString(),
        },
        {
          headers: { Authorization: 'Bearer ' + user.token },
        }
      );

      showAlert('Data updated successfully!', 'success', 'Update Success');
      router.push('/master_data/master_system/master_data_list');
    } catch (error) {
      console.error(error)
      const data_error = error.response?.data || {};
      showAlert(data_error.message || 'Error updating data', 'error', data_error.error || 'Update Failed');
    }
  };

  return (
    <AuthLayout sidebarList={masterDataList}>
      <div className="py-6">
        <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" style={{ position: 'relative' }} withBorder>
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <h1 className="text-center font-bold text-2xl mt-2">EDIT DATA</h1>

              <div className="p-4">
                <TextInput label="Project Name :" value={form.values.project_name} readOnly />
              </div>

              <div className="p-4">
                <TextInput label="System Name :" {...form.getInputProps('system_name')} />
              </div>

              <div className="p-4">
                <Textarea label="Description :" {...form.getInputProps('description')} />
              </div>
              <div className="px-4 py-2 text-right">
                <Button
                  className="mr-2"
                  variant="outline"
                  color="red"
                  onClick={() => router.push('/master_data/master_system/master_data_list')}
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

Edit_master.title = 'Edit Data';
export default Edit_master;
