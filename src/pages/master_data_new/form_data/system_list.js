import PublicLayout from "@/components/layout/publicLayout"
import React, { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/router"
import axios from "axios"
import { Paper, ActionIcon, Tooltip } from "@mantine/core"
import { useDebouncedState } from "@mantine/hooks"
import { IconCopy, IconCheck } from "@tabler/icons-react"
import { getCoreRowModel, useReactTable } from "@tanstack/react-table"
import Datatables from "@/components/custom/Datatables"

/* ================= VALIDATION ================= */
const isValidValue = (value) => {
  if (value === null || value === undefined) return false
  if (typeof value === "number") return value !== 0
  if (typeof value === "string") {
    const trimmed = value.trim()
    return trimmed !== "" && trimmed !== "0"
  }
  return true
}

// 🔥 VALIDASI PROJECT
const isValidProjectRow = (row) => {
  if (!row) return false
  if (row.project_id === 0 || row.project_id === "0") return false
  return true
}

export default function System_List() {
  System_List.title = "System Data List"

  const router = useRouter()
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  /* ================= STATE ================= */
  const [loadingData, setLoadingData] = useState(true)
  const [data, setData] = useState([])
  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useDebouncedState([], 500)
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [totalPages, setTotalPages] = useState(1)
  const [totalEntries, setTotalEntries] = useState(0)
  const [copiedValue, setCopiedValue] = useState(null)

  /* ================= COPY HANDLER ================= */
 const handleCopy = async (value) => {
    if (!isValidValue(value)) return

    // Guard untuk SSR & browser lama
    if (typeof window === "undefined") return

    try {
        if (navigator?.clipboard?.writeText) {
            await navigator.clipboard.writeText(String(value))
        } else {
            // Fallback untuk HTTP / IP
            const textarea = document.createElement("textarea")
            textarea.value = String(value)
            textarea.style.position = "fixed"
            textarea.style.opacity = "0"
            document.body.appendChild(textarea)
            textarea.select()
            document.execCommand("copy")
            document.body.removeChild(textarea)
        }

        setCopiedValue(value)
        setTimeout(() => setCopiedValue(null), 1500)
    } catch (error) {
        console.error("Copy failed:", error)
    }
}

  /* ================= TABLE COLUMNS ================= */
  const columns = useMemo(
    () => [
      {
        id: "no",
        header: "No",
        size: 50,
        cell: ({ row }) =>
          row.index + 1 + pagination.pageIndex * pagination.pageSize,
      },
      {
        accessorFn: (row) => row.project_name,
        id: "project_name",
        header: "Project Name",
        enableSorting: true,
        enableColumnFilter: true,
        cell: ({ getValue }) => getValue() ?? "-",
      },

      {
        accessorFn: (row) => row.system_name,
        id: "system_name",
        header: "System Name",
        enableSorting: true,
        cell: ({ getValue }) => {
          const value = getValue()
          return (
            <div className="flex items-center gap-2">
              <span>{value ?? "-"}</span>
              {isValidValue(value) && (
                <Tooltip label="Copy">
                  <ActionIcon
                    size="sm"
                    variant="light"
                    onClick={() => handleCopy(value)}
                  >
                    {copiedValue === value ? (
                      <IconCheck size={16} color="green" />
                    ) : (
                      <IconCopy size={18} />
                    )}
                  </ActionIcon>
                </Tooltip>
              )}
            </div>
          )
        },
      },
      {
        accessorFn: (row) => row.description,
        id: "description",
        header: "Description",
        enableSorting: true,
        cell: ({ getValue }) => {
          const value = getValue()
          return (
            <div className="flex items-center gap-2">
              <span>{value ?? "-"}</span>
              
            </div>
          )
        },
      },
    ],
    [pagination, copiedValue]
  )

  /* ================= REACT TABLE ================= */
  const table = useReactTable({
    data,
    columns,
    state: { sorting, pagination, columnFilters },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
  })

  /* ================= SEARCH PARAMS ================= */
  const buildSearchParams = () => {
    const params = {}
    columnFilters.forEach((filter) => {
      if (filter.value) params[filter.id] = filter.value
    })
    return params
  }

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true)
      try {
        const sort =
          sorting.length > 0
            ? `${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}`
            : ""

        const response = await axios.get(
          `${API_URL}/public/master_system`,
          {
            params: {
              page: pagination.pageIndex + 1,
              size: pagination.pageSize,
              sort,
              ...buildSearchParams(),
            },
          }
        )

        const rawData = response.data?.content ?? []

        const filteredData = rawData.filter(isValidProjectRow)

        setData(filteredData)
        setTotalPages(response.data?.totalPages ?? 1)
        setTotalEntries(response.data?.totalElements ?? filteredData.length)

      } catch (error) {
        console.error("Error fetching system:", error)
      } finally {
        setLoadingData(false)
      }
    }

    fetchData()
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    columnFilters,
    sorting,
    API_URL,
  ])

  /* ================= RENDER ================= */
  return (
    <div className="py-6">
      <div className="max-w-full mx-auto sm:px-6 lg:px-8">
        <h1 className="text-center font-bold text-2xl">
          System Data List
        </h1>

        <Paper radius="sm" mt="md" withBorder>
          <div className="p-4 overflow-x-auto">
            <Datatables
              table={table}
              totalPages={totalPages}
              info={{ totalElements: totalEntries }}
              className="shadow-lg"
            />
          </div>
        </Paper>
      </div>
    </div>
  )
}

System_List.isPublic = true
System_List.getLayout = function getLayout(page) {
  return <PublicLayout>{page}</PublicLayout>
}
