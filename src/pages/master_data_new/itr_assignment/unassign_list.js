import Datatables from '@/components/custom/Datatables'
import AuthLayout from '@/components/layout/authLayout'
import { tagNumberList } from '@/data/sidebar/tag-number'
import useApi from '@/hooks/useApi'
import { itrAssignmentList } from '@/data/sidebar/itr-assignmen'
import useUser from '@/store/useUser'
import { Button, Paper, Table, Checkbox, Select } from '@mantine/core'
import { useDebouncedState } from '@mantine/hooks'
import { IconAd, IconAdjustmentsCheck, IconArcheryArrow, IconChecks, IconCircleDashedLetterD, IconCubeSend, IconDetails, IconDetailsOff, IconEdit, IconLayoutList, IconListDetails, IconPlaylistAdd, IconUserDown, IconUserPentagon, IconX, IconXboxX } from '@tabler/icons-react'
import { getCoreRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table'
import axios from 'axios'
import { useRouter } from 'next/router'
import useSwal from '@/hooks/useSwal'
import NoPermissionCard from '@/components/card_permission';
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from '@mantine/form'
import { usePermissions } from "@/hooks/usePermissions"
import Swal from 'sweetalert2'
import useEncrypt from '@/hooks/useEncrypt'



Itr_Unassignment_List.title = "ITR UnAssignment"

export default function Itr_Unassignment_List() {
  const router = useRouter()
  const { user } = useUser()
   const { showAlert } = useSwal()
  const API = useApi()
  const API_URL = API.API_URL
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const { encrypt } = useEncrypt();


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
  const [data, setData] = useState([])
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedDiscipline, setSelectedDiscipline] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [UsersOptions, setUsersOptions] = useState([])
  const [subsystemFilter, setSubsystemFilter] = useState("");
  const [savedFilter, setSavedFilter] = useState({})
  const [checkedId, setCheckedId] = useState([])
  const [showDropdown, setShowDropdown] = useState(false);
  const usersContainerRef = useState([]);
  const [userQuery, setUserQuery] = useState("");
  const [sorting, setSorting] = useState([{ id: "id", desc: true }]);
  const [columnFilters, setColumnFilters] = useDebouncedState([], 500);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalEntries, setTotalEntries] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

   const hasViewPermission = usePermissions([16]);


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
      accessorFn: (row) => row.project_name,
      id: "project_name",
      header: "Project Name",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue()
    },

     {
      accessorFn: (row) => row.discipline_tag?.discipline_name ?? "-",
      id: "discipline",
      header: "Discipline",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue(),
    },

    {
      accessorFn: (row) => row.company_name ?? '-',
      id: 'company_name',
      header: 'Company',
      enableColumnFilter: true,
      enableSorting: true,
     },

    {
      accessorFn: (row) => row.templates_md?.mod_desc ?? "-",
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
      accessorFn: (row) => row.drawing_no,
      id: "drawing_no",
      header: "Drawing No",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue(),
    },

    {
      accessorFn: (row) => row.cert_rel?.cert_id ?? "-",
      id: "cert_id",
      header: "Cert ID",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue(),
    },


    {
      accessorFn: (row) => row.tag_number,
      id: "tag_number",
      header: "Tag Number",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue()
    },

     {
      accessorFn: (row) => row.tag_description,
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
      accessorFn: (row) => row.subsystem_rel?.subsystem_name ?? "-",
      id: "subsystem",
      header: "Subsystem",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue()
    },

    {
      accessorFn: (row) => row.subsystem_description,
      id: "subsystem_description",
      header: "Subsystem Description",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue()
    },

    {
      accessorFn: (row) => row.phase,
      id: "phase",
      header: "Phase",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue()
    },

    {
      accessorFn: (row) => row.location,
      id: "location",
      header: "location",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue()
    },

      {
      accessorFn: (row) => row.model_no,
      id: "model_no",
      header: "No Model",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue()
    },

     {
      accessorFn: (row) => row.rating,
      id: "rating",
      header: "Rating",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue()
    },

     {
      accessorFn: (row) => row.manufacturer,
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
      enableColumnFilter: false,
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
  accessorFn: (row) => row.assignment_status,
  id: "assignment_status",
  header: "Status",
  enableColumnFilter: false,
  enableSorting: true,
  cell: (info) => {
    const value = info.getValue();
    const status = (value === null || value === "null" || value === 0)
      ? "Unassigned"
      : "Assigned";

    const colorClass =
      status === "Unassigned"
        ? "bg-white-600 text-red-500 border border-red-400"
        : "bg-green-100 text-green-800 border border-green-300";

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}
      >
        {status}
      </span>
    );
  },
}



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
    if (!user?.token) return;
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
      `/api/pcms_mc_template/serverside_list?${filterParams}&page=${pagination.pageIndex}&size=${pagination.pageSize}&sort=${sort}`,
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

   const filteredData = data.data.filter(
  item => item.assignment_status === 0 || item.assignment_status === null
);


  setData(filteredData);
  setTotalPages(data.total_pages);
  setTotalEntries(data.total ?? 0);
  },[API_URL, columnFilters, pagination.pageIndex, pagination.pageSize, sorting, user.token]);



  const filteredUsers = useMemo(() => {
  const q = (userQuery || "").toLowerCase().trim();
  const activeUsers = (UsersOptions || []).filter(
    (u) => !u.status_user || u.status_user === 1 
  );

  if (!q) return activeUsers;

  return activeUsers.filter((u) => {
    const name = (u.full_name || u.fullname || u.username || "").toLowerCase();
    const badge = (u.badge_no || u.badge || "").toLowerCase();
    const id = (u.id_user || u.id || "").toString().toLowerCase();
    return name.includes(q) || badge.includes(q) || id.includes(q);
  });
}, [UsersOptions, userQuery]);


  const handleAssignITR = async (values) => {
  if (!selectedUser) return;

  if (selectedRowIds.length === 0) {
    showAlert("Please select at least one ITR item to assign.", "warning");
    return;
  } 

  const confirm = await Swal.fire({
    title: "Are you sure?",
    text: "Are you sure you want to submit this assignment?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "Cancel",
    reverseButtons: true,
    confirmButtonColor: "#16a34a", // green
    cancelButtonColor: "#ef4444",
    iconColor: "#FFCE30",
  });
    
      
    if (!confirm.isConfirmed) return;

    const encryptedUserId = encrypt(String(user.id));
    const encryptedTemplateIds = selectedRowIds.map(id => encrypt(String(id)));

  try {
    const payload = {
      user_id: selectedUser,
      templates: selectedRowIds, // array ID dari DataTables
      production_assigned_by: encryptedTemplateIds
    };

await axios.post(
  `${API_URL}/api/pcms_itr/assignment_itr`,
  payload,
  {
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  }
);

    showAlert("ITR successfully assigned!", "success");
    console.log("Assign response:", data);

    // Refresh data table
    getData();

    // Reset state
    setSelectedRowIds([]);
    setSelectedUser("");
    setUserQuery("");
  } catch (err) {
    console.error("Failed to assign ITR:", err);
    showAlert("Failed to assign ITR. Please try again.", "error");
  }
};




 const fetchUsers = async () => {

  if (!user?.token) return;
  try {

    const res = await axios.get(`${API_URL}/api/portal_user/dropdown-assign`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });

    setUsersOptions(res.data?.data || res.data || []); 
  } catch (err) {
    console.error("Failed fetching user options:", err);
    setUsersOptions([]);
  }
};

useEffect(() => {
   const handleClickOutside = (e) => {
     if (usersContainerRef.current && !usersContainerRef.current.contains(e.target)) {
       setShowDropdown(false);
     }
   };
   document.addEventListener('mousedown', handleClickOutside);
   return () => document.removeEventListener('mousedown', handleClickOutside);
 }, []);



  useEffect(() => {

    if (!user?.token) return;

    fetchUsers();
    getData();
    
 }, [user?.token, columnFilters, pagination.pageIndex, pagination.pageSize, sorting, loadingData, savedFilter, API_URL, getData]);

//  Type of Module Filter Options

  const typeOfModuleOptios = useMemo( () => {
    const types = Array.from(new Set(
      data?.map(item => item.typeModule?.name).filter(Boolean)
    ));
    return types.map(t => ({ label: t, value: t }));
  }, [data]);


  const moduleOptions = useMemo( () => {
      const types = Array.from(new Set(
        data?.map(item => item.templates_md.mod_desc).filter(Boolean)
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
    <AuthLayout sidebarList={itrAssignmentList}>
       {hasViewPermission ? (
      <div className='py-8 mb-8'>
        <div className="max-w-full mx-auto sm:px-6 lg:px-8 py-4"> 
          <Paper radius="sm" mt="md" style={{ position: 'relative' }} withBorder>
            
          
            <div className="p-4 border-b flex justify-start">
              <Button 
                onClick={() => setDisplay(!display)} 
                leftSection={<IconAdjustmentsCheck />}
                variant="outline"
                color="blue"          >
                {display ? "Close Filter" : "Filter"}
              </Button>
            </div>

        {display && (
        <div className="p-4 flex justify-items-center mb-5">
          <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                {/* Module */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-7">
                  <label className="text-sm font-medium sm:w-32">Module :</label>
                  <Select
                    placeholder="Select Discipline"
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
                    className=" flex-1"
                    value={columnFilters.find(f => f.id === "discipline")?.value || null}
                    onChange={(val) => {
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
                <Button 
                className='shadow-md'
                variant="filled"
                color='blue' 
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
        <div className="p-4 border-b flex justify-start bg-blue-800 text-white">
          <IconLayoutList size={26} />
          <h1 className='text-center font-medium text-white px-3'> UNASSIGNMENT ITR | Unassignment ITR List </h1>
        </div>

        {/* Table Data */}
        <div className="p-4 overflow-x-auto border-b-2">
          <Datatables table={table} totalPages={totalPages} info={{ totalElements: totalEntries }}/>
        </div>


      <Paper>
        <div className="p-4">
        <div className="grid md:grid-cols-2 gap-10 mt-4 max-w-4xl">

        <div
        className="relative flex flex-col gap-1"
        ref={usersContainerRef}
        style={{ overflow: "visible" }} // ensure dropdown not clipped by parent
         >
        <label className="text-sm font-medium">FullName :</label>

      <input
        type="text"
        placeholder="Type name or badge no..."
        className="border rounded px-3 py-2 mb-2 w-full"
        value={userQuery}
        onChange={(e) => {
          setUserQuery(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
      />

      
      {showDropdown && userQuery.trim().length >= 0 && (
        <div
          className="absolute left-0 right-0 bg-white border rounded shadow max-h-56 overflow-auto"
          style={{
            bottom: "100%",
            marginBottom: 8,
            zIndex: 9999,
            boxShadow: "0 10px 24px rgba(0,0,0,0.12)",
          }}
        >

       {/* close icon */}
            <div className="flex justify-end pr-2 pt-1">
              <button
                type="button"
                aria-label="Close suggestions"
                onClick={() => setShowDropdown(false)}
                className="text-red-500 hover:text-gray-800 rounded p-1"
              >
                <IconXboxX size={17} />
              </button>
            </div>


      {filteredUsers && filteredUsers.length > 0 ? (
        filteredUsers.map((u) => {
          const id = String(u.id_user ?? u.id ?? "");
          const label = `${u.full_name || u.fullname || u.username || "Unknown"} - ${u.badge_no || u.badge || "-"}`;
          
          return (
            <button
              key={id}
              type="button"
              className="w-full text-left px-3 py-2 hover:bg-gray-100"
              onClick={() => {
                setSelectedUser(id);
                setUserQuery(label);
                setShowDropdown(false);
              }}
            >
              {label}
            </button>
          );
        })
      ) : (
        <div className="px-3 py-2 text-sm text-gray-500">No users found</div>
      )}
    </div>
  )}

  <input type="hidden" value={selectedUser} />
</div>


    </div>

    {/* Action Button */}
    <div className="mt-8 flex justify-start">
        
      <Button
        variant="filled"
        leftSection={<IconUserDown />}
        onClick={handleAssignITR}
        color={selectedUser ? "blue" : "gray"}
        disabled={!selectedUser || selectedRowIds.length === 0}
      >
        Assign ITR
      </Button>
        
      </div>
      
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
