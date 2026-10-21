import type { DocSection } from "./policyDocs";

/**
 * Full text: Attendance & Shifts, Information Security, Work From Home,
 * IT Acceptable Use. Original DEJOIY drafts; company-specific numbers are
 * proposals for HR and the relevant owners.
 */

export const ATTENDANCE: DocSection[] = [
  {
    heading: "Purpose",
    paras: [
      "Our clients pay for staffed queues and service levels. This policy explains working hours, breaks, attendance, rosters, shift swaps and night-shift safety, so every shift is covered and every person is treated consistently and lawfully.",
    ],
  },
  {
    heading: "Scope",
    clauses: [
      "Applies to all employees working in shifts — on the production floor, at home under the Work From Home & Hybrid Policy, and in support functions that follow a roster.",
      "Client-specific attendance requirements in a statement of work apply in addition, where they are stricter.",
    ],
  },
  {
    heading: "Working hours and breaks",
    table: {
      head: ["Item", "Standard"],
      rows: [
        ["Shift length", "9 hours including breaks (8 working hours)"],
        ["Breaks", "Two 15-minute breaks and one 30-minute meal break, as scheduled by WFM"],
        ["Working days", "5 days a week, with 2 rostered weekly offs"],
        ["Weekly cap", "No more than 48 working hours a week, as the OSH Code provides"],
        ["Overtime", "Voluntary, pre-approved by the Manager, paid at twice the ordinary rate of wages"],
      ],
    },
  },
  {
    heading: "Log-in and schedule adherence",
    clauses: [
      "Be at your workstation and logged in to all required tools — dialler, CRM, chat — at shift start. Walking in at shift start is late.",
      "Take breaks at the times WFM schedules, and return on time, so the queue stays covered.",
      "Aux and idle codes must reflect what you are actually doing. Misuse of aux codes is treated as a breach of the Code of Conduct.",
      "Schedule adherence and conformance are reported weekly to each Team Leader.",
    ],
  },
  {
    heading: "Late log-ins",
    clauses: [
      "A log-in more than 5 minutes after shift start is a late mark.",
      "Three late marks in a calendar month lead to a documented conversation with your Team Leader to understand and fix the cause (for example transport).",
      "Six or more late marks in a month, or a continuing pattern over two months, lead to a written attendance improvement plan agreed with HR.",
      "Late marks are not converted into leave deductions or pay cuts, except where the time not worked is substantial and unpaid by law.",
    ],
  },
  {
    heading: "Rosters and shift swaps",
    clauses: [
      "WFM publishes the next week's roster every Friday by 6 pm, including weekly offs.",
      "Shift swaps between employees with the same skills need at least 48 hours' notice and approval from both Team Leaders.",
      "Rotational shifts change no more often than once a fortnight, except in emergencies or by your request.",
      "Requests for a fixed shift on medical, caregiving or education grounds are considered by WFM and HR and answered within 7 working days.",
    ],
  },
  {
    heading: "Unplanned absence",
    clauses: [
      "If you cannot come to work, inform your Team Leader and the WFM desk at least 2 hours before your shift starts, by phone or the WFM line — not only by chat message.",
      "Unplanned absence is adjusted against casual, sick or earned leave as the Leave Policy sets out.",
      "Absence without informing on 3 consecutive working days starts the absconding process: HR contacts you and your emergency contact, then sends a written notice to your registered address asking you to report. Please call, even late — we would rather know you are safe.",
    ],
  },
  {
    heading: "Night shifts and safety",
    clauses: [
      "Women are rostered on night shifts only with their written consent and with the safety, transport and facility conditions required by the OSH Code and the applicable State rules.",
      "DEJOIY provides door-to-door cab pick-up and drop for night shifts, with GPS-tracked vehicles and verified drivers. A security guard travels on routes where a woman is the first pick-up or last drop at night.",
      "Night-shift employees have access to a female security staff member on each floor, adequate lighting, rest areas and drinking water.",
      "Any transport or safety concern can be reported to the floor security desk at any time, or through a Facilities ticket.",
    ],
  },
  {
    heading: "Attendance records",
    clauses: [
      "Attendance is recorded through biometric or system log-in. Records are kept as required by law and are visible to you in the HR app.",
      "If your record is wrong, raise a WFM ticket within 7 days; corrections are made within 3 working days.",
    ],
  },
  {
    heading: "Roles and responsibilities",
    clauses: [
      "Employees: log in on time, follow the schedule and inform early when you cannot come.",
      "Team Leaders: coach on adherence, record conversations, and apply this policy consistently across the team.",
      "WFM: forecast, roster fairly, publish on time and approve swaps.",
      "Facilities: run safe night transport and floor facilities.",
      "HR: handle attendance plans and absconding cases fairly and lawfully.",
    ],
  },
  {
    heading: "Related policies",
    clauses: ["Leave Policy", "Work From Home & Hybrid", "Code of Conduct", "POSH Policy"],
  },
  {
    heading: "Review",
    paras: ["Owned by Workforce Management with the People Team. Reviewed every year and when State rules under the OSH Code change."],
  },
];

export const SECURITY: DocSection[] = [
  {
    heading: "Purpose",
    paras: [
      "Clients trust DEJOIY with their systems and their customers' personal data. This policy sets the rules that protect that information, meet our contractual obligations, and comply with the Digital Personal Data Protection Act, 2023 (\"DPDP Act\") and the DPDP Rules, 2025.",
    ],
  },
  {
    heading: "Scope",
    clauses: [
      "Applies to everyone with access to DEJOIY or client information or systems, on site or remotely.",
      "Covers information in any form — on screen, in systems, on paper, in conversation and in recordings.",
      "For most client programmes, DEJOIY processes personal data on the client's behalf (as a Data Processor); the client is the Data Fiduciary. For employee and candidate data, DEJOIY is the Data Fiduciary.",
    ],
  },
  {
    heading: "Classification of information",
    table: {
      head: ["Class", "Examples", "Handling"],
      rows: [
        ["Restricted", "Card numbers, CVV, OTPs, passwords, Aadhaar, health data, bank details", "Never written down, stored or shared outside the approved system"],
        ["Confidential", "Customer names and contacts, call recordings, client processes, salaries", "Access by role only; never sent outside DEJOIY or client systems"],
        ["Internal", "Rosters, internal updates, training material", "Shared within DEJOIY only"],
        ["Public", "Published website and job postings", "No restriction"],
      ],
    },
  },
  {
    heading: "Production floor controls",
    clauses: [
      "Mobile phones, smart watches with cameras, bags, paper and pens are kept in lockers outside the production floor, unless the client process permits otherwise.",
      "Clean desk: nothing is left on the desk at the end of a shift. Any approved notes are shredded.",
      "Lock your screen (Win + L) every time you step away, even briefly.",
      "Photography and video on the floor are prohibited.",
      "Visitors are escorted at all times and sign in and out.",
    ],
  },
  {
    heading: "Handling personal data",
    clauses: [
      "Collect and view only the personal data the process needs, for the purpose the client has defined.",
      "Verify customer identity exactly as the process requires before disclosing or changing any information.",
      "Never copy customer data to personal devices, email, messaging apps, notes, spreadsheets or any tool the client has not approved — including public AI tools.",
      "Card data is handled only in PCI-compliant flows (for example pause-and-resume recording or secure IVR); never read card numbers back aloud unless the process requires it.",
      "Customers' requests about their data (access, correction, deletion, complaints) are routed to the client through the process defined for that programme.",
    ],
  },
  {
    heading: "Access control",
    clauses: [
      "Access is granted on a least-privilege basis for your role and programme, approved by your Manager and the client where required.",
      "Never share your credentials or use someone else's. Every action in a system is attributed to the logged-in user.",
      "Access is reviewed every quarter and removed within 24 hours of a role change or exit.",
    ],
  },
  {
    heading: "Security incidents and personal data breaches",
    clauses: [
      "A security incident is any actual or suspected loss, theft, unauthorised access, disclosure or alteration of information — for example a misdirected email, a lost laptop, a phishing click, or customer data seen outside the approved system.",
      "Report it immediately, and in any case within 1 hour, to your Team Leader and through an IT ticket marked 'Security incident'. Do not try to investigate or fix it yourself, and do not delete evidence.",
      "Information Security assesses the incident, contains it and, where client data is involved, notifies the client without delay so that the client can meet its own obligations.",
      "For personal data where DEJOIY is the Data Fiduciary, DEJOIY notifies affected individuals and the Data Protection Board of India as the DPDP Rules require — intimation without delay and a detailed report within 72 hours of becoming aware — once those provisions apply.",
      "Employees who report promptly, including their own mistakes, are treated supportively. Concealing an incident is serious misconduct.",
    ],
  },
  {
    heading: "Retention and disposal",
    clauses: [
      "Client data is retained only as long as the client contract specifies, then securely deleted or returned.",
      "Paper is shredded; devices and media are wiped or destroyed by IT with a record kept.",
    ],
  },
  {
    heading: "Confidentiality after you leave",
    paras: [
      "Your duty to keep DEJOIY and client information confidential continues after your employment ends. On exit you return all devices, ID and access cards, and any documents, and confirm in writing that you hold no copies.",
    ],
  },
  {
    heading: "Violations and consequences",
    clauses: [
      "Breaches lead to disciplinary action up to termination, depending on intent and impact.",
      "Deliberate theft or disclosure of data may also be reported to the police and may lead to civil and criminal liability.",
    ],
  },
  {
    heading: "Related policies",
    clauses: ["IT Acceptable Use", "Work From Home & Hybrid", "Code of Conduct"],
  },
  {
    heading: "Review",
    paras: ["Owned by Information Security. Reviewed every year, after any significant incident, and when the DPDP Rules or client requirements change."],
  },
];

export const WFH: DocSection[] = [
  {
    heading: "Purpose",
    paras: [
      "This policy explains when DEJOIY employees may work from home or in a hybrid pattern, the set-up required, and the standards that apply, so that remote work stays secure, productive and fair.",
    ],
  },
  {
    heading: "Scope",
    clauses: [
      "Applies to employees approved for full or partial work from home (WFH).",
      "WFH is a privilege granted for a role and a period, not an entitlement, except where the law or a medical accommodation requires otherwise.",
    ],
  },
  {
    heading: "Eligibility",
    clauses: [
      "The client programme must permit remote work in its contract and security requirements. Where it does not, WFH is not possible for that programme.",
      "The employee has normally completed training and nesting, and has met quality and adherence standards for the last 3 months.",
      "The Manager approves in writing, for a defined period, reviewed every quarter.",
      "Temporary WFH may be approved for medical recovery, return from maternity leave, or exceptional circumstances, with HR's agreement.",
    ],
  },
  {
    heading: "Home set-up requirements",
    clauses: [
      "A private room or space where no one else can see your screen or hear your calls.",
      "A stable internet connection of at least the speed the programme specifies, on a password-protected home network (WPA2 or better); a wired connection where the client requires it.",
      "Only the DEJOIY-issued laptop, headset and approved peripherals are used for work.",
      "A power backup sufficient for your shift, or an agreed plan to return to the office during outages.",
    ],
  },
  {
    heading: "Working standards",
    clauses: [
      "The same shift timings, breaks, adherence and quality standards apply as on the floor.",
      "Keep your camera on for team huddles, coaching, training and audits.",
      "Be reachable by your Team Leader throughout your shift through the approved chat tool.",
      "If your connection or equipment fails, inform your Team Leader at once and raise an IT ticket; time not worked because of a lasting failure may need to be made up or adjusted against leave.",
    ],
  },
  {
    heading: "Security at home",
    clauses: [
      "Never work from cafés, co-working spaces, public Wi-Fi or while travelling.",
      "Do not let anyone else use the company laptop, and lock it whenever you step away.",
      "Never print, write down or photograph customer information.",
      "All Information Security & Client Confidentiality rules apply in full.",
    ],
  },
  {
    heading: "Equipment and expenses",
    clauses: [
      "DEJOIY provides the laptop, headset and any required peripherals. These remain DEJOIY property and are returned when WFH ends or on exit.",
      "Where the programme requires a specific internet plan, DEJOIY pays an internet allowance as notified by HR.",
    ],
  },
  {
    heading: "Ending WFH",
    clauses: [
      "DEJOIY may end a WFH arrangement with at least 7 days' notice, or immediately for a security breach or a client instruction.",
      "Employees may ask to return to the office at any time.",
    ],
  },
  {
    heading: "Related policies",
    clauses: ["Information Security & Client Confidentiality", "IT Acceptable Use", "Attendance & Shift Adherence", "Leave Policy"],
  },
  {
    heading: "Review",
    paras: ["Owned by Operations with the People Team. Reviewed every year."],
  },
];

export const IT_USE: DocSection[] = [
  {
    heading: "Purpose",
    paras: [
      "DEJOIY's laptops, accounts, networks and software are provided to do our work securely. This policy sets out acceptable and unacceptable use, so they stay safe and available for everyone.",
    ],
  },
  {
    heading: "Scope",
    clauses: [
      "Applies to all users of DEJOIY IT resources: devices, email, chat, internet access, networks, software, cloud services and accounts — on site or remotely.",
      "Client systems are also governed by the client's own acceptable-use rules, which take priority where stricter.",
    ],
  },
  {
    heading: "Ownership and monitoring",
    clauses: [
      "DEJOIY IT resources, and the data created on them, belong to DEJOIY.",
      "To protect clients and the company, DEJOIY logs and monitors the use of its systems, including email, internet activity and system access, in line with law and this notice. Monitoring is carried out by authorised staff for security, compliance and investigation purposes only.",
      "Personal use should be minimal and should not involve personal financial or sensitive information, as it may be visible in logs.",
    ],
  },
  {
    heading: "Accounts and passwords",
    clauses: [
      "Use a passphrase of at least 12 characters, unique to DEJOIY, and keep it secret.",
      "Multi-factor authentication is mandatory wherever it is available.",
      "Never share accounts or one-time codes. IT will never ask for your password.",
    ],
  },
  {
    heading: "Devices and software",
    clauses: [
      "Install only software approved by IT; request anything else through an IT ticket.",
      "Do not disable or bypass antivirus, encryption, VPN, screen lock or update settings.",
      "USB storage devices are blocked by default. Exceptions need IT approval for a specific purpose.",
      "Keep devices with you or locked away; never leave them in vehicles.",
      "Report a lost or stolen device to IT immediately so it can be locked and wiped.",
    ],
  },
  {
    heading: "Email, chat and internet",
    clauses: [
      "Use company email and chat for work. Do not auto-forward work email to personal accounts.",
      "Do not send confidential or restricted information outside DEJOIY unless the process requires it and it is protected as Information Security directs.",
      "Do not access or share illegal, obscene, hateful, gambling or pirated content, or use the network for personal commercial activity.",
      "Treat unexpected attachments and links with suspicion. Report phishing with the 'Report phishing' button or an IT ticket, and never reply to it.",
    ],
  },
  {
    heading: "Artificial intelligence (AI) tools",
    clauses: [
      "Use only AI tools that DEJOIY has approved for the purpose.",
      "Never enter client data, customer personal data, credentials or confidential DEJOIY information into public or unapproved AI tools.",
      "You remain responsible for anything you send or submit that an AI tool helped produce; check it for accuracy and tone.",
    ],
  },
  {
    heading: "Violations and consequences",
    clauses: [
      "Misuse may lead to removal of access and disciplinary action up to termination.",
      "Unlawful activity may be reported to the authorities.",
    ],
  },
  {
    heading: "Related policies",
    clauses: ["Information Security & Client Confidentiality", "Work From Home & Hybrid", "Code of Conduct"],
  },
  {
    heading: "Review",
    paras: ["Owned by IT with Information Security. Reviewed every year."],
  },
];
