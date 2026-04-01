import { IconNote, IconDownload, IconHome, IconList, IconUpload, IconListLetters, IconMapPinPlus, IconArrowDownToArc, IconDeviceIpadHorizontalPin, IconGps, IconGolf, IconDatabaseHeart, IconDiaper, IconDatabaseExclamation, IconSubtask, IconCertificate, IconRegistered, IconTag, IconFileImport, IconSignLeftFilled, IconFavicon, IconCapProjecting, IconDeviceProjector, IconBuildingStore, IconBuilding, IconFileCheck, IconCreativeCommons, IconPlus, IconEdit, IconDatabase, IconUser, IconUserPlus, IconAccessPoint, IconAccessible } from "@tabler/icons-react";

export const userManagementList = [

  // MANAGEMENT
  {
    title: "System Management",
    href: "#",
    active: "Mangement",
    icon: <IconUser size={18} />,
    child: [
      {
        title: "User System",
        href: "/master_data_new/user_management/user_system",
        active: "User System",
        icon: <IconUserPlus size={18} />,
      },

      {
        title: "Permission Management",
        href: "/master_data_new/permission_system/permission_list",
        active: "Permisssion",
        icon: <IconAccessible size={18} />,
      },
    ],
  },
]