/* eslint-disable react-hooks/rules-of-hooks */
import AuthLayout from '@/components/layout/authLayout';
import { masterDataList } from '@/data/sidebar/master-data';
import { Button, Paper, TextInput, Textarea, Select } from '@mantine/core';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useForm } from '@mantine/form';
import useApi from '@/hooks/useApi';
import useSwal from '@/hooks/useSwal';
import useUser from '@/store/useUser';
import axios from 'axios';
import { IconPlaylistAdd, IconArrowBack } from '@tabler/icons-react';

Add_Subsystem.title = 'Add Subsystem List';

export default function Add_Subsystem() {
  const router = useRouter();
  const { user } = useUser();
  const API = useApi();
  const API_URL = API.API_URL;
  const { showAlert } = useSwal();

  const form = useForm({
    initialValues: {
      system_id: '', // ✅ HARUS string
      subsystem_name: '',
      subsystem_description: '',
      status: 'Active',
    },
  });

  const [systems, setSystems] = useState([]);

  // --- Fetch system dropdown
  useEffect(() => {
    if (!user?.token) return;

    const fetchSystems = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/master_system/dropdown`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );

        const list = res.data?.content ?? res.data;

        setSystems(
          list.map((s) => ({
            value: s.id.toString(), // ✅ string
            label: s.system_name,
          }))
        );
      } catch (err) {
        showAlert('Gagal ambil data system', 'error');
      }
    };

    fetchSystems();
  }, [user?.token, API_URL]);

  // --- Submit
  const handleSubmit = async (values) => {
    try {
      const payload = {
        system_id: Number(values.system_id), // ✅ KONVERSI
        subsystem_name: values.subsystem_name,
        subsystem_description: values.subsystem_description,
        status: values.status,
        created_by: user.id, // ✅ KONSISTEN
      };

      await axios.post(
        `${API_URL}/api/master_subsystem`,
        payload,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      showAlert('Success', 'success', 'Subsystem successfully added');
      router.push('/master_data_new/master_data_subsystem/subsystem_list');
    } catch (error) {
      showAlert(
        error.response?.data?.message || 'Failed to Add Subsystem',
        'error'
      );
    }
  };

  return (
    <AuthLayout sidebarList={masterDataList}>
      <div className="py-6">
        <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
          <Paper withBorder radius="sm">
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <h1 className="text-center font-bold text-xl mt-4">
                ADD MASTER SUBSYSTEM
              </h1>

              <div className="p-4">
                <Select
                  label="System"
                  placeholder="Select system"
                  data={systems}
                  searchable
                  withAsterisk
                  {...form.getInputProps('system_id')}
                />
              </div>

              <div className="p-4">
                <TextInput
                  label="Subsystem Name"
                  placeholder='Input Subsystem Name'
                  withAsterisk
                  {...form.getInputProps('subsystem_name')}
                />
              </div>

              <div className="p-4">
                <Textarea
                  label="Subsystem Description"
                  placeholder='Input Subsystem Description'
                  minRows={5}
                  {...form.getInputProps('subsystem_description')}
                />
              </div>

              <div className="p-4">
                <Select
                  label="Status"
                  data={[
                    { value: 'Active', label: 'Active' },
                    { value: 'Inactive', label: 'Inactive' },
                  ]}
                  {...form.getInputProps('status')}
                />
              </div>

              <div className="px-4 py-4 text-right">
                <Button
                  variant="outline"
                  color="red"
                  onClick={() =>
                    router.push('/master_data_new/master_data_subsystem/subsystem_list')
                  }
                  leftSection={<IconArrowBack />}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  color="blue"
                  ml="sm"
                  leftSection={<IconPlaylistAdd />}
                >
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
