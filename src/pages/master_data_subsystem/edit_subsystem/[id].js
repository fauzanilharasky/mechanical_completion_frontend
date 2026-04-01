import AuthLayout from '@/components/layout/authLayout';
import useApi from '@/hooks/useApi';
import useSwal from '@/hooks/useSwal';
import useUser from '@/store/useUser';
import { Button, Paper, TextInput, Textarea, Select } from '@mantine/core';
import { useForm } from '@mantine/form';
import axios from 'axios';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { masterDataList } from '@/data/sidebar/master-data';
import { IconArrowBack, IconEdit } from '@tabler/icons-react';

// --- SSR ambil param ---
export async function getServerSideProps({ params }) {
  return {
    props: { id: params.id },
  };
}

function EditSubsystem({ id }) {
  const { user } = useUser();
  const router = useRouter();
  const API = useApi();
  const API_URL = API.API_URL;
  const { showAlert } = useSwal();
  const [loaded, setLoaded] = useState(false);

  const form = useForm({
    initialValues: {
      system_id: '', 
      subsystem_name: '',
      subsystem_description: '',
      status: 'Active',
    },
  });

  const [systems, setSystems] = useState([]);

  useEffect(() => {
    if (!user.token) return;
    const fetchSystems = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/master_system`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (Array.isArray(res.data.content)) {
          setSystems(
            res.data.content.map((sys) => ({
              value: sys.id?.toString() || '',
              label: sys.system_name || '-',
            }))
          );
        }
      } catch (err) {
        showAlert('Failed to Fetch Systems', 'error', 'Fetch Failed');
      }
    };
    fetchSystems();
  }, [user.token]);

  // --- Fetch detail Subsystem untuk edit
  useEffect(() => {
    if (!user.token || !id || loaded) return;

    const fetchDetail = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/master_subsystem/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        form.setValues({
          system_id: res.data.system?.id?.toString() || '',
          subsystem_name: res.data.subsystem_name || '',
          subsystem_description: res.data.subsystem_description || '',
          status: res.data.status || 'Active',
        });

        setLoaded(true);
      } catch (err) {
        showAlert(
          err.response?.data?.message || 'Failed to Fetch Data',
          'error',
          err.response?.data?.error || 'Fetch Failed'
        );
      }
    };

    fetchDetail();
  }, [user.token, API_URL, id, form, loaded, showAlert]);

  // --- Handle submit
  const handleSubmit = async (values) => {
    try {
      await axios.put(
        `${API_URL}/api/master_subsystem/${id}`,
        {
          system_id: Number(values.system_id), 
          subsystem_name: values.subsystem_name,
          subsystem_description: values.subsystem_description,
          status: values.status,
          updated_by: user.id,
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      showAlert('Success', 'success', 'Successfully Updated SubSystem');
      router.push('/master_data_subsystem/subsystem_list');
    } catch (err) {
      showAlert(
        err.response?.data?.message || 'Error updating data',
        'error',
        err.response?.data?.error || 'Update Failed'
      );
    }
  };

  return (
    <AuthLayout sidebarList={masterDataList}>
          <div className="py-6">
            <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
              <Paper radius="sm" mt="md" style={{ position: 'relative' }} withBorder>
                <form onSubmit={form.onSubmit(handleSubmit)}>
                  <h1 className="text-center font-bold text-xl mt-2">EDIT MASTER SUBSYSTEM</h1>
              {/* System Name dropdown */}
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
                  label="Description"
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
                  onClick={() => router.push('/master_data_subsystem/subsystem_list')}
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

EditSubsystem.title = 'EditSubsystem';
export default EditSubsystem;
