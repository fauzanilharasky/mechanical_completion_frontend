import PublicLayout from "@/components/layout/publicLayout"
import React, { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/router"
import axios from "axios"
import { Button, Paper, ActionIcon, Tooltip } from "@mantine/core"
import { useDebouncedState } from "@mantine/hooks"
import {
  IconCopy,
  IconCheck,
} from "@tabler/icons-react"
import { getCoreRowModel, useReactTable } from "@tanstack/react-table"

import Datatables from "@/components/custom/Datatables"

// ------------------ validation read data ----------------
const isValidValue = (value) => {
  if (value === null || value === undefined) return false
  if (typeof value === "number") return value !== 0
  if (typeof value === "string") {
    const trimmed = value.trim()
    return trimmed !== "" && trimmed !== "0"
  }
  return true
}

  export default function Cert_Data_List() {
  Cert_Data_List.title = "Cert Data List"

  const router = useRouter()
  const API_URL = process.env.NEXT_PUBLIC_API_URL


  // State
  const [loadingData, setLoadingData] = useState(true)
  const [data, setData] = useState([])
  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useDebouncedState([], 500)
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [totalPages, setTotalPages] = useState(1)
  const [copiedValue, setCopiedValue] = useState(null)
   const [totalEntries, setTotalEntries] = useState(0);

 
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

  // Table Columns
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
      accessorFn: (row) => row.discipline_rel?.discipline_name ?? "-",
      id: "discipline",
      header: "Discipline",
      enableSorting: true,
      cell: (info) => info.getValue(),
    },
    {
      id: "phase",
      header: "Phase",
      accessorFn: (row) => row.phase?.phase_name ?? "-",
      enableSorting: true,
      cell: (info) => info.getValue(),
    },

      {
        accessorFn: (row) => row.cert_id,
        id: "cert_id",
        header: "Cert Code",
        enableSorting: true,
        cell: ({ getValue }) => {
          const value = getValue()
          return (
            <div className="flex items-center gap-2">
              <span>{value}</span>
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
            </div>
          )
        },
      },
    ],
    [pagination, copiedValue]
  )

  // React Table
  const table = useReactTable({
    data,
    columns,
    columnFilters,
    state: { sorting, pagination, columnFilters },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
  })

  const buildSearchParams = () => {
  const params = {}

  columnFilters.forEach((filter) => {
    if (filter.value) {
      params[filter.id] = filter.value
    }
  })

  return params
}


  // Fetch Data
 useEffect(() => {
  const fetchData = async () => {
    try {

        const searchQuery = {};
      columnFilters.forEach((filter) => {
      if (filter.value != null && filter.value !== "") {
        searchQuery[filter.id] = filter.value;
      }
    });

      const sort =
        sorting.length > 0
          ? `${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}`
          : "";

      const response = await axios.get(
        `${API_URL}/public/master_form`,
        {
          params: {
            page: pagination.pageIndex + 1,
            size: pagination.pageSize,
            sort,
            ...buildSearchParams(),
          },
        }
      );

      setData(response.data.content ?? []);
      setTotalPages(response.data.total_pages ?? 1);
      setTotalEntries(response.data.total ?? 0);

    } catch (error) {
      console.error("Error fetching cert data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  fetchData();
}, [
  pagination.pageIndex,
  pagination.pageSize,
  columnFilters,
  sorting,
  API_URL,
]);


  return (
    <div className="py-6">
      <div className="max-w-full mx-auto sm:px-6 lg:px-8">
        <h1 className="text-center font-bold text-2xl">
          Cert Data List
        </h1>

        <Paper radius="sm" mt="md" withBorder>
          <div className="p-4 overflow-x-auto">
            <Datatables table={table} totalPages={totalPages}  info={{ totalElements: totalEntries }} className="shadow-lg" />
          </div>
        </Paper>
      </div>
    </div>
  )
}

Cert_Data_List.isPublic = true
Cert_Data_List.getLayout = function getLayout(page) {
  return <PublicLayout>{page}</PublicLayout>;
};

