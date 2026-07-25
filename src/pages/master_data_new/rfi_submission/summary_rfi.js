import Datatables from '@/components/custom/Datatables'
import AuthLayout from '@/components/layout/authLayout'
import { rfiSubmissionList } from '@/data/sidebar/rfi-submission'
import useApi from '@/hooks/useApi'
import useUser from '@/store/useUser'
import { Button, Paper, Checkbox, Select } from '@mantine/core'
import { useDebouncedState } from '@mantine/hooks'
import { IconAdjustmentsCheck, IconEdit, IconPlaylistAdd, IconX, IconUserDown, IconUpload, IconXboxX, IconCircleDashedLetterD, IconPdf, IconFileTypePdf, IconDetails, IconListDetails} from '@tabler/icons-react'
import { getCoreRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table'
import axios from 'axios'
import { useRouter } from 'next/router'
import useSwal from '@/hooks/useSwal'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { usePermissions } from '@/hooks/usePermissions'
import NoPermissionCard from '@/components/card_permission'

SummaryRfi.title = "Summary RFI Submission"
export default function SummaryRfi() {
  const router = useRouter()

  const { user } = useUser()
  const API = useApi()
  const { showAlert } = useSwal()
  const API_URL = API.API_URL
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [totalEntries, setTotalEntries] = useState(0);

  // PERMISSIONS DATA
  const hasViewPermission = usePermissions([35]);
  const hasDetailsDataPermission = usePermissions([36])


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


  const STATUS_INSPECTION_MAP = {
    6: { label: "Pending By Client", color: "bg-yellow-400 text-black" },
    7: { label: "Reject By Client", color: "bg-red-500 text-white" },
    8: { label: "Approve By Client", color: "bg-green-500 text-white" },
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
    cell: ({ row }) =>
        pagination.pageIndex * pagination.pageSize + row.index + 1,
    size: 50,
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
      accessorFn: (row) => row.requestor_name?? "-",
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
    const value = Number(info.getValue());

    const status =
    STATUS_INSPECTION_MAP[value] ?? {
        label: "-",
        color: "bg-gray-100 text-gray-800",
    };

    return (
    <span
        className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap inline-flex items-center ${status.color}`}
    >
        {status.label}
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
             {hasDetailsDataPermission && (
             <Button
              onClick={() => router.push(`/master_data_new/rfi_submission/client_section/details/summary_details/${value}`)}
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
    // getFilteredRowModel: getFilteredRowModel(),
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
  });

 const getData = useCallback(async () => {
  const searchQuery = {};
  columnFilters.forEach((filter) => {
    if (filter.value !== undefined && filter.value !== null && filter.value !== "") {
      searchQuery[filter.id] = filter.value;
    }
  });

  const filterParams =
    Object.keys(searchQuery).length > 0
      ? `search=${encodeURIComponent(JSON.stringify(searchQuery))}`
      : "";

  const sort =
    sorting.length > 0
      ? `${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}`
      : "";

    try {
    if (!user?.token) return;
    const res = await axios.post(

      `${API_URL}/api/pcms_mc_template/summary_rfi?${filterParams}&page=${pagination.pageIndex}&size=${pagination.pageSize}&sort=${sort}`,
      {},
      {
        headers: { Authorization: `Bearer ${user.token}` },
      }
    );

    const rawData = res.data?.data ?? []

    setData(rawData);
    setTotalPages(res.data?.total_pages ?? 1);
    setTotalEntries(res.data?.totalElements ?? rawData.length);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}, [
  API_URL,
  columnFilters,
  pagination.pageIndex,
  pagination.pageSize,
  sorting,
  user.token,
]);



  useEffect(() => {
    if (!user?.token) return;
    fetchArea();
    getData();
  }, [user?.token, columnFilters, pagination.pageIndex, pagination.pageSize, sorting, loadingData, savedFilter, API_URL, getData]);

useEffect(() => {
  if (selectedArea) {
    fetchLocation(selectedArea); // load location berdasarkan area
  }
}, [selectedArea]);

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
             <div className="p-4 border-b flex justify-start text-white bg-blue-800">
                <IconListDetails size={25} />
            <h1 className='text-center font-medium px-3'> CLIENT SECTION | Summary/Report RFI  </h1>
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