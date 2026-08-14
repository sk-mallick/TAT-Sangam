// ============================================================
//  Trident Academy of Technology — 7th Semester Master Timetable
//  w.e.f. 20 July 2026. One schedule per branch per weekday.
//  Branch keys match the signup form's branch values.
//  NOTE: auto-extracted from the official PDF — verify lab/seminar/
//  project cells against the master copy if anything looks off.
// ============================================================
const BRANCH_TIMETABLES = {
  "CSE-A": {
    "Monday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "DOP",
        "teacher": "CKP",
        "room": "R-4116"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "SST",
        "room": "RN-4215"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "SPM",
        "teacher": "BRN",
        "room": "RN-4116"
      },
      {
        "time": "12:35 PM - 01:30 PM",
        "subject": "IOT",
        "teacher": "MR",
        "room": "RN-4116"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "DS&A",
        "teacher": "SM-2",
        "room": "RN-4116"
      }
    ],
    "Tuesday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "DS&A",
        "teacher": "SM-2",
        "room": "RN-4112"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "SPM",
        "teacher": "BRN",
        "room": "RN-4112"
      },
      {
        "time": "09:50 AM - 10:45 AM",
        "subject": "IOT",
        "teacher": "SM-2",
        "room": "RN-4112"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "OOP",
        "teacher": "CKP",
        "room": "RN-4112"
      },
      {
        "time": "12:35 PM - 01:30 PM",
        "subject": "IOT",
        "teacher": "AKS",
        "room": "RN-4215"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "A&R",
        "teacher": "PKN",
        "room": "RN-4215"
      }
    ],
    "Wednesday": [
      {
        "time": "08:00 AM - 10:45 AM",
        "subject": "GR-1: PPD-11 (BM) [L9] / GR-2: Seminar (BRN) [L5]"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "DS&A",
        "teacher": "SM-2",
        "room": "RN-4309"
      },
      {
        "time": "12:35 PM - 01:30 PM",
        "subject": "SPM",
        "teacher": "BRN",
        "room": "RN-4309"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "IOT",
        "teacher": "MR",
        "room": "RN-4309"
      }
    ],
    "Thursday": [
      {
        "time": "08:00 AM - 10:45 AM",
        "subject": "GR-1: Seminar (BRN) [L5] / GR-2: PPD-11 Lab (YD) [L10]"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "OOP",
        "teacher": "CKP",
        "room": "RN-4114"
      },
      {
        "time": "12:35 PM - 01:30 PM",
        "subject": "SPM",
        "teacher": "BRN",
        "room": "RN-4114"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "DS&A",
        "teacher": "SM-2",
        "room": "RN-4114"
      }
    ],
    "Friday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "DS&A",
        "teacher": "SM-2",
        "room": "RN-4112"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "IOT",
        "teacher": "MR",
        "room": "RN-4112"
      },
      {
        "time": "09:50 AM - 10:45 AM",
        "subject": "IOT",
        "teacher": "MR",
        "room": "RN-4112"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "OOP",
        "teacher": "CKP",
        "room": "RN-4112"
      },
      {
        "time": "12:35 PM - 01:30 PM",
        "subject": "OOP",
        "teacher": "CKP",
        "room": "RN-4112"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "SPM",
        "teacher": "BRN",
        "room": "RN-4112"
      }
    ]
  },
  "CSE-B": {
    "Monday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "DS&A",
        "teacher": "SM-2",
        "room": "RN-4212"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "SST",
        "room": "RN-4215"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "IOT",
        "teacher": "AKS",
        "room": "RN-4212"
      },
      {
        "time": "12:35 PM - 01:30 PM",
        "subject": "SPM",
        "teacher": "BRN",
        "room": "RN-4212"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "OOP",
        "teacher": "PSM",
        "room": "RN-4212"
      }
    ],
    "Tuesday": [
      {
        "time": "08:00 AM - 10:45 AM",
        "subject": "GR-1: Seminar (RD) [L9] / GR-2: PPD-11 Lab (RR) [L10]"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "IOT",
        "teacher": "AKS",
        "room": "RN-4215"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "A&R",
        "teacher": "PKN",
        "room": "RN-4215"
      }
    ],
    "Wednesday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "DS&A",
        "teacher": "SM-2",
        "room": "RN-4102"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "OOP",
        "teacher": "PSM",
        "room": "RN-4102"
      },
      {
        "time": "09:50 AM - 10:45 AM",
        "subject": "SPM",
        "teacher": "BRN",
        "room": "RN-4102"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "SPM",
        "teacher": "BRN",
        "room": "RN-4102"
      },
      {
        "time": "12:35 PM - 01:30 PM",
        "subject": "IOT",
        "teacher": "AKS",
        "room": "RN-4215"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "OOP",
        "teacher": "PSM",
        "room": "RN-4102"
      }
    ],
    "Thursday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "DS&A",
        "teacher": "SM-2",
        "room": "RN-4114"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "OOP",
        "teacher": "PSM",
        "room": "RN-4114"
      },
      {
        "time": "09:50 AM - 10:45 AM",
        "subject": "IOT",
        "teacher": "AKS",
        "room": "RN-4212"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 02:25 PM",
        "subject": "GR-1: PPD-11 (SP) [L9] / GR-2: Seminar (CKP) [L10]"
      }
    ],
    "Friday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "SPM",
        "teacher": "BRN",
        "room": "RN-4113"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "OOP",
        "teacher": "PSM",
        "room": "RN-4113"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "SPM",
        "teacher": "BRN",
        "room": "RN-4113"
      },
      {
        "time": "12:35 PM - 01:30 PM",
        "subject": "IOT",
        "teacher": "AKS",
        "room": "RN-4215"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "DS&A",
        "teacher": "SM-2",
        "room": "RN-4113"
      }
    ]
  },
  "CSE-C": {
    "Monday": [
      {
        "time": "08:00 AM - 10:45 AM",
        "subject": "GR-1: PPD-11 Lab (TS) [L9] / GR-2: Seminar (CKP) [L10]"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "DS&A",
        "teacher": "SM-2",
        "room": "RN-4309"
      },
      {
        "time": "12:35 PM - 01:30 PM",
        "subject": "DS&A",
        "teacher": "SM-2",
        "room": "RN-4309"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "IOT",
        "teacher": "AKS",
        "room": "RN-4215"
      }
    ],
    "Tuesday": [
      {
        "time": "08:00 AM - 10:45 AM",
        "subject": "GR-1: Seminar-II (CKP) [L4] / GR-2: PPD-II Lab (SBP) [L5]"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "SPM",
        "teacher": "RD",
        "room": "RN-4212"
      },
      {
        "time": "12:35 PM - 01:30 PM",
        "subject": "IOT",
        "teacher": "AKS",
        "room": "RN-4215"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "OOP",
        "teacher": "CKP",
        "room": "RN-4212"
      }
    ],
    "Wednesday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "OOP",
        "teacher": "CKP",
        "room": "RN-4310"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "SST",
        "room": "RN-4215"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "IOT",
        "teacher": "AKS",
        "room": "RN-4215"
      },
      {
        "time": "12:35 PM - 01:30 PM",
        "subject": "DS&A",
        "teacher": "SM-2",
        "room": "RN-4310"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "SPM",
        "teacher": "RD",
        "room": "RN-4310"
      }
    ],
    "Thursday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "OOP",
        "teacher": "CKP",
        "room": "RN-4112"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "SPM",
        "teacher": "RD",
        "room": "RN-4112"
      },
      {
        "time": "09:50 AM - 10:45 AM",
        "subject": "DS&A",
        "teacher": "SM-2",
        "room": "RN-4112"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "IOT",
        "teacher": "AKS",
        "room": "RN-4215"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "A&R",
        "teacher": "PKN",
        "room": "RN-4215"
      }
    ],
    "Friday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "OOP",
        "teacher": "CKP",
        "room": "RN-4114"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "OOP",
        "teacher": "CKP",
        "room": "RN-4114"
      },
      {
        "time": "09:50 AM - 10:45 AM",
        "subject": "SPM",
        "teacher": "RD",
        "room": "RN-4114"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "SRM",
        "teacher": "RD",
        "room": "RN-4114"
      },
      {
        "time": "12:35 PM - 01:30 PM",
        "subject": "DS&A",
        "teacher": "SM-2",
        "room": "RN-4114"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "IOT",
        "teacher": "AKS",
        "room": "RN-4215"
      }
    ]
  },
  "CST-A": {
    "Monday": [
      {
        "time": "08:00 AM - 10:45 AM",
        "subject": "GR-1: Seminar (PSM) [L5] / GR-2: PPD-11 (KCD) [L5]"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "DS&A",
        "teacher": "D.DHAL",
        "room": "RN-4113"
      },
      {
        "time": "12:35 PM - 01:30 PM",
        "subject": "OOP",
        "teacher": "PSM",
        "room": "RN-4113"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "SPM",
        "teacher": "RD",
        "room": "RN-4113"
      }
    ],
    "Tuesday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "OOP",
        "teacher": "PSM",
        "room": "RN-4114"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "OOP",
        "teacher": "PSM",
        "room": "RN-4114"
      },
      {
        "time": "09:50 AM - 10:45 AM",
        "subject": "IOT",
        "teacher": "PKM",
        "room": "RN-4114"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "DS&A",
        "teacher": "D.DHAL",
        "room": "RN-4114"
      },
      {
        "time": "12:35 PM - 01:30 PM",
        "subject": "OOP",
        "teacher": "PKM",
        "room": "RN-4114"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "SPM",
        "teacher": "RD",
        "room": "RN-4114"
      }
    ],
    "Wednesday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "IOT",
        "teacher": "PKM",
        "room": "RN-4112"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "SST",
        "room": "RN-3112"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "SPM",
        "teacher": "RD",
        "room": "RN-4112"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "A&R",
        "teacher": "PKN",
        "room": "RN-4215"
      }
    ],
    "Thursday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "SPM",
        "teacher": "RD",
        "room": "RN-4113"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "SPM",
        "teacher": "RD",
        "room": "RN-4113"
      },
      {
        "time": "09:50 AM - 10:45 AM",
        "subject": "DS&A",
        "teacher": "D.DHAL",
        "room": "RN-4113"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "DS&A",
        "teacher": "D.DHAL",
        "room": "RN-4113"
      },
      {
        "time": "12:35 PM - 01:30 PM",
        "subject": "OOP",
        "teacher": "PKM",
        "room": "RN-4113"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "OOP",
        "teacher": "PSM",
        "room": "RN-4113"
      }
    ],
    "Friday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "IOT",
        "teacher": "PKM",
        "room": "RN-4116"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "DS&A",
        "teacher": "D.DHAL",
        "room": "RN-4116"
      },
      {
        "time": "09:50 AM - 10:45 AM",
        "subject": "OOP",
        "teacher": "PSM",
        "room": "RN-4116"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 02:25 PM",
        "subject": "GR-1: PPD-11 Lab (PS) [L9] / GR-2: Seminar (TS) [L10]"
      }
    ]
  },
  "CST-B": {
    "Monday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "OOP",
        "teacher": "PSM",
        "room": "RN-4112"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "SPM",
        "teacher": "RD",
        "room": "RN-4112"
      },
      {
        "time": "09:50 AM - 10:45 AM",
        "subject": "SPM",
        "teacher": "RD",
        "room": "RN-4112"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 02:25 PM",
        "subject": "GR-1: PPD-11 Lab (AD) [L9] / GR-2: Seminar (KS) [L10]"
      }
    ],
    "Tuesday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "DS&A",
        "teacher": "KS",
        "room": "RN-4116"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "DS&A",
        "teacher": "KS",
        "room": "RN-4116"
      },
      {
        "time": "09:50 AM - 10:45 AM",
        "subject": "IOT",
        "teacher": "SKT",
        "room": "RN-4116"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "IOT",
        "teacher": "SKT",
        "room": "RN-4116"
      },
      {
        "time": "12:35 PM - 01:30 PM",
        "subject": "OOP",
        "teacher": "PSM",
        "room": "RN-4116"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "OOP",
        "teacher": "PSM",
        "room": "RN-4116"
      }
    ],
    "Wednesday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "SPM",
        "teacher": "RD",
        "room": "RN-4113"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "SST",
        "room": "RN-3112"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "IOT",
        "teacher": "SKT",
        "room": "RN-4113"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "A&R",
        "teacher": "PKN",
        "room": "RN-4215"
      }
    ],
    "Thursday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "DS&A",
        "teacher": "KS",
        "room": "RN-4309"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "IOT",
        "teacher": "SKT",
        "room": "RN-4309"
      },
      {
        "time": "09:50 AM - 10:45 AM",
        "subject": "OOP",
        "teacher": "PSM",
        "room": "RN-4309"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "DS&A",
        "teacher": "KS",
        "room": "RN-4309"
      },
      {
        "time": "12:35 PM - 01:30 PM",
        "subject": "OOP",
        "teacher": "PSM",
        "room": "RN-4309"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "SPM",
        "teacher": "RD",
        "room": "RN-4309"
      }
    ],
    "Friday": [
      {
        "time": "08:00 AM - 10:45 AM",
        "subject": "GR-1: Seminar (SP-1) [L5] / GR-2: PPD-I Lab (D.D) [L10]"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "DS&A",
        "teacher": "KS",
        "room": "RN-4116"
      },
      {
        "time": "12:35 PM - 01:30 PM",
        "subject": "IOT",
        "teacher": "SKT",
        "room": "RN-4116"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "SPM",
        "teacher": "RD",
        "room": "RN-4116"
      }
    ]
  },
  "CST-IT": {
    "Monday": [
      {
        "time": "08:00 AM - 10:45 AM",
        "subject": "GR-1: Seminar (BRN) [L6] / GR-2: PPD-11 (RD) [L7]"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "OOP",
        "teacher": "CKP",
        "room": "RN-4114"
      },
      {
        "time": "12:35 PM - 01:30 PM",
        "subject": "OOP",
        "teacher": "CKP",
        "room": "RN-4114"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "DS&A",
        "teacher": "SS",
        "room": "RN-4114"
      }
    ],
    "Tuesday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "OOP",
        "teacher": "CKD",
        "room": "RN-4309"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "DS&A",
        "teacher": "SS",
        "room": "RN-4309"
      },
      {
        "time": "09:50 AM - 10:45 AM",
        "subject": "IOT",
        "teacher": "SMA",
        "room": "RN-4309"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "SPM",
        "teacher": "BRN",
        "room": "RN-4309"
      },
      {
        "time": "12:35 PM - 01:30 PM",
        "subject": "SPM",
        "teacher": "BRN",
        "room": "RN-4309"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "DS&A",
        "teacher": "SS",
        "room": "RN-4309"
      }
    ],
    "Wednesday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "DS&A",
        "teacher": "SS",
        "room": "RN-4114"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "SST",
        "room": "RN-4215"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "OOP",
        "teacher": "CKP",
        "room": "RN-4114"
      },
      {
        "time": "12:35 PM - 01:30 PM",
        "subject": "OOP",
        "teacher": "CKP",
        "room": "RN-4114"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "IOT",
        "teacher": "SMA",
        "room": "RN-4114"
      }
    ],
    "Thursday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "SPM",
        "teacher": "BRN",
        "room": "RN-4310"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "IOT",
        "teacher": "SMA",
        "room": "RN-4310"
      },
      {
        "time": "09:50 AM - 10:45 AM",
        "subject": "DS&A",
        "teacher": "SS",
        "room": "RN-4310"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "SPM",
        "teacher": "BRN",
        "room": "RN-4310"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "A&R",
        "teacher": "PKN",
        "room": "RN-4215"
      }
    ],
    "Friday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "IOT",
        "teacher": "SMA",
        "room": "RN-4309"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "IOT",
        "teacher": "SMA",
        "room": "RN-4309"
      },
      {
        "time": "09:50 AM - 10:45 AM",
        "subject": "SPM",
        "teacher": "BRN",
        "room": "RN-4309"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 02:25 PM",
        "subject": "GR-1: PPD-11 Lab (BS) [L9] / GR-2: Seminar-II (KCP) [L10]"
      }
    ]
  },
  "CSE-DS": {
    "Monday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "DSH",
        "teacher": "MM",
        "room": "RN-4310"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "OOP",
        "teacher": "BS",
        "room": "RN-4310"
      },
      {
        "time": "09:50 AM - 10:45 AM",
        "subject": "DS&A",
        "teacher": "SS",
        "room": "RN-4310"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "APT",
        "teacher": "PKN",
        "room": "RN-4215"
      },
      {
        "time": "12:35 PM - 01:30 PM",
        "subject": "APT",
        "teacher": "PKN",
        "room": "RN-4215"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "OOP",
        "teacher": "RB",
        "room": "RN-4310"
      }
    ],
    "Tuesday": [
      {
        "time": "08:00 AM - 10:45 AM",
        "subject": "PPD-II Lab (SM-2) [L6]"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "DSH",
        "teacher": "MM",
        "room": "RN-4310"
      },
      {
        "time": "12:35 PM - 01:30 PM",
        "subject": "DS&A",
        "teacher": "SS",
        "room": "RN-4310"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "OOP",
        "teacher": "RB",
        "room": "RN-4310"
      }
    ],
    "Wednesday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "DSH",
        "teacher": "MM",
        "room": "RN-4116"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "OOP",
        "teacher": "BS",
        "room": "RN-4116"
      },
      {
        "time": "09:50 AM - 10:45 AM",
        "subject": "IOT",
        "teacher": "RB",
        "room": "RN-4116"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 02:25 PM",
        "subject": "GR-1: Seminar (SS) [L9] / GR-2: PPD-11 Lab (D.DHAL) [L10]"
      }
    ],
    "Thursday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "IOT",
        "teacher": "RB",
        "room": "RN-4102"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "SST",
        "room": "RN-4215"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "OOP",
        "teacher": "SS",
        "room": "RN-4116"
      },
      {
        "time": "12:35 PM - 01:30 PM",
        "subject": "OOP",
        "teacher": "BS",
        "room": "RN-4116"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "DSH",
        "teacher": "MM",
        "room": "RN-4116"
      }
    ],
    "Friday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "DS&A",
        "teacher": "SS",
        "room": "RN-4310"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "IOT",
        "teacher": "RB",
        "room": "RN-4310"
      },
      {
        "time": "09:50 AM - 10:45 AM",
        "subject": "DSH",
        "teacher": "MM",
        "room": "RN-4310"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "OOP",
        "teacher": "BS",
        "room": "RN-4310"
      },
      {
        "time": "12:35 PM - 01:30 PM",
        "subject": "DS&A",
        "teacher": "SS",
        "room": "RN-4310"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "OOP",
        "teacher": "BS",
        "room": "RN-4310"
      }
    ]
  },
  "CS-AIML": {
    "Monday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "AIH",
        "teacher": "SM-1",
        "room": "RN-4101"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "DS&A",
        "teacher": "SS",
        "room": "RN-4101"
      },
      {
        "time": "09:50 AM - 10:45 AM",
        "subject": "IOT",
        "teacher": "RB",
        "room": "RN-4101"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "APT",
        "teacher": "PKN",
        "room": "RN-4215"
      },
      {
        "time": "12:35 PM - 01:30 PM",
        "subject": "OOP",
        "teacher": "BS",
        "room": "RN-4101"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "RES",
        "teacher": "SMA/MP",
        "room": "RN-4101"
      }
    ],
    "Tuesday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "DS&A",
        "teacher": "SS",
        "room": "RN-4101"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "OOP",
        "teacher": "BS",
        "room": "RN-4101"
      },
      {
        "time": "09:50 AM - 10:45 AM",
        "subject": "AIH",
        "teacher": "SM-1",
        "room": "RN-4101"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "OOP",
        "teacher": "BS",
        "room": "RN-4101"
      },
      {
        "time": "12:35 PM - 01:30 PM",
        "subject": "DS",
        "teacher": "KPS",
        "room": "RN-4101"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "RES",
        "teacher": "SMA/MP",
        "room": "RN-4101"
      }
    ],
    "Wednesday": [
      {
        "time": "08:00 AM - 10:45 AM",
        "subject": "GR-1: Seminar (SS) [L9] / GR-2: PPD-11 Lab (CKP) [L10]"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "IOT",
        "teacher": "RB",
        "room": "RN-4101"
      },
      {
        "time": "12:35 PM - 01:30 PM",
        "subject": "OOP",
        "teacher": "BS",
        "room": "RN-4101"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "DS&A",
        "teacher": "SS",
        "room": "RN-4101"
      }
    ],
    "Thursday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "DS&A",
        "teacher": "SS",
        "room": "RN-4101"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "SST",
        "room": "RN-4215"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "OOP",
        "teacher": "BS",
        "room": "RN-4101"
      },
      {
        "time": "12:35 PM - 01:30 PM",
        "subject": "IOT",
        "teacher": "RB",
        "room": "RN-4101"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "DS&A",
        "teacher": "SS",
        "room": "RN-4101"
      }
    ],
    "Friday": [
      {
        "time": "08:00 AM - 10:45 AM",
        "subject": "GR-1: PPD-11 Lab (PSM) [L4] / GR-2: Seminar (SM) [L5]"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "AIH",
        "teacher": "SM",
        "room": "RN-4101"
      },
      {
        "time": "12:35 PM - 01:30 PM",
        "subject": "IOT",
        "teacher": "RB",
        "room": "RN-4101"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "AIH",
        "teacher": "SM",
        "room": "RN-4101"
      }
    ]
  },
  "ETC-EV": {
    "Monday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "DS",
        "teacher": "KPS",
        "room": "RN-3115"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "TSN",
        "teacher": "SNR",
        "room": "RN-3115"
      },
      {
        "time": "09:50 AM - 10:45 AM",
        "subject": "TSN",
        "teacher": "SNR",
        "room": "RN-3115"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "IOT",
        "teacher": "SKT",
        "room": "RN-3115"
      },
      {
        "time": "12:35 PM - 01:30 PM",
        "subject": "RES",
        "teacher": "SMA/MP",
        "room": "RN-3115"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "RES",
        "teacher": "SMA/MP",
        "room": "RN-3115"
      }
    ],
    "Tuesday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "IOT",
        "teacher": "SKT",
        "room": "RN-3115"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "SST",
        "room": "RN-3112"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "TSN",
        "teacher": "SNR",
        "room": "RN-3115"
      },
      {
        "time": "12:35 PM - 01:30 PM",
        "subject": "DS",
        "teacher": "KPS",
        "room": "RN-3115"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "RES",
        "teacher": "SMA/MP",
        "room": "RN-3115"
      }
    ],
    "Wednesday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "DS",
        "teacher": "KPS",
        "room": "RN-3115"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "IOT",
        "teacher": "SKT",
        "room": "RN-3115"
      },
      {
        "time": "09:50 AM - 10:45 AM",
        "subject": "RES",
        "teacher": "SMA/MP",
        "room": "RN-3115"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 02:25 PM",
        "subject": "Seminar (MM/RB) / Project (SMA)"
      }
    ],
    "Thursday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "IOT",
        "teacher": "SKT",
        "room": "RN-3115"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "DS",
        "teacher": "KPS",
        "room": "RN-3115"
      },
      {
        "time": "09:50 AM - 10:45 AM",
        "subject": "TSN",
        "teacher": "SNR",
        "room": "RN-3115"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 02:25 PM",
        "subject": "GR-1: Project (SMA) / GR-2: Seminar (MM/KPS)"
      }
    ],
    "Friday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "IOT",
        "teacher": "SKT",
        "room": "RN-3115"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "DS",
        "teacher": "KPS",
        "room": "RN-3115"
      },
      {
        "time": "09:50 AM - 10:45 AM",
        "subject": "TSN",
        "teacher": "SNR",
        "room": "RN-3115"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "RES",
        "teacher": "SMA/MP",
        "room": "RN-3115"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "A&R",
        "teacher": "PKN",
        "room": "RN-3112"
      }
    ]
  },
  "MECH": {
    "Monday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "RES",
        "teacher": "YP",
        "room": "RN-3216"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "WM",
        "teacher": "SR",
        "room": "RN-3216"
      },
      {
        "time": "09:50 AM - 10:45 AM",
        "subject": "TL",
        "teacher": "PKN",
        "room": "RN-3216"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 02:25 PM",
        "subject": "Seminar (DM)"
      }
    ],
    "Tuesday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "IOT",
        "teacher": "RP",
        "room": "RN-3216"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "SST",
        "room": "RN-3112"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "TL",
        "teacher": "PKN",
        "room": "RN-3216"
      },
      {
        "time": "12:35 PM - 01:30 PM",
        "subject": "WM",
        "teacher": "SR",
        "room": "RN-3216"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "RES",
        "teacher": "YP",
        "room": "RN-3216"
      }
    ],
    "Wednesday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "IOT",
        "teacher": "RP",
        "room": "RN-3216"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "RES",
        "teacher": "YP",
        "room": "RN-3216"
      },
      {
        "time": "09:50 AM - 10:45 AM",
        "subject": "ECA",
        "teacher": "PKN",
        "room": "RN-3216"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 02:25 PM",
        "subject": "Project (AKS/RP/DM)"
      }
    ],
    "Thursday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "RES",
        "teacher": "YP",
        "room": "RN-3216"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "IOT",
        "teacher": "RP",
        "room": "RN-3216"
      },
      {
        "time": "09:50 AM - 10:45 AM",
        "subject": "IOT",
        "teacher": "RP",
        "room": "RN-3216"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "WM",
        "teacher": "SR",
        "room": "RN-3216"
      },
      {
        "time": "12:35 PM - 01:30 PM",
        "subject": "ECA",
        "teacher": "PKN",
        "room": "RN-3216"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "ECA",
        "teacher": "PKN",
        "room": "RN-3216"
      }
    ],
    "Friday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "RES",
        "teacher": "YP",
        "room": "RN-3216"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "WM",
        "teacher": "SR",
        "room": "RN-3216"
      },
      {
        "time": "09:50 AM - 10:45 AM",
        "subject": "WM",
        "teacher": "SR",
        "room": "RN-3216"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "IOT",
        "teacher": "RP",
        "room": "RN-3216"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "A&R",
        "teacher": "PKN",
        "room": "RN-3112"
      }
    ]
  },
  "EEE": {
    "Monday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "RES",
        "teacher": "YP",
        "room": "RN-3216"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "SG",
        "teacher": "NI",
        "room": "RN-3204"
      },
      {
        "time": "09:50 AM - 10:45 AM",
        "subject": "CAD",
        "teacher": "MME",
        "room": "RN-3204"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 02:25 PM",
        "subject": "Seminar (NI)"
      }
    ],
    "Tuesday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "IOT",
        "teacher": "RP",
        "room": "RN-3216"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "SST",
        "room": "RN-3112"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "SG",
        "teacher": "NI",
        "room": "RN-3212(A)"
      },
      {
        "time": "12:35 PM - 01:30 PM",
        "subject": "WM",
        "teacher": "NI",
        "room": "RN-3212(A)"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "RES",
        "teacher": "YP",
        "room": "RN-3216"
      }
    ],
    "Wednesday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "IOT",
        "teacher": "RP",
        "room": "RN-3216"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "CFMC",
        "teacher": "YP",
        "room": "RN-3216"
      },
      {
        "time": "09:50 AM - 10:45 AM",
        "subject": "RD",
        "teacher": "MME",
        "room": "3204"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 02:25 PM",
        "subject": "Project (MME)"
      }
    ],
    "Thursday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "CFMC",
        "teacher": "YP",
        "room": "RN-3216"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "IOT",
        "teacher": "RP",
        "room": "RN-3216"
      },
      {
        "time": "09:50 AM - 10:45 AM",
        "subject": "IOT",
        "teacher": "RP",
        "room": "RN-3216"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "WM",
        "teacher": "MME",
        "room": "RN-3205"
      },
      {
        "time": "12:35 PM - 01:30 PM",
        "subject": "CAD",
        "teacher": "MME",
        "room": "RN-3205"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "CAD",
        "teacher": "NI",
        "room": "RN-3205"
      }
    ],
    "Friday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "RES",
        "teacher": "YP",
        "room": "RN-3216"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "ECA",
        "teacher": "MME",
        "room": "RN-3204"
      },
      {
        "time": "09:50 AM - 10:45 AM",
        "subject": "SG",
        "teacher": "NI",
        "room": "RN-3204"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "IOT",
        "teacher": "RP",
        "room": "RN-3216"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "A&R",
        "teacher": "PKN",
        "room": "RN-3112"
      }
    ]
  },
  "CIVIL": {
    "Monday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "CFMC",
        "teacher": "SR",
        "room": "RN-3215"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "WM",
        "teacher": "SR",
        "room": "RN-3216"
      },
      {
        "time": "09:50 AM - 10:45 AM",
        "subject": "BI",
        "teacher": "SM",
        "room": "RN-3215"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 02:25 PM",
        "subject": "Seminar (AB/SKB)"
      }
    ],
    "Tuesday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "IOT",
        "teacher": "RP",
        "room": "RN-3216"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "SST",
        "room": "RN-3112"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "CAD",
        "teacher": "SM",
        "room": "RN-3215"
      },
      {
        "time": "12:35 PM - 01:30 PM",
        "subject": "WM",
        "teacher": "SR",
        "room": "RN-3216"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "CFMC",
        "teacher": "SR",
        "room": "RN-3215"
      }
    ],
    "Wednesday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "IOT",
        "teacher": "RP",
        "room": "RN-3216"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "BB",
        "teacher": "SR",
        "room": "RN-3215"
      },
      {
        "time": "09:50 AM - 10:45 AM",
        "subject": "BI",
        "teacher": "SM",
        "room": "RN-3215"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 02:25 PM",
        "subject": "Project (RS/SR/NR)"
      }
    ],
    "Thursday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "BB",
        "teacher": "SR",
        "room": "RN-3215"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "IOT",
        "teacher": "RP",
        "room": "RN-3216"
      },
      {
        "time": "09:50 AM - 10:45 AM",
        "subject": "IOT",
        "teacher": "RP",
        "room": "RN-3216"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "WM",
        "teacher": "SR",
        "room": "RN-3216"
      },
      {
        "time": "12:35 PM - 01:30 PM",
        "subject": "BI",
        "teacher": "SM",
        "room": "RN-3215"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "BB",
        "teacher": "SM",
        "room": "RN-3215"
      }
    ],
    "Friday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "CFMC",
        "teacher": "SR",
        "room": "RN-3215"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "WM",
        "teacher": "SR",
        "room": "RN-3216"
      },
      {
        "time": "09:50 AM - 10:45 AM",
        "subject": "WM",
        "teacher": "SR",
        "room": "RN-3216"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "IOT",
        "teacher": "RP",
        "room": "RN-3216"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "A&R",
        "teacher": "PKN",
        "room": "RN-3112"
      }
    ]
  },
  "BIO-TECH": {
    "Monday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "BB",
        "teacher": "BS",
        "room": "RN-3204"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "WM",
        "teacher": "SR",
        "room": "RN-3216"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 02:25 PM",
        "subject": "Project"
      }
    ],
    "Tuesday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "IOT",
        "teacher": "RP",
        "room": "RN-3216"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "SST",
        "room": "RN-3112"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "BB",
        "teacher": "SNS",
        "room": "RN"
      },
      {
        "time": "12:35 PM - 01:30 PM",
        "subject": "WM",
        "teacher": "SR",
        "room": "RN-3216"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "BB",
        "teacher": "DS"
      }
    ],
    "Wednesday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "IOT",
        "teacher": "RP",
        "room": "RN-3216"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "DS",
        "teacher": "DS",
        "room": "RN-3204"
      },
      {
        "time": "09:50 AM - 10:45 AM",
        "subject": "SNS",
        "room": "RB-3204"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 02:25 PM",
        "subject": "Project"
      }
    ],
    "Thursday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "BB",
        "teacher": "DS",
        "room": "RN-3204"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "IOT",
        "teacher": "RP",
        "room": "RN-3216"
      },
      {
        "time": "09:50 AM - 10:45 AM",
        "subject": "IOT",
        "teacher": "RP",
        "room": "RN-3216"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "WM",
        "teacher": "SR",
        "room": "RN-3216"
      },
      {
        "time": "12:35 PM - 01:30 PM",
        "subject": "BI",
        "teacher": "SNS",
        "room": "RN"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "BB",
        "teacher": "DS",
        "room": "RN"
      }
    ],
    "Friday": [
      {
        "time": "08:00 AM - 08:55 AM",
        "subject": "BI",
        "teacher": "SNS",
        "room": "RN-3204"
      },
      {
        "time": "08:55 AM - 09:50 AM",
        "subject": "WM",
        "teacher": "SR",
        "room": "RN-3216"
      },
      {
        "time": "09:50 AM - 10:45 AM",
        "subject": "WM",
        "teacher": "SR",
        "room": "RN-3216"
      },
      {
        "break": true
      },
      {
        "time": "11:40 AM - 12:35 PM",
        "subject": "IOT",
        "teacher": "RP",
        "room": "RN-3216"
      },
      {
        "time": "01:30 PM - 02:25 PM",
        "subject": "A&R",
        "teacher": "PKN",
        "room": "RN-3112"
      }
    ]
  }
};
