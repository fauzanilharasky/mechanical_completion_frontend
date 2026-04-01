import Datatables from '@/components/custom/Datatables'
import AuthLayout from '@/components/layout/authLayout'
import { rfiSubmissionList } from '@/data/sidebar/rfi-submission'
import useApi from '@/hooks/useApi'
import useUser from '@/store/useUser'
import { Button, Paper, Checkbox, Select } from '@mantine/core'
import { useDebouncedState } from '@mantine/hooks'
import { IconAdjustmentsCheck, IconEdit, IconPlaylistAdd, IconX, IconUserDown, IconUpload, IconXboxX, IconCircleDashedLetterB, IconFileTypePdf, IconDatabaseMinus } from '@tabler/icons-react'
import { getCoreRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table'
import axios from 'axios'
import { useRouter } from 'next/router'
import useSwal from '@/hooks/useSwal'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { usePermissions } from "@/hooks/usePermissions"
import NoPermissionCard from '@/components/card_permission'
import Swal from 'sweetalert2'
import useEncrypt from '@/hooks/useEncrypt'


RejectByQc.title = "Rejected By Qc"
export default function RejectByQc() {
  const router = useRouter()

  const { user } = useUser()
  const API = useApi()
  const { showAlert } = useSwal()
  const API_URL = API.API_URL
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [totalEntries, setTotalEntries] = useState(0);
  const {encrypt: encryptUser} = useEncrypt();

  // PERMISSIONS
   const hasViewPermission = usePermissions([26]);
  const hasDetailsDataPermission = usePermissions([27])
  
  


  // FUNCTION FOR SUBMIT

  const handleRejectRFI = async () => {
    if (selectedRowIds.length === 0) {
      return showAlert("Please select at least 1 data to submit RFI.", "error");
    }

    const selectedRows = data.filter(row => selectedRowIds.includes(row.id));

    if (selectedRows.length === 0) {
      return showAlert("Selected data not found.", "error");
    }

    const confirm = await Swal.fire({
      title: "Are you sure",
      text: "Are you sure to submit RFI to Supervisor?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      confirmButtonColor: "#16a34a", // green
      cancelButtonColor: "#ef4444",
      iconColor: "#FFCE30",
    });
    
    
     if (!confirm.isConfirmed) return;


    // --- Daftar kolom ------
    const requiredFields = [
      "project_name",
      "discipline_tag.discipline_name",
      "templates_md.mod_desc",
      "typeModule.name",
      "company_name",
      "drawing_no",
      "system_name",
      "subsystem_rel.subsystem_name"
    ];


    const getValue = (obj, path) => {
      return path.split(".").reduce((o, key) => (o ? o[key] : null), obj);
    };


    for (const field of requiredFields) {
      const firstVal = getValue(selectedRows[0], field);

      const allSame = selectedRows.every(row => {
        return getValue(row, field) === firstVal;
      });

      if (!allSame) {
        return showAlert(
          `❌ RFI Submit Failed. Data for "${field}" must be the same for all selected items.`,
          "error"
        );
      }
    }

    // --- Validasi area dan location ---
    if (!selectedArea || !selectedLocation) {
      return showAlert("Please select Area & Location before submitting.", "error");
    }

     const encryptedRequestor = encryptUser(String(user.id));
    setSubmitting(true);

    try {
      const payload = {
        id_template: selectedRowIds,
        requestor: encryptedRequestor,
        area_v2: selectedArea,
        location_v2: selectedLocation,
        date_request: new Date(),
        submission_id: true,
        status_delete: 1
      };

      const res = await axios.put(`${API_URL}/api/pcms_itr/rejected-rfi`, payload, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      showAlert("✔️ Reject Data submitted successfully!", "success");

      setSelectedRowIds([]);
      setUserQuery("");
      getData();

    } catch (err) {
      showAlert(
        `Failed to submit Data: ${err.response?.data?.message || err.message}`,
        "error"
      );
    }

    setSubmitting(false);
  };



  // --------- Fetch Location For Dropdown ------------

  const fetchArea = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/master_area/dropdown`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      const formatted = res.data?.data?.map(a => ({
        value: a.id.toString(),
        label: a.name
      })) || [];

      setAreaOptions(formatted);
    } catch (err) {
      console.error("Error fetch area:", err);
    }
  };

  // ----------- Fetch Location By Area ----------

  const fetchLocation = async (areaId) => {
    try {
      const res = await axios.get(`${API_URL}/api/master_location/dropdown/${areaId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      const formatted = res.data?.data?.map(l => ({
        value: l.id.toString(),
        label: l.name
      })) || [];

      setLocationOptions(formatted);
    } catch (err) {
      console.error("Error fetch location:", err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (usersContainerRef.current && !usersContainerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);



  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRowIds(data.map((row) => row.id));
    } else {
      setSelectedRowIds([]);
    }
  };

  const handleSelectRow = (id, checked) => {
    if (checked) {
      setSelectedRowIds((prev) => [...prev, id]);
    } else {
      setSelectedRowIds((prev) => prev.filter((rowId) => rowId !== id));
    }
  };


  const [loadingData, setLoadingData] = useState(true)
  const [loadingOpt, setLoadingOpt] = useState(false)
  const [selectedUser, setSelectedUser] = useState("");
  const [areaOptions, setAreaOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);

  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [display, setDisplay] = useState(true)
  const [UsersOptions, setUsersOptions] = useState([])
  const [selectedDiscipline, setSelectedDiscipline] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [data, setData] = useState([])
  const [showDropdown, setShowDropdown] = useState(false);
  const [userQuery, setUserQuery] = useState("");
  const usersContainerRef = useState([]);
  const [savedFilter, setSavedFilter] = useState({})
  const [checkedId, setCheckedId] = useState([])
  const [sorting, setSorting] = useState([{ id: "id", desc: true }]);
  const [columnFilters, setColumnFilters] = useDebouncedState([], 500);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalPages, setTotalPages] = useState(1);

  // Definisi kolom
  const columns = useMemo(() => [

    {
      id: "select",
      header: () => (
        <Checkbox
          checked={selectedRowIds.length === data.length && data.length > 0}
          indeterminate={selectedRowIds.length > 0 && selectedRowIds.length < data.length}
          onChange={(e) => handleSelectAll(e.currentTarget.checked)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedRowIds.includes(row.original.id)}
          onChange={(e) => handleSelectRow(row.original.id, e.currentTarget.checked)}
        />
      ),
      size: 40,
    },

    {
      id: "no",
      header: "No.",
      cell: ({ row }) => {
        const rowNumber = row.index + 1 + (pagination.pageIndex * pagination.pageSize);
        return rowNumber;
      },
      size: 40,
    },
    {
      accessorFn: (row) => row.project_name,
      id: "project_name",
      header: "Project Name",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue()
    },

    {
      accessorFn: (row) => {
        return row.submission_id
          ?? row.id_itr?.submission_id
          ?? row.id_template
          ?? row.submission?.submission_id
          ?? null;
      },
      id: "submission_id",
      header: "Submission No",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue()
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
      accessorFn: (row) => row.discipline_tag?.discipline_name,
      id: "discipline",
      header: "Discipline",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue(),
    },

    {
      accessorFn: (row) => row.company_name,
      id: "company_name",
      header: "Company Name",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue()
    },



    {
      accessorFn: (row) => row.event_id,
      id: "event_id",
      header: "Event ID",
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
      accessorFn: (row) => row.templates_md?.mod_desc,
      id: "module",
      header: "Module",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue(),
    },

    {
      accessorFn: (row) => row.typeModule?.name,
      id: "type_of_module",
      header: "Type OF Module",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue(),
    },

    {
      accessorFn: (row) => row.system_rel?.system_name,
      id: "system",
      header: "System",
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
      header: "Location",
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
      accessorFn: (row) => row.serial_no,
      id: "serial_no",
      header: "No Serial",
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
      accessorFn: (row) => Number(row.status_inspection ?? row.statusInspection ?? 4),
      id: "status_inspection",
      header: " Status Inspection",
      enableColumnFilter: false,
      enableSorting: true,
      cell: (info) => {
        const value = info.getValue();
        const statusOptions = (value === 4 || value === "4" || null)
          ? "Reject Submission"
          : "Pending Submission";

        const colorClass =
          statusOptions === "Submitted"
            ? "bg-orange-500 text-white border border-white shadow-sm"
            : "bg-red-500 text-white border border-white shadow-sm";
        return (
          <span className={`flex px-3 py-2 rounded-full font-medium text-xs text-center ${colorClass}`}
          >
            {statusOptions}
          </span>
        )
      }
    },

    {
      accessorFn: (row) => row.submission_id,
      id: "id",
      header: "Action",
      enableColumnFilter: false,
      enableSorting: true,
      cell: (info) => {
        let value = info.getValue()
        return (
          <div className='align-middle items-center'>
            <Button.Group className='justify-center'>
              {hasDetailsDataPermission && (
              <Button
                onClick={() => router.push(`/master_data_new/rfi_submission/submission_qc/details/reject/${value}`)}
                leftSection={<IconCircleDashedLetterB size={16} />}
                color="blue"
                className="justify-center"
              >
                Detail
              </Button>
              )}
              
            </Button.Group>
          </div>
        )
      },
    },


  ])




  // Setup react-table
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

  const getData = useCallback(async () => {
    const searchQuery = {};
    columnFilters.forEach((filter) => {
      if (filter.value != null && filter.value !== "") {
        searchQuery[filter.id] = filter.value;
      }
    });

    searchQuery.status_inspection = 4;
    const filterParams =
      searchQuery && Object.keys(searchQuery).length > 0
        ? `search=${encodeURIComponent(JSON.stringify(searchQuery))}`
        : "";

    const sort =
      sorting && sorting.length > 0
        ? `${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}`
        : "";

    try {
      const res = await axios.post(
        `${API_URL}/api/pcms_mc_template/rejected_qc?${filterParams}&page=${pagination.pageIndex}&size=${pagination.pageSize}&sort=${sort}`,
        {
          filter: filterParams,
          page: pagination.pageIndex,
          size: pagination.pageSize,
          sort: sort
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      setData(res.data.data || []);

      // gunakan variabel respon yang jelas
      const filteredData = (res.data.data || []).filter((item) => {
        return (
          Number(item.assignment_status) === 1 &&
          Number(item.status_inspection ?? item.statusInspection ?? 4) === 4
        );
      });




      setData(filteredData);
      setTotalPages(res.data.total_pages);
      setTotalEntries(res.data?.totalElements || filteredData.length);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [API_URL, columnFilters, pagination.pageIndex, pagination.pageSize, sorting, user.token]);


  useEffect(() => {
    if (!user?.token) return;
    fetchArea();
    getData();
  }, [user?.token, columnFilters, pagination.pageIndex, pagination.pageSize, sorting, loadingData, savedFilter, API_URL, getData]);

  useEffect(() => {
    if (selectedArea) {
      fetchLocation(selectedArea); // load location berdasarkan area
    }
  }, [selectedArea]);

  const filteredUsers = useMemo(() => {
    const q = (userQuery || "").toLowerCase().trim();
    const activeUsers = (UsersOptions || []).filter(
      (u) => !u.status_user || u.status_user === 1 || u.status_user === 2
    );

    if (!q) return activeUsers;

    return activeUsers.filter((u) => {
      const name = (u.full_name || u.fullname || u.username || "").toLowerCase();
      const badge = (u.badge_no || u.badge || "").toLowerCase();
      const id = (u.id_user || u.id || "").toString().toLowerCase();
      return name.includes(q) || badge.includes(q) || id.includes(q);
    });
  }, [UsersOptions, userQuery]);

  const typeOfModuleOptios = useMemo(() => {
    const types = Array.from(new Set(
      data?.map(item => item.typeModule?.name).filter(Boolean)
    ));
    return types.map(t => ({ label: t, value: t }));
  }, [data]);


  const moduleOptions = useMemo(() => {
    const types = Array.from(new Set(
      data?.map(item => item.templates_md.mod_desc).filter(Boolean)
    ));
    return types.map(t => ({ label: t, value: t }));
  }, [data]);

  // Discipline Filter Options

  const disciplineOptions = useMemo(() => {
    const types = Array.from(new Set(
      data?.map(item => item.discipline_tag?.discipline_name).filter(Boolean)
    ));
    return types.map(t => ({ label: t, value: t }));
  }, [data]);


  // Function Apply filter: 
  const applyFilters = () => {

    setPagination(prev => ({
      ...prev,
      pageIndex: 0
    }));

    // Panggil getData setelah state update
    setTimeout(() => {
      getData();
    }, 0);
  };


  return (
    <AuthLayout sidebarList={rfiSubmissionList}>
      {hasViewPermission ? (
      <div className='py-6'>
        <div className="max-w-full mx-auto sm:px-6 lg:px-8 py-4">
          <Paper radius="sm" mt="md" style={{ position: 'relative' }} withBorder>
            <div className="p-4 border-b border-black flex justify-start">
              <Button
                onClick={() => setDisplay(!display)}
                leftSection={<IconAdjustmentsCheck />}
                variant="outline"
              >
                {display ? "Close Filter" : "Filter"}
              </Button>


            </div>

            {display && (
              <div className="p-4 border-b flex justify-items-center">
                <div className="w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                    {/* Module */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-7">
                      <label className="text-sm font-medium sm:w-32"> Module :</label>
                      <Select
                        placeholder="Select Discipline"
                        data={moduleOptions}
                        className="flex-1"
                        value={selectedModule || null}

                        onChange={(val) => {
                          setSelectedModule(val);
                          setColumnFilters(old => [
                            ...old.filter(f => f.id !== "module"),
                            ...(val ? [{ id: "module", value: val }] : [])
                          ]);
                        }}

                        searchable
                        clearable
                      />
                    </div>

                    {/* submission No */}
                   <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-7">
                     <label className="text-sm font-medium sm:w-32">Submission No :</label>
           
                    <input
                      type="text"
                      placeholder="Search Submission No"
                      className="border rounded px-3 py-2 flex-1 text-sm"
                      value={columnFilters.find(f => f.id === "submission_id")?.value || ""}
                      onChange={(e) => {
                        const value = e.target.value;

                        setColumnFilters(old => {
                          const otherFilters = old.filter(f => f.id !== "submission_id");
                          return value
                            ? [...otherFilters, { id: "submission_id", value }]
                            : otherFilters;
                        });
                      }}
                    />      
                   </div>


                    {/* Discipline */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-7">
                      <label className="text-sm font-medium sm:w-32">Discipline :</label>
                      <Select
                        placeholder="Select Discipline"
                        data={disciplineOptions}
                        className="flex-1"
                        value={selectedDiscipline || null}

                        onChange={(val) => {
                          setSelectedDiscipline(val);
                          setColumnFilters(old => [
                            ...old.filter(f => f.id !== "discipline"),
                            ...(val ? [{ id: "discipline", value: val }] : [])
                          ]);
                        }}

                        searchable
                        clearable
                      />
                    </div>


                    {/* Type Of Module */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-7">
                      <label className="text-sm font-medium sm:w-32">Type Of Module :</label>
                      <Select
                        placeholder="Select Module Type"
                        data={typeOfModuleOptios}
                        className="flex-1"
                        value={columnFilters.find(f => f.id === "type_of_module")?.value || ""}
                        onChange={(value) =>
                          setColumnFilters(old => [
                            ...old.filter(f => f.id !== "type_of_module"),
                            { id: "type_of_module", value }
                          ])
                        }
                        searchable
                        clearable
                      />
                    </div>
                  </div>

                  {/* Action filter Button */}
                  <div className="mt-10 flex justify-end">
                    <Button variant="filled"
                      leftSection={<IconAdjustmentsCheck />}
                      onClick={applyFilters}
                    >
                      Apply Filter
                    </Button>
                  </div>
                </div>
              </div>
            )}

          </Paper>
          <Paper radius="sm" mt="md" style={{ position: 'relative', }} withBorder>
            <Paper>
              <div className="p-4 border-b text-white flex justify-start bg-blue-800">
                 <IconDatabaseMinus size={26} />
                <h1 className='text-center font-medium px-3'> QC SECTION | Reject Data List </h1>
              </div>
              <div className="px-4 py-2 text-right space-x-2">


              </div>
              <div className="p-4 overflow-x-auto">
                <Datatables table={table} totalPages={totalPages} info={{ totalElements: totalEntries }} />

              </div>
            </Paper>


            <Paper>
              <div className="p-4 border-b">
                <div className="w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t-2 mt-4 mb-8">

                    {showDropdown && userQuery.trim().length >= 0 && (
                      <div
                        className="absolute left-0 right-0 bg-white border rounded shadow max-h-56 overflow-auto"
                        style={{
                          bottom: "100%",
                          marginBottom: 8,
                          zIndex: 9999,
                          boxShadow: "0 10px 24px rgba(0,0,0,0.12)",
                        }}
                      >

                        {/* close icon */}
                        <div className="flex justify-end pr-2 pt-1">
                          <button
                            type="button"
                            aria-label="Close suggestions"
                            onClick={() => setShowDropdown(false)}
                            className="text-red-500 hover:text-gray-800 rounded p-1"
                          >
                            <IconXboxX size={17} />
                          </button>
                        </div>


                        {filteredUsers && filteredUsers.length > 0 ? (
                          filteredUsers.map((u) => {
                            const id = String(u.id_user ?? u.id ?? "");
                            const label = `${u.full_name || u.fullname || u.username || "Unknown"} - ${u.badge_no || u.badge || "-"}`;

                            return (
                              <button
                                key={id}
                                type="button"
                                className="w-full text-left px-3 py-2 hover:bg-gray-100"
                                onClick={() => {
                                  setSelectedUser(id);
                                  setUserQuery(label);
                                  setShowDropdown(false);
                                }}
                              >
                                {label}
                              </button>
                            );
                          })
                        ) : (
                          <div className="px-3 py-2 text-sm text-gray-500">No users found</div>
                        )}
                      </div>
                    )}

                    {/* Area and LOCATION Select */}
                    {/* AREA DROPDOWN */}

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-7">
                      <label className="text-sm font-medium sm:w-32">Area :</label>
                      <Select
                        placeholder="Select Area"
                        data={areaOptions}
                        value={selectedArea}
                        onChange={(val) => {
                          setSelectedArea(val);
                          setSelectedLocation(null); // reset location
                        }}
                        searchable
                        clearable
                        className="flex-1"
                      />
                    </div>



                    {/* LOCATION DROPDOWN */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-7">
                      <label className="text-sm font-medium sm:w-32">Location :</label>
                      <Select
                        placeholder={selectedArea ? "Select Location" : "Select Area First"}
                        data={locationOptions}
                        value={selectedLocation}
                        disabled={!selectedArea}
                        onChange={(val) => {
                          setSelectedLocation(val);
                        }}
                        searchable
                        clearable
                        className="flex-1"
                      />
                    </div>

                  </div>
                </div>
                {/* Tombol di bawah input */}
                <div className="mt-8 flex justify-end mb-2 py-2">
                  <Button
                    variant="filled"
                    leftSection={<IconUpload />}
                    color={selectedRowIds.length > 0 ? "green" : "gray"}
                    disabled={selectedRowIds.length === 0}
                    onClick={handleRejectRFI}
                  >
                    Submit Reject Data
                  </Button>
                </div>
              </div>

            </Paper>

          </Paper>
        </div>
      </div>
      ) : (
      <NoPermissionCard />
      )}
    </AuthLayout>
  )
}