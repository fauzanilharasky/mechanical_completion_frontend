import AuthLayout from '@/components/layout/authLayout'
import { masterDataList } from '@/data/sidebar/master-data'
import useApi from '@/hooks/useApi'
import useUser from '@/store/useUser'
import { Button, Paper, Text, Title, Loader } from '@mantine/core'
import { useRouter } from 'next/router'
import axios from 'axios'
import React, { useEffect, useState } from 'react'

export default function DetailsMasterSystem() {
  DetailsMasterSystem.title = "Details Master System"

  const router = useRouter()
  const { id } = router.query
  const { user } = useUser()
  const API = useApi()
  const API_URL = API.API_URL

  const [loading, setLoading] = useState(true)
  const [detailData, setDetailData] = useState(null)

  useEffect(() => {
  if (!id || typeof id !== "string" || !user?.token) return;

  const fetchDetail = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/master_system/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      setDetailData(data);
    } catch (error) {
      console.error("Error fetching detail:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchDetail();
}, [id, user?.token, API_URL]);

  return (
    <AuthLayout sidebarList={masterDataList}>
      <div className='py-6'>
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" p="md" withBorder>
            <div className="mb-4 flex justify-between items-center">
              <Title order={3}>Details</Title>
              <Button onClick={() => router.back()}>Back</Button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center p-8">
                <Loader />
              </div>
            ) : detailData ? (
              <div className="space-y-4">
                <Text><strong>ID:</strong> {detailData.id}</Text>
                <Text><strong>Project ID:</strong> {detailData.project_id}</Text>
                <Text><strong>System Name:</strong> {detailData.system_name}</Text>
                <Text><strong>Description:</strong> {detailData.description}</Text>
              </div>
            ) : (
              <Text color="red">Data not found.</Text>
            )}
          </Paper>
        </div>
      </div>
    </AuthLayout>
  )
}
