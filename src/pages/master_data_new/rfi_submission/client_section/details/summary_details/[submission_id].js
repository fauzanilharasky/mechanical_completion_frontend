import { useRouter } from "next/router";
import AuthLayout from "@/components/layout/authLayout";
import Datatables from "@/components/custom/Datatables";
import { rfiSubmissionList } from "@/data/sidebar/rfi-submission";
import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import axios, { all } from "axios";
import { IconArrowBack, IconAdjustmentsCheck, IconUpload, IconClearAll, IconClearFormatting, IconArrowRight } from '@tabler/icons-react'
import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Paper, Button, Select, Accordion, Info, Checkbox, Textarea } from "@mantine/core";
import useSwal from '@/hooks/useSwal';




DetailsApproval.title = "Details Approval"
export default function DetailsApproval() {
  const router = useRouter();
  const { submission_id } = router.query;
  const [display, setDisplay] = useState(true)

  const API = useApi();
  const { user } = useUser();
  const { showAlert } = useSwal()


  const API_URL = API.API_URL;

  const [data, setData] = useState([]);
  const [headerData, setHeaderData] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [templateRows, setTemplateRows] = useState([]);
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [selectedResults, setSelectedResults] = useState({});
  const remarksRef = useRef({});
  const [remarksValues, setRemarksValues] = useState({});
  const [openedPanels, setOpenedPanels] = useState([]);
  const [activePanel, setActivePanel] = useState(null);
  const [itrMap, setItrMap] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialResultsState, setInitialResultsState] =  useState({});
  const [initialRemarksState, setInitialRemarksState] = useState({});
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // // PERMISSIONS
  // const hasUpdatePermissions = usePermissions([50]);


  // ---- Fetch grouped data ----
const fetchDetails = async () => {
  if (!submission_id) return;

  try {
    const res = await axios.get(
      `${API_URL}/api/pcms_itr/summary_details/${submission_id}`,
      { headers: { Authorization: `Bearer ${user.token}` } }
    );

    const list = (res.data.data || []).filter(row =>
      [6, 7, 8].includes(Number(row.status_inspection))
    );

    const sortedList = [...list].sort((a, b) => {
      const tagA = Number(a.tag_number);
      const tagB = Number(b.tag_number);

      // Jika bukan angka, fallback ke string compare
      if (isNaN(tagA) || isNaN(tagB)) {
        return String(a.tag_number).localeCompare(String(b.tag_number));
      }

      return tagA - tagB;
    });


    setTemplateRows(sortedList);
    setHeaderData(sortedList[0] ?? null);
    

    // ------------- DATA GROUPING -------------
    
    const grouped = {}; 
    const itrMap = {};

    sortedList.forEach((row) => {
      const tag = row.tag_number;
      if (!grouped[tag]) grouped[tag] = [];

      const itrId = row.id_itr ?? row.id ?? row.itr_id ?? null;
      if (itrId) itrMap[tag] = itrMap[tag] || itrId;

      const checklist = row.cert_rel?.flatMap(cert => cert.checklist) ?? [];
      checklist.forEach(item => {
        grouped[tag].push({
          id: item.id,
          id_itr: itrId,
          form_mc_id: item.form_mc_rel?.id ?? null,
          item_no: item.item_no,
          description: item.description,
          result: item.form_mc_rel?.result ?? item.result ?? null,
          remarks: item.form_mc_rel?.remarks ?? item.remarks ?? "",
        });
      });
    });


    setItrMap(itrMap)
    setData(grouped); 

    const initialResults = {};
    const initialRemarks = {};

    Object.keys(grouped).forEach(tag => {
      grouped[tag].forEach(item => {
        if (!initialResults[tag]) initialResults[tag] = {};
        if (!initialRemarks[tag]) initialRemarks[tag] = {};

        initialResults[tag][item.item_no] = item.result ?? null;
        initialRemarks[tag][item.item_no] = item.remarks ?? "";
      });
    });

    setSelectedResults(initialResults);
    setRemarksValues(initialRemarks);
    setInitialResultsState(initialResults);
    setInitialRemarksState(initialRemarks);

  } catch (err) {
    console.error(err);
  }
};



  //  ------------------ Handle Select Single -------------------------
  
 const handleSelectSingle = (tag_number, item_no, type) => {
  setSelectedResults(prev => ({
    ...prev,
    [tag_number]: {
      ...prev[tag_number],
      [item_no]: prev?.[tag_number]?.[item_no] === type ? null : type
    }
  }));
};


  // 

  const handleRemarksChange = (tag_number, item_no, value) => {
    setRemarksValues(prev => ({
      ...prev,
      [tag_number]: {
        ...prev[tag_number],
        [item_no]: value
      }
    }));
  };



  useEffect(() => {
  console.log("openedPanels (type):", typeof openedPanels, openedPanels);
}, [openedPanels]);



  useEffect(() => {
    fetchDetails();
  }, [submission_id, reloadTrigger]);


useEffect(() => {
  if (templateRows.length > 0) {
    setOpenedPanels([]);
  }
}, [templateRows]);

useEffect(() => {
  const handler = (e) => {
    setReloadTrigger(prev => prev + 1)
  };
  window.addEventListener('rfi:updated', handler);
  return () => window.removeEventListener('rfi:updated', handler);
}, []);
  // -------------------- Handle Select ALL ---------------------------

const handleSelectAll = (tag_number, type) => {
  
  const rows = data?.[tag_number] ?? [];

  if (!rows.length) return;

  const updated = {};
  rows.forEach(r => {
    updated[r.item_no] = type;
  });

  // merge ke selectedResults tanpa menghapus pilihan di tag lain
  setSelectedResults(prev => ({
    ...prev,
    [tag_number]: updated
  }));
}



  // ------------------ Handle Clear All -----------------------------
  const handleClearAll = (tag_number, type) => {
    const rows = data?.[tag_number] ?? [];

    if (!rows.length) return;

    const cleared = {};
    const clearedRemarks = {};

    rows.forEach(r => {
      cleared[r.item_no] = null;
      clearedRemarks[r.item_no] = type;
    });

    setSelectedResults(prev => ({
      ...prev,
      [tag_number]: cleared
    }));

    setRemarksValues(prev => ({
      ...prev,
      [tag_number]: clearedRemarks
    }));
  };

  // ---------- build Form MC ---------

  const buildFormMC = () => {
    const formMC = [];

    if (!Array.isArray(openedPanels) || openedPanels.length === 0) return formMC;

    const uniqueTags = Array.from(new Set(openedPanels.filter(Boolean)));

    uniqueTags.forEach(tag_number => {
      const rows = data?.[tag_number] ?? [];
      rows.forEach(row => {
        formMC.push({
          item_no: row.item_no,
          tag_number: tag_number,
          id: row.id,
          itr_id: row.itr_id ?? itrMap?.[tag_number] ?? null,
          form_mc_id: row.form_mc_id,
          result: selectedResults?.[tag_number]?.[row.item_no] ?? null,
          remarks: remarksValues?.[tag_number]?.[row.item_no] ?? ""
        });
      });
    });

    return formMC;
  };

  // --------- MC_REL --------
  
  const buildMcRel = () => {
    const mcRel = [];

    if (!Array.isArray(openedPanels) || openedPanels.length === 0) return mcRel;

    const uniqueTags = Array.from(new Set(openedPanels.filter(Boolean)));

    uniqueTags.forEach(tag_number => {
      const row = templateRows.find(r => r.tag_number === tag_number);
      if (row) {
        mcRel.push({
          itr_id: row.id_itr ?? row.id,
          tag_number: row.tag_number
        })
      }
      
    })
     return mcRel;
  };



  // --------------- handle SubmitRFI ----------------

  const handleSubmitRfi = async () => {

    if (isSubmitting) return; 
    setIsSubmitting(true);

    const formMC = buildFormMC();
    const mcRel = buildMcRel();

    const dedupedFormMC = Array.from(
      new Map(
    formMC.map(item => [`${item.tag_number}-${item.item_no}`, item])
  ).values()
    );


    const unselected = dedupedFormMC.filter(item => !item.result);
    if (unselected.length > 0) {
      showAlert("Please select OK / NA / PL for all checklist items before submitting.", "warning");
       setIsSubmitting(false);
      return;
    }

    const plByItr = {};
    dedupedFormMC.forEach(item => {
      const itr = item.itr_id ?? null;
      const key = itr !== null ? String(itr) : `tag:${item.tag_number}`;
      if (!plByItr[key]) plByItr[key] = false;
      if (String(item.result).toUpperCase() === "PL") plByItr[key] = true;
    });

    const mcRelWithStatus = mcRel.map(r => {
      const itrKey = String(r.itr_id ?? r.id ?? "");
      const hasPl = !!plByItr[itrKey];
      return { ...r, status_inspection: hasPl ? 7 : 8 };
    });

    const payload = {
      user_id: user.id,
      created_by: user.id,
      mc_rel: mcRelWithStatus,
      form_mc: dedupedFormMC,
      created_date: new Date(),
      remarks: remarksValues,
    };

    try {
      const res = await axios.post(`${API_URL}/api/pcms_checklist/assignment_client`, payload, {
        headers: { Authorization: `Bearer ${user.token}` },
      });


      showAlert("ITR successfully Submit!", "success");

        window.dispatchEvent(new CustomEvent('rfi:updated', {
    detail: {
      updatedIds: (payload.mc_rel || []).map(m => m.itr_id),
      returned: res.data?.data ?? null
    }
  })); 
    
      setReloadTrigger(prev => prev + 1);
      // Reset state
      setSelectedResults({})
      setRemarksValues({})

    } catch (err) {
      console.error("Failed to assign ITR:", err);
      showAlert("Failed to assign ITR. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };





  return (
    <AuthLayout sidebarList={rfiSubmissionList}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8 py-4">
          <Paper radius="sm" mt="md" style={{ position: 'relative' }} withBorder>
            <div className="p-4 border-b border-black flex justify-center bg-gray-200">

              <h1 className="font-bold text-xl justify-center">
             APPROVAL DATA DETAILS – <span className="text-blue-800">{submission_id}</span>
              </h1>
            </div>


            <div className="p-4 border-b flex flex-auto justify-items-center">
               <div className="w-full @container">
                <div className="grid grid-cols-1 @2xl:grid-cols-3 gap-6 mb-4">

                  {/* drawing_no */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-7">
                    <label className="text-sm font-medium sm:w-32">Drawing No :</label>
                    <Textarea
                      resize="vertical"
                      className=" flex-col border rounded px-3 py-2 flex-1"
                      value={headerData?.drawing_no || ""}
                      readOnly withAsterisk disabled
                    />
                  </div>

                  {/* Project */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-7">
                    <label className="text-sm font-medium sm:w-32">Project :</label>
                    <input
                      type="text"
                      className="border rounded px-3 py-2 flex-1"
                      value={headerData?.project_name || ""}
                      readOnly withAsterisk disabled
                    />
                  </div>

                  {/* Module */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-7">
                    <label className="text-sm font-medium sm:w-32"> Module :</label>
                    <input
                      type="text"
                      className="border rounded px-3 py-2 flex-1"
                      value={headerData?.templates_md?.mod_desc || ""}
                      readOnly withAsterisk disabled
                    />
                  </div>

                  {/* system Name */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-7">
                    <label className="text-sm font-medium sm:w-32">System Name :</label>
                    <input
                      type="text"
                      className="border rounded px-3 py-2 flex-1"
                      value={headerData?.system_rel?.system_name || ""}
                      readOnly withAsterisk disabled
                    />
                  </div>

                  {/* subsystem Name */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-7">
                    <label className="text-sm font-medium sm:w-32">Subsystem Name :</label>
                    <input
                      type="text"
                      className="border rounded px-3 py-2 flex-1"
                      value={headerData?.subsystem_rel?.subsystem_name || ""}
                      readOnly withAsterisk disabled
                    />

                  </div>


                  {/* Discipline */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-7">
                    <label className="text-sm font-medium sm:w-32">Discipline :</label>
                    <input
                      type="text"
                      className="border rounded px-3 py-2 flex-1"
                      value={headerData?.discipline_tag?.discipline_name || ""}
                      readOnly withAsterisk disabled
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-7">
                    <label className="text-sm font-medium sm:w-32">Requestor :</label>
                    <input
                      type="text"
                      className="border rounded px-3 py-2 flex-1"
                      value={headerData?.requestor_name || ""}
                      readOnly withAsterisk disabled
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-7">
                    <label className="text-sm font-medium sm:w-32">Company :</label>
                    <input
                      type="text"
                      className="border rounded px-3 py-2 flex-1"
                      value={headerData?.company_name || ""}
                      readOnly withAsterisk disabled

                    />
                  </div>



                  {/* Type Of Module */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-7">
                    <label className="text-sm font-medium sm:w-32">Type Of Module :</label>
                    <input
                      type="text"
                      className="border rounded px-3 py-2 flex-1"
                      value={headerData?.typeModule?.name || ""}
                      readOnly withAsterisk disabled
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-7">
                    <label className="text-sm font-medium sm:w-32">Request Date :</label>
                    <input
                      type="text"
                      className="border rounded px-3 py-2 flex-1"
                      value={
                        headerData?.date_request ? headerData.date_request.slice(0, 10) 
                          : ""}
                      readOnly withAsterisk disabled
                    />
                  </div>
                </div>

              </div>
            </div>

            <div className="px-4 py-2 text-left">
              <Button
                className="mr-2"

                color="red"
                variant="outline"
                onClick={() => router.push('/master_data_new/rfi_submission/summary_rfi')}

                leftSection={<IconArrowBack />}
              >
                Back
              </Button>

            </div>

          </Paper>

          <Paper radius="sm" mt="lg" style={{ position: "relative" }} withBorder>
            <div className="p-4">

        
      <Accordion
        variant="separated"
        color="black"
        multiple
        value={openedPanels}
        onChange={(values) => {
          const normalized = Array.isArray(values) ? values : [];

          setOpenedPanels(normalized);

          setActivePanel(
            normalized.length ? normalized[normalized.length - 1] : null
          );
        }}
      >
        {templateRows.map((row, idx) => (
          <Accordion.Item key={row.tag_number} value={row.tag_number}>

            <Accordion.Control>
              <div className="flex items-center justify-between w-full">
                <h1 className="font-bold text-black text-xl">
                  No. Tag Number:
                  <span className="font-bold text-lg text-blue">
                    {row.tag_number || "No Tag Number"}
                  </span>
                </h1>
              </div>
            </Accordion.Control>

            <Accordion.Panel>

              {/* ======= TOMBOL ======== */}
              <div className="flex justify-between mb-4">
                <Button
                  onClick={() => handleClearAll(row.tag_number)}
                  color="gray"
                  leftSection={<IconClearAll />}
                >
                  Clear All
                </Button>


                <Button.Group>
                  <Button color="green" onClick={() => handleSelectAll(row.tag_number, "OK")} disabled>
                    OK All
                  </Button>
                  <Button color="blue" onClick={() => handleSelectAll(row.tag_number, "NA")} disabled>
                    NA All
                  </Button>
                  <Button color="orange" onClick={() => handleSelectAll(row.tag_number, "PL")} disabled>
                    PL All
                  </Button>
                </Button.Group>
              </div>

              {/* ======= TABLE ======== */}
              <table className="min-w-full border border-gray-400 mt-4">
                <thead className="bg-blue-500 text-white">
                  <tr>
                    <th className="border px-3 py-2 w-20 text-center">Item</th>
                    <th className="border px-3 py-2">Description</th>
                    <th className="border px-3 py-2 w-12 text-center">OK</th>
                    <th className="border px-3 py-2 w-12 text-center">NA</th>
                    <th className="border px-3 py-2 w-12 text-center">PL</th>
                    <th className="border px-3 py-2 text-center">Comments</th>
                  </tr>
                </thead>

                <tbody>
                  {data[row.tag_number]?.map((item) => (
                    <tr key={item.item_no}>
                      <td className="border px-3 py-2 text-center font-semibold">
                        {item.item_no}
                      </td>

                      <td className="border px-3 py-2">{item.description}</td>

                      <td className="border px-3 py-2 text-center">
                        <Checkbox
                          checked={selectedResults[row.tag_number]?.[item.item_no] === "OK"}
                          onChange={() => handleSelectSingle(row.tag_number, item.item_no, "OK")}
                        />
                      </td>

                      <td className="border px-4 py-2 text-center">
                        <Checkbox
                          checked={selectedResults[row.tag_number]?.[item.item_no] === "NA"}
                          onChange={() => handleSelectSingle(row.tag_number, item.item_no, "NA")}
                        />
                      </td>

                      <td className="border px-3 py-2 text-center">
                        <Checkbox
                          checked={selectedResults[row.tag_number]?.[item.item_no] === "PL"}
                          onChange={() => handleSelectSingle(row.tag_number, item.item_no, "PL")}
                        />
                      </td>

                      <td className="border px-3 py-2">
                        <Textarea
                          value={remarksValues?.[row.tag_number]?.[item.item_no] || ""}
                          onChange={(e) => handleRemarksChange(row.tag_number, item.item_no, e.target.value)}
                          placeholder="Type remarks..."
                          autosize
                          minRows={1}
                          maxRows={4}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
                
              </table>
              {/* <div className="flex justify-end py-4">

               {hasChanges(row.tag_number) && (
                <Button
                  onClick={() => handleUpdateAll(row.tag_number)}
                  color="yellow"
                  leftSection={<IconAdjustmentsCheck />}
                  rightSection={<IconArrowRight size={14} />}
                  className="flex mt-4 py-4k"
                >
                  Update Changes
                </Button>
                )}

              </div> */}
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>


            </div>
          </Paper>

        </div>
      </div>
    </AuthLayout>
  );
}
