import AuthLayout from '@/components/layout/authLayout'
import { tagNumberList } from '@/data/sidebar/tag-number'
import { itrAssignmentList } from '@/data/sidebar/itr-assignmen'
import useApi from '@/hooks/useApi'
import useUser from '@/store/useUser'
import { Button, Paper } from '@mantine/core'
import { IconArrowBack, IconEditCircle } from '@tabler/icons-react'
import axios from 'axios'
import { useRouter } from 'next/router'
import React, { useEffect, useMemo, useState } from 'react'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import Datatables from '@/components/custom/Datatables'
import Swal from 'sweetalert2'
import { info } from 'autoprefixer'

Assignment_Itr_edit.title = 'Assignment ITR Edit'

export default function Assignment_Itr_edit() {
  const router = useRouter()
  const { user } = useUser()
  const API = useApi()
  const API_URL = API.API_URL

  const [data, setData] = useState([])
  const [editingCell, setEditingCell] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [sorting, setSorting] = useState([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [hasChanges, setHasChanges] = useState(false)
  const [dropdownUsers, setDropdownUsers] = useState([]);


  // Master data
  const [discipline, setDiscipline] = useState([])
  const [typeModuleList, setTypeModule] = useState([])
  const [moduleList, setModuleList] = useState([])
  const [subsystemList, setSubsystemList] = useState([])
  const [projects, setProjects] = useState([])
  const [companies, setCompanies] = useState([])

  // Mapping kolom ke field backend
  const fieldMap = {
    discipline: 'discipline',
    module: 'module',
    type_of_module: 'type_of_module',
    subsystem: 'subsystem',
    company_id: 'company_id',
  }

  /** Fetch master data */
  useEffect(() => {
    if (user?.token) {
      const fetcher = async (url, setter) => {
        try {
          const res = await axios.get(`${API_URL}${url}`, {
            headers: { Authorization: `Bearer ${user.token}` },
          })
          setter(Array.isArray(res.data) ? res.data : res.data.data || [])
        } catch (err) {
          console.error(err)
        }
      }
      fetcher('/api/master_discipline', setDiscipline)
      fetcher('/api/master_type_module', setTypeModule)
      fetcher('/api/master_module', setModuleList)
      fetcher('/api/master_subsystem', setSubsystemList)
      fetcher('/api/dropdown-assign', setDropdownUsers)

      //relasi database 
      fetcher('/api/pcms_mc_template/dropdown-data', (res) => {
      setProjects(res.projects || [])
      setCompanies(res.companies || [])
    })
    }
  }, [user?.token, API_URL])

  /** Resolve update state local */
  const resolveUpdate = (row, columnId, value) => {

    if (columnId === 'project_id') {
      const selected = projects.find((p) => p.id === parseInt(value))
      return {
        ...row,
        project_name: selected ? selected.project_name : row.project_name,
        project_id: selected ? selected.id : value,
      }
    }

    if (columnId === 'company_id') {
      const selected = companies.find((c) => c.id_company === parseInt(value))
      return {
        ...row,
        company_name: selected ? selected.company_name : row.company_name,
        company_id: selected ? selected.id_company : value,
      }
    }

    if (columnId === 'production_assigned_to') {
      const selected = dropdownUsers.find((u) => u.id_user === value);
      return {
      ...row,
      production_assigned_to: value,
      assigned_to_fullname: selected?.full_name || null,
      };
    }


    if (columnId === 'discipline') {
      const selected = discipline.find((d) => d.id === parseInt(value))
      return {
        ...row,
        discipline_tag: selected
          ? { id: selected.id, discipline_name: selected.discipline_name }
          : null,
      }
    }
    if (columnId === 'type_of_module') {
      const selected = typeModuleList.find((t) => t.id === parseInt(value))
      return {
        ...row,
        typeModule: selected 
        ? { id: selected.id, name: selected.name } : null,
      }
    }
    if (columnId === 'module') {
      const selected = moduleList.find((m) => m.mod_id === parseInt(value))
      return {
        ...row,
        templates_md: selected
          ? { id: selected.mod_id, mod_desc: selected.mod_desc }
          : null,
      }
    }
    if (columnId === 'subsystem') {
      const selected = subsystemList.find((s) => s.id === parseInt(value))
      return {
        ...row,
        subsystem_rel: selected
          ? { id: selected.id, subsystem_name: selected.subsystem_name }
          : null,
      }
    }
    return { ...row, [columnId]: value }
  }

  /** Update API */
  const handleUpdate = async (rowId, columnId, value) => {
    try {
      await axios.put(
        `${API_URL}/api/pcms_mc_template/${rowId}`,
        { [fieldMap[columnId] ?? columnId]: value },
        { headers: { Authorization: `Bearer ${user.token}` } }
      )

      setData((prev) =>
        prev.map((row) =>
          row.id === rowId ? resolveUpdate(row, columnId, value) : row
        )
      )

      setHasChanges(true) // tandai ada perubahan
    } catch (error) {
      console.error(error)
      Swal.fire('Error', 'Failed to update data', 'error')
    }
  }

  /** Fetch bulk data */
  const fetchBulkData = async () => {
    if (router.query.id && user?.token) {
      const ids = router.query.id.split(',')
      try {
        const res = await axios.post(
          `${API_URL}/api/pcms_mc_template/edit_itr`,
          { ids },
          { headers: { Authorization: `Bearer ${user.token}` } }
        )
        setData(res.data || [])
      } catch (err) {
        console.error(err)
      }
    }
  }

  useEffect(() => {
    fetchBulkData()
  }, [router.query.id, API_URL, user?.token])

  /** Columns */
  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.project_name,
        id: 'project_id',
        header: 'Project',
        cell: (info) => renderEditableCell(info, 'project_id'),
      },
      {
        accessorFn: (row) => row.company_name,
        id: 'company_id',
        header: 'Company',
        cell: (info) => renderEditableCell(info, 'company_id'),
      },
      {
        accessorFn: (row) => row.discipline_tag?.discipline_name,
        id: 'discipline',
        header: 'Discipline',
        cell: (info) => renderEditableCell(info, 'discipline'),
      },

      {
        accessorFn: (row) => row.assigned_to_fullname || row.assigned_to?.full_name,
        id: 'production_assigned_to', // match resolveUpdate / update field
        header: "Assigned To",
        cell: (info) => renderEditableCell(info, 'production_assigned_to'),
      },

      {
        accessorFn: (row) => row.templates_md?.mod_desc,
        id: 'module',
        header: 'Module',
        cell: (info) => renderEditableCell(info, 'module'),
      },
      {
        accessorFn: (row) => row.typeModule?.name,
        id: 'type_of_module',
        header: 'Type of Module',
        cell: (info) => renderEditableCell(info, 'type_of_module'),
      },
      {
        accessorFn: (row) => row.drawing_no,
        id: 'drawing_no',
        header: 'Drawing No',
        cell: (info) => renderEditableCell(info, 'drawing_no'),
      },
      {
        accessorFn: (row) => row.tag_number,
        id: 'tag_number',
        header: 'Tag Number',
        cell: (info) => renderEditableCell(info, 'tag_number'),
      },

      
      {
        accessorFn: (row) => row.tag_description,
        id: 'tag_description',
        header: 'Tag Description',
        cell: (info) => renderEditableCell(info, 'tag_description'),
      },
      {
        accessorFn: (row) => row.subsystem_rel?.subsystem_name,
        id: 'subsystem',
        header: 'Subsystem',
        cell: (info) => renderEditableCell(info, 'subsystem'),
      },
      {
        accessorFn: (row) => row.subsystem_description,
        id: 'subsystem_description',
        header: 'Subsystem Description',
        cell: (info) => renderEditableCell(info, 'subsystem_description'),
      },
      
      {
        accessorFn: (row) => row.phase,
        id: 'phase',
        header: 'Phase',
        cell: (info) => renderEditableCell(info, 'phase'),
      },
      {
        accessorFn: (row) => row.location,
        id: 'location',
        header: 'Location',
        cell: (info) => renderEditableCell(info, 'location'),
      },
      {
        accessorFn: (row) => row.model_no,
        id: 'model_no',
        header: 'No Model',
        cell: (info) => renderEditableCell(info, 'model_no'),
      },
      {
        accessorFn: (row) => row.rating,
        id: 'rating',
        header: 'Rating',
        cell: (info) => renderEditableCell(info, 'rating'),
      },
      {
        accessorFn: (row) => row.manufacturer,
        id: 'manufacturer',
        header: 'Manufacturer',
        cell: (info) => renderEditableCell(info, 'manufacturer'),
      },
      {
        accessorFn: (row) => row.remarks,
        id: 'remarks',
        header: 'Remarks',
        cell: (info) =>
          renderEditableCell(info, 'remarks', {
            className:
              'border border-gray-300 p-2 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-400',
          }),
      },
       {
        accessorFn: (row) => row.assignment_status,
        id: "assignment_status",
        header: "Status",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (info) => {
          const value = info.getValue();
          const status = (value === 1 || value === "1")
            ? "Assigned"
            : "Unassigned";

          const colorClass =
            status === "Unassigned"
              ? "bg-white-600 text-red-600 border border-black-500"
              : "bg-green-50 text-green-600 border border-white-300";

            return (
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}
              >
                {status}
      </span>
    );
  },
},

    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editingCell, editValue]
  )

  /** Render editable cell */
  const renderEditableCell = (info, colId) => {
    const rowId = info.row.original.id
    const value = info.getValue()

    // dropdown relasi
    if (
      ['discipline', 'type_of_module', 'module', 'subsystem', 'project_id', 'company_id'].includes(colId) &&
      editingCell?.rowId === rowId &&
      editingCell?.columnId === colId
    ) {
      let options = []
      if (colId === 'discipline') {
        options = discipline.map((d) => ({
          id: d.id,
          name: d.discipline_name,
        }))
      } else if (colId === 'type_of_module') {
        options = typeModuleList.map((t) => ({ id: t.id, name: t.name }))
      } else if (colId === 'module') {
        options = moduleList.map((m) => ({ id: m.mod_id, name: m.mod_desc }))
      } else if (colId === 'subsystem') {
        options = subsystemList.map((s) => ({
          id: s.id,
          name: s.subsystem_name,}))
      } else if (colId === 'project_id') { 
        options = projects.map((p) => ({ id: p.id, name: p.project_name }))
      } else if (colId === 'company_id') {
        options = companies.map((c) => ({ id: c.id_company, name: c.company_name }))
      }else if (colId === "production_assigned_to") {
        setEditValue(info.row.original.production_assigned_to || "");
      }



      return (
        <select
        value={String(editValue) || ''}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={() => {
          if (editValue) handleUpdate(rowId, colId, editValue);
          setEditingCell(null);
        }}
        autoFocus
        className="border px-1 py-0.5"
      >
        <option value=""></option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.name}
          </option>
        ))}
      </select>
    );
  }

 if (colId === "production_assigned_to" && editingCell?.rowId === rowId) {
      return (
        <select
          value={String(editValue) || ""}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => {
            handleUpdate(rowId, colId, editValue);
            setEditingCell(null);
          }}
          autoFocus
          className="border px-2 py-1"
        >
          <option value="">-- Select User --</option>
          {dropdownUsers.map((u) => (
            <option key={u.id_user ?? u.id} value={u.id_user ?? u.id}>
              { (u.full_name || u.fullname || u.username)  (u.badge_no ? ` (${u.badge_no})` : "")}
            </option>
          ))}
        </select>
      );
    }


    // input text biasa
    if (editingCell?.rowId === rowId && editingCell?.columnId === colId) {
      return (
        <input
          className="w-full border px-1 py-0.5"
          value={editValue}
          autoFocus
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => {
            handleUpdate(rowId, colId, editValue)
            setEditingCell(null)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleUpdate(rowId, colId, editValue)
              setEditingCell(null)
            }
          }}
        />
      )
    }

    // tampilan default
    return (
       <span
      className="border border-gray-300 bg-gray-200 rounded-lg px-2 py-1 cursor-pointer flex hover:bg-gray-100 transition h-max justify-center"
      onClick={() => {
        console.log(info.row.original.typeModule?.id)
        setEditingCell({ rowId, columnId: colId });
        if (colId === 'discipline') {
          setEditValue(info.row.original.discipline_tag?.id || '');
        } else if (colId === 'type_of_module') {
          setEditValue(info.row.original.typeModule?.id || '');
        } else if (colId === 'module') {
          setEditValue(info.row.original.templates_md?.mod_id || '');
        } else if (colId === 'subsystem') {
          setEditValue(info.row.original.subsystem_rel?.id || '');
        } else if (colId === 'project_id') {
          setEditValue(info.row.original.project_id || '')
        } else if (colId === 'company_id') {
          setEditValue(info.row.original.company_id || '')  
        }else if (colId === 'production_assigned_to') {
        setEditValue(info.row.original.production_assigned_to ?? info.row.original.assigned_to?.id ?? '')
        } else {
          setEditValue(value ?? '');
        }
      }}
    >
      {value ?? '-'}
    </span>
    )
  }

  /** Datatables setup */
  const table = useReactTable({
    data,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: false,
  })

  return (
    <AuthLayout sidebarList={itrAssignmentList}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8 py-4">
          <Paper radius="sm" mt="md" withBorder>
            <div className="p-4 border-b border-black flex justify-between bg-gray-200">
              <Button
                onClick={() => router.back()}
                leftSection={<IconArrowBack />}
                variant=""
                color="red"
              >
                Back
              </Button>
               <h1 className="text-center font-bold py-2 text-2xl">EDIT ASSIGNMENT ITR</h1>
              <Button
                leftSection={<IconEditCircle />}
                color="green"
                disabled={!hasChanges}
                onClick={async () => {
                  await fetchBulkData() 
                  Swal.fire('Success', 'Changes have been saved!', 'success')
                  setHasChanges(false)
                }}
              >
                Update
              </Button>
            </div>

           

            <div className="p-4 overflow-x-auto ">
              <Datatables table={table} totalPages={1} />
            </div>
          </Paper>
        </div>
      </div>
    </AuthLayout>
  )
}
