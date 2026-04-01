import AuthLayout from '@/components/layout/authLayout'
import useApi from '@/hooks/useApi'
import useSwal from '@/hooks/useSwal'
import { masterDataList } from '@/data/sidebar/master-data'
import useUser from '@/store/useUser'
import { Button, Text, TextInput, Select } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useEffect, useState } from "react"
import axios from 'axios'
import { useRouter } from 'next/router'
import React from 'react'

Add_Data.title = "Add Master System"
export default function Add_Data() {
  const router = useRouter()
  const { user } = useUser()
  const API = useApi()
  const API_URL = API.API_URL
  const { showAlert } = useSwal()

  const [projectOptions, setProjectOptions] = useState([]) 

  const form = useForm({
    initialValues: {
      project_id: Number,    
      system_name: '',
      description: ''
    },
    validate: {
      project_id: (value) => (value ? null : 'Project Name Required'),
      system_name: (value) => (value.trim().length > 0 ? null : 'System Name is Required'),
    }
  })

  

  const fetchProjects = async () => {
      const res = await axios.get(`${API_URL}/api/project/select`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
  
      setProjectOptions(
        res.data.data.map((i) => ({
          value: String(i.id),
          label: i.project_name,
        }))
      );
    };


    useEffect(() => {
      fetchProjects();
    }, []);
      


  const handleSubmit = async (values) => {
    const confirmSubmit = window.confirm("Are you sure you want to submit this data?");
    if (!confirmSubmit) return;

    try {
      const payload = {
       project_id: values.project_id,
       system_name: values.system_name,
       description: values.description,
       created_by: values.created_by
     };

     const { data } = await axios.post(
       `${API_URL}/api/master_system/create`,
       payload,
       {
         headers: {
           Authorization: "Bearer " + user.token,
         },
       }
     );

      if (data) {
       // show alert then navigate after short delay so user sees it
        showAlert(data.message || "data added successfully", "success");
        form.reset();
        await new Promise((resolve) => setTimeout(resolve, 700));
        router.push("/master_data/master_system/master_data_list");
      }
    } catch (error) {
      const data_error = error.response?.data;
      showAlert(data_error?.message || "Error", "error", data_error?.error || "Something went wrong");
    }
  }

  return (
    <AuthLayout sidebarList={masterDataList}>
      <div className="flex justify-center items-start py-12">
        <div className="w-full max-w-md bg-white shadow-lg border sm:rounded-lg">
          <div className="p-6 text-gray-900 text-center border-b">
            <Text fw={600} fz="lg">Add Data</Text>
          </div>

          <form onSubmit={form.onSubmit(handleSubmit)} className="p-6">

            <div className="mb-4">
              <Select
                label="Project Name"
                withAsterisk
                placeholder="Select Project"
                data={projectOptions}
                searchable
                nothingFound="No projects found"
                {...form.getInputProps('project_id')}
              />
            </div>

            <div className="mb-4">
              <TextInput
                label="System Name"
                withAsterisk
                placeholder='Input System Name'
                {...form.getInputProps('system_name')}
              />
            </div>

            <div className="mb-4">
              <TextInput
                label="Description"
                withAsterisk
                placeholder='Input Description'
                {...form.getInputProps('description')}
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                color="red"
                onClick={() => {
                  const confirmCancel = window.confirm("Are you sure you want to cancel?");
                  if (confirmCancel) {
                    router.back();
                  }
                }}
              >
                Cancel
              </Button>
              <Button 
              type="submit"
              >
                Submit
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AuthLayout>
  )
}
