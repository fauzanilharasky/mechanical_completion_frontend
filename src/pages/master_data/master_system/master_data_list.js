import React, { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/router"
import axios from "axios"
import { Button, Paper } from "@mantine/core"
import { useDebouncedState } from "@mantine/hooks"
import { IconAddressBook, IconCreativeCommons, IconEdit, IconPlaylistAdd } from "@tabler/icons-react"
import { getCoreRowModel, useReactTable } from "@tanstack/react-table"
import NoPermissionCard from '@/components/card_permission';
import Datatables from "@/components/custom/Datatables"
import AuthLayout from "@/components/layout/authLayout"
import { masterDataList } from "@/data/sidebar/master-data"
import useApi from "@/hooks/useApi"
import useUser from "@/store/useUser"
import { usePermissions } from "@/hooks/usePermissions"
import useEncrypt from "@/hooks/useEncrypt"

// ------------------ validation read data ----------------

const isValidProjectRow = (row) => {
  if (!row) return false
  if (row.project_id === 0 || row.project_id === "0") return false
  return true
}

export default function Master_Data_List() {
  Master_Data_List.title = "Master Data List"

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
  const [sorting, setSorting] = useState([{ id: "id", desc: true }])
  const [columnFilters, setColumnFilters] = useDebouncedState([], 500)
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [totalPages, setTotalPages] = useState(1)
  const [totalEntries, setTotalEntries] = useState(0);

   const hasViewPermission = usePermissions([1]);

  // PERMISSIONS DATA
  const hasAddDataPermission = usePermissions([4])
  const hasEditDataPermission = usePermissions([5])


 

  // Table Columns
  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.project_name,
        id: "project_name",
        header: "Project Name",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue() ?? "-",
      },
      {
        accessorFn: (row) => row.system_name,
        id: "system_name",
        header: "System Name",
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
        
        id: "actions",
        header: "Action",
        cell: ({ row }) => {
          const value = row.original.id
          return (
            <div className="flex-auto justify-center items-center gap-2">
               {hasEditDataPermission && (
              <Button
                size="xs"
                color="orange"
                leftSection={<IconEdit size={16} />}
                onClick={() =>
                  router.push(`/master_data/master_system/edit_masterdata/${encrypt(value.toString())}`)
                }
              >
                Edit
              </Button>
              )}
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
    if (!user?.token) return;

    const fetchData = async () => {
       setLoadingData(true)
      try {
        const sort =
          sorting && sorting.length > 0
            ? `${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}`
            : ""

        const response = await axios.get(`${API_URL}/api/master_system`, {

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

        const filteredData = rawData.filter(isValidProjectRow)

        setData(filteredData)
        setTotalPages(response.data?.totalPages ?? 1)
        setTotalEntries(response.data?.totalElements ?? filteredData.length)

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
  <AuthLayout sidebarList={masterDataList}>
     {hasViewPermission ? (
    <div className="py-8 mb-8 px-5">
      <div className="max-w-full mx-auto sm:px-6 lg:px-8">
        <Paper radius="sm" mt="md" style={{ position: "relative" }} withBorder>
          <div className="p-4 border-b border-white flex justify-center text-xl bg-gray-300">
            <h1 className='text-center font-bold'> MASTER DATA SYSTEM </h1>
             </div>
          <div className="px-4 py-2 text-right space-x-2">
            {hasAddDataPermission && (
            <Button 
            onClick={() => router.push("/master_data/master_system/add_masterdata")}
             leftSection={<IconPlaylistAdd />}
            >
              Add Data
            </Button>
            )}
          </div>

          <div className="p-4 overflow-x-auto">
            <Datatables table={table} totalPages={totalPages}  info={{ totalElements: totalEntries }} />
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
