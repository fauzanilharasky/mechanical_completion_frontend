import Datatables from '@/components/custom/Datatables';
import AuthLayout from '@/components/layout/authLayout';
import { masterDataList } from '@/data/sidebar/master-data';
import NoPermissionCard from '@/components/card_permission';
import useApi from '@/hooks/useApi';
import useUser from '@/store/useUser';
import { Button, Paper } from '@mantine/core';
import { useDebouncedState } from '@mantine/hooks';
import { IconEdit, IconPlaylistAdd } from '@tabler/icons-react';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import axios from 'axios';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { usePermissions } from "@/hooks/usePermissions"
import useEncrypt from '@/hooks/useEncrypt';



/* ------------------ VALIDATION HELPER ----------------- */
const isValidValue = (value) => {
  if (value === null || value === undefined) return false;

  if (typeof value === "number") {
    return value !== 0;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed !== "" && trimmed !== "0";
  }

  return true;
};



SubsystemList.title = "Master Data SubSystem";
export default function SubsystemList() {
  const router = useRouter();
  const { user } = useUser();
  const API = useApi();
  const API_URL = API.API_URL;
  const [loadingData, setLoadingData] = useState(true);

  const [data, setData] = useState([]);
  const [columnFilters, setColumnFilters] = useDebouncedState([], 500);
  const [sorting, setSorting] = useState([{ id: 'id', desc: true }]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);

  const [search, setSearch] = useState("");


  // PERMISSIONS 
    const hasViewPermission = usePermissions([2]);

    const hasAddDataPermission = usePermissions([6])
    const hasEditDataPermission = usePermissions([7])
    const { encrypt } = useEncrypt()



  const columns = useMemo(() => [
    {
      accessorFn: (row) => row.system?.system_name ?? '-',
      id: 'system_name',
      header: 'System Name',
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue(),
    },
    {
      accessorFn: (row) => row.subsystem_name ?? '-',
      id: 'subsystem_name',
      header: 'Subsystem Name',
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue(),
    },
    {
      accessorFn: (row) => row.subsystem_description ?? '-',
      id: 'subsystem_description',
      header: 'Description',
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue(),
    },
    {
      accessorFn: (row) => row.status_delete,
      id: 'status_delete',
      header: 'Status',
      enableColumnFilter: false,
      enableSorting: true,
       cell: (info) => {
    const value = info.getValue();
    const status = (value === 1 || value === "1")
      ? "Active"
      : "Inactive";

    const colorClass =
      status === "Inactive"
        ? "bg-red-500 text-white border border-white"
        : " bg-green-500 text-white border border-white";

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
      id: 'id',
      header: 'Action',
      enableColumnFilter: false,
      cell: (info) => {
         let value = info.getValue()
         return (
       <div className="flex-auto justify-center items-center gap-2">
        {hasEditDataPermission && (
        <Button
          leftSection={<IconEdit size={16}/>}
          color="orange"
          onClick={() => router.push(`/master_data_new/master_data_subsystem/edit_subsystem/${encrypt(value.toString())}`)}
          className='height: 10 width: 20'
        >
          Edit
        </Button>
      )}
            </div>
         )
      },
    },
  ], [router]);

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
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
  });

  // ================= SEARCH PARAMS =================
   const buildSearchParams = () => {
        const params = {}
        columnFilters.forEach((filter) => {
            if (filter.value) params[filter.id] = filter.value
        })
        return params
    }


  useEffect(() => {
    if (!user?.token) return;

    const fetchData = async () => {
      setLoadingData(true)
      try {
        // Build search query dari columnFilters
        const searchQuery = {};
        columnFilters.forEach((filter) => {
          if (filter.value != null && filter.value !== "") {
            if (filter.id === "status_delete") {
              // mapping label ke value DB
              if (filter.value.toLowerCase() === "active") {
                searchQuery[filter.id] = 1;
              } else if (filter.value.toLowerCase() === "inactive") {
                searchQuery[filter.id] = 0;
              }
            } else {
              searchQuery[filter.id] = filter.value;
            }
          }
        });

        // Build sort parameter
        const sort =
          sorting && sorting.length > 0
            ? `${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}`
            : null;

        const response  = await axios.post(
          `${API_URL}/api/master_subsystem/serverside`,
          {
            page: pagination.pageIndex + 1,
            size: pagination.pageSize,
            sort,
            ...buildSearchParams(),
          },
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

       const rawData = response.data?.content ?? [];

      setData(rawData);

      setTotalPages(response.data?.totalPages ?? 1);
      setTotalEntries(response.data?.totalElements ?? rawData.length);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchData();
  }, [user?.token, pagination.pageIndex, pagination.pageSize, sorting, columnFilters, API_URL]);

  return (
    <AuthLayout sidebarList={masterDataList}>
      {hasViewPermission ? (
      <div className='py-4 mb-8 px-5'>
        <div className="max-w-full mx-2 sm:px-6 lg:px-8 py-4">
          <Paper radius="sm" mt="md" style={{ position: 'relative' }} withBorder>
            <div className="px-4 py-2 text-right space-x-2">
              <div className="p-4 border-b border-black flex justify-center bg-gray-300">
            <h1 className='text-center font-bold text-xl'>MASTER DATA SUBSYSTEM LIST </h1>
             </div>
             {hasAddDataPermission && (
              <Button onClick={() => router.push("/master_data_new/master_data_subsystem/add_subsystem")}
                leftSection={<IconPlaylistAdd />} className='justify-end mt-4'> Add Master SubSystem</Button>
             )}
            </div>
            <div className="p-4 overflow-x-auto">
              <Datatables table={table} totalPages={totalPages} info={{ totalElements: totalEntries }} />
            </div>
          </Paper>
        </div>
      </div>
      ) : (
      <NoPermissionCard />
      )}

    </AuthLayout>
  );
}
