import { IconNote, IconDownload, IconHome, IconList, IconUpload, IconListLetters, IconMapPinPlus, IconArrowDownToArc, IconDeviceIpadHorizontalPin, IconGps, IconGolf, IconDatabaseHeart, IconDiaper, IconDatabaseExclamation, IconSubtask, IconCertificate, IconRegistered, IconTag, IconFileImport, IconSignLeftFilled, IconFavicon, IconCapProjecting, IconDeviceProjector, IconBuildingStore, IconBuilding, IconFileCheck, IconCreativeCommons, IconPlus, IconEdit, IconDatabase, IconUser, IconUserPlus, IconAccessPoint, IconAccessible } from "@tabler/icons-react";

export const masterDataList = [

  // MANAGEMENT
  // {
  //   title: "User Management",
  //   href: "#",
  //   active: "Mangement",
  //   icon: <IconUser size={18} />,
  //   child: [
  //     {
  //       title: "User System",
  //       href: "/master_data_new/user_management/user_system",
  //       active: "User System",
  //       icon: <IconUserPlus size={18} />,
  //     },
  //     // {
  //     //   title: "Edit User Data",
  //     //   href: "/master_data_new/master_data_subsystem/subsystem_list",
  //     //   active: "master subsystem",
  //     //   icon: <IconEdit size={18} />,
  //     // },

  //     {
  //       title: "Permission Management",
  //       href: "/master_data_new/user_management/edit_account",
  //       active: "Permisssion",
  //       icon: <IconAccessible size={18} />,
  //     },
  //   ],
  // },




  {
    title: "Master Data",
    href: "master_data/master_system/master_data_list",
    active: "Master",
    icon: <IconListLetters size={18} />,
    child: [
      {
        title: "Master Data System",
        href: "/master_data/master_system/master_data_list",
        active: "master system",
        icon: <IconDatabaseExclamation size={18} />,
      },
      {
        title: "Master Data SubSystem",
        href: "/master_data_new/master_data_subsystem/subsystem_list",
        active: "master subsystem",
        icon: <IconDatabase size={18} />,
      },
      {
        title: "Master Data ITR",
        href: "/master_data_new/master_data_itr/master_system",
        active: "master itr",
        icon: <IconCertificate size={18} />,
      },
    ],
  },


]

