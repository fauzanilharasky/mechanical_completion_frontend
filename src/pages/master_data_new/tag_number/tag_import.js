import React, { useState, useMemo } from "react";
import {
  Button,
  Paper,
  Alert,
  Box,
  LoadingOverlay,
  Text,
  FileInput,
  List
} from "@mantine/core";
import { IconUpload, IconFileSpreadsheet, IconAdjustmentsCheck, IconLiveView, IconViewfinder, IconFileImport, IconFileUpload } from "@tabler/icons-react";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import axios from "axios";
import useUser from "@/store/useUser";
import AuthLayout from "@/components/layout/authLayout";
import { tagNumberList } from "@/data/sidebar/tag-number";
import Datatables from "@/components/custom/Datatables";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import useApi from '@/hooks/useApi';
import useSwal from '@/hooks/useSwal';
import NoPermissionCard from '@/components/card_permission';
import { usePermissions } from "@/hooks/usePermissions"



TagImport.title = "Tag Import Page"
export default function TagImport () {
  const { user } = useUser();
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);


  // PERMISSIONS DATA EXPORT

   const hasViewPermission = usePermissions([15]);
  const hasSavedDataPermission = usePermissions([15])

  // url API
  const API = useApi()
  const API_URL = API.API_URL
  const { showAlert } = useSwal()

  // Saat user pilih file Excel
  const handleFileChange = (file) => {
    setFile(file);
  };
  

  // Upload & Baca Excel
const handleUploadFile = async () => {
  if (!file) {
    showAlert("Warning", "Please select file first", "warning");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    setLoading(true);

    const res = await axios.post(
      `${API_URL}/api/import_excel/upload`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    setPreviewData(res.data.preview);
    setSessionId(res.data.sessionId);


    showAlert("data preview successfully read", "success");
  } catch (error) {
    showAlert("Error", "Failed upload file", "error");
  } finally {
    setLoading(false);
  }
};





  const columns = useMemo(() => {
    if (previewData.length === 0) return [];

     const hiddenKeys = ["_ids"];

    return Object.keys(previewData[0])
    .filter((key) => !hiddenKeys.includes(key))
    .map((key) => ({
      accessorKey: key,
      header: key.replace(/_/g, " ").toUpperCase(),
      cell: (info) => info.getValue() || "-",
    }));
}, [previewData]);


// -------- VALIDASI DUPLICATE TAG NUMBER ----------
const validateDuplicateTagNumber = () => {
  if (!previewData || previewData.length === 0) return [];

  const seen = new Set();
  const duplicates = new Set();

  previewData.forEach((row) => {
    const tag = row.tag_number?.toString().trim().toUpperCase();

    if (!tag) return;

    if (seen.has(tag)) {
      duplicates.add(tag);
    } else {
      seen.add(tag);
    }
  });

  return Array.from(duplicates);
};

  //  ------------- HANDLESUBMIT IMPORT ---------------

  const handleSubmitImport = async () => {
    if (!sessionId) return;

  const duplicates = validateDuplicateTagNumber();

    if (duplicates.length > 0) {
      showAlert(
        "Warning!", `Duplicate tag_number found: ${duplicates.join(", ")}`, "Import data storage failed, duplicate data of Tag Number",
      )
      return;
    }

    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "Are you sure you want to import data to save?",
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

  try {
    setLoading(true);

    await axios.post(
      `${API_URL}/api/import_excel/confirm`,
      { sessionId},
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
    );

    showAlert("Success", "Data imported successfully", "success");
    setPreviewData([]);
    setSessionId(null);
  } catch (err) {
    showAlert("Error", "Failed to save data", "error");
  } finally {
    setLoading(false);
  }
};




  // Inisialisasi React Table
  const table = useReactTable({
    data: previewData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
  <AuthLayout sidebarList={tagNumberList}>
    {hasViewPermission ? (
    <div className="py-6">
      <div className="max-w-full mx-auto sm:px-6 lg:px-8 py-4">
        <Paper radius="sm" mt="md" withBorder>
          {/* Header Upload */}
          <div className=" py-2 px-4 bg bg-gray-200 border-b flex items-center">
            <IconFileImport size={23} />
            <h1 className="px-3 font-semibold" >
              IMPORT TAG NUMBER (Microsoft Excel)
            </h1>
          
          </div>

          {/* Template File & Download Button */}
         <div className="p-4 flex gap-6 py-10">
         <label className="text-sm text-black font-medium">
               Template File :
          </label>

          <List
            size="sm"
            spacing="xs"
            withPadding
            styles={{
              itemLabel: { color: "#1c7ed6" }, // biru
            }}
          >
            <List.Item
              icon={<IconFileSpreadsheet size={16} color="#1c7ed6" />}
            >
              <a
                href="/template/template_Import_Data_TagNumber.xlsx"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium"
              >
                template_Import_Data_TagNumber.xlsx
              </a>
            </List.Item>
          </List>
        </div>


          <div className="p-4 flex items-center gap-6 py-4">
            <label className="text-sm text-black font-medium">
              Update Template :
            </label>
            <FileInput
            type="file"
            accept=".xls,.xlsx"
            className="w-1/3 text-black"
            placeholder="Choose file"
            rightSection= {<IconFileUpload size={18} color= {'black'}/>}
            onChange={handleFileChange}
            />
          </div>

          {/* File Info */}
          {file && (
            <Alert color="blue" title="File Selected" className="m-4">
              {file.name}
            </Alert>
          )}

          {/* Tombol Upload */}
          <div className="p-4 flex justify-end">

            <Button.Group className="justify-end">
            <Button
              onClick={handleUploadFile}
              leftSection={<IconViewfinder size={18} />}
              color="blue"
            >
              Preview
            </Button>

            {previewData.length > 0 && (
              
            <Button
              color="green"
              rightSection={<IconFileImport size={18} />}
              onClick={handleSubmitImport}
            >
              Save Data
            </Button>
          )}
          </Button.Group>

          </div>
        </Paper>

        {/* Preview Data */}
        <Paper radius="sm" mt="md" withBorder>
          <Box className="p-4 shadow-md" style={{ position: "relative" }}>
            <LoadingOverlay visible={loading} />
            {previewData.length > 0 ? (
              <Datatables table={table} totalPages={1} />
            ) : (
              <Text ta="center" c="dimmed" mt="md">
                No data preview yet. Upload an Excel file to see data.
              </Text>
            )}
          </Box>
        </Paper>
      </div>
    </div>
     ) : (
    <NoPermissionCard />
    )}
  </AuthLayout>
  );
};


