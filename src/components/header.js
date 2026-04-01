import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import { Button, Image } from "@mantine/core";
import { IconLogout, IconUser } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import Swal from "sweetalert2";

export default function Header() {
  const router = useRouter();
  const { user }    = useUser();
  const API         = useApi()
  const LINK_PORTAL = API.LINK_PORTAL
  const [loggingOut, setLoggingOut] = useState(false)


  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Confirm Logout",
      text: "Are you sure you want to log out?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, log out",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      setLoggingOut(true);
      router.push("/");
    } finally {
      setLoggingOut(false);
    }
  };
  
  return (
    <header className="flex flex-col md:flex-row items-center md:justify-between py-8 px-8" >
      <div>
        <Image
          src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/mechanical-completion.png`}
          w={300}
          alt="logo"
        />
      </div>

      <div className="flex items-center">
        <Button
          variant="filled"
          leftSection={<IconUser size={20} />}
          size="md"
          style={{ backgroundColor: "#204e81" }}
          className="mr-2"
          onClick={() => router.push("/profile")}
        >
          {user.name}
        </Button>
        <Button
          component={Link}
          href={LINK_PORTAL}
          variant="filled"
          color="gray"
          size="md"
          className="mr-2"
        >
          Portal
        </Button>

          <Button
          leftSection={<IconLogout size={20}/>}
          onClick={handleLogout}
          variant="outline"
          color="red"
          size="md"
          loading={loggingOut}
        >
          Log Out
        </Button>
      </div>
    </header>
  );
}
