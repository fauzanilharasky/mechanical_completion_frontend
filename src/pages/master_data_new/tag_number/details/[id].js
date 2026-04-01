import Datatables from '@/components/custom/Datatables'
import AuthLayout from '@/components/layout/authLayout'
import { tagNumberList } from '@/data/sidebar/tag-number'
import useApi from '@/hooks/useApi'
import useUser from '@/store/useUser'
import { Button, Paper, Table, Checkbox } from '@mantine/core'
import { useDebouncedState } from '@mantine/hooks'
import { IconAd, IconAdjustmentsCheck, IconDeviceFloppy, IconChevronDown, IconDetails, IconDetailsOff, IconEdit, IconPlaylistAdd, IconEyeEdit, IconUserEdit, IconDatabaseEdit, IconArrowAutofitLeft } from '@tabler/icons-react'
import { getCoreRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table'
import axios from 'axios'
import { useRouter } from 'next/router'
import React, { useCallback, useEffect, useMemo, useState } from 'react'


Tag_number_details.title = "Tag Number Details"

export default function Tag_number_details() {
  const router = useRouter()
  const { user } = useUser()

  console.log(user)
  const API = useApi()
  const API_URL = API.API_URL

const [selectedRowIds, setSelectedRowIds] = useState([]);



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
  const [totalPages, setTotalPages] = useState(1);


  const columns = useMemo(() => [

 
    {
      accessorFn: (row) => row.report_number,
      id: "report_number",
      header: "Report Number",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue()
    },

    {
      accessorFn: (row) => row.company_name,
      id: "company_id",
      header: "Company Name",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue()
    },

     {
      accessorFn: (row) => row.discipline_tag?.discipline_name,
      id: "discipline",
      header: "Discipline",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue(),
    },

    {
      accessorFn: (row) => row.templates_md?.mod_desc,
      id: "module",
      header: "Module",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue(),
    },

    {
      accessorFn: (row) => row.template?.name,
      id: "type_of_module",
      header: "Type OF module",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue(),
    },

    {
      accessorFn: (row) => row.drawing_no,
      id: "drawing_no",
      header: "Drawing No",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue(),
    },



    {
      accessorFn: (row) => row.tag_number,
      id: "tag_number",
      header: "Tag Number",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue()
    },

     {
      accessorFn: (row) => row.tag_description,
      id: "tag_description",
      header: "Tag Description",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue()
    },

     {
      accessorFn: (row) => row.subsystem_rel?.subsystem_name,
      id: "subsystem",
      header: "Subsystem",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue()
    },

    {
      accessorFn: (row) => row.subsystem_description,
      id: "subsystem_description",
      header: "Subsystem Description",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue()
    },

    {
      accessorFn: (row) => row.phase,
      id: "phase",
      header: "Phase",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue()
    },

    {
      accessorFn: (row) => row.location,
      id: "location",
      header: "location",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue()
    },

      {
      accessorFn: (row) => row.model_no,
      id: "model_no",
      header: "No Model",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue()
    },

     {
      accessorFn: (row) => row.rating,
      id: "rating",
      header: "Rating",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue()
    },

     {
      accessorFn: (row) => row.manufacturer,
      id: "manufacturer",
      header: "Manufacturer",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue()
    },

    {
      accessorFn: (row) => row.remarks, 
      id: "remarks",
      header: "Remarks",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => {
      const value = info.getValue();
    if (Array.isArray(value)) {
      return value.join(", ");
    }

    

    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.join(", ");
      }
    } catch (e) {
    }
    return value || "-"; },
  },


    {
      accessorFn: (row) => row.status_delete,
      id: "status delete",
      header: "Status",
      enableColumnFilter: false,
      enableSorting: true,
      cell: (info) => { const value = info.getValue(); 
      return value === "1" || value === 1 ? "Active" : "Inactive";},
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

  const downloadPdf  = async() => {
    try {
      const response = await axios.get(API_URL + '/api/testing/generate_pdf', {
        responseType: "blob",
        headers : {
          Authorization : "Bearer "+user.token
        }
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "PDF Sample.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  }

  const downloadExcel = async () => {
    try {
      const response = await axios.get(API_URL + '/api/testing/download', {
        responseType: "blob",
        headers : {
          Authorization : "Bearer "+user.token
        }
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "LargeData.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  }

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
        `/api/pcms_itr/serverside_list?${filterParams}&page=${pagination.pageIndex}&size=${pagination.pageSize}&sort=${sort}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
    );

    setData(data.data);
    setTotalPages(data.total_pages);
  },[API_URL, columnFilters, pagination.pageIndex, pagination.pageSize, sorting, user.token]);


  useEffect(() => {
    getData();
  }, [user.token, columnFilters, pagination.pageIndex, pagination.pageSize, sorting, loadingData, savedFilter, API_URL, getData]);

  return (
    <AuthLayout sidebarList={tagNumberList}>
  <div className='py-6'>
    <div className="max-w-full mx-auto sm:px-6 lg:px-8 py-4"> 
      <Paper radius="sm" mt="md" style={{ position: 'relative' }} withBorder>
        
    
       
        <div className="p-4 border-b flex justify-start font-medium">
            
                <h1>Tag Number Details - </h1>
                 
        </div>

 
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
        
        <div>
        <label className="text-sm font-medium">Drawing No</label>
        <input type="text" value=""
            disabled className="w-full border rounded px-3 py-2 bg-gray-100" />
        </div>

        {/* <div>
        <label className="text-sm font-medium">Workpack Number</label>
        <input type="text" value=""
            disabled className="w-full border rounded px-3 py-2 bg-gray-100" />
        </div> */}

        <div>
        <label className="text-sm font-medium">Discipline</label>
        <input type="text" value=""
            disabled className="w-full border rounded px-3 py-2 bg-gray-100" />
        </div>

        <div>
        <label className="text-sm font-medium">Project Name</label>
        <input type="text" value=""
            disabled className="w-full border rounded px-3 py-2 bg-gray-100" />
        </div>

        <div>
        <label className="text-sm font-medium">Module</label>
        <input type="text" value=""
            disabled className="w-full border rounded px-3 py-2 bg-gray-100" />
        </div>

        <div>
        <label className="text-sm font-medium">Company</label>
        <input type="text" value=""
            disabled className="w-full border rounded px-3 py-2 bg-gray-100" />
        </div>

        <div>
        <label className="text-sm font-medium">Type Of Module</label>
        <input type="text" value=""
            disabled className="w-full border rounded px-3 py-2 bg-gray-100" />
        </div>
    </div>


    <div className='border border-t-1 p-4'>

    
  {/* Area, Location, Point */}
    <div className=" grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 p-4">
        <div>
        <label className="text-sm font-medium">Area</label>
        <select className="w-full border rounded px-3 py-2">
            <option>YARD ZONE IV</option>
        </select>
        </div>
        <div>
        <label className="text-sm font-medium">Location</label>
        <select className="w-full border rounded px-3 py-2">
            <option>WORKSHOP 7</option>
        </select>
        </div>
        <div>
        <label className="text-sm font-medium">Point</label>
        <select className="w-full border rounded px-3 py-2">
            <option>---</option>
        </select>
        </div>
    </div>

    {/* Tombol Update */}
    <div className="flex justify-end mt-6 p-6">
        <Button
        className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium"
        color='green'
        leftSection={<IconDatabaseEdit />}
        >
        Update Location
        </Button>
    </div>
    </div>

            <div className="p-4 flex justify-end items-center border-t border-gray-200">
              <Button
                variant="filled"
                color="blue"
                leftSection={<IconDeviceFloppy />}
                onClick={() => {
                  // alert('Data berhasil disimpan!');
                }}
              >
                Save
              </Button>
            </div>
         


        <div className="p-4 overflow-x-auto">
          <Datatables table={table} totalPages={totalPages} />
        </div>
        
  
      </Paper>
    </div>
  </div>
</AuthLayout>

  )
}