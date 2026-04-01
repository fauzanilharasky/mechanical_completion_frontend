import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/router"
import axios from "axios"
import { Button, ButtonGroup, Paper } from "@mantine/core"
import { useDebouncedState } from "@mantine/hooks"
import { IconAddressBook, IconArrowLeft, IconCreativeCommons, IconEdit, IconPlaylistAdd, IconSettings } from "@tabler/icons-react"
import { getCoreRowModel, useReactTable } from "@tanstack/react-table"
import NoPermissionCard from '@/components/card_permission';
import Datatables from "@/components/custom/Datatables"
import AuthLayout from "@/components/layout/authLayout"
import { masterDataList } from "@/data/sidebar/master-data"
import useApi from "@/hooks/useApi"
import useUser from "@/store/useUser"
import { usePermissions } from "@/hooks/usePermissions"
import useEncrypt from "@/hooks/useEncrypt"
import { userManagementList } from "@/data/sidebar/user_management"

// ------------------ validation read data ----------------

 Permission_group.title = "Permission Data Group"
export default function Permission_group() {
 

  const router = useRouter()
  const { user } = useUser()
   const { id_permission } = router.query;
  const { encrypt } = useEncrypt()
  const API = useApi()
  const API_URL = API.API_URL

  // State
  const [loadingData, setLoadingData] = useState(true)
  const [loadingOpt, setLoadingOpt] = useState(false)
  const [data, setData] = useState([])
  const [savedFilter, setSavedFilter] = useState({})
  const [sorting, setSorting] = useState([{ id: "id_app_permission", desc: true }])
  const [columnFilters, setColumnFilters] = useDebouncedState([], 500)
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [totalPages, setTotalPages] = useState(1)
  const [totalEntries, setTotalEntries] = useState(0);

//    const hasViewPermission = usePermissions([1]);

  // PERMISSIONS DATA
//   const hasAddDataPermission = usePermissions([4])
//   const hasEditDataPermission = usePermissions([5])


 

  // Table Columns
  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.portalApp?.app_name,
        id: "app_name",
        header: "Application Name",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (info) => info.getValue() ?? "-",
      },

      {
        accessorFn: (row) => row.permission_group,
        id: "permission_group",
        header: "Permission Group",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue() ?? "-",
      },

      {
        accessorFn: (row) => row.permission_name,
        id: "permission_name",
        header: "Permission Name",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue() ?? "-",
      },

      {
        accessorFn: (row) => row.index_key,
        id: "index_key",
        header: "Index Key",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue() ?? "-",
      },



      {
        
        id: "actions",
        header: "Action",
        cell: ({ row }) => {
          const value = row.original.id_permission
          return (
            <div className="flex-auto justify-center items-center gap-2">
               {/* {hasEditDataPermission && ( */}
               <ButtonGroup className="justify-center">
               <Button
                size="sm"
                color="orange"
                leftSection={<IconEdit size={16} />}
                onClick={() =>
                  router.push(`/master_data_new/permission_system/edit/${encrypt(value.toString())}`)
                }
              >
                Edit
              </Button>
              </ButtonGroup>
              {/* )} */}
            </div>
          )
        },
      },
    ],
    [router]
  )

  // React Table
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
  })

  // Build Search Params
//     const buildSearchParams = () => {
//     const params = {}
//     columnFilters.forEach((filter) => {
//       if (filter.value) params[filter.id] = filter.value
//     })
//     return params
//   }

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
        `/api/portal_permission/permissions?${filterParams}&page=${pagination.pageIndex+1}&size=${pagination.pageSize}&sort=${sort}`,
      {
        filter: filterParams,
        page: pagination.pageIndex + 1,
        size: pagination.pageSize,
        sort: sort,
        id_app_permission: id_permission,
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
    if (!user?.token) return;
    getData();
  }, [user?.token, columnFilters, pagination.pageIndex, pagination.pageSize, sorting, loadingData, savedFilter, API_URL, getData]);


return (
  <AuthLayout sidebarList={userManagementList}>
     {/* {hasViewPermission ? ( */}
    <div className="py-6">
      <div className="max-w-full mx-auto sm:px-6 lg:px-8">
        <Paper radius="sm" mt="md" style={{ position: "relative" }} withBorder>
          <div className="p-4 border-b border-white flex text-xl bg-gray-300 border-b-black">
            <ButtonGroup>
            <Button className="justify-start"
            onClick={() => router.push("/master_data_new/permission_system/permission_list")}
             leftSection={<IconArrowLeft />}
             variant="filled"
             color="red"
            >
              Back
            </Button>
            <Button
              onClick={() => {
                if (!id_permission) return

                router.push({
                  pathname:
                    '/master_data_new/permission_system/permission/add_data',
                  query: {
                    id_app_permission: id_permission,
                  },
                })
              }}
              leftSection={<IconPlaylistAdd />}
            >
              Add Data Permissions
            </Button>
            </ButtonGroup>
             </div>
           <h1 className="font-bold text-center mt-4 text-2xl mb-4"> Details Permissions System </h1>

          <div className="p-4 overflow-x-auto">
            <Datatables table={table} totalPages={totalPages}  info={{ totalElements: totalEntries }} />
          </div>
        </Paper>
      </div>
    </div>
    {/* // ) : ( */}
     {/* <NoPermissionCard /> */}
    {/* // )} */}
  </AuthLayout>
)
}
