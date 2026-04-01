import AuthLayout from '@/components/layout/authLayout';
import { masterDataList } from '@/data/sidebar/master-data';
import { Button, Paper, TextInput, Textarea, Select } from '@mantine/core';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import { useForm } from '@mantine/form';
import useApi from '@/hooks/useApi';
import useSwal from '@/hooks/useSwal';
import useUser from '@/store/useUser';
import axios from 'axios';
import { IconPlaylistAdd, IconArrowBack } from '@tabler/icons-react';

Add_Subsystem.title = "Add Subsystem List";

export default function Add_Subsystem() {
  const router = useRouter();
  const { user } = useUser();
  const API = useApi();
  const API_URL = API.API_URL;
  const { showAlert } = useSwal();

  const form = useForm({
    initialValues: {
      system_id: '',
      subsystem_name: '',
      subsystem_description: '',
      status: 'Active', // default Active
    },
  });

  const [systems, setSystems] = useState([]);

  // Fetch systems untuk dropdown
  useEffect(() => {
    if (!user.token) return;

    const fetchSystems = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/master_system`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Cache-Control': 'no-cache',
          },
        });

        const systemsData = res.data?.content;
        if (Array.isArray(systemsData)) {
          setSystems(
            systemsData.map(sys => ({
              value: sys.id?.toString() || '',
              label: sys.system_name || '-',
            }))
          );
        } else {
          showAlert('Data sistem tidak valid', 'error');
        }
      } catch (error) {
        const data_error = error.response?.data || {};
        showAlert(
          data_error.message || error.message || 'Gagal ambil data sistem',
          'error'
        );
      }
    };

    fetchSystems();
  }, [user.token]);

  const handleSubmit = async (values) => {
    try {
      const payload = {
        system_id: values.system_id,
        subsystem_name: values.subsystem_name,
        subsystem_description: values.subsystem_description,
        status: values.status,
        created_by: user.userId,
      };

      const { data } = await axios.post(`${API_URL}/api/master_subsystem`, payload, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      // Cek apakah backend mengembalikan object subsystem dengan id
      if (data && data.id) {
        showAlert("Success", "success", "Subsystem added successfully");
        form.reset();
        router.push("/master_data_subsystem/subsystem_list");
      } else {
        showAlert("Failed to Add SubSystem", "error");
      }
    } catch (error) {
      const data_error = error.response?.data || {};
      showAlert(
        data_error.message || "Failed to Add Subsystem",
        "error",
        data_error.error || "An error occurred"
      );
    }
  };

  return (
    <AuthLayout sidebarList={masterDataList}>
      <div className="py-6">
        <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" style={{ position: 'relative' }} withBorder>
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <h1 className="text-center font-bold text-xl mt-2">
                ADD MASTER SUBSYSTEM
              </h1>

              <div className="p-4">
                <Select
                  label="System"
                  placeholder="Select system"
                  data={systems}
                  size="md"
                  radius="md"
                  {...form.getInputProps('system_id')}
                  classNames={{
                    input: 'text-lg py-3',
                    label: 'text-lg font-medium text-gray-700',
                    item: 'text-base',
                  }}
                  withAsterisk
                />
              </div>

              <div className="p-4">
                <TextInput
                  label="Subsystem Name"
                  withAsterisk
                  size="md"
                  radius="md"
                  {...form.getInputProps('subsystem_name')}
                  classNames={{
                    input: 'text-lg py-3',
                    label: 'text-lg font-medium text-gray-700',
                  }}
                />
              </div>

              <div className="p-4">
                <Textarea
                  label="Subsystem Description"
                  minRows={6}
                  size="md"
                  radius="md"
                  {...form.getInputProps('subsystem_description')}
                  classNames={{
                    input: 'text-lg py-3',
                    label: 'text-lg font-medium text-gray-700',
                  }}
                />
              </div>

              <div className="p-4">
                <Select
                  label="Status"
                  placeholder="Select status"
                  data={[
                    { value: 'Active', label: 'Active' },
                    { value: 'Inactive', label: 'Inactive' },
                  ]}
                  size="md"
                  radius="md"
                  {...form.getInputProps('status')}
                  classNames={{
                    input: 'text-lg py-3',
                    label: 'text-lg font-medium text-gray-700',
                    item: 'text-base',
                  }}
                />
              </div>

              <div className="px-4 py-2 text-right">
                <Button
                  className="mr-2"
                  variant="outline"
                  color="red"
                  onClick={() =>
                    router.push('/master_data_new/master_data_subsystem/subsystem_list')
                  }
                  leftSection={<IconArrowBack />}
                >
                  Cancel
                </Button>
                <Button type="submit" color="blue" leftSection={<IconPlaylistAdd />}>
                  Save
                </Button>
              </div>
            </form>
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}