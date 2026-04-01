import Datatables from '@/components/custom/Datatables'
import AuthLayout from '@/components/layout/authLayout'
import { masterDataList } from '@/data/sidebar/master-data'
import useApi from '@/hooks/useApi'
import useUser from '@/store/useUser'
import { Button, Paper, Table } from '@mantine/core'
import { useDebouncedState } from '@mantine/hooks'
import { IconAd, IconAdjustmentsCheck, IconChecks, IconCircleDashedLetterD, IconDetails, IconDetailsOff, IconEdit, IconPlaylistAdd } from '@tabler/icons-react'
import { getCoreRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table'
import axios from 'axios'
import { useRouter } from 'next/router'
import React, { useCallback, useEffect, useMemo, useState } from 'react'


Master_form_list.title = "Master Form List"
export default function Master_form_list() {
  const router = useRouter()
  const { user } = useUser()

  console.log(user)
  const API = useApi()
  const API_URL = API.API_URL

  const [loadingData, setLoadingData] = useState(true)
  const [loadingOpt, setLoadingOpt] = useState(false)
  const [display, setDisplay] = useState(false)
  const [data, setData] = useState([])
  const [savedFilter, setSavedFilter] = useState({})
  const [checkedId, setCheckedId] = useState([])
  const [sorting, setSorting] = useState([{ id: "id", desc: true }]);
  const [columnFilters, setColumnFilters] = useDebouncedState([], 500);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalPages, setTotalPages] = useState(1);

  const columns = useMemo(() => [

    {
      accessorFn: (row) => row.cert_id,
      id: "cert_id",
      header: "Cert ID",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue()
    },

    {
      accessorFn: (row) => row.form_code,
      id: "form_code",
      header: "Form Code",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue(),
    },

    {
      accessorFn: (row) => row.phase?.phase_name,
      id: "phase_name",
      header: "Phase",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue(),
    },

    {
      accessorFn: (row) => row.discipline_rel?.discipline_name,
      id: "discipline",
      header: "Discipline",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue(),
    },

    {
      accessorFn: (row) => row.activity_description,
      id: "activity_description",
      header: "Activity Description",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue(),
    },

    {
      accessorFn: (row) => row.inspection_type,
      id: "inspection_type",
      header: "Inspection",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue()
    },

    {
      accessorFn: (row) => row.options, 
      id: "options",
      header: "Options",
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
      id: "status delete",
      header: "Status",
      enableColumnFilter: false,
      enableSorting: true,
      cell: (info) => { const value = info.getValue(); 
      return value === "1" || value === 1 ? "Active" : "Inactive";},
    },

    {
  accessorFn: (row) => row.id,
  id: "unassign",
  header: "Unassign",
  enableColumnFilter: false,
  enableSorting: false,
  cell: (info) => {
    const value = info.getValue();
    return (
      <Button
        color="red"
        onClick={() => handleUnassign(value)}
        leftSection={<IconDetailsOff />}
      >
        Unassign
      </Button>
    );
  },
},
    
    {
      accessorFn: (row) => row.id,
      id: "id",
      header: "Action",
      enableColumnFilter: false,
      enableSorting: true,
      cell: (info) => {
        let value = info.getValue()
        return (
          <div className='align-middle items-center'>

            <Button className='mb-2'
            onClick={() => router.push(`/master_data_new/master_data_itr/edit_form/${value}`)} 
            leftSection={<IconEdit />} color='orange'
            > 
            Edit
            </Button>


            <Button
            onClick={() => router.push(`/master_data_new/master_data_itr/details/${value}`)}
            leftSection={<IconCircleDashedLetterD/>}
            color="blue"
            className="ml-2"
          >
            Detail
          </Button>
          </div>
          
        )
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

  const downloadPdf  = async() => {
    try {
      const response = await axios.get(API_URL + '/api/testing/generate_pdf', {
        responseType: "blob",
        headers : {
          Authorization : "Bearer "+user.token
        }
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "PDF Sample.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  }

  const downloadExcel = async () => {
    try {
      const response = await axios.get(API_URL + '/api/testing/download', {
        responseType: "blob",
        headers : {
          Authorization : "Bearer "+user.token
        }
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "LargeData.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  }

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

    const handleUnassign = async (id) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/master_form/unassign/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
    );

    if (response.status === 200) {
      console.log("Unassign success");
      getData(); // refresh table
    } else {
      console.error("Unassign failed:", response.data);
    }
  } catch (error) {
    console.error("Error during unassign:", error);
  }
};

    setData(data.data);
    setTotalPages(data.total_pages);
  },[API_URL, columnFilters, pagination.pageIndex, pagination.pageSize, sorting, user.token]);


  useEffect(() => {
    getData();
  }, [user.token, columnFilters, pagination.pageIndex, pagination.pageSize, sorting, loadingData, savedFilter, API_URL, getData]);

  return (
    <AuthLayout sidebarList={masterDataList}>
      <div className='py-6'>
        <div className="max-w-full mx-auto sm:px-6 lg:px-8 py-4"> 
          <Paper radius="sm" mt="md" style={{ position: 'relative' }} withBorder>
            <div className="px-4 py-2 text-right space-x-2">
              <h1 className='text-center font-bold text-xl mt-2'>FORM MASTER DATA ITR</h1>
              <Button onClick={() => router.push("/master_data_new/master_data_itr/add_master")}
                leftSection ={<IconPlaylistAdd/>} > Add Master ITR</Button>
              {/* <Button onClick={downloadExcel}> Download Excel</Button>
              <Button onClick={downloadPdf}> Download PDF</Button> */}
            </div>
            <div className="p-4 overflow-x-auto">
              {
                <Datatables table={table} totalPages={totalPages} />
              }
            </div>
          </Paper>
        </div>
      </div>
    </AuthLayout>
  )
}