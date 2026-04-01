import AuthLayout from '@/components/layout/authLayout';
import { rfiSubmissionList } from '@/data/sidebar/rfi-submission';
import useApi from '@/hooks/useApi';
import useEncrypt from '@/hooks/useEncrypt';
import useUser from '@/store/useUser';
import { Button, Grid, Paper, Select } from '@mantine/core';
import { IconFileExcel } from '@tabler/icons-react';
import axios from 'axios';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import NoPermissionCard from '@/components/card_permission';
import { usePermissions } from '@/hooks/usePermissions';

export default function ExportExcel() {
  const { user } = useUser();
  const API = useApi();
  const API_URL = API.API_URL;
  const { encrypt } = useEncrypt();

  // ================= STATE OPTION =================
  const [projectOptions, setProjectOptions] = useState([]);
  const [disciplineOptions, setDisciplineOptions] = useState([]);
  const [typeModuleOptions, setTypeModuleOptions] = useState([]);
  const [moduleOptions, setModuleOptions] = useState([]);
  const [LocationOptions, setLocationOptions] = useState([]);


  // PERMISSIONS 
      const hasViewPermission = usePermissions([37]);


  // ================= STATE FORM =================
  const [form, setForm] = useState({
    project: "",
    discipline: "",
    type_of_module: "",
    module: "",
    // company: "",
    location: "",
    status_inspection: "",
  });

  // ================= STATIC STATUS =================
  const statusOptions = [
    { value: "0", label: "Pending Submission by Spv" },
    { value: "1", label: "Submission By Spv" },
    { value: "2", label: "Reject By Spv" },
    { value: "3", label: "Pending By QC" },
    { value: "4", label: "Reject By QC" },
    { value: "5", label: "Approve By QC" },
    { value: "6", label: "Pending By Client" },
    { value: "7", label: "Reject By Client" },
    { value: "8", label: "Approve By Client" },
  ];

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ================= FETCH FUNCTIONS =================

  const fetchProjects = async () => {
    if (!user?.token) return;
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

  const fetchDisciplines = async () => {
    if (!user?.token) return;
    const res = await axios.get(`${API_URL}/api/master_discipline/select`, {
      headers: { Authorization: `Bearer ${user?.token}` },
    });

    setDisciplineOptions(
      res.data.data.map((i) => ({
        value: String(i.id),
        label: i.discipline_name,
      }))
    );
  };

  const fetchTypeModules = async (projectId) => {
    if (!user?.token) return;
    const res = await axios.get(`${API_URL}/api/master_type_module/select`, {
      params: { project_id: projectId },
      headers: { Authorization: `Bearer ${user?.token}` },
    });

    setTypeModuleOptions(
      res.data.data.map((i) => ({
        value: String(i.id),
        label: i.name,
      }))
    );
  };

  const fetchModules = async (typeModuleId) => {
    if (!user?.token) return;
    const res = await axios.get(`${API_URL}/api/master_module/select`, {
      params: { type_module_id: typeModuleId },
      headers: { Authorization: `Bearer ${user?.token}` },
    });

    setModuleOptions(
      res.data.data.map((i) => ({
        value: String(i.mod_id),
        label: i.mod_desc,
      }))
    );
  };

  const fetchLocations = async () => {
    if (!user?.token) return;
    const res = await axios.get(`${API_URL}/api/master_location/select`, {
      headers: { Authorization: `Bearer ${user?.token}` },
    });

    setLocationOptions(
      res.data.data.map((i) => ({
        value: String(i.id),
        label: i.name,
      }))
    );
  };

  // ================= USE EFFECT =================

  useEffect(() => {
    if (!user?.token) return;
    fetchDisciplines();
    fetchTypeModules();
    fetchModules();
    fetchProjects();
    fetchLocations();
    // fetchCompanies();
  }, [user?.token]);


  // ================= EXPORT =================

 const handleGenerate = async () => {
  try {
    const payload = {};

    if (form.discipline)
      payload.discipline = Number(form.discipline);

    if (form.project)
      payload.project = Number(form.project);

    if (form.type_of_module)
      payload.type_of_module = Number(form.type_of_module);

    if (form.module)
      payload.module = Number(form.module);

    if (form.location)
      payload.location = Number(form.location);

    if (form.status_inspection !== "" && form.status_inspection !== null) {
      payload.status_inspection = Number(form.status_inspection);
    }


    const response = await axios.post(
      `${API_URL}/api/pcms_mc_template/export_fitup`,
      payload,
      {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      }
    );

    const today = new Date().toISOString().split("T")[0];
    const fileName = `Export_Fitup_${today}.xlsx`;

    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Swal.fire({
      icon: "success",
      text: "Excel generated successfully",
    });
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Export Failed",
      text: "Data not found or server error",
    });
  }
};


  // ================= RENDER =================

  return (
    <AuthLayout sidebarList={rfiSubmissionList}>
      {hasViewPermission ? (
      <>
      <Head>
        <title>Export To Excel</title>
      </Head>

      <div className=" py-16 px-20 @container">
        <Paper shadow="xl" withBorder p="xl">

          <div withBorder className="p-4 border-b flex justify-start bg-blue-800">
            <h1 className='text-center text-white font-medium'> EXPORT TO EXCEL | FitUp Excel </h1>
          </div>    
          <Grid className='mt-10' gutter={"lg"}>
            <Grid.Col span={6}>
              <Select
                label="Project :"
                placeholder="--- Select Project Name ---"
                data={projectOptions}
                value={form.project}
                onChange={(v) => { handleChange("project", v);
                  if (v) fetchProjects(Number(v));
                  else setProjectOptions([]);
                }}
                searchable
                clearable
                nothingFound="No project found"
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <Select
                label="Discipline :"
                placeholder='--- Select Discipline ---'
                data={disciplineOptions}
                value={form.discipline}
                onChange={(v) => { handleChange("discipline", v);
                  if (v) fetchDisciplines(Number(v));
                  else setDisciplineOptions([]);
                }}
                searchable
                clearable
                nothingFound="No discipline found"

              />
            </Grid.Col>

            <Grid.Col span={6}>
              <Select
                label="Type Module :"
                placeholder='--- Select Type Module ---'
                data={typeModuleOptions}
                value={form.type_of_module}
                onChange={(v) => handleChange("type_of_module", v)}
                clearable
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <Select
                label="Module :"
                placeholder='--- Select Module ---'
                data={moduleOptions}
                value={form.module}
                onChange={(v) => { handleChange("module", v);
                  if (v) fetchModules(Number(v));
                  else setModuleOptions([]);
                }}
                 searchable
                clearable
                nothingFound="No Module found"
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <Select
                label="Location :"
                placeholder='--- Select Location ---'
                data={LocationOptions}
                value={form.location}
                onChange={(v) => { handleChange("location", v);
                  if (v) fetchLocations(Number(v));
                  else setLocationOptions([]);
                }}
                searchable
                clearable
                nothingFound="No Location found"
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <Select
                label="Status Submission :"
                placeholder='--- Select Status Submission ---'
                data={statusOptions}
                value={form.status_inspection}
                onChange={(v) => handleChange("status_inspection", v)}
                clearable
                searchable
                nothingFound= "No Status Submission"
              />
            </Grid.Col>
          </Grid>

          <div className="mt-10 flex justify-end">
            <Button
              color="green"
              leftSection={<IconFileExcel size={16} />}
              onClick={handleGenerate}
            >
              Generate To Excel
            </Button>
          </div>
        </Paper>
      </div>
      </>
      ) : (
      <NoPermissionCard />
      )}
    </AuthLayout>
  );
}

