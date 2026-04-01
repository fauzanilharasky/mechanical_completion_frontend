import Datatables from '@/components/custom/Datatables'
import AuthLayout from '@/components/layout/authLayout'
import { tagNumberList } from '@/data/sidebar/tag-number'
import useApi from '@/hooks/useApi'
import useUser from '@/store/useUser'
import { Button, Paper, Table, Checkbox, Select } from '@mantine/core'
import { useDebouncedState } from '@mantine/hooks'
import { IconAd, IconAdjustmentsCheck, IconChecks, IconCircleDashedLetterD, IconDetails, IconDetailsOff, IconEdit, IconFileExport, IconPlaylistAdd, IconRegistered, IconUpload } from '@tabler/icons-react'
import { getCoreRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table'
import axios from 'axios'
import NoPermissionCard from '@/components/card_permission';
import { useRouter } from 'next/router'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { usePermissions } from "@/hooks/usePermissions"
import { useForm } from '@mantine/form'


Tag_number_register.title = "Tag Number Register"

export default function Tag_number_register() {
  const router = useRouter()
  const { user } = useUser()
  
  const API = useApi()
  const API_URL = API.API_URL

const [selectedRowIds, setSelectedRowIds] = useState([]);


const handleSelectAll = (checked) => {
  if (checked) {
    setSelectedRowIds(data.map((row) => row.id));
  } else {
    setSelectedRowIds([]);
  }
};

const handleSelectRow = (id, checked) => {
  if (checked) {
    setSelectedRowIds((prev) => [...prev, id]);
  } else {
    setSelectedRowIds((prev) => prev.filter((rowId) => rowId !== id));
  }
};



  const [loadingData, setLoadingData] = useState(true)
  const [loadingOpt, setLoadingOpt] = useState(false)
  const [display, setDisplay] = useState(true)
  const [selectedDiscipline, setSelectedDiscipline] = useState(null);
  const [data, setData] = useState([])
  const [savedFilter, setSavedFilter] = useState({})
  const [checkedId, setCheckedId] = useState([])
  const [selectedProject, setSelectedProject] = useState(null);
  const [sorting, setSorting] = useState([{ id: "id", desc: true }]);
  const [columnFilters, setColumnFilters] = useDebouncedState([], 500);
  const [totalEntries, setTotalEntries] = useState(0);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalPages, setTotalPages] = useState(1);

   const hasViewPermission = usePermissions([13]);

  const hasExportDataPermission = usePermissions([14])
  const hasEditDataPermission = usePermissions([41])


  const [projectOptions, setProjectOptions] = useState([]) 
  
    const form = useForm({
      initialValues: {
        project_id: Number,    
        // system_name: '',
        // description: ''
      },
      validate: {
        project_id: (value) => (value ? null : 'Project Name Required'),
        system_name: (value) => (value.trim().length > 0 ? null : 'System Name is Required'),
      }
    })
  
    
  
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
  
  
      useEffect(() => {
        fetchProjects();
        
      }, []);
  


  const columns = useMemo(() => [
    

    {
      id: "select",
      header: () => (
        <Checkbox
          checked={selectedRowIds.length === data.length && data.length > 0}
          indeterminate={selectedRowIds.length > 0 && selectedRowIds.length < data.length}
          onChange={(e) => handleSelectAll(e.currentTarget.checked)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedRowIds.includes(row.original.id)}
          onChange={(e) => handleSelectRow(row.original.id, e.currentTarget.checked)}
        />
      ),
      size: 40, 
    },

    {
    id: "no",
    header: "No",
    cell: ({ row }) => {
      // Hitung nomor urut berdasarkan index row + offset halaman
      const rowNumber = row.index + 1 + (pagination.pageIndex * pagination.pageSize);
      return rowNumber;
    },
    size: 40,
    },
    
    {
      accessorFn: (row) => row.project_name ?? "-",
      id: "project_name",
      header: "Project Name",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue()
    },

    {
      accessorFn: (row) => row.company_name ?? "-",
      id: "company_name",
      header: "Company Name",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue()
    },

     {
      accessorFn: (row) => row.discipline_tag?.discipline_name,
      id: "discipline",
      header: "Discipline",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue(),
    },

    {
      accessorFn: (row) => row.templates_md?.mod_desc,
      id: "module",
      header: "Module",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue(),
    },

    {
      accessorFn: (row) => row.typeModule?.name ?? "-",
      id: "type_of_module",
      header: "Type OF module",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue(),
    },

    {
      accessorFn: (row) => row.drawing_no ?? "-",
      id: "drawing_no",
      header: "Drawing No",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue(),
    },

    {
      accessorFn: (row) => row.cert_rel?.cert_id,
      id: "cert_id",
      header: "Cert ID",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue(),
    },

     {
      accessorFn: (row) => row.event_id ?? "-",
      id: "event_id",
      header: "Event ID",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue(),
    },



    {
      accessorFn: (row) => row.tag_number ?? "-",
      id: "tag_number",
      header: "Tag Number",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue()
    },

     {
      accessorFn: (row) => row.tag_description ?? "-",
      id: "tag_description",
      header: "Tag Description",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue()
    },

     {
      accessorFn: (row) => row.system_rel?.system_name ?? "-",
      id: "system",
      header: "System",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue()
    },



     {
      accessorFn: (row) => row.subsystem_rel?.subsystem_name,
      id: "subsystem",
      header: "Subsystem",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue()
    },

    {
      accessorFn: (row) => row.subsystem_description ?? "-",
      id: "subsystem_description",
      header: "Subsystem Description",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue()
    },

    {
      accessorFn: (row) => row.phase ?? "-",
      id: "phase",
      header: "Phase",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue()
    },

    {
      accessorFn: (row) => row.location ?? "-",
      id: "location",
      header: "location",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue()
    },

      {
      accessorFn: (row) => row.model_no ?? "-",
      id: "model_no",
      header: "No Model",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue()
    },

     {
      accessorFn: (row) => row.rating ?? "-",
      id: "rating",
      header: "Rating",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue()
    },

     {
      accessorFn: (row) => row.serial_no ?? "-",
      id: "serial_no",
      header: "Serial No",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue(),
    },

     {
      accessorFn: (row) => row.manufacturer ?? "-",
      id: "manufacturer",
      header: "Manufacturer",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue()
    },

    {
      accessorFn: (row) => row.remarks, 
      id: "remarks",
      header: "Remarks",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => {
      const value = info.getValue();
    if (Array.isArray(value)) {
      return value.join(", ");
    }

    

    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.join(", ");
      }
    } catch (e) {
    }
    return value || "-"; },
  },


  {
  accessorFn: (row) => row.status_delete,
  id: "status_delete",
  header: "Status",
  enableColumnFilter: false,
  enableSorting: true,
  cell: (info) => {
    const value = info.getValue();
    const status = (value === 1 || value === "1")
      ? "Active"
      : "Inactive";

    const colorClass =
      status === "Active"
        ? "bg-white-600 text-blue-500 border border-blue-400"
        : "bg-white-100 text-green-800 border border-green-300";

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}
      >
        {status}
      </span>
    );
  },
},


  ])
  const table = useReactTable({
    data,
    columns,
    filterFns: {},
    state: {
      columnFilters,
      sorting,
      pagination,
    },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
  });



  const getData = useCallback(async () => {
    const searchQuery = {};
    columnFilters.forEach((filter) => {
      if (filter.value != null && filter.value !== "") {
        searchQuery[filter.id] = filter.value;
      }
    });

    const filterParams =
      searchQuery && Object.keys(searchQuery).length > 0
        ? `search=${encodeURIComponent(JSON.stringify(searchQuery))}`
        : "";

    const sort =
      sorting && sorting.length > 0
        ? `${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}`
        : "";

    const { data } = await axios.post(
      API_URL +
        `/api/pcms_mc_template/numbers_list?${filterParams}&page=${pagination.pageIndex}&size=${pagination.pageSize}&sort=${sort}`,
      {
        filter: filterParams,
        page: pagination.pageIndex,
        size: pagination.pageSize,
        sort: sort
      },
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
    );
    
    setData(data.data);
    setTotalPages(data.total_pages);
    setTotalEntries(data.total ?? 0);
  },[API_URL, columnFilters, pagination.pageIndex, pagination.pageSize, sorting, user.token]);



  // ---------------- HANDLE EXPORT TO EXCEL ------------------
  const handleExportExcel = async () => {
    try {
      // 🔹 Ambil filter dari columnFilters
      const searchQuery = {};
      columnFilters.forEach((filter) => {
        if (filter.value !== null && filter.value !== "") {
          searchQuery[filter.id] = filter.value;
        }
      });
  
      // 🔹 Sort
      const sort =
        sorting && sorting.length > 0
          ? `${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}`
          : "";
  
      // 🔹 Payload ke backend
      const payload = {
        search: Object.keys(searchQuery).length > 0 ? searchQuery : null,
        sort,
        page: 0,
        size: 999999, // ambil semua data
      };
  
      console.log("EXPORT PAYLOAD", payload);
  
      const response = await axios.post(
        `${API_URL}/api/pcms_mc_template/export_to_excel`,
        payload,
        {
          headers: { Authorization: `Bearer ${user.token}` },
          responseType: "blob",
        }
      );
  
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
  
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Pcms_Tag_Register.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
  
    } catch (err) {
      console.error("Export Excel error:", err);
    }
  };


  useEffect(() => {
    if (!user?.token) return;
    getData();
  }, [user?.token, columnFilters, pagination.pageIndex, pagination.pageSize, sorting, loadingData, savedFilter, API_URL, getData]);

  const typeOfModuleOptios = useMemo( () => {
      const types = Array.from(new Set(
        data?.map(item => item.typeModule?.name).filter(Boolean)
      ));
      return types.map(t => ({ label: t, value: t }));
    }, [data]);
  
  
    const moduleOptions = useMemo( () => {
        const types = Array.from(new Set(
          data?.map(item => item.templates_md?.mod_desc).filter(Boolean)
        ));
        return types.map(t => ({ label: t, value: t }));
      }, [data]);
      
    // Discipline Filter Options
  
     const disciplineOptions = useMemo( () => {
      const types = Array.from(new Set(
        data?.map(item => item.discipline_tag?.discipline_name).filter(Boolean)
      ));
      return types.map(t => ({ label: t, value: t }));
    }, [data]);
  
   const applyFilters = () => {
  
    setPagination(prev => ({
      ...prev,
      pageIndex: 0
    }));
  
    // Panggil getData setelah state update
    setTimeout(() => {
      getData();
    }, 0);
  };
  return (
    <AuthLayout sidebarList={tagNumberList}>
       {hasViewPermission ? (
          <div className='py-8 mb-8'>
            <div className="max-w-full mx-auto sm:px-6 lg:px-8 py-4">
              <Paper radius="sm" mt="md" style={{ position: 'relative' }} withBorder>
                <div className="p-4 border-b flex justify-start">
                         <Button 
                           onClick={() => setDisplay(!display)} 
                           leftSection={<IconAdjustmentsCheck />}
                          variant="outline"
                         >
                           {display ? "Close Filter" : "Filter"}
                         </Button>
    
                          
                </div>
               
                 {display && (
                 <div className="p-4 border-b flex justify-items-center">
                   <div className="w-full">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                       
                       {/* Module */}
                       <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-7">
                         <label className="text-sm font-medium sm:w-32">Module :</label>
                         <Select
                           placeholder="Select Module"
                           data={moduleOptions}
                           className="flex-1"
                           value={selectedDiscipline || null}
                           
                           onChange={(val) => {
                           setSelectedDiscipline(val);
                           setColumnFilters(old => [
                             ...old.filter(f => f.id !== "module"),
                             ...(val ? [{ id: "module", value: val }] : [])
                           ]);
                         }}
               
                           searchable
                           clearable
                         />
                       </div>

                        {/* System filter */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-7">
                        <label className="text-sm font-medium sm:w-32">System Name :</label>
              
                        <input
                        type="text"
                        placeholder="Search System Name"
                        className="border rounded px-3 py-2 flex-1 text-sm"
                        value={columnFilters.find(f => f.id === "system")?.value || ""}
              
                        onChange={(e) => {
                          const value = e.target.value;
              
                          setColumnFilters(old => {
                            const otherFilters = old.filter(f => f.id !== "system");
                            return value
                              ? [...otherFilters, { id: "system", value }]
                              : otherFilters;
                          });
                        }}
                      />
                      </div>


                     {/* Project filter */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-7">
                        <label className="text-sm font-medium sm:w-32">Project :</label>

                        <Select
                          className="flex-1"
                          placeholder="Select Project"
                          data={projectOptions}
                          searchable
                          clearable
                          value={selectedProject}
                          onChange={(val) => {
                            setSelectedProject(val);

                            setColumnFilters(old => {
                              const others = old.filter(f => f.id !== "project_id");
                              return val
                                ? [...others, { id: "project_id", value: val }]
                                : others;
                            });

                            // reset ke page pertama
                            setPagination(prev => ({
                              ...prev,
                              pageIndex: 0,
                            }));
                          }}
                        />
                      </div>


               
                       {/* subsystem Name */}
                       <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-7">
                         <label className="text-sm font-medium sm:w-32">Subsystem Name :</label>
               
                         <input
                         type="text"
                         placeholder="Search Subsystem Name"
                         className="border rounded px-3 py-2 flex-1 text-sm"
                         value={columnFilters.find(f => f.id === "subsystem")?.value || ""}
               
                         onChange={(e) => {
                           const value = e.target.value;
               
                           setColumnFilters(old => {
                             const otherFilters = old.filter(f => f.id !== "subsystem");
                             return value
                               ? [...otherFilters, { id: "subsystem", value }]
                               : otherFilters;
                           });
                         }}
                       />
               
                       </div>
               
               
                      {/* Discipline */}
                       <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-7">
                         <label className="text-sm font-medium sm:w-32">Discipline :</label>
                         <Select
                           placeholder="Select Discipline"
                           data={disciplineOptions}
                           className="flex-1"
                           value={selectedDiscipline || null}
                           
                           onChange={(val) => {
                           setSelectedDiscipline(val);
                           setColumnFilters(old => [
                             ...old.filter(f => f.id !== "discipline"),
                             ...(val ? [{ id: "discipline", value: val }] : [])
                           ]);
                         }}
               
                           searchable
                           clearable
                         />
                       </div>
               
               
                      {/* Type Of Module */}
                       <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-7">
                         <label className="text-sm font-medium sm:w-32">Type Of Module :</label>
                         <Select
                           placeholder="Select Module Type"
                           data={typeOfModuleOptios}
                           className="flex-1"
                           value={columnFilters.find(f => f.id === "type_of_module")?.value || ""}
                           onChange={(value) =>
                             setColumnFilters(old => [
                               ...old.filter(f => f.id !== "type_of_module"),
                               { id: "type_of_module", value }
                             ])
                           }
                           searchable
                           clearable
                         />
                       </div>
               
               
               
                     </div>
               
                     {/* Action filter Button */}
                     <div className="mt-10 flex justify-end">
                       <Button variant="filled"
                       className="shadow-md"
                       color="blue" 
                       leftSection={<IconAdjustmentsCheck />}
                       onClick={applyFilters}
                       >
                         Apply Filter
                       </Button>
                     </div>
                   </div>
                 </div>
               )}
    
              </Paper>
             <Paper radius="sm" mt="md" style={{ position: 'relative' }} withBorder>
               <div className="p-4 border-b flex justify-between items-center text-white bg-blue-800">
                 <h1 className='text-center font-medium text-white px-3'> TAG NUMBER | Tag Number Register List </h1>

                 {/* grouped actions: Export Edit Selected */}
                 {(hasExportDataPermission || selectedRowIds.length > 0) && (
                   <Button.Group className="shadow-sm">
                     {hasExportDataPermission && (
                       <Button
                       variant="filled"
                       color="green"
                       onClick={handleExportExcel}
                       leftSection={<IconFileExport />}
                       >
                         Export To Excel
                       </Button>
                     )}

                     {hasEditDataPermission && selectedRowIds.length > 0 && (
                       <Button
                         variant="filled"
                         color="yellow"
                         onClick={() => {
                           const ids = selectedRowIds.join(",");
                           router.push(`/master_data_new/tag_number/edit_form/${ids}`);
                         }}
                         leftSection={<IconEdit />}
                       >
                         Edit Selected
                       </Button>
                     )}
                   </Button.Group>
                 )}
                 </div>
               <Paper>
                 <div className="p-4 overflow-x-auto">
                   <Datatables table={table} totalPages={totalPages} info={{ totalElements: totalEntries }} />
                 </div>
               </Paper>
             </Paper>
            </div>
          </div>
        ) : (
          <NoPermissionCard />
          )}
        </AuthLayout>

  )
}