import AuthLayout from '@/components/layout/authLayout'
import { masterDataList } from '@/data/sidebar/master-data'
import { Button, Paper, TextInput, Textarea, Select } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useRouter } from 'next/router'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { IconArrowLeft, IconMinus, IconPlaylistAdd, IconPlus, IconArrowBack } from '@tabler/icons-react'
import useApi from '@/hooks/useApi'
import useSwal from '@/hooks/useSwal'
import useUser from '@/store/useUser'

Add_Master.title = "Add Master System"

export default function Add_Master() {
  const router = useRouter()
  const API = useApi()
  const { showAlert } = useSwal()
  const { user } = useUser()
  const [phaseList, setPhaseList] = useState([])
  const [disciplineList, setDisciplineList] = useState([])

  const form = useForm({
    initialValues: {
      cert_id: '',
      form_code: '',
      phase_id: 0,
      discipline: 0,
      activity_description: '',
      inspection_type: '',
      options: [],
    },
  })

  const [options, setOptions] = useState([])

  
  useEffect(() => {
    if (!user?.token) return

    const getPhase = async () => {
      try {
        const res = await axios.get(`${API.API_URL}/api/master_phase`, {
          headers: { Authorization: `Bearer ${user.token}` },
        })
        if (Array.isArray(res.data)) {
          setPhaseList(res.data)
        } else {
          showAlert('Data phase tidak valid', 'error')
        }
      } catch (error) {
        const data_error = error.response?.data || {}
        showAlert(
          data_error.message || error.message || 'Gagal ambil data phase',
          'error'
        )
      }
    }

    const getDiscipline = async () => {
      try {
        const res = await axios.get(`${API.API_URL}/api/master_discipline`, {
          headers: { Authorization: `Bearer ${user.token}` },
        })
        if (Array.isArray(res.data)) {
          setDisciplineList(res.data)
        } else {
          showAlert('Data discipline tidak valid', 'error')
        }
      } catch (error) {
        const data_error = error.response?.data || {}
        showAlert(
          data_error.message || error.message || 'Failed To Get Data discipline',
          'error'
        )
      }
    }

    getPhase()
    getDiscipline()
  }, [user?.token, API.API_URL])

 
  const handleAddOption = () => {
  setOptions([...options, ''])
  }

 
  const handleOptionChange = (value, index) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
    form.setFieldValue('options', newOptions)
  }

  //  handle submit
const handleSubmit = async (values) => {
  try {
    const cleanedOptions = options.map(opt => opt.trim()).filter(Boolean);

    const OptionsString = cleanedOptions.join(",");

    await axios.post(
      `${API.API_URL}/api/master_form/create`,
      {
        ...values,
        options: OptionsString, 
        created_by: user.id,
      },
      {
        headers: { Authorization: `Bearer ${user.token}` },
      }
    );

    showAlert('Data added successfully!', 'success');
    router.push('/master_data_new/master_data_itr/master_system');
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
    <AuthLayout sidebarList={masterDataList}>
      <div className="py-8 mb-8">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" p="lg" withBorder>
            <h1 className="font-bold text-center mb-6 text-xl">
              Add Master Data ITR
            </h1>

            <form className="space-y-4" onSubmit={form.onSubmit(handleSubmit)}>
              <TextInput
                label="Cert ID"
                placeholder="Enter Cert ID"
                required
                {...form.getInputProps('cert_id')}
              />

              <TextInput
                label="Form Code"
                placeholder="Enter Form Code"
                required
                {...form.getInputProps('form_code')}
              />

              <Select
                label="Phase"
                placeholder="Select Phase"
                data={phaseList.map((p) => ({
                  value: p.id.toString(),
                  label: p.phase_name,
                }))}
                value={form.values.phase_id?.toString() || null}
                onChange={(value) =>
                  form.setFieldValue('phase_id', parseInt(value))
                }
                required
              />

              <Select
                label="Discipline"
                placeholder="Select Discipline"
                data={disciplineList.map((d) => ({
                  value: d.id.toString(),
                  label: d.discipline_name,
                }))}
                value={form.values.discipline?.toString() || null}
                onChange={(value) =>
                  form.setFieldValue('discipline', parseInt(value))
                }
                required
              />

              <Textarea
                label="Activity Description"
                placeholder="Enter Description"
                {...form.getInputProps('activity_description')}
              />

              <TextInput
                label="Inspection Type"
                placeholder="Enter Inspection Type"
                {...form.getInputProps('inspection_type')}
              />

              {/* Options multiple input */}
              <div>
                <label className="font-medium mb-2 block">Options</label> {options.map((opt, index) => (
                  <div key={index} className="flex items-center mb-2 space-x-2">
                    <TextInput
                    placeholder="Enter options (eg: ok, a/n, PL, etc)"
                    value={opt}
                    onChange={(e) => handleOptionChange(e.target.value, index)} className="flex-1"/>
                    <Button variant="outline" color="red" size="xs" onClick={() => {
                      const newOptions = options.filter((_, i) => i !== index) 
                      setOptions(newOptions)
                      form.setFieldValue('options', newOptions)
                    }}>
                      <IconMinus size={14} />
                    </Button>
                      </div>
                    ))}
                    <Button variant="outline" color="blue" size="xs" leftSection={<IconPlus size={16} />}
                    onClick={handleAddOption}>
                      Add Option
                    </Button>
                    </div>


              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  color="red"
                  onClick={() =>
                    router.push(
                      '/master_data_new/master_data_itr/master_system')}
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