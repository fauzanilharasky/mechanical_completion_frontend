import React, { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/router"
import axios from "axios"
import { Button, ButtonGroup, Paper } from "@mantine/core"
import { useDebouncedState } from "@mantine/hooks"
import { IconAddressBook, IconCreativeCommons, IconEdit, IconPlaylistAdd, IconPlus } from "@tabler/icons-react"
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

// const isValidProjectRow = (row) => {
//   if (!row) return false
//   if (row.project_id === 0 || row.project_id === "0") return false
//   return true
// }

export default function User_System_List() {
  User_System_List.title = "User System List";

  const router = useRouter()
  const { user } = useUser()
  const { encrypt } = useEncrypt()
  const API = useApi()
  const API_URL = API.API_URL

  // State
  const [loadingData, setLoadingData] = useState(true)
  const [loadingOpt, setLoadingOpt] = useState(false)
  const [data, setData] = useState([])
  const [savedFilter, setSavedFilter] = useState({})
  const [sorting, setSorting] = useState([{ id: "id_user", desc: true }])
  const [columnFilters, setColumnFilters] = useDebouncedState([], 500)
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [totalPages, setTotalPages] = useState(1)
  const [totalEntries, setTotalEntries] = useState(0);

  const hasViewPermission = usePermissions([1]);

 

  // Table Columns
  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.full_name,
        id: "full_name",
        header: "FullName",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue() ?? "-",
      },
      {
        accessorFn: (row) => row.badge_no ?? "-",
        id: "badge_no",
        header: "Badge No",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue(),
      },
      {
        accessorFn: (row) => row.username ?? "-",
        id: "username",
        header: "Username",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue(),
      },

      {
        accessorFn: (row) => row.email ?? "-",
        id: "email",
        header: "Email",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue(),
      },

      {
        accessorFn: (row) => row.status_user,
        id: "status_user",
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
        accessorFn: (row) => row.id_user, 
        id: "id_user",
        header: "Action",
        enableColumnFilter: false,
        cell: (info) => {
          let value = info.getValue()
          return (
            <div className="flex-auto justify-center items-center gap-2">
               {/* {hasEditDataPermission && ( */}
                <ButtonGroup className="justify-center">
              <Button
                size="xs"
                color="orange"
                leftSection={<IconEdit size={18} />}
                onClick={() =>
                  router.push(`/master_data_new/user_management/edit_user/${encrypt(value.toString())}`)}
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
    const buildSearchParams = () => {
    const params = {}
    columnFilters.forEach((filter) => {
      if (filter.value) params[filter.id] = filter.value
    })
    return params
  }

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
       setLoadingData(true)
      try {
        const sort =
          sorting && sorting.length > 0
            ? `${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}`
            : ""

        const response = await axios.get(`${API_URL}/api/portal_user/user_system`, {

          params: {
            
            page: pagination.pageIndex + 1,
            size: pagination.pageSize,
            sort,
            ...buildSearchParams(),
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
    })

      
        const rawData = response.data?.content ?? []

        setData(rawData);
        setTotalPages(response.data?.totalPages ?? 1);
        setTotalEntries(response.data?.totalElements ?? rawData.length);

      } catch (error) {
        console.error("Error fetching master data:", error)
      } finally {
        setLoadingData(false)
      }
    }

    fetchData()
      }, [
      user.token,
      columnFilters,
      pagination.pageIndex,
      pagination.pageSize,
      sorting,
      savedFilter,
      API_URL,
    ])

return (
  <AuthLayout sidebarList={userManagementList}>
     {/* {hasViewPermission ? ( */}
    <div className="py-8 mb-8">
      <div className="max-w-full mx-auto sm:px-6 lg:px-8">
        <Paper radius="sm" mt="md" style={{ position: "relative" }} withBorder>
          <div className="p-4 border-b border-white flex justify-center text-xl bg-gray-300">
            <h1 className='text-center font-bold'> User System Data List </h1>
             </div>
          <div className="px-4 py-2 text-right space-x-2">
            {/* {hasAddDataPermission && ( */}
            <Button 
             onClick={() => router.push("/master_data_new/user_management/create_user")}
             leftSection={<IconPlus />}
             className="mt-3"
            >
              Add User Data
            </Button>
            {/* )} */}
          </div>

          <div className="p-4 overflow-x-auto">
            <Datatables table={table} totalPages={totalPages}  info={{ totalElements: totalEntries }} />
          </div>
        </Paper>
      </div>
    </div>
    {/* ) : ( */}
    {/* <NoPermissionCard /> */}
    {/* )} */}
  </AuthLayout>
)
}
