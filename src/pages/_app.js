import { useEffect, useState } from "react";
import { useCookie } from "../hooks/useCookie";
import { LoadingOverlay, MantineProvider, Paper } from "@mantine/core";
import { useRouter } from "next/router";
import AuthLayout from '@/components/layout/authLayout';


import useUser from "@/store/useUser";
import useEncrypt from "@/hooks/useEncrypt";
import useDecrypt from "@/hooks/useDecrypt";
import Cookies from "js-cookie";
import axios from "axios";
import Head from "next/head";

import "@/styles/globals.css";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import useApi from "@/hooks/useApi";

const COOKIE_EXPIRE_TIME = 86400;

export default function App({ Component, pageProps }) {
  const cookieUser = useCookie("portal_user_db");
  const { user, setUser } = useUser();
  const router = useRouter();
  const { encrypt } = useEncrypt();
  const { decrypt } = useDecrypt();
  const API         = useApi()
  const API_URL     = API.API_URL
  const PORTAL_API  = API.LINK_PORTAL
  const isPublic = Component.isPublic || false
  const getLayout = Component.getLayout || ((page) => page)

  const [isAuthenticated, setIsAuthenticated] = useState(true);



  if (isPublic) {
    return (
      <MantineProvider>
        <Head>
          <title>
            {Component.title
              ? `${Component.title} - ${process.env.NEXT_PUBLIC_APP_NAME}`
              : process.env.NEXT_PUBLIC_APP_NAME}
          </title>
        </Head>

        {getLayout(<Component {...pageProps} />)}
      </MantineProvider>
    )
  };

//  const validateUser = async (userId) => {
//   try {
//     const { data } = await axios.post(
//       `${API_URL}/api/auth/validate`,
//       {
//         id_user: userId,
//       }
//     );

//     if (data.success) {
//       return data;
//     }

//     return null;
//   } catch (error) {
//     console.error("Error validating user: ", error);

//     // 🔥 HANDLE ERROR 400 (USER SUDAH TIDAK ADA)
//     if (error.response?.status === 400) {
//       Cookies.remove("portal_user_db");
//     }

//     return null;
//   }
// };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  // useEffect(() => {
  //   const initAuth = async () => {
  //     if (!router.isReady) return;

  //     const { id, auth_user } = router.query;
  //     let idUser = null;
  //     let permissions = {}

  //     console.log(idUser);

  //     if (auth_user) {
  //       const encryptUserId = auth_user;
  //       const isValidUser = await validateUser(encryptUserId);

  //       if (isValidUser) {
  //         Cookies.set("portal_user_db", encryptUserId, {
  //           expires: COOKIE_EXPIRE_TIME / 86400,
  //         });

  //         permissions = decrypt(isValidUser.user.permissions)
  //         permissions = JSON.parse(permissions) || []

  //         setUser({
  //           id: encryptUserId,
  //           name: isValidUser.user.full_name,
  //           token: isValidUser.token,
  //           permissions: permissions.map(p => Number(p))
  //         });

  //         setIsAuthenticated(true);
  //         const currentPath = window.location.pathname;

  //         if (currentPath === "/login" || currentPath === "/") {
  //           // Jika user akses login page atau root, baru redirect ke "/"
  //           router.push("/");
  //         } else {
  //           router.push(currentPath);
  //         }

  //       } else {
  //         //  router.push(`${PORTAL_API}`);
  //       }
  //     } else {
  //       const cookieValue = Cookies.get("portal_user_db");

  //       if (!cookieValue || cookieValue === "undefined") {
  //         Cookies.remove("portal_user_db");
  //         router.push("/");
  //         return;
  //       }
  //     }

  //     if (idUser) {
  //       const decryptUserId = decrypt(idUser);
  //       const isValidUser = await validateUser(idUser);

  //       if (isValidUser) {
  //         permissions = decrypt(isValidUser.user.permissions)
  //         permissions = JSON.parse(permissions) || []

  //         setUser({
  //           id: idUser,
  //           name: isValidUser.user.full_name,
  //           token: isValidUser.token,
  //           permissions: permissions.map(p => Number(p)),
  //         });
  //         setIsAuthenticated(true);
  //       } else {
  //          Cookies.remove("portal_user_db"); // 🔥 hapus user lama
  //         router.push("/");
  //         return;
  //         //  router.push(`${PORTAL_API}`);
  //       }
  //     }
  //   };

  //   initAuth();
  // }, [cookieUser, router, setUser, API_URL]);
  // }, [cookieUser, setUser, decrypt, encrypt]);

  // if (!isAuthenticated) {
  //   return <div> Loading</div>;
  // }

  
  return (
  
      <MantineProvider>
        {!isAuthenticated}
        <>
          <Head>
            {Component.title
            ? `${Component.title} - ${process.env.NEXT_PUBLIC_APP_NAME}`
            : process.env.NEXT_PUBLIC_APP_NAME}
          </Head>
          <LoadingOverlay visible={!isAuthenticated} />
        </>
        {isAuthenticated ? (
          <>
            <Head>
              <title>
                {Component.title ? Component.title : 'Default Title'} - {process.env.NEXT_PUBLIC_APP_NAME}
              </title>
            </Head>
            <Component {...pageProps} />
          </>
        ) : (
          <></>
        )}
      </MantineProvider>
    
    );
  }

