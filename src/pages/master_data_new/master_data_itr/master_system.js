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
import NoPermissionCard from '@/components/card_permission';
import { usePermissions } from "@/hooks/usePermissions"
import useEncrypt from "@/hooks/useEncrypt"



Master_form_list.title = "Master Form List"
export default function Master_form_list() {
  const router = useRouter()
  const { user } = useUser()
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
   const [totalEntries, setTotalEntries] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

 

  const hasViewPermission = usePermissions([3]);
  

  // PERMISSIONS
  const hasAddDataPermission = usePermissions([8])
  const hasEditDataPermission = usePermissions([9])
  const hasDetailsPermission = usePermissions([12])
   const { encrypt } = useEncrypt()

  const columns = useMemo(() => [

    {
    id: "no",
    header: "No.",
    cell: ({ row }) => {
      // Hitung nomor urut berdasarkan index row + offset halaman
      const rowNumber = row.index + 1 + (pagination.pageIndex * pagination.pageSize);
      return rowNumber;
    },
    size: 40,
  },

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

        if (!value) return "-";

    
        if (Array.isArray(value)) {
          return value.join(", ");
        }

        if (typeof value === "string") {
          try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
              return parsed.join(", ");
            }
          } catch (e) {
            // lanjut ke logic berikutnya
          }

          return value
            .split(";")        
            .map(v => v.trim())  
            .filter(Boolean)     
            .join(", ");        
        }

        return "-";
      },
    },


    {
      accessorFn: (row) => row.status_delete,
      id: "status delete",
      header: "Status",
      enableColumnFilter: false,
      enableSorting: true,
      cell: (info) => {
    const value = info.getValue();
    const status = (value === 1 || value === "1")
      ? "Active"
      : "unactive";

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
            <Button.Group>
            {hasEditDataPermission && (
            <Button className='mb-2'
              onClick={() => router.push(`/master_data_new/master_data_itr/edit_form/${encrypt(value.toString())}`)}
              leftSection={<IconEdit size={18} />} color='orange'
            >
              Edit
            </Button>
            )}

            {hasDetailsPermission && (
            <Button
            onClick={() => router.push(`/master_data_new/master_data_itr/details/${encrypt(value.toString())}`)}
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
        `/api/master_form/serverside_list?${filterParams}&page=${pagination.pageIndex+1}&size=${pagination.pageSize}&sort=${sort}`,
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
  }, [API_URL, columnFilters, pagination.pageIndex, pagination.pageSize, sorting, user.token]);


  useEffect(() => {
    getData();
  }, [user.token, columnFilters, pagination.pageIndex, pagination.pageSize, sorting, loadingData, savedFilter, API_URL, getData]);

  return (
    <AuthLayout sidebarList={masterDataList}>
       {hasViewPermission ? (
      <div className='py-8 mb-8 px-2'>
        <div className="max-w-full mx-auto sm:px-6 lg:px-8 py-4">
          <Paper radius="sm" mt="md" style={{ position: 'relative' }} withBorder>
             <div className="p-4 border-b border-black flex justify-center text-xl bg-gray-300">
            <h1 className='text-center font-bold'>  MASTER DATA ITR LIST </h1>
             </div>
            <div className="px-4 py-2 text-right space-x-2">
              {hasAddDataPermission && (
              <Button onClick={() => router.push("/master_data_new/master_data_itr/add_master")}
                leftSection={<IconPlaylistAdd />} > Add Master ITR</Button>
              )}
            </div>
            <div className="p-4 overflow-x-auto">
              {
                <Datatables table={table} totalPages={totalPages}  info={{ totalElements: totalEntries }} />
              }
            </div>
          </Paper>
        </div>
      </div>
       ) : (
      <NoPermissionCard />
      )}
      
    </AuthLayout>
  )
}
