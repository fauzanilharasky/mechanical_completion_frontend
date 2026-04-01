import AuthLayout from "@/components/layout/authLayout";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import { Paper, Text, Grid } from "@mantine/core";
import {
  IconDeviceDesktopCheck,
  IconArrowRight,
  IconFolderOpen,
  IconHourglass,
  IconX,
  IconMessageUser,
  IconCheck,
  IconListCheck,
  IconMailCheck,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import useUser from "@/store/useUser";
import useApi from "@/hooks/useApi";
import axios from 'axios'
import Link from "next/link";



export default function Index() {
  Index.title = "Dashboard"


  const [dashboard, setDashboard] = useState({
    pending_spv: 0,
    totals: 0,
    pending_qc: 0,
    rejected_qc: 0,
    approved_qc: 0,
    pending_client:0,
    approve_client:0,
    comment:0,
    completed:0
  });

  const router = useRouter()
  const { user } = useUser()
  const API = useApi()
  const API_URL = API.API_URL


  // Use Effect GET data pcms_itr
  useEffect(() => {
    if (!user?.token) return;

    const getDashboard = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/pcms_itr/dashboard-summary`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );

        setDashboard(res.data);
      } catch (error) {
        console.error("Failed fetch dashboard", error);
      }
    };

    getDashboard();
  }, [user?.token]);



  return (
    <AuthLayout>
      <Head>
        <title>Home</title>
      </Head>

      <div className="py-12">
        <div className="max-w mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-lg border sm:rounded-lg">
            <div className="p-6 text-gray-900 justify-center text-center">
              <h1 className="font-semibold text-xl"> Mechanical Completion </h1>
            </div>
          </div>
        </div>
      </div>


      <div className="max-w mx-auto sm:px-6 lg:px-8">
        <Grid>
          <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
            <Paper
              shadow="xl"
              radius="md"
              withBorder
              p="xl"
              style={{ position: "relative" }}
            >
              <div
                style={{
                  display: "block",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "10px",
                  content: "",
                  borderTopLeftRadius: "7px",
                  borderTopRightRadius: "7px",
                  background:
                    "linear-gradient(81.67deg, #98edc2 0%, #79d1a5 100%)",
                }}
              />
              <div
                style={{ display: "flex", alignItems: "center" }}
                className="justify-center text-center"
              >
                <IconDeviceDesktopCheck
                  size={30}
                  stroke={1.5}
                  style={{ marginLeft: "8px", marginRight: "5px" }}
                />
                <span className="font-semibold">Total Data</span>
              </div>

              <div
                className="justify-center text-center"
                style={{ marginTop: 30 }}
              >
                <span style={{ fontSize: "2em" }}>{dashboard.totals}</span>
              </div>

              <div
                className="justify-center text-center"
                style={{ marginTop: 30 }}
              >
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <div
                    style={{ display: "flex", alignItems: "center" }}
                    className="justify-center text-center"
                  >
                    <span>More Detail</span>
                    <IconArrowRight size={20} stroke={1.5} />
                  </div>
                </a>
              </div>
            </Paper>
          </Grid.Col>

                {/* PENDING BY SPV */}

          <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
            <Paper
              shadow="xl"
              radius="md"
              withBorder
              p="xl"
              style={{ position: "relative" }}
            >
              <div
                style={{
                  display: "block",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "10px",
                  content: "",
                  borderTopLeftRadius: "7px",
                  borderTopRightRadius: "7px",
                  background:
                    "linear-gradient(81.67deg, #e3e3e3 0%, #a1a1a1 100%)",
                }}
              />
              <div
                style={{ display: "flex", alignItems: "center" }}
                className="justify-center text-center"
              >
                <IconFolderOpen
                  size={30}
                  stroke={1.5}
                  style={{ marginLeft: "8px", marginRight: "5px" }}
                />
                <span className="font-semibold">Pending Approval By SPV</span>
              </div>

              <div
                className="justify-center text-center"
                style={{ marginTop: 30 }}
              >
                <span className="font-semibold text-gray-600" style={{ fontSize: "2em" }}>{dashboard.pending_spv}</span>
              </div>

              <div
                className="justify-center text-center"
                style={{ marginTop: 30 }}
              >
               <Link href="/master_data_new/rfi_submission/inspection_rfi">
                  <div
                    style={{ display: "flex", alignItems: "center" }}
                    className="justify-center text-center cursor-pointer"
                  >
                    <span>More Detail</span>
                    <IconArrowRight size={20} stroke={1.5} />
                  </div>
               </Link>
              </div>
            </Paper>
          </Grid.Col>

          {/* PENDING QC */}

          <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
            <Paper
              shadow="xl"
              radius="md"
              withBorder
              p="xl"
              style={{ position: "relative" }}
            >
              <div
                style={{
                  display: "block",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "10px",
                  content: "",
                  borderTopLeftRadius: "7px",
                  borderTopRightRadius: "7px",
                  background:
                    "linear-gradient(81.67deg, #1a4da2 0%, #0084f4 100%)",
                }}
              />
              <div
                style={{ display: "flex", alignItems: "center" }}
                className="justify-center text-center"
              >
                <IconHourglass
                  size={30}
                  stroke={1.5}
                  style={{ marginLeft: "8px", marginRight: "5px" }}
                />
                <span className="font-semibold">Pending By QC</span>
              </div>

              <div
                className="justify-center text-center"
                style={{ marginTop: 30 }}
              >
                <span className="font-semibold text-blue-600" style={{ fontSize: "2em" }}>{dashboard.pending_qc}</span>
              </div>

              <div
                className="justify-center text-center"
                style={{ marginTop: 30 }}
              >
                <Link href="/master_data_new/rfi_submission/submission_qc/pending_sub_qc">
                  <div
                    style={{ display: "flex", alignItems: "center" }}
                    className="justify-center text-center cursor-pointer"
                  >
                    <span>More Detail</span>
                    <IconArrowRight size={20} stroke={1.5} />
                  </div>
               </Link>
              </div>
            </Paper>
          </Grid.Col>

                {/* REJECT BY QC */}

          <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
            <Paper
              shadow="xl"
              radius="md"
              withBorder
              p="xl"
              style={{ position: "relative" }}
            >
              <div
                style={{
                  display: "block",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "10px",
                  content: "",
                  borderTopLeftRadius: "7px",
                  borderTopRightRadius: "7px",
                  background:
                    "linear-gradient(81.67deg, #c94747 0%, #d67a7a 100%)",
                }}
              />
              <div
                style={{ display: "flex", alignItems: "center" }}
                className="justify-center text-center"
              >
                <IconX
                  size={30}
                  stroke={3}
                  style={{ marginLeft: "8px", marginRight: "5px" }}
                />
                <span className="font-semibold">Rejected By QC</span>
              </div>

              <div
                className="justify-center text-center"
                style={{ marginTop: 30 }}
              >
                <span className="text-red-600 font-semibold" style={{ fontSize: "2em" }}>{dashboard.rejected_qc}</span>
              </div>

              <div
                className="justify-center text-center"
                style={{ marginTop: 30 }}
              >
               <Link href="/master_data_new/rfi_submission/submission_qc/reject_qc">
                  <div
                    style={{ display: "flex", alignItems: "center" }}
                    className="justify-center text-center cursor-pointer"
                  >
                    <span>More Detail</span>
                    <IconArrowRight size={20} stroke={1.5} />
                  </div>
              </Link>
              </div>
            </Paper>
          </Grid.Col>

                {/* APPROVE BY QC */}
                
          <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
            <Paper
              shadow="xl"
              radius="md"
              withBorder
              p="xl"
              style={{ position: "relative" }}
            >
              <div
                style={{
                  display: "block",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "10px",
                  content: "",
                  borderTopLeftRadius: "7px",
                  borderTopRightRadius: "7px",
                  background:
                    "linear-gradient(81.67deg, #1a4da2 0%, #0084f4 100%)",
                }}
              />
              <div
                style={{ display: "flex", alignItems: "center" }}
                className="justify-center text-center"
              >
                <IconCheck
                  size={30}
                  stroke={1.5}
                  style={{ marginLeft: "8px", marginRight: "5px" }}
                />
                <span className="font-semibold">Approved By QC</span>
              </div>

              <div
                className="justify-center text-center"
                style={{ marginTop: 30 }}
              >
                <span className="font-semibold text-blue-500" style={{ fontSize: "2em" }}>{dashboard.approved_qc}</span>
              </div>

              <div
                className="justify-center text-center"
                style={{ marginTop: 30 }}
              >
              <Link href="/master_data_new/rfi_submission/submission_qc/transmittal_by_qc">
                  <div
                    style={{ display: "flex", alignItems: "center" }}
                    className="justify-center text-center cursor-pointer"
                  >
                    <span>More Detail</span>
                    <IconArrowRight size={20} stroke={1.5} />
                  </div>
              </Link>
              </div>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
            <Paper
              shadow="xl"
              radius="md"
              withBorder
              p="xl"
              style={{ position: "relative" }}
            >
              <div
                style={{
                  display: "block",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "10px",
                  content: "",
                  borderTopLeftRadius: "7px",
                  borderTopRightRadius: "7px",
                  background:
                    "linear-gradient(69.83deg, #0084f4 0%, #00c48c 100%)",
                }}
              />
              <div
                style={{ display: "flex", alignItems: "center" }}
                className="justify-center text-center"
              >
                <IconMessageUser
                  size={30}
                  stroke={1.5}
                  style={{ marginLeft: "8px", marginRight: "5px" }}
                />
                <span className="font-semibold">Pending By Client</span>
              </div>

              <div
                className="justify-center text-center"
                style={{ marginTop: 30 }}
              >
                <span className="font-semibold text-emerald-500" style={{ fontSize: "2em" }}>{dashboard.pending_client}</span>
              </div>

              <div
                className="justify-center text-center"
                style={{ marginTop: 30 }}
              >
                <Link href="/master_data_new/rfi_submission/client_section/pending_client">
                  <div
                    style={{ display: "flex", alignItems: "center" }}
                    className="justify-center text-center cursor-pointer"
                  >
                    <span>More Detail</span>
                    <IconArrowRight size={20} stroke={1.5} />
                  </div>
               </Link>
              </div>
            </Paper>
          </Grid.Col>

                {/* APPROVE WITH COMMENT */}

          <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
            <Paper
              shadow="xl"
              radius="md"
              withBorder
              p="xl"
              style={{ position: "relative" }}
            >
              <div
                style={{
                  display: "block",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "10px",
                  content: "",
                  borderTopLeftRadius: "7px",
                  borderTopRightRadius: "7px",
                  background:
                    "linear-gradient(81.67deg, #fff2cc 0%, #e6c877 100%) ",
                }}
              />
              <div
                style={{ display: "flex", alignItems: "center" }}
                className="justify-center text-center"
              >
                <IconListCheck
                  size={30}
                  stroke={1.5}
                  style={{ marginLeft: "8px", marginRight: "5px" }}
                />
                <span className="font-semibold">Return With Comment By Client</span>
              </div>

              <div
                className="justify-center text-center"
                style={{ marginTop: 30 }}
              >
                <span className="font-semibold text-orange-300" style={{ fontSize: "2em" }}>{dashboard.comment}</span>
              </div>

              <div
                className="justify-center text-center"
                style={{ marginTop: 30 }}
              >
                <Link href="/master_data_new/rfi_submission/submission_qc/approval_review">
                  <div
                    style={{ display: "flex", alignItems: "center" }}
                    className="justify-center text-center cursor-pointer"
                  >
                    <span>More Detail</span>
                    <IconArrowRight size={20} stroke={1.5} />
                  </div>
               </Link>
              </div>
            </Paper>
          </Grid.Col>

                {/* APPROVE BY CLIENT & COMPLETED */}
          <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
            <Paper
              shadow="xl"
              radius="md"
              withBorder
              p="xl"
              style={{ position: "relative" }}
            >
              <div
                style={{
                  display: "block",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "10px",
                  content: "",
                  borderTopLeftRadius: "7px",
                  borderTopRightRadius: "7px",
                  background:
                    "linear-gradient(82.59deg, #84d194 0%, #47c462 100%)",
                }}
              />
              <div
                style={{ display: "flex", alignItems: "center" }}
                className="justify-center text-center"
              >
                <IconMailCheck
                  size={30}
                  stroke={1.5}
                  style={{ marginLeft: "8px", marginRight: "5px" }}
                />
                <span className="font-semibold">Approved By Client & Completed</span>
              </div>

              <div
                className="justify-center text-center"
                style={{ marginTop: 30 }}
              >
                <span className="font-semibold text-green-500" style={{ fontSize: "2em" }}>{dashboard.completed}</span>
              </div>

              <div
                className="justify-center text-center"
                style={{ marginTop: 30 }}
              >
                <Link href="/master_data_new/rfi_submission/client_section/approve_client">
                  <div
                    style={{ display: "flex", alignItems: "center" }}
                    className="justify-center text-center cursor-pointer"
                  >
                    <span>More Detail</span>
                    <IconArrowRight size={20} stroke={1.5} />
                  </div>
               </Link>
              </div>
            </Paper>
          </Grid.Col>
        </Grid>
      </div>
    </AuthLayout>
  );
}
