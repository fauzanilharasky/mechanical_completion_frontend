import { IconDeviceImacSearch, IconBuilding, IconFileCheck, IconSubtask } from "@tabler/icons-react";

export const itrAssignmentList = [

  {
    title: "ITR Assignment",
    href: "master_data_new/itr_assignment/unassign_list",
    active: "Master",
    icon: < IconDeviceImacSearch size={18} />,
    
    child: [
      {
        title: "Unassign ITR",
        href: "/master_data_new/itr_assignment/unassign_list",
        active: "Unassign ITR",
        icon: <IconSubtask size={18} />,
        
      },
      {
        title: "Assignment ITR",
        href: "/master_data_new/itr_assignment/assign_list",
        active: "assigned ITR",
        icon: <IconFileCheck size={18} />,
      },
    ],
  },
];