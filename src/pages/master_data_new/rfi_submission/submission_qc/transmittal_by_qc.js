import Datatables from '@/components/custom/Datatables'
import AuthLayout from '@/components/layout/authLayout'
import { rfiSubmissionList } from '@/data/sidebar/rfi-submission'
import useApi from '@/hooks/useApi'
import useUser from '@/store/useUser'
import { Button, Paper, Checkbox, Select, Textarea, ActionIcon, MultiSelect} from '@mantine/core'
import { useDebouncedState } from '@mantine/hooks'
import { TimeInput, DateInput } from '@mantine/dates';
import { IconAdjustmentsCheck, IconEdit, IconPlaylistAdd, IconX, IconUserDown, IconUpload, IconXboxX, IconCircleDashedLetterD, IconPdf, IconFileTypePdf, IconArrowBack, IconClock, IconCalendar, IconSend2, IconSendOff, IconBookUpload} from '@tabler/icons-react'
import { getCoreRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table'
import axios from 'axios'
import { useRouter } from 'next/router'
import useSwal from '@/hooks/useSwal'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from 'lucide-react'
import NoPermissionCard from '@/components/card_permission'
import { usePermissions } from '@/hooks/usePermissions'
import Swal from 'sweetalert2'


TransmittalByQc.title = "Transmittal To Client"
export default function TransmittalByQc() {
  const router = useRouter()

  const { user } = useUser()
  const API = useApi()
  const { showAlert } = useSwal()
  const API_URL = API.API_URL
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const ref = useRef(null);
  const [totalEntries, setTotalEntries] = useState(0);


  // PERMISSIONS
  const hasViewPermission = usePermissions([28]);
  const hasDetailsPermission = usePermissions([44]);


 const fetchUsers = async () => {
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


const buildTimeInspect = () => {
  if (!inspectDate || !inspectTime) return null;

  const date = new Date(inspectDate);
  const [h, m, s] = inspectTime.split(":");

  date.setHours(+h);
  date.setMinutes(+m);
  date.setSeconds(+s);

  return date.toISOString();
};




// ----------- Handle Transmittal -------------

const buildTransmittalPayload = () => {
  return selectedRowIds.map((id) => {
    const row = data.find((d) => d.id === id);

    return {
      id_itr: row.pcms_itr[0].id_itr,
      submission_id: row.submission_id,
      id_template: row.id_template,
      status_invitation: Number(invitationType),
      inspector_id: Number(selectedUser),
      legend_inspection_auth: authorityType.join(","), 
      time_inspect: buildTimeInspect(),
      status_inspection: 6,
    };
  });
};



// ------------ Handle Transmittal data -----------

const handleUpdateRfi = async () => {

  if (!invitationType || !authorityType.length === 0 || !selectedUser || !inspectDate || !inspectTime) {
    showAlert("Warning", "Please complete all required fields", "warning");
    return;
  }

  // ALERT TO SUBMIT
  const confirm = await Swal.fire({
    title: "Are you sure?",
    text: "Are you sure you want to send this data to the Client?",
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

  try {
    setSubmitting(true);

     const payload = buildTransmittalPayload();

    await axios.put(
      `${API_URL}/api/pcms_itr/transmittal`, payload, 
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
    );

    showAlert( "RFI successfully updated", "success");
    setSelectedRowIds([]);
    getData();
  } catch (err) {
    console.error("Failed transmittal To Client:", err);
    showAlert("Failed To Transmittal data. Please try again.", "error");
  } finally {
    setSubmitting(false);
  }
};



// ------------ SELECT TIME ----------

const generateLiveTimeOptions = () => {
  const now = new Date();
  const options = [];

  const startHour = now.getHours();
  const startMinute = now.getMinutes();
  const startSecond = now.getSeconds();

  for (let h = startHour; h < 24; h++) {
    for (let m = h === startHour ? startMinute : 0; m < 60; m++) {
      const s = h === startHour && m === startMinute ? startSecond : 0;

      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      const ss = String(s).padStart(2, "0");

      options.push({
        value: `${hh}:${mm}:${ss}`,
        label: `${hh}:${mm}:${ss}`,
      });
    }
  }

  return options;
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


//  ------------- Date And Time -------------
useEffect(() => {
  const updateTime = () => {
    setTimeOptions(generateLiveTimeOptions());
  };


  updateTime(); // initial
  const interval = setInterval(updateTime, 1000);

  return () => clearInterval(interval);
}, []);

// ----------- Date Auto ------------

useEffect(() => {
  const now = new Date();
  const timeNow = now.toLocaleTimeString("en-GB"); // HH:mm:ss
  setInspectTime(timeNow);
}, []);


  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRowIds(data.map((row) => row.id_itr));
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
  // const [areaOptions, setAreaOptions] = useState([]);
  // const [locationOptions, setLocationOptions] = useState([]);
  const [inspectTime, setInspectTime] = useState("");
  const [timeOptions, setTimeOptions] = useState([]);
  const [inspectDate, setInspectDate] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [display, setDisplay] = useState(false)
  const [UsersOptions, setUsersOptions] = useState([])
  const [selectedDiscipline, setSelectedDiscipline] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [data, setData] = useState([])

  const [showDropdown, setShowDropdown] = useState(false);
  const [userQuery, setUserQuery] = useState("");
  const usersContainerRef = useRef(null);
  const [savedFilter, setSavedFilter] = useState({})
  const [checkedId, setCheckedId] = useState([])
  const [invitationType, setInvitationType] = useState(null);
  const [authorityType, setAuthorityType] = useState([]);
  const [sorting, setSorting] = useState([{  id: "submission_id", desc: true }]);
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
      accessorFn: (row) => row.submission_id ?? "-",
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
      accessorFn: (row) => row.company_name,
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
      accessorFn: (row) => row.system_rel?.system_name ?? "-",
      id: "system",
      header: "System",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue()
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
      accessorFn: (row) => row.subsystem_rel?.subsystem_name ?? "-",
      id: "subsystem",
      header: "Subsystem",
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
      accessorFn: (row) => row.requestor_name?? "Not set",
      id: "requestor_name",
      header: "Requestor",
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
      enableColumnFilter: false,
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
        // normalize value to number/string
        const v = typeof value === "string" && value.trim() !== "" ? value.trim() : value;

        let status = "-";
        let colorClass = "bg-gray-100 text-gray-800";

        if (v === 5 || v === "5") {
          status = "Pending Transmittal To Client";
          colorClass = "bg-blue-500 text-white";
          } else if (v === 3 || v === "3") {
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
              {/* <Button className='mb-2'
                onClick={() => router.push(`/${value}`)}
                leftSection={<IconEdit size={16}/>} color='orange'
              >
                Edit
              </Button> */}
              {hasDetailsPermission && (
             <Button
              onClick={() => router.push(`/master_data_new/rfi_submission/submission_qc/details/transmittal/${value}`)}
              leftSection={<IconCircleDashedLetterD size={16} />}
              color="blue"
              className="justify-center"
            >
              Detail
            </Button>
            )}
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
   getRowId: row => String(row.id_itr),
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

    searchQuery.status_inspection = 5;
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
          `${API_URL}/api/pcms_mc_template/transmittal_qc?${filterParams}&page=${pagination.pageIndex}&size=${pagination.pageSize}&sort=${sort}`,
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


        const filteredData = (res.data.data || []).filter((item) => {
        return (
          Number(item.assignment_status) === 1 &&
          Number(item.status_inspection ?? item.statusInspection ?? 0) === 5
        );
      });
    
        setData(filteredData);
         setTotalEntries(res.data?.totalElements || filteredData.length);
        setTotalPages(res.data.total_pages);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
  }, [API_URL, columnFilters, pagination.pageIndex, pagination.pageSize, sorting, user.token]);

  const invitationTypeOptions = [
  { value: "0", label: "Invitation Witness" },
  { value: "1", label: "Notification Activity" },
];

 const AuthorityTypeOptions = [
  { value: "0", label: "Hold Point" },
  { value: "1", label: "Witness" },
  { value: "2", label: "Monitoring" },
  { value: "3", label: "Review" },
];



useEffect(() => {
  console.log("inspectTime:", inspectTime);
}, [inspectTime]);

  useEffect(() => {
    if (!user?.token) return;
    fetchUsers();
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


  setPagination(prev => ({
    ...prev,
    pageIndex: 0
  }));

  setTimeout(() => {
    getData();
  }, 0);
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
                       variant='outline'
                       leftSection={<IconAdjustmentsCheck />}
                      
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



          <Paper radius="sm" mt="lg" style={{ position: 'relative' }} withBorder>
             <div className="p-4 border-b text-white flex justify-start bg-blue-800">
               <IconBookUpload size={25} />
            <h1 className='text-center font-medium px-3'> QC SECTION | Transmittal data List </h1>
             </div>

             <div className="p-4 justify-start">
            <h1 className='text-start font-bold'> Inspection Details : </h1>
             </div>

           <Paper mt="md">
            <div className="p-4 border-b flex flex-auto justify-items-center mt-6">
              <div className="w-svw">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-4">

                  {/* Inspector Name */}
                   <div
                    className="flex flex-col sm:flex-row sm:items-center gap-8"
                    ref={usersContainerRef}
                    style={{ overflow: "visible" }}
                      >
                    <label className="text-sm font-medium sm:w-40">Inspector Name</label>
            
                  <input
                    type="text"
                    className="border rounded px-3 py-2 w-full text-sm"
                     placeholder="Select Inspector Name"
                    value={userQuery}
                    onChange={(e) => {
                      setUserQuery(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                  />
            
                  
                  {showDropdown && userQuery.trim().length >= 0 && (
                    <div
                      className="absolute left-50 bg-white border rounded shadow max-h-56 overflow-auto"
                      style={{
                        top: "28%",
                        zIndex: 9999,
                        boxShadow: "0 20px 24px rgba(0,0,0,0.12)",
                        width: "50%",
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
                          className="w-full text-left px-2 py-2 hover:bg-gray-100"
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
                  

                  {/* Date */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-8">
                    <label className="text-sm font-medium sm:w-32">Inspect Date</label>
                    <DateInput
                    className="flex-1"
                    placeholder="dd-mm-yyyy"
                    value={inspectDate}
                    onChange={setInspectDate}
                    rightSection={<IconCalendar size={18} />}
                  />
                  </div>

                  {/* Type Invite */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-8">
                    <label className="text-sm font-medium sm:w-32">Invitation Type </label>
                   <Select
                    className="flex-1"
                    placeholder="Select Invitation Type"
                    data={invitationTypeOptions}
                    value={invitationType}
                    onChange={setInvitationType}
                    clearable
                  />
                  </div>
                  
                  {/* Inspect Time */}
                   <div className="flex flex-col sm:flex-row sm:items-center gap-8">
                    <label className="text-sm font-medium sm:w-32">Inspect Time</label>
                    <Select
                    className="flex-1"
                    placeholder="Select current time"
                    data={timeOptions}
                    value={inspectTime}
                    onChange={setInspectTime}
                    searchable
                    maxDropdownHeight={200}
                  />

                  </div>

                  {/* Inspect Auth */}
                   <div className="flex flex-col sm:flex-row sm:items-center gap-8">
                    <label className="text-sm font-medium sm:w-32">Inspect Authority </label>
                   <MultiSelect
                    className="flex-1"
                    placeholder="Select Inspect Authority"
                    data={AuthorityTypeOptions}
                    value={authorityType}
                    onChange={setAuthorityType}
                    clearable
                    searchable
                  />
                  </div>

                </div>
                  <div className="mt-12 flex justify-end mb-2 py-2">
             <Button
              variant="filled"
              color="green"
              className='shadow-sm'
              leftSection={<IconUpload />}
              disabled={
                !invitationType ||
                !authorityType.length === 0 ||
                !selectedUser ||
                !inspectDate ||
                !inspectTime ||
                selectedRowIds.length === 0
              }
              onClick={handleUpdateRfi}
            >
              Transmittal To Client
            </Button>

            </div>
              </div>
            </div>
            </Paper>
         
             <Paper radius="sm" mt="lg" >

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