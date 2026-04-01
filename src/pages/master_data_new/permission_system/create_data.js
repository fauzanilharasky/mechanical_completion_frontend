import AuthLayout from '@/components/layout/authLayout'
import { masterDataList } from '@/data/sidebar/master-data'
import { Button, Paper, TextInput, Textarea, Select } from '@mantine/core'
import { formRootRule, useForm, isNotEmpty } from '@mantine/form'
import { useRouter } from 'next/router'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { IconArrowLeft, IconMinus, IconPlaylistAdd, IconPlus, IconArrowBack } from '@tabler/icons-react'
import useApi from '@/hooks/useApi'
import useSwal from '@/hooks/useSwal'
import useUser from '@/store/useUser'
import { userManagementList } from '@/data/sidebar/user_management'

Create_Data.title = "Create Data Permissions"

export default function Create_Data() {
  const router = useRouter()
  const API = useApi()
  const { showAlert } = useSwal()
  const { user } = useUser()

  const form = useForm({
    initialValues: {
        app_name: '',
        status: 'Active',
        }
        
    });

  //  handle submit
const handleSubmit = async (values) => {
  try {

    await axios.post(
      `${API.API_URL}/api/portal_app_permission/create_permissions`,
      {
        ...values,
        created_date: new Date(),
      },
      {
        headers: { Authorization: `Bearer ${user.token}` },
      }
    );

    showAlert('Added Permission Data successfully!', 'success');
    router.push('/master_data_new/permission_system/permission_list');
  } catch (error) {
    const data_error = error.response?.data || {};
    console.log(error.message);
    showAlert(
      data_error.message || 'Error adding data',
      'error',
      data_error.error || 'Create failed'
    );
  }
};





  return (
    <AuthLayout sidebarList={userManagementList}>
      <div className="py-6">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" p="lg" withBorder>
            <h1 className="font-bold text-center mb-6 text-xl">
              Add Application Name 
            </h1>

            <form className="space-y-4" onSubmit={form.onSubmit(handleSubmit)}>
              <TextInput
                label="Application Name"
                placeholder="Enter App Name"
                required
                {...form.getInputProps('app_name')}
              />

                <div className="flex justify-end space-x-2 mt-4">
                    <Button
                    variant="outline"
                    color="red"
                    onClick={() =>
                        router.push(
                        '/master_data_new/permission_system/permission_list')}
                        leftSection = {<IconArrowBack/>}>
                    Cancel
                    </Button>
                    <Button type="submit" color="blue" leftSection = {<IconPlaylistAdd/>}>
                    Save
                    </Button>
                </div>
                </form>
            </Paper>
            </div>
        </div>
        </AuthLayout>
    )
}