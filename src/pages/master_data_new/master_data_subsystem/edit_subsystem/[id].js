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
import Swal from 'sweetalert2';



// --- SSR
export async function getServerSideProps({ params }) {
  return { props: { id: params.id } };
}

export default function EditSubsystem({ id }) {
  const { user } = useUser();
  const router = useRouter();
  const API = useApi();
  const API_URL = API.API_URL;
  const { showAlert } = useSwal();

  const form = useForm({
    initialValues: {
      system_id: '',
      subsystem_name: '',
      subsystem_description: '',
      status: 'Active',
    },
  });

  const [systems, setSystems] = useState([]);

  // --- Fetch system dropdown (SAMA dengan ADD)
  useEffect(() => {
    if (!user?.token) return;

    const fetchSystems = async () => {
      const res = await axios.get(
        `${API_URL}/api/master_system/dropdown`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      const list = res.data?.content ?? res.data;

      setSystems(
        list.map((s) => ({
          value: s.id.toString(),
          label: s.system_name,
        }))
      );
    };

    fetchSystems();
  }, [user?.token, API_URL]);

  // --- Fetch detail subsystem
  useEffect(() => {
    if (!user?.token || !id) return;

    const fetchDetail = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/master_subsystem/${id}`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );

        form.setValues({
          system_id: res.data.system?.id?.toString() || '',
          subsystem_name: res.data.subsystem_name || '',
          subsystem_description: res.data.subsystem_description || '',
          status: res.data.status || 'Active',
        });
      } catch (err) {
        showAlert('Failed to fetch data', 'error');
      }
    };

    fetchDetail();
  }, [user?.token, id]);

  // --- Submit
  const handleSubmit = async (values) => {

    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to update this subsystem?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#ef4444',
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.put(
        `${API_URL}/api/master_subsystem/${id}`,
        {
          system_id: Number(values.system_id), // ✅
          subsystem_name: values.subsystem_name,
          subsystem_description: values.subsystem_description,
          status: values.status,
          updated_by: user.id,
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      showAlert('Success', 'success', 'Subsystem Successfully To Update');
      router.push('/master_data_new/master_data_subsystem/subsystem_list');
    } catch (err) {
      showAlert('Update gagal', 'error');
    }
  };

  return (
    <AuthLayout sidebarList={masterDataList}>
      <div className="py-14">
        <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
          <Paper withBorder radius="sm">
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <h1 className="text-center font-bold text-xl mt-4">
                EDIT MASTER SUBSYSTEM
              </h1>

              <div className="p-4">
                <Select
                  label="System"
                  data={systems}
                  withAsterisk
                  {...form.getInputProps('system_id')}
                />
              </div>

              <div className="p-4">
                <TextInput
                  label="Subsystem Name"
                  withAsterisk
                  {...form.getInputProps('subsystem_name')}
                />
              </div>

              <div className="p-4">
                <Textarea
                  label="Description"
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
                  color="green"
                  ml="sm"
                  leftSection={<IconEdit />}
                >
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
