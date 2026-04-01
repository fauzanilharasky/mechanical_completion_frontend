import Datatables from '@/components/custom/Datatables'
import AuthLayout from '@/components/layout/authLayout'
import { masterDataList } from '@/data/sidebar/master-data'
import useApi from '@/hooks/useApi'
import useUser from '@/store/useUser'
import { Button, Paper, Table } from '@mantine/core'
import { useDebouncedState } from '@mantine/hooks'
import { IconAd2, IconArrowLeft, IconDetailsOff, IconEdit, IconFileDownload, IconPlaylistAdd } from '@tabler/icons-react'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import axios from 'axios'
import { Search } from 'lucide-react'
import { useRouter } from 'next/router'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { usePermissions } from "@/hooks/usePermissions"
import useEncrypt from '@/hooks/useEncrypt'


const isValidValue = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    return value.trim() !== "" && value.trim() !== "0";
  }
  return true;
};


export const getStaticPaths = async () => {
    return {
        paths: [],
        fallback: "blocking"
    }
}

export const getStaticProps = async (context) => {
    return {
        props: { form_id: context.params.id }
    }
}


Details_system.title = "Master Form Details"
export default function Details_system({form_id}) {
  const router = useRouter()
  const { id } = router.query;
  // const form_id = id ? Number(id) : null;

  const { user } = useUser()

  const API = useApi()
  const API_URL = API.API_URL

  const [loadingData, setLoadingData] = useState(true)
  const [loadingOpt, setLoadingOpt] = useState(false)
  const [display, setDisplay] = useState(false)
  const [totalEntries, setTotalEntries] = useState(0);
  
  const [data, setData] = useState([])
  const [savedFilter, setSavedFilter] = useState({})
  const [checkedId, setCheckedId] = useState([])
  const [sorting, setSorting] = useState([{ id: "id", desc: false }]);
  const [columnFilters, setColumnFilters] = useDebouncedState([], 500);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalPages, setTotalPages] = useState(1);


  // PERMISSIONS DATA
    const hasAddDataPermission = usePermissions([10])
    const hasEditDataPermission = usePermissions([11])
    const { encrypt } = useEncrypt()



  const columns = useMemo(() => [

     {
      accessorFn: (row) => row.item_no,
      id: "item_no",
      header: "Item",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue(),
    },

    {
      accessorFn: (row) => row.group_name,
      id: "group_name",
      header: "Group Name",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue(),
    },


     {
      accessorFn: (row) => row.description,
      id: "description",
      header: "Description",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue(),
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
      : "Inactive";

    const colorClass =
      status === "Inactive"
        ? "bg-white-600 text-red-600 border border-red-500"
        : "bg-white-50 text-green-500 border border-green-500";

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
            {hasEditDataPermission && (
            <Button onClick={() => router.push(`/master_data_new/master_data_itr/form_checklist/${encrypt(value.toString())}`)} leftSection={<IconEdit />} color='green'> Edit</Button>            
            )}
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
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
  });





  // --------------------------- GET DATA ---------------------------

  const getData = useCallback(async () => {
    if (!form_id) return;

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
          `/api/master_checklist/serverside_list?form_id=${form_id}&${filterParams}&page=${pagination.pageIndex + 1}&size=${pagination.pageSize}&sort=${sort}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      const filteredData = data.data.filter((row) => {
        return (
          isValidValue(row.group_name) &&
          isValidValue(row.item_no) &&
          isValidValue(row.description)
        );
      });

      setData(filteredData);
      setTotalPages(data.total_pages);
      setTotalEntries(data.total ?? 0);
    },[API_URL, columnFilters, pagination.pageIndex, pagination.pageSize, sorting, user.token, form_id]);
  
      useEffect(() => {
      setSorting([{ id: "item_no", desc: false }]);
    }, []);


  useEffect(() => {
    if (user.token && form_id) {
      getData();
    }
    }, [user.token, columnFilters, pagination.pageIndex, pagination.pageSize, sorting, loadingData, savedFilter, API_URL, getData]);


  return (
    <AuthLayout sidebarList={masterDataList}>
  <div className="py-6 mt-4">
    <div className="max-w-full mx-auto sm:px-6 lg:px-8">
      <Paper radius="sm" mt="md" style={{ position: 'relative' }} withBorder>
        {/* Header tombol dan title */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between px-4 py-2">
         
          <div className="space-x-2">
            <Button color="red" 
            variant='outline'
            leftSection={<IconArrowLeft size={16} />} 
            onClick={() => router.push('/master_data_new/master_data_itr/master_system')}>
              Back
            </Button>
          </div>

          <h1 className="text-center font-bold text-2xl mt-2 flex-1">
            FORM DETAILS MASTER CHECKLIST
          </h1>

          
          <div className="space-x-2">
           {hasAddDataPermission && (
           <Button
            onClick={() =>
              router.push({
                pathname: '/master_data_new/master_data_itr/details/add_details',
                query: { form_id: id },
              })
            }
            leftSection={<IconPlaylistAdd />}
           >
            Add Master Checklist
          </Button>
           )}
            {/* <Button onClick={downloadExcel} leftSection = {<IconFileDownload/>}>Download Excel</Button> */}
          </div>
        </div>

        
        <div className="p-4 overflow-x-auto">
          <Datatables table={table} totalPages={totalPages} info={{ totalElements: totalEntries }} />
        </div>
      </Paper>
    </div>
  </div>
</AuthLayout>

  )
}
