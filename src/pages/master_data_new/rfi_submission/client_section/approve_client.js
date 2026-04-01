import Datatables from '@/components/custom/Datatables'
import AuthLayout from '@/components/layout/authLayout'
import { rfiSubmissionList } from '@/data/sidebar/rfi-submission'
import useApi from '@/hooks/useApi'
import useUser from '@/store/useUser'
import { Button, Paper, Checkbox, Select } from '@mantine/core'
import { useDebouncedState } from '@mantine/hooks'
import { IconAdjustmentsCheck, IconEdit, IconPlaylistAdd, IconX, IconUserDown, IconUpload, IconXboxX, IconCircleDashedLetterD, IconPdf, IconFileTypePdf, IconCubeSend} from '@tabler/icons-react'
import { getCoreRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table'
import axios from 'axios'
import { useRouter } from 'next/router'
import useSwal from '@/hooks/useSwal'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { usePermissions } from '@/hooks/usePermissions'
import NoPermissionCard from '@/components/card_permission'

ApproveClient.title = "Approval By Client"
export default function ApproveClient() {
  const router = useRouter()

  const { user } = useUser()
  const API = useApi()
  const { showAlert } = useSwal()
  const API_URL = API.API_URL
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);
   const [totalEntries, setTotalEntries] = useState(0);

  // PERMISSIONS DATA
  const hasViewPermission = usePermissions([33]);
  const hasDetailsDataPermission = usePermissions([34])


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
  const [selectedUser, setSelectedUser] = useState("");
  const [areaOptions, setAreaOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);

  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [display, setDisplay] = useState(true)
  const [UsersOptions, setUsersOptions] = useState([])
  const [selectedDiscipline, setSelectedDiscipline] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [data, setData] = useState([])
  const [showDropdown, setShowDropdown] = useState(false);
  const [userQuery, setUserQuery] = useState("");
  const usersContainerRef = useState([]);
  const [savedFilter, setSavedFilter] = useState({})
  const [checkedId, setCheckedId] = useState([])
  const [sorting, setSorting] = useState([{ id: "id", desc: true }]);
  const [columnFilters, setColumnFilters] = useDebouncedState([], 500);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalPages, setTotalPages] = useState(1);

  // Definisi kolom
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
      accessorFn: (row) => row.company_name,
      id: "company_name",
      header: "Company Name",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue()
    },

     {
      accessorFn: (row) => row.requestor_name?? "Not set",
      id: "requestor_id",
      header: "Requestor",
      enableColumnFilter: true,
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

        if (v === 8 ) {
          status = "Approve By Client";
          colorClass = "bg-green-500 text-white";
          } else if (v === 4 || v === "4") {
          status = "Pending QC";
          colorClass = "bg-blue-50 text-blue-700";
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
        accessorFn: (row) => row.submission_id,
        id: "id",
        header: "Action",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (info) => {
          let value = info.getValue()
          return (
            <div className='align-middle items-center'>
              <Button.Group className='justify-center'>
              {hasDetailsDataPermission && (
             <Button
              onClick={() => router.push(`/master_data_new/rfi_submission/client_section/details/review_approval/${value}`)}
              leftSection={<IconCircleDashedLetterD size={16} />}
              color="blue"
              className="justify-center"
            >
              Detail
            </Button>
              )}

            <Button
              onClick={() => downloadPdf(value)}
              leftSection={<IconPdf size={16} />}
              color="red"
              className="justify-center"
            >
              Export PDF
            </Button>
              </Button.Group>
            </div>
          )
        },
      },
  ])


  

  // Setup react-table
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

    searchQuery.status_inspection = 8;
    const filterParams =
      searchQuery && Object.keys(searchQuery).length > 0
        ? `search=${encodeURIComponent(JSON.stringify(searchQuery))}`
        : "";

    const sort =
      sorting && sorting.length > 0
        ? `${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}`
        : "";

    try {
        const res = await axios.post(
          `${API_URL}/api/pcms_mc_template/approve_client?${filterParams}&page=${pagination.pageIndex}&size=${pagination.pageSize}&sort=${sort}`,
          {
            filter: filterParams,
            page: pagination.pageIndex,
            size: pagination.pageSize,
            sort: sort
          },
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );

    
        const rows = res.data.data || [];

       const filteredData = rows.filter((item) => {
          const hasSubmission = item.submission_id !== null && item.submission_id !== undefined && String(item.submission_id).trim() !== "";
          return (
            hasSubmission &&
            Number(item.assignment_status) === 1 &&
            Number(item.status_inspection ?? item.statusInspection ?? item.status ?? 0) === 8
          );
        });
    
    
        setData(filteredData);
            setTotalEntries(res.data?.totalElements || filteredData.length);
        setTotalPages(res.data.total_pages);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
  }, [API_URL, columnFilters, pagination.pageIndex, pagination.pageSize, sorting, user.token]);


  useEffect(() => {
    if (!user?. token) return;
    fetchArea();
    getData();
  }, [user?.token, columnFilters, pagination.pageIndex, pagination.pageSize, sorting, loadingData, savedFilter, API_URL, getData]);

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


    // Function Apply filter: 
     const applyFilters = () => {
  // const filters = [];

  // if (columnFilters.find(f => f.id === "type_of_module")) {
  //     filters.push(columnFilters.find(f => f.id === "type_of_module"));
  //   }

  // setColumnFilters(filters);

  setPagination(prev => ({
    ...prev,
    pageIndex: 0
  }));

  setTimeout(() => {
    getData();
  }, 0);
};



// EXPORT TO PDF 
  const downloadPdf = async (submissionId) => {
  try {

    const res = await axios.get(
      `${API_URL}/api/pcms_itr/export/${submissionId}`,
      {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      }
    );

    const url = window.URL.createObjectURL(new Blob([res.data]));

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Commisioning inspection-${submissionId}.pdf`);

    document.body.appendChild(link);
    link.click();

    link.remove();

    } catch (err) {
      console.error("Export PDF error:", err);
      showAlert("Failed to export PDF", "error");
    }
  }; 



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
           
                  {/* subsystem */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-7">
                    <label className="text-sm font-medium sm:w-32">Subsystem :</label>
          
                    <input
                      type="text"
                      placeholder="Search Subsystem"
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
             <div className="p-4 border-b flex justify-start text-white bg-blue-700">
               <IconCubeSend size={26} />
            <h1 className='text-center font-medium px-3'> CLIENT SECTION | Approval By Client </h1>
             </div>
             <Paper>

            {/* <div className="px-4 py-2 text-right space-x-2">
              
              {selectedRowIds.length > 0 && (
                <Button
                  variant="filled"
                  color="green"
                  leftSection={<IconEdit />}
                  onClick={() => {
                    // navigasi ke halaman edit berdasarkan row pertama yang dipilih
                    router.push(`/master_data_new/rfi_submission/edit_form/${selectedRowIds[0]}`);
                  }}
                >

                  Edit Selected
                </Button>
              )}
             
            </div> */}
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
