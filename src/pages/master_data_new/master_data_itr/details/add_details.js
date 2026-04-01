import AuthLayout from '@/components/layout/authLayout'
import { masterDataList } from '@/data/sidebar/master-data'
import { Button, Paper, TextInput, Textarea} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useRouter } from 'next/router'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { IconArrowBack, IconArrowLeft, IconPlaylistAdd, IconPlus } from '@tabler/icons-react'
import useApi from '@/hooks/useApi'
import useSwal from '@/hooks/useSwal'
import useUser from '@/store/useUser'
import useEncrypt from "@/hooks/useEncrypt"

Add_Details.title = "Add Master Checklist"

export default function Add_Details() {
  const router = useRouter()
  const { form_id } = router.query
  const { encrypt } = useEncrypt()

  const API = useApi()
  const { showAlert } = useSwal()
  const { user } = useUser()

  const form = useForm({
    initialValues: {
      group_name: '',
      item_no: '',
      description: '',
    },
  })

  // VALIDASI FORM ID
  useEffect(() => {
    if (!router.isReady) return

    if (!form_id) {
      showAlert('Form ID tidak ditemukan', 'error')
      router.replace('/master_data_new/master_data_itr/master_system')
    }
  }, [router.isReady, form_id])

  const handleSubmit = async (values) => {
    if (!form_id) return

    try {
      await axios.post(
        `${API.API_URL}/api/master_checklist/create`,
        {
          ...values,
          form_id: form_id,
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      )

      showAlert('Successfully To Add Data', 'success')
      router.push(
        `/master_data_new/master_data_itr/details/${form_id}`
      )
    } catch (error) {
      console.log(error)
      showAlert(
        error.response?.data?.message || 'Create failed',
        'error'
      )

    }
  }

  if (!router.isReady || !form_id) return null


  return (
    <AuthLayout sidebarList={masterDataList}>
      <div className="py-6">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" p="lg" withBorder>
            <h1 className="font-bold text-center mb-6 text-xl">
              Add Form Checklist
            </h1>

            <form className="space-y-4" onSubmit={form.onSubmit(handleSubmit)}>
              <TextInput
                label="Item No"
                placeholder="Enter Item No"
                required
                {...form.getInputProps('item_no')}
              />

              <TextInput
                label="Group Name"
                placeholder="Enter Group Name"
                required
                {...form.getInputProps('group_name')}
              />

              <Textarea
                label=" Description"
                placeholder="Enter Description"
                {...form.getInputProps('description')}
              />


              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  color="red"
                  onClick={() =>
                    router.push(`/master_data_new/master_data_itr/details/${form_id}`)}
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
