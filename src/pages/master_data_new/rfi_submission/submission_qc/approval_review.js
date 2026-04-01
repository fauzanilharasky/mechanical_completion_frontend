import Datatables from '@/components/custom/Datatables'
import AuthLayout from '@/components/layout/authLayout'
import { rfiSubmissionList } from '@/data/sidebar/rfi-submission'
import useApi from '@/hooks/useApi'
import useUser from '@/store/useUser'
import { Button, Paper, Checkbox, Select, Tabs } from '@mantine/core'
import { useDebouncedState } from '@mantine/hooks'
import { IconAdjustmentsCheck, IconEdit, IconPlaylistAdd, IconX, IconUserDown, IconUpload, IconXboxX, IconCircleDashedLetterD, IconPdf, IconFileTypePdf} from '@tabler/icons-react'
import { getCoreRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table'
import axios from 'axios'
import { useRouter } from 'next/router'
import useSwal from '@/hooks/useSwal'
import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { usePermissions } from "@/hooks/usePermissions"
import NoPermissionCard from '@/components/card_permission'


PendingReview.title = "Pending Review From Client"
export default function PendingReview() {
  const router = useRouter()

  const { user } = useUser()
  const API = useApi()
  const { showAlert } = useSwal()
  const API_URL = API.API_URL
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  
  // PERMISSIONS DATA 
   const hasViewPermission = usePermissions([38]);
   const hasDetailsDataPermission = usePermissions([39])



  const STATUS_BY_TAB = {
  "re-offer": 9,
  "post-pone": 10,
  "approve-with-comment": 11,
};


const DETAIL_ROUTE_BY_STATUS = {
  9: "/master_data_new/rfi_submission/submission_qc/details_reoffer",
  10: "/master_data_new/rfi_submission/submission_qc/details/postpone",
  11: "/master_data_new/rfi_submission/submission_qc/details/approve_comment",
};





  // --------- Fetch Location For Dropdown ------------

const fetchArea = async () => {
  try {
    const res = await axios.get(`${API_URL}/api/master_area/dropdown`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });

    const formatted = res.data?.data?.map(a => ({
      value: a.id.toString(),
      label: a.name
    })) || [];

    setAreaOptions(formatted);
  } catch (err) {
    console.error("Error fetch area:", err);
  }
};



// ----------- Fetch Location By Area ----------

const fetchLocation = async (areaId) => {
  try {
    const res = await axios.get(`${API_URL}/api/master_location/dropdown/${areaId}`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });

    const formatted = res.data?.data?.map(l => ({
      value: l.id.toString(),
      label: l.name
    })) || [];

    setLocationOptions(formatted);
  } catch (err) {
    console.error("Error fetch location:", err);
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



  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRowIds(rows.map((row) => row.id));
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
  const [selectedUser, setSelectedUser] = useState("");
  const [areaOptions, setAreaOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);

  const [activeTab, setActiveTab] = useState("re-offer");
  const [rows, setRows] = useState([]);
  const [totalPages, setTotalPages] = useState(0);


  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [display, setDisplay] = useState(true)
  const [UsersOptions, setUsersOptions] = useState([])
  const [selectedDiscipline, setSelectedDiscipline] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
//   const [data, setData] = useState([])
  const [showDropdown, setShowDropdown] = useState(false);
  const [userQuery, setUserQuery] = useState("");
  const usersContainerRef = useState([null]);
  const [savedFilter, setSavedFilter] = useState({})
  const [checkedId, setCheckedId] = useState([])
  const [sorting, setSorting] = useState([{ id: "id", desc: true }]);
  const [columnFilters, setColumnFilters] = useDebouncedState([], 500);
  const [totalEntries, setTotalEntries] = useState(0);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  // Definisi kolom
  const columns = useMemo(() => [

    {
      id: "select",
      header: () => (
        <Checkbox
          checked={selectedRowIds.length === rows.length && rows.length > 0}
          indeterminate={selectedRowIds.length > 0 && selectedRowIds.length < rows.length}
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
    header: "No.",
    cell: ({ row }) => {
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
      accessorFn: (row) => row.submission_id,
      id: "submission_id",
      header: "Submission No",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue()
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
      accessorFn: (row) => row.typeModule?.name,
      id: "type_of_module",
      header: "Type OF Module",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue(),
    },

    {
      accessorFn: (row) => row.company_name?? "-",
      id: "company_name",
      header: "Company Name",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue()
    },

     {
      accessorFn: (row) => row.requestor_name?? "Not set",
      id: "requestor_name",
      header: "Requestor",
      enableColumnFilter: false,
      enableSorting: true,
      cell: (info) => info.getValue()
    },

     {
      accessorFn: (row) => {
        if (!row.date_request) return "-";

        const date = new Date(row.date_request);

        return date.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });
      },
      id: "date_request",
      header: "Date Request",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue(),
    },

    {
      accessorFn: (row) => row.report_resubmit_status || "-",
      id: "report_resubmit_status",
      header: "Resubmit Status",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue()
    },


    // .............. existing code .............
    {
      accessorFn: (row) => row.status_inspection,
      id: "status_inspection",
      header: "Status Inspection",
      enableColumnFilter: false,
      enableSorting: true,
      cell: (info) => {
        const value = info.getValue();
        const v = typeof value === "string" && value.trim() !== "" ? value.trim() : value;

        let status = "-";
        let colorClass = "bg-gray-100 text-gray-800";

        if (v === 9 ) {
          status = "Re-Offer";
          colorClass = "bg-orange-500  text-black";
          } else if (v === 10 || v === "10") {
          status = "Pending Post-Pone";
          colorClass = "bg-yellow-400 text-gray";
          } else if (v === 11 || v === "11") {
          status = "Approve With Comment";
          colorClass = "bg-blue-500 text-white";
          }

        return (
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap inline-flex items-center ${colorClass}`}
          >
            {status}
          </span>
        );
      },
    },
// ...existing code...

      {
      id: "action",
      header: "Action",
      cell: ({ row }) => {
        const submissionId = row.original.submission_id;
        const statusInspection = Number(row.original.status_inspection);

        const detailBasePath =
          DETAIL_ROUTE_BY_STATUS[statusInspection];

        return (
          <Button.Group className='justify-center'>
             {hasDetailsDataPermission && (
            <Button
              color="blue"
              leftSection={<IconCircleDashedLetterD size={16} />}
              disabled={!detailBasePath}
              onClick={() =>
                router.push(`${detailBasePath}/${submissionId}`)
              }
            >
              Detail
            </Button>
             )}
          </Button.Group>
        );
      },
    },
  ])

  


  

  // Setup react-table
  const table = useReactTable({
    data: rows,
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
  try {
    const statusInspection = STATUS_BY_TAB[activeTab];

    // 🔹 convert filter ke search JSON string
    const searchObj = {};
    columnFilters.forEach((f) => {
      if (f.value !== null && f.value !== "") {
        searchObj[f.id] = f.value;
      }
    });

    const payload = {
      page: pagination.pageIndex,
      size: pagination.pageSize,
      sort:
        sorting.length > 0
          ? `${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}`
          : undefined,
      search:
        Object.keys(searchObj).length > 0
          ? JSON.stringify(searchObj)
          : undefined,
      status_inspection: statusInspection, 
    };

    const res = await axios.post(
      `${API_URL}/api/pcms_mc_template/pending_review`,
      payload,
      { headers: { Authorization: `Bearer ${user.token}` } }
    );

    setRows(res.data?.data ?? []);
    setTotalEntries(res.data?.total ?? 0);
    setTotalPages(res.data?.total_pages ?? 0);

    } catch (err) {
        console.error("Load failed:", err.response?.data || err);
    }
    }, [
    activeTab,
    pagination.pageIndex,
    pagination.pageSize,
    sorting,
    columnFilters,
    API_URL,
    user.token,
    ]);



  useEffect(() => {
  if (user?.token) {
    getData();
  }
}, [getData, user?.token]);


useEffect(() => {
  if (selectedArea) {
    fetchLocation(selectedArea); // load location berdasarkan area
  }
}, [selectedArea]);

  const filteredUsers = useMemo(() => {
    const q = (userQuery || "").toLowerCase().trim();
    const activeUsers = (UsersOptions || []).filter(
      (u) => !u.status_user || u.status_user === 1 || u.status_user === 2
    );
  
    if (!q) return activeUsers;
  
    return activeUsers.filter((u) => {
      const name = (u.full_name || u.fullname || u.username || "").toLowerCase();
      const badge = (u.badge_no || u.badge || "").toLowerCase();
      const id = (u.id_user || u.id || "").toString().toLowerCase();
      return name.includes(q) || badge.includes(q) || id.includes(q);
    });
  }, [UsersOptions, userQuery]);

    const typeOfModuleOptios = useMemo(() => {
    const types = Array.from(
        new Set(rows.map(item => item.typeModule?.name).filter(Boolean))
    );
    return types.map(t => ({ label: t, value: t }));
    }, [rows]);

  
  
    const moduleOptions = useMemo(() => {
    const types = Array.from(
        new Set(rows.map(item => item.templates_md?.mod_desc).filter(Boolean))
    );
    return types.map(t => ({ label: t, value: t }));
    }, [rows]);

      
    // Discipline Filter Options
  
    const disciplineOptions = useMemo(() => {
    const types = Array.from(
        new Set(rows.map(item => item.discipline_tag?.discipline_name).filter(Boolean))
    );
    return types.map(t => ({ label: t, value: t }));
    }, [rows]);



    // Function Apply filter: 
     const applyFilters = () => {

  setPagination(prev => ({
    ...prev,
    pageIndex: 0
  }));

  setTimeout(() => {
    getData();
  }, 0);
};

useEffect(() => {
    setSelectedRowIds([])
  setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  if (user?.token) getData();
}, [activeTab, getData, user?.token]);

useEffect(() => {

  if (user?.token) {
    fetchArea();
  }
}, [getData, user?.token]);


  return (
    <AuthLayout sidebarList={rfiSubmissionList}>
      {hasViewPermission ? (
      <div className='py-6'>
        <div className="max-w-full mx-auto sm:px-6 lg:px-8 py-4">
          <Paper radius="sm" mt="md" style={{ position: 'relative' }} withBorder>
            <div className="p-4 border-b border-black flex justify-start">
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
                     <label className="text-sm font-medium sm:w-32"> Module :</label>
                     <Select
                       placeholder="Select Discipline"
                       data={moduleOptions}
                       className="flex-1"
                       value={selectedModule || null}
                       
                       onChange={(val) => {
                       setSelectedModule(val);
                       setColumnFilters(old => [
                         ...old.filter(f => f.id !== "module"),
                         ...(val ? [{ id: "module", value: val }] : [])
                       ]);
                     }}
           
                       searchable
                       clearable
                     />
                   </div>
           
                   {/* submission No */}
                   <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-7">
                     <label className="text-sm font-medium sm:w-32">Submission No :</label>
           
                    <input
                      type="text"
                      placeholder="Search Submission No"
                      className="border rounded px-3 py-2 flex-1 text-sm"
                      value={columnFilters.find(f => f.id === "submission_id")?.value || ""}
                      onChange={(e) => {
                        const value = e.target.value;

                        setColumnFilters(old => {
                          const otherFilters = old.filter(f => f.id !== "submission_id");
                          return value
                            ? [...otherFilters, { id: "submission_id", value }]
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
             <div className="p-4 border-b border-gray text-white bg-blue-800 flex justify-start">
               {/* <Iconre size={26} /> */}
              <h1 className='text-center font-medium'> QC SECTION | Re-Transmittal To Client </h1>
             </div>
             <Paper>
           <Paper shadow="xs" radius="md" p="md">
              <Tabs
              value={activeTab}
              onChange={setActiveTab}
              variant="default"
              className='mt-3'
            >
              <Tabs.List>
                <Tabs.Tab value="re-offer" className='font-medium'  allowTabDeactivation>
                  Re-Offer
                </Tabs.Tab>

                <Tabs.Tab value="post-pone" className='font-medium'>
                  Post-Pone
                </Tabs.Tab>

                <Tabs.Tab value="approve-with-comment" className='font-medium'>
                  Approve With Comment
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="re-offer" pt="md">
                <Datatables
                  table={table}
                  totalPages={totalPages}
                  info={{ totalElements: totalEntries }}
                />
              </Tabs.Panel>

              <Tabs.Panel value="post-pone" pt="md">
                <Datatables
                  table={table}
                  totalPages={totalPages}
                  info={{ totalElements: totalEntries }}
                />
              </Tabs.Panel>

              <Tabs.Panel value="approve-with-comment" pt="md">
                <Datatables
                  table={table}
                  totalPages={totalPages}
                  info={{ totalElements: totalEntries }}
                />
              </Tabs.Panel>
            </Tabs>
          </Paper>
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