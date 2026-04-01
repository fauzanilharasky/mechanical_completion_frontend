import { IconNote, IconDownload, IconHome, IconList, IconUpload, IconListLetters, IconMapPinPlus, IconArrowDownToArc, IconDeviceIpadHorizontalPin, IconGps, IconGolf, IconDatabaseHeart, IconDiaper, IconDatabaseExclamation, IconSubtask, IconCertificate, IconRegistered, IconTag, IconFileImport, IconSignLeftFilled, IconFavicon, IconCapProjecting, IconDeviceProjector, IconBuildingStore, IconBuilding, IconFileCheck } from "@tabler/icons-react";

export const tagNumberList = [
  // Tag Number Menu

  {
    title: "Tag Number",
    href: "master_data_new/tag_number/tag_register",
    active: "master",
    icon: <IconTag size={18} />,
    alwaysOpen: true,
    child: [
      {
        title: "Tag Number Register",
        href: "/master_data_new/tag_number/tag_register",
        active: "tag number register",
        icon: <IconRegistered size={18} />,
      },
      {
        title: "Tag Number import",
        href: "/master_data_new/tag_number/tag_import",
        active: "tag number import",
        icon: <IconFileImport size={18} />,
      },
    ],
  },

]

