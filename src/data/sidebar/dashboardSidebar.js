import { IconNote, IconDownload, IconHome, IconList, IconUpload, IconListLetters, IconMapPinPlus, IconArrowDownToArc, IconDeviceIpadHorizontalPin, IconGps, IconGolf, IconDatabaseHeart, IconDiaper, IconDatabaseExclamation, IconSubtask, IconCertificate } from "@tabler/icons-react";


export const dashboardSidebar = [
  {
    title: "Master Data",
    href: "master_data/master_system/master_data_list",
    active: "Master",
    icon: < IconListLetters size={18} />,
    child: [
      {
        title: "Master Data System",
        href: "/master_data/master_system/master_data_list",
        active: "master system",
        icon: <IconDatabaseExclamation size={18} />,
      },
      {
        title: "Master Data Subsystem",
        href: "/master_data_subsystem/subsystem_list/",
        active: "master_subsystem",
        icon: <IconSubtask size={18} />,
      },
      {
        title: "Master Data ITR",
        href: "/master_data_new/master_data_itr/master_system",
        active: "master itr",
        icon: <IconCertificate size={18} />,
        child: [
          {
            title: "ITR Form",
            href: "/master_data_new/master_data_itr/itr_form",
            active: "itr form",
            icon: <IconNote size={18} />,
          },
        ],
      },
    ],
  },
];
      // Tambahan menu baru di sini
      // {
      //   title: "Master Data New Item",
      //   href: "/master_data/new_item",
      //   active: "master_new_item",
      //   icon: <IconSubtask size={18} />, // Ganti dengan icon sesuai kebutuhan
      // },
  // item sidebar lainnya

      // {
      //   title: "Area",
      //   href: "/master-data/area",
      //   active: "Area",
      //   icon: <IconGps size={18} />,
      // },
      // {
      //   title: "Location",
      //   href: "/master-data/location",
      //   active: "Location",
      //   icon: <IconMapPinPlus size={18} />,
      // },
      // {
      //   title: "Point",
      //   href: "/master-data/point",
      //   active: "Point",
      //   icon: <IconGolf size={18} />,
      // },