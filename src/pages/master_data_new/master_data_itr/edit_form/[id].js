import AuthLayout from '@/components/layout/authLayout';
import useApi from '@/hooks/useApi';
import useSwal from '@/hooks/useSwal';
import useUser from '@/store/useUser';
import { Button, Paper, TextInput, Textarea, Select } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlignLeft, IconArrowBack, IconEdit, IconPlus, IconMinus } from '@tabler/icons-react';
import axios from 'axios';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { masterDataList } from '@/data/sidebar/master-data';
import Swal from 'sweetalert2';




export async function getServerSideProps({ params }) {
  return {
    props: { id_master: params.id },
  };
}

function Edit_master({ id_master }) {
  const { user } = useUser();
  const router = useRouter();
  const API = useApi();
  const API_URL = API.API_URL;
  const { showAlert } = useSwal();

  const form = useForm({
    initialValues: {
      cert_id: '',
      form_code: '',
      phase_id: null,
      discipline: null,
      activity_description: '',
      inspection_type: '',
      status_delete: '',
      options: [], // jadi array untuk multiple input
    },
    validate: {
      cert_id: (value) => (value.trim().length > 0 ? null : 'Cert ID is required'),
      form_code: (value) => (value.trim().length > 0 ? null : 'Form Code is required'),
    },
  });

  const [options, setOptions] = useState(['']);
  const [phaseList, setPhaseList] = useState([]);
  const [disciplineList, setDisciplineList] = useState([]); 

 useEffect(() => {
  if (user.token && id_master) {
    const getDetail = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/master_form/${id_master}`, {
          headers: {
            Authorization: 'Bearer ' + user.token,
          },
        });

        let optionData = [];
        if (Array.isArray(res.data.options)) {
          optionData = res.data.options;
        } else if (typeof res.data.options === "string") {
          // pecah string jadi array
          optionData = res.data.options.split(";").map(opt => opt.trim());
        } else {
          optionData = [""];
        }

        setOptions(optionData);

        form.setValues({
          cert_id: res.data.cert_id || '',
          form_code: res.data.form_code || '',
          phase_id: res.data.phase?.id || 0,
          discipline: res.data.discipline_rel?.id || 0,
          activity_description: res.data.activity_description || '',
          inspection_type: res.data.inspection_type || '',
          status_delete: res.data.status_delete?. toString() || 0,
          options: optionData,
        });
      } catch (error) {
        const data_error = error.response?.data || {};
        showAlert(data_error.message || 'Failed to retrieve data', 'error', data_error.error || 'Fetch Failed');
      }
    };

    const getPhase = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/master_phase`, {
          headers: {
            Authorization: 'Bearer ' + user.token,
          },
        });
        setPhaseList(res.data);
      } catch (error) {
        const data_error = error.response?.data || {};
        showAlert(data_error.message || 'Failed to retrieve data', 'error', data_error.error || 'Fetch Failed');
      }
    };

    const getDiscipline = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/master_discipline`, {
          headers: {
            Authorization: 'Bearer ' + user.token,
          },
        });
        setDisciplineList(res.data);
      } catch (error) {
        const data_error = error.response?.data || {};
        showAlert(data_error.message || 'Failed to retrieve data', 'error', data_error.error || 'fetch failed');
      }
    }
    getDiscipline();
    getPhase();
    getDetail();
  };
}, [user.token, API_URL, id_master]);

  const handleAddOption = () => {
  setOptions([...options, ''])
  };

  const handleOptionChange = (value, index) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
    form.setFieldValue('options', newOptions);
  };

  const handleSubmit = async (values) => {

    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to Update data ITR?',
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
        `${API_URL}/api/master_form/${id_master}`,
        {
          ...values,
          options,
          updated_by: user.id,
        },
        {
          headers: { Authorization: 'Bearer ' + user.token },
        }
      );

     showAlert('Data updated successfully!', 'success', 'Success');
      router.push('/master_data_new/master_data_itr/edit_form/' + id_master);
    } catch (error) {
      const data_error = error.response?.data || {};
      showAlert(data_error.message || 'Error updating data', 'error', data_error.error || 'Update Failed');
    }
  };

  return (
    <AuthLayout sidebarList={masterDataList}>
      <div className="py-8 mb-8">
        <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" style={{ position: 'relative' }} withBorder>
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <h1 className="text-center font-bold text-xl mt-2">EDIT MASTER DATA ITR</h1>

              <div className="p-4">
                <TextInput label="Cert ID" withAsterisk disabled {...form.getInputProps('cert_id')} />
              </div>

              <div className="p-4">
                <TextInput label="Form Code" withAsterisk disabled {...form.getInputProps('form_code')} />
              </div>

              <div className="p-4">
                <Select label="Phase" placeholder="Choose your Phase" data={phaseList.map((p) => ({
                  value: p.id.toString(), label: p.phase_name,}))} value={form.values.phase_id?.toString() || null}
                  onChange={(value) => form.setFieldValue('phase_id', parseInt(value))}/>
              </div>

              <div className="p-4">
                <Select label="Discipline" placeholder="Choose your Discipline"
                data={disciplineList.map((d) => ({value: d.id.toString(), label: d.discipline_name,}))}
                value={form.values.discipline?.toString() || null} onChange={(value) => form.setFieldValue('discipline', parseInt(value))}/>
              </div>

              <div className="p-4">
                <Textarea label="Activity Description" {...form.getInputProps('activity_description')} />
              </div>

              <div className="p-4">
                <TextInput label="Inspection Type" {...form.getInputProps('inspection_type')} />
              </div>

              <div className="p-4">
                <Select label="Status" placeholder="Select status" data={[ 
                  { value: '1', label: 'Active' }, { value: '0', label: 'Inactive' }, ]}
                  {...form.getInputProps('status_delete')}
                  />
              </div>

             <div className="p-4">
              <label className="font-medium mb-2 block">Options</label>
              {options.map((opt, index) => (
                <div key={index} className="flex items-center mb-2 space-x-2">
                  <TextInput placeholder="Enter options (eg: ok, a/n, PL, etc)" value={opt} 
                  onChange={(e) => handleOptionChange(e.target.value, index)} className="flex-1"/>
                  <Button
                  variant="outline" color="red" size="xs" onClick={() => { 
                    const newOptions = options.filter((_, i) => i !== index); 
                    setOptions(newOptions); 
                    form.setFieldValue("options", newOptions); }}>
                      <IconMinus size={14} />
                  </Button>
                  </div>
                ))}

                <Button
                variant="outline"color="blue" size="xs" leftSection={<IconPlus size={15} />} onClick={handleAddOption}>
                  Add Option
                </Button>
                </div>

              <div className="px-4 py-2 text-right">
                <Button
                  className="mr-2"
                  variant="outline"
                  color="red"
                  onClick={() => router.push('/master_data_new/master_data_itr/master_system')}
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

Edit_master.title = 'Edit Master Form';
export default Edit_master;
