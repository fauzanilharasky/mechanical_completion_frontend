import AuthLayout from "@/components/layout/authLayout";
import { userManagementList } from "@/data/sidebar/user_management";
import { Button, Paper, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import axios from "axios";
import { IconArrowLeft, IconPlaylistAdd } from "@tabler/icons-react";
import useApi from "@/hooks/useApi";
import useSwal from "@/hooks/useSwal";
import useUser from "@/store/useUser";
import useEncrypt from "@/hooks/useEncrypt";

Add_Permission.title = "Add Permission";

export default function Add_Permission() {
  const router = useRouter();
  const { id_app_permission } = router.query; // ini sebenarnya id_application terenkripsi
  const { encrypt } = useEncrypt();

  const API = useApi();
  const { showAlert } = useSwal();
  const { user } = useUser();

  const form = useForm({
    initialValues: {
      permission_name: "",
      permission_group: "",
    //   index_key: "",
    },
  });

  // VALIDASI ID DARI URL
  useEffect(() => {
    if (!router.isReady) return;

    if (!id_app_permission) {
      showAlert("Application ID tidak ditemukan", "error");
      router.replace("/master_data_new/permission_system/permission_list");
    }
  }, [router.isReady, id_app_permission]);

  const handleSubmit = async (values) => {
    if (!id_app_permission) return;

    try {
      await axios.post(
        `${API.API_URL}/api/portal_permission/create`,
        {
          ...values,
          id_app_permission: id_app_permission,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      showAlert("Successfully Added Permission", "success");

      router.push(
        `/master_data_new/permission_system/permission/${id_app_permission}`
      );
    } catch (error) {
      console.log(error);
      showAlert(
        error.response?.data?.message || "Create failed",
        "error"
      );
    }
  };

  if (!router.isReady || !id_app_permission) return null;

  return (
    <AuthLayout sidebarList={userManagementList}>
      <div className="py-6">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" p="lg" withBorder>
            <h1 className="font-bold text-center mb-6 text-xl">
              Add Permission
            </h1>

            <form
              className="space-y-4"
              onSubmit={form.onSubmit(handleSubmit)}
            >
              <TextInput
                label="Permission Group"
                placeholder="Enter Permission Group"
                required
                {...form.getInputProps("permission_group")}
              />

              <TextInput
                label="Permission Name"
                placeholder="Enter Permission Name"
                required
                {...form.getInputProps("permission_name")}
              />

              {/* <TextInput
                label="Index Key"
                placeholder="Enter Index Key"
                required
                {...form.getInputProps("index_key")}
              /> */}

              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  color="red"
                  leftSection={<IconArrowLeft />}
                  onClick={() =>
                  router.push(`/master_data_new/permission_system/permission/${id_app_permission}`)
                }
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  color="blue"
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