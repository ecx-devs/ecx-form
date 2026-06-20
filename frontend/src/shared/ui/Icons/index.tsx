'use client';

import { SVGProps } from 'react';
import { cn } from '../../lib/cn';

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const createIcon = (path: React.ReactNode, viewBox = '0 0 24 24') => {
  const Icon = ({ size = 24, className, ...props }: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('shrink-0', className)}
      {...props}
    >
      {path}
    </svg>
  );
  return Icon;
};

// Navigation & Actions
export const IconPlus = createIcon(<path d="M12 5v14M5 12h14" />);
export const IconMinus = createIcon(<path d="M5 12h14" />);
export const IconX = createIcon(<><path d="M18 6L6 18" /><path d="M6 6l12 12" /></>);
export const IconCheck = createIcon(<path d="M20 6L9 17l-5-5" />);
export const IconChevronDown = createIcon(<path d="M6 9l6 6 6-6" />);
export const IconChevronUp = createIcon(<path d="M18 15l-6-6-6 6" />);
export const IconChevronLeft = createIcon(<path d="M15 18l-6-6 6-6" />);
export const IconChevronRight = createIcon(<path d="M9 18l6-6-6-6" />);
export const IconMenu = createIcon(<><path d="M4 12h16" /><path d="M4 6h16" /><path d="M4 18h16" /></>);
export const IconMoreVertical = createIcon(<><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></>);
export const IconMoreHorizontal = createIcon(<><circle cx="12" cy="12" r="1" /><circle cx="5" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>);

// Form Elements
export const IconShortText = createIcon(<><path d="M4 7h16" /><path d="M4 12h10" /></>);
export const IconLongText = createIcon(<><path d="M4 6h16" /><path d="M4 10h16" /><path d="M4 14h16" /><path d="M4 18h10" /></>);
export const IconNumber = createIcon(<><path d="M4 17V7" /><path d="M8 17V7" /><path d="M8 12h8" /><path d="M20 7v10" /></>);
export const IconRadio = createIcon(<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" fill="currentColor" /></>);
export const IconCheckbox = createIcon(<><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 12l2 2 4-4" /></>);
export const IconDropdown = createIcon(<><path d="M6 9l6 6 6-6" /><rect x="3" y="3" width="18" height="18" rx="2" /></>);
export const IconFile = createIcon(<><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /></>);
export const IconUpload = createIcon(<><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></>);
export const IconSection = createIcon(<><path d="M4 5h16" /><path d="M4 19h16" /><path d="M8 9h8" /><path d="M8 13h6" /></>);

// Actions
export const IconCopy = createIcon(<><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></>);
export const IconTrash = createIcon(<><path d="M3 6h18" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></>);
export const IconEdit = createIcon(<><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></>);
export const IconSave = createIcon(<><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></>);
export const IconDownload = createIcon(<><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>);
export const IconExport = createIcon(<><path d="M21 3H3v18h18V3z" /><path d="M10 9l3 3-3 3" /><path d="M7 12h9" /></>);
export const IconShare = createIcon(<><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" /></>);
export const IconLink = createIcon(<><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></>);

// Status
export const IconSuccess = createIcon(<><circle cx="12" cy="12" r="10" /><path d="M9 12l2 2 4-4" /></>);
export const IconWarning = createIcon(<><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>);
export const IconError = createIcon(<><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></>);
export const IconInfo = createIcon(<><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></>);

// Layout
export const IconGripVertical = createIcon(<><circle cx="9" cy="4" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="20" r="1" /><circle cx="15" cy="4" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="20" r="1" /></>);
export const IconSettings = createIcon(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" /></>);
export const IconEye = createIcon(<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>);
export const IconEyeOff = createIcon(<><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>);

// Form specific
export const IconRequired = createIcon(<><path d="M12 2v20M2 12h20" /><path d="M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" /></>);
export const IconFormList = createIcon(<><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></>);
export const IconResponse = createIcon(<><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></>);

