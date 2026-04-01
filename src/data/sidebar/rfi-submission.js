import { Center } from "@mantine/core";
import { IconDeviceImacSearch, IconBuilding, IconFileCheck, IconPlayerEject, IconPageBreak, IconStatusChange, IconPlayerEjectFilled, IconSend, IconEaseInControlPoint, IconNumber2, IconNumber3, IconStars, IconTransformFilled, IconFileExport, IconFileUpload, IconFileExcel, IconCircleCaretRight, IconCaretRight, IconCircleChevronRight, IconUser, IconBorderStyle, IconLineDashed, IconPlaneDeparture, IconChartBar } from "@tabler/icons-react";
import { Icon, icons } from "lucide-react";

export const rfiSubmissionList = [

  // RFI SUBMISSION BY SPV
    {
      title: "Supervisor Section",
      href: "master_data_new/itr_assignment/unassign_list",
      active: "/rfi",
      icon: < IconChartBar size={18} />,
      
      child: [
      
        {
          title: "Pending Submission Spv",
          href: "/master_data_new/rfi_submission/production_rfi",
          active: "Pending Submission",
          icon: <IconCaretRight size={18} />,
        },
        
        {    
          title: "Reject By Spv",
          href: "/master_data_new/rfi_submission/reject_rfi",
          active: "Reject By Spv",
          match: "/master_data_new/rfi_submission/submission_qc/${value}",
          icon: <IconCaretRight size={18} />,
        },
      
        {   
          title: "Pending Approval Spv",
          href: "/master_data_new/rfi_submission/inspection_rfi",
          active: "Pending Approval Spv",
          icon: <IconCaretRight size={18} />,
        },
      ],
    },


      // QC SECTION
     {
      title: "QC Section",
      href: "master_data_new/rfi_submission/submission_qc/pending_sub_qc",
      active: "/rfi",
      icon: < IconBorderStyle size={18} />,
      child: [     

        {
          title: "Pending Approval QC",
          href:"/master_data_new/rfi_submission/submission_qc/pending_sub_qc",
          active: "Pending Approval QC",
          icon: <IconCaretRight size={18} />,
        },

        
        {
          title: "Reject By QC",
          href: "/master_data_new/rfi_submission/submission_qc/reject_qc",
          match: "/master_data_new/rfi_submission/submission_qc/details/reject/${value}",
          active: "Reject By QC",
          icon: <IconCaretRight size={18} />,
        },
        
        {
          title: " Transmittal To Client",
          href:"/master_data_new/rfi_submission/submission_qc/transmittal_by_qc",
          active: "Transmittal To Client",
          icon: <IconCaretRight size={18} />,
        },
        {
          title: "Re-Transmittal To Client",
          href:"/master_data_new/rfi_submission/submission_qc/approval_review",
          active: "Pending From Review",
          icon: <IconCaretRight size={18} />,
        },
      ],
    },


     {
      title: "Client Section",
      href: "master_data_new/itr_assignment/unassign_list",
      active: "/rfi",
      icon: < IconUser size={18} />,
      child: [     

        {
          title: " Pending By Client",
          href:"/master_data_new/rfi_submission/client_section/pending_client",
          active: "Pending By Client",
          icon: <IconCaretRight size={18} />,
        },

        // {
        //   title: "Pending Review",
        //   href:"/master_data_new/rfi_submission/client_section/",
        //   active: "Reject By Client",
        //   icon: <IconCaretRight size={18} />,
        // },
      
        {
          title: " Reject By Client",
          href:"/master_data_new/rfi_submission/client_section/reject_client",
          active: "Reject By Client",
          icon: <IconCaretRight size={18} />,
        },
      
         {
          title: " Approve By Client",
          href:"/master_data_new/rfi_submission/client_section/approve_client",
          active: "Approve By Client",
          icon: <IconCaretRight size={18} />,
        },

         {
          title: "Summary/Report To Client",
          href:"/master_data_new/rfi_submission/summary_rfi",
          active: "Summary To Client",
          icon: <IconCaretRight size={18} />,
        },

        
      ],
    },

   {
    title: "Export To Excel",
    href:"/master_data_new/rfi_submission/export_to_excel",
    active: "Fitup To Excel",
    icon: <IconFileExcel size={18} />,
  },
  
];

