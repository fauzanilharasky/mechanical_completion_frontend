import Datatables from '@/components/custom/Datatables';
import AuthLayout from '@/components/layout/authLayout';
import { masterDataList } from '@/data/sidebar/master-data';
import useApi from '@/hooks/useApi';
import useUser from '@/store/useUser';
import { Button, Paper } from '@mantine/core';
import { useDebouncedState } from '@mantine/hooks';
import { IconEdit, IconPlaylistAdd } from '@tabler/icons-react';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import axios from 'axios';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState, useCallback } from 'react';

SubsystemList.title = "Master Data SubSystem";
export default function SubsystemList() {
  const router = useRouter();
  const { user } = useUser();
  const API = useApi();
  const API_URL = API.API_URL;
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState([]);
  const [columnFilters, setColumnFilters] = useDebouncedState([], 500);
  const [sorting, setSorting] = useState([{ id: 'id', desc: true }]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);

  const [search, setSearch] = useState("");

  const columns = useMemo(() => [
    {
      accessorFn: (row) => row.system?.system_name ?? '',
      id: 'system_name',
      header: 'System Name',
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue(),
    },
    {
      accessorFn: (row) => row.subsystem_name,
      id: 'subsystem_name',
      header: 'Subsystem Name',
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue(),
    },
    {
      accessorFn: (row) => row.subsystem_description,
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
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue() === 1 ? 'Active' : 'Inactive',
    },
    {
      accessorFn: (row) => row.id,
      id: 'id',
      header: 'Action',
      enableColumnFilter: false,
      cell: (info) => (
        <Button
          leftSection={<IconEdit />}
          color="orange"
          onClick={() => router.push('/master_data_subsystem/edit_subsystem/' + info.getValue())}
        >
          Edit
        </Button>
      ),
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

  useEffect(() => {
    const fetchData = async () => {
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

        const { data } = await axios.post(
          `${API_URL}/api/master_subsystem/serverside`,
          {
            sort: sort,
            search: Object.keys(searchQuery).length > 0 ? JSON.stringify(searchQuery) : "",
            page: Number(pagination?.pageIndex ?? 0),
            size: Number(pagination?.pageSize ?? 10),
          },
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        setData(data.data ?? []);
        setTotalPages(data.total_pages ?? 1);
        setTotalEntries(data.total ?? 0);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchData();
  }, [user.token, pagination.pageIndex, pagination.pageSize, sorting, columnFilters, API_URL]);

  return (
    <AuthLayout sidebarList={masterDataList}>
      <div className='py-6'>
        <div className="max-w-full mx-auto sm:px-6 lg:px-8 py-4">
          <Paper radius="sm" mt="md" style={{ position: 'relative' }} withBorder>
            <div className="px-4 py-2 text-right space-x-2">
              <h1 className='text-center font-bold text-xl mt-2'>MASTER DATA SUBSYSTEM </h1>
              <Button onClick={() => router.push("/master_data_subsystem/add_subsystem")}
                leftSection={<IconPlaylistAdd />} > Add Master SubSystem</Button>
              {/* <Button onClick={downloadExcel}> Download Excel</Button>
              <Button onClick={downloadPdf}> Download PDF</Button> */}
            </div>
            <div className="p-4 overflow-x-auto">
              <Datatables table={table} totalPages={totalPages} info={{ totalElements: totalEntries }} />
            </div>
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}
