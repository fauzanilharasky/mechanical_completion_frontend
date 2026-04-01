import React, { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/router"
import axios from "axios"
import { Button, ButtonGroup, Paper } from "@mantine/core"
import { useDebouncedState } from "@mantine/hooks"
import { IconAddressBook, IconCreativeCommons, IconEdit, IconPlaylistAdd, IconSettings } from "@tabler/icons-react"
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





export default function Permission_List() {
  Permission_List.title = "Permission Data List"

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
  const [sorting, setSorting] = useState([{ id: "id_application", desc: true }])
  const [columnFilters, setColumnFilters] = useDebouncedState([], 500)
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [totalPages, setTotalPages] = useState(1)
  const [totalEntries, setTotalEntries] = useState(0);
  

   const hasViewPermission = usePermissions([51]);

  // PERMISSIONS DATA
//   const hasAddDataPermission = usePermissions([4])
//   const hasEditDataPermission = usePermissions([5])


 

  // Table Columns
  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.app_name,
        id: "app_name",
        header: "Application Name",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue() ?? "-",
      },
      {
        accessorFn: (row) =>{
        if (!row.created_date) return "-";

        const date = new Date(row.created_date);

        return date.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });
        },
        id: "created_date",
        header: "Date Created",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue(),
      },
      {
        
        id: "actions",
        header: "Action",
        cell: ({ row }) => {
          const value = row.original.id_application
          return (
            <div className="flex-auto justify-center items-center gap-2">
               {/* {hasEditDataPermission && ( */}
               <ButtonGroup className="justify-center">
              <Button
                size="sm"
                color="gray"
                leftSection={<IconSettings size={20} />}
                onClick={() =>
                  router.push(`/master_data_new/permission_system/permission/${encrypt(value.toString())}`)
                }
              >
                Permission
              </Button>

               <Button
                size="sm"
                color="orange"
                leftSection={<IconEdit size={16} />}
                onClick={() =>
                  router.push(`/master_data_new/permission_system/edit_list/${encrypt(value.toString())}`)
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
      if (!user?.token) return;
       setLoadingData(true)
      try {
        const sort =
          sorting && sorting.length > 0
            ? `${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}`
            : ""

        const response = await axios.get(`${API_URL}/api/portal_app_permission/permissions`, {

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

        setData(rawData)
        setTotalPages(response.data?.totalPages ?? 1)
        setTotalEntries(response.data?.totalElements ?? rawData.length)

      } catch (error) {
        console.error("Error fetching master data:", error)
      } finally {
        setLoadingData(false)
      }
    }

    fetchData()
      }, [
      user?.token,
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
    <div className="py-8 px-6 mb-8">
      <div className="max-w-full mx-auto sm:px-6 lg:px-8">
        <Paper radius="sm" mt="md" style={{ position: "relative" }} withBorder>
          <div className="p-4 border-b border-white flex justify-center text-xl bg-gray-300 border-b-black">
            <h1 className='text-center font-bold'> Master Permission </h1>
             </div>
          <div className="px-4 py-2 text-right space-x-2 mt-2">
            {/* {hasAddDataPermission && ( */}
            <Button 
            onClick={() => router.push("/master_data_new/permission_system/create_data")}
             leftSection={<IconPlaylistAdd />}
            >
              Add Data
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
