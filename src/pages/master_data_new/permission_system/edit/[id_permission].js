import React, { useEffect, useState } from "react"
import { useRouter } from "next/router"
import axios from "axios"
import {
  Button,
  Paper,
  TextInput,
  Select,
  Group,
  LoadingOverlay
} from "@mantine/core"
import { useForm } from "@mantine/form"
import { IconArrowLeft, IconDeviceFloppy } from "@tabler/icons-react"

import AuthLayout from "@/components/layout/authLayout"
import useApi from "@/hooks/useApi"
import useUser from "@/store/useUser"
import useEncrypt from "@/hooks/useEncrypt"
import useDecrypt from "@/hooks/useDecrypt"
import { userManagementList } from "@/data/sidebar/user_management"
import Swal from "sweetalert2"



EditPermission.title = "Edit Permission"
export default function EditPermission() {

  const router = useRouter()
  const { id_permission } = router.query

  const { user } = useUser()
  const { decrypt } = useDecrypt()
  const API = useApi()
  const API_URL = API.API_URL

  const [loading, setLoading] = useState(true)
  const [idPermissionReal, setIdPermissionReal] = useState(null)

  const form = useForm({
    initialValues: {
      permission_group: "",
      permission_name: "",
      index_key: "",
    },
    validate: {
      permission_group: (value) =>
        value ? null : "Permission group must be filled in",
      permission_name: (value) =>
        value ? null : "Permission name must be filled in",
      index_key: (value) =>
        value ? null : "Index key must be filled in",
    },
  })

  // ================= FETCH DETAIL =================
  useEffect(() => {
  if (user.token && id_permission) {
    const getDetail = async () => {
      try {
        const { data } = await axios.get(
          `${API_URL}/api/portal_permission/${id_permission}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        )

        form.setValues({
          permission_group: data.permission_group || "",
          permission_name: data.permission_name || "",
          index_key: data.index_key || "",
        })

      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    getDetail()
  }
}, [user.token, id_permission])


  // ================= UPDATE =================
  const handleSubmit = async (values) => {

    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to Update Permission Name?',
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
        `${API_URL}/api/portal_permission/${id_permission}`,
        {
          ...values,
          permission_group: values.permission_group,
          permission_name: values.permission_name 
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      )

      router.push("/master_data_new/permission_system/permission_list")
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <AuthLayout sidebarList={userManagementList}>
      <div className="py-6 mt-16">
        <div className="max-w-xl mx-auto">
          <Paper withBorder p="md" radius="md" style={{ position: "relative" }}>
            <LoadingOverlay visible={loading} />

            <h1 className="text-2xl font-bold mb-6 text-center">
              Edit Permission
            </h1>

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <TextInput
                label="Permission Group"
                placeholder="Masukkan Permission Group"
                {...form.getInputProps("permission_group")}
                mb="md"
              />

              <TextInput
                label="Permission Name"
                placeholder="Masukkan Permission Name"
                {...form.getInputProps("permission_name")}
                mb="md"
              />

              <TextInput
                label="Index Key"
                placeholder="Masukkan Index Key"
                {...form.getInputProps("index_key")}
                mb="md"
                disabled
              />

              <Group justify="space-between" mt="lg">
                <Button
                  color="red"
                  leftSection={<IconArrowLeft size={16} />}
                  onClick={() => router.back()}
                >
                  Back
                </Button>

                <Button
                  type="submit"
                  leftSection={<IconDeviceFloppy size={16} />}
                >
                  Save Changes
                </Button>
              </Group>
            </form>
          </Paper>
        </div>
      </div>
    </AuthLayout>
  )
}