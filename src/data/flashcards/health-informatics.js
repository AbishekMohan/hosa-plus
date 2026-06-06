export const flashcards = [
  {
    id: "informatics-f1",
    term: "Interoperability",
    definition: "The ability of different information systems, devices, and software applications to access, exchange, integrate and cooperatively use data in a coordinated manner.",
    example: "Achieving full semantic interoperability allows different hospitals to read each other's EHR systems.",
    difficulty: "hard"
  },
  {
    id: "informatics-f2",
    term: "HIPAA",
    definition: "Health Insurance Portability and Accountability Act of 1996; US legislation that provides data privacy and security provisions for safeguarding medical information.",
    example: "Failing to encrypt patient emails violates HIPAA Security Rules.",
    difficulty: "easy"
  }
];

export const quizQuestions = [
  {
    id: "informatics-q1",
    question: "Which standards organization defines the international standards for transferring clinical and administrative data between healthcare software applications?",
    options: ["HL7 (Health Level Seven)", "ANSI", "IEEE", "ISO"],
    answerIndex: 0,
    explanation: "HL7 produces interoperability standards that guide the transfer of clinical and administrative data between medical databases.",
  },
  {
    id: "informatics-q2",
    question: "What does the abbreviation ICD-10-CM stand for in clinical documentation and billing?",
    options: [
      "International Code of Diseases, Tenth Revision, Clinic Master",
      "Interstate Classification of Disorders, Tenth Revision, Case Management",
      "International Classification of Diseases, Tenth Revision, Clinical Modification",
      "Internal Codification of Diagnoses, Tenth Revision, Core Measurement"
    ],
    answerIndex: 2,
    explanation: "ICD-10-CM stands for International Classification of Diseases, Tenth Revision, Clinical Modification, used to code diagnoses.",
  },
  {
    id: "informatics-q3",
    question: "Which system is the global standard for transmitting, storing, retrieving, and displaying medical imaging information (like X-rays and MRIs)?",
    options: ["PACS", "DICOM", "LOINC", "SNOMED-CT"],
    answerIndex: 1,
    explanation: "DICOM (Digital Imaging and Communications in Medicine) is the universal file format and communication protocol for medical images.",
  },
  {
    id: "informatics-q4",
    question: "What is the primary difference between an Electronic Medical Record (EMR) and an Electronic Health Record (EHR)?",
    options: [
      "EMRs are written in paper format; EHRs are fully digital",
      "EMRs contain billing codes; EHRs only contain clinical notes",
      "EMRs are used by one specific provider's office; EHRs are shared across multiple healthcare organizations",
      "EMRs are for pediatric patients; EHRs are for geriatric patients"
    ],
    answerIndex: 2,
    explanation: "EMRs are digital logs of patient care within a single practice, while EHRs are built to share patient health records across different providers.",
  },
  {
    id: "informatics-q5",
    question: "Under the HIPAA Security Rule, which of the following is considered a 'Technical Safeguard'?",
    options: [
      "Conducting background checks on new IT staff",
      "Locking the server room door to restrict physical access",
      "Implementing user access controls and automatic logoffs",
      "Writing a policy outline for disaster recovery plans"
    ],
    answerIndex: 2,
    explanation: "Technical safeguards involve the technology and policy controls that protect electronic protected health info (ePHI) (e.g., encryption, passwords, access control).",
  },
  {
    id: "informatics-q6",
    question: "Which vocabulary standard is specifically designed to provide a universal coding language for laboratory test orders and clinical observations?",
    options: ["SNOMED-CT", "LOINC", "RxNorm", "CPT"],
    answerIndex: 1,
    explanation: "LOINC (Logical Observation Identifiers Names and Codes) is the standard for naming and identifying laboratory tests, clinical metrics, and outcomes.",
  },
  {
    id: "informatics-q7",
    question: "What does CPT stand for, and who maintains this coding database for medical, surgical, and diagnostic procedures?",
    options: [
      "Clinical Patient Tracking; maintained by the CDC",
      "Common Procedure Terminology; maintained by the WHO",
      "Current Procedural Terminology; maintained by the American Medical Association (AMA)",
      "Certified Provider Treatments; maintained by CMS"
    ],
    answerIndex: 2,
    explanation: "Current Procedural Terminology (CPT) codes describe medical, surgical, and diagnostic procedures and are maintained by the AMA.",
  },
  {
    id: "informatics-q8",
    question: "What represents the use of clinical decision support systems (CDSS) in modern Electronic Health Records?",
    options: [
      "An automated system that schedules patient follow-up appointments",
      "An alert system warning a physician about a dangerous drug-allergy interaction",
      "A database that tracks hospital inventory levels",
      "An online portal that lets patients view lab results"
    ],
    answerIndex: 1,
    explanation: "CDSS provides active clinical knowledge and patient-specific info (like allergy alerts, dosage safety limits) to assist physicians in clinical decisions.",
  },
  {
    id: "informatics-q9",
    question: "Under HIPAA regulations, what does 'PHI' stand for?",
    options: [
      "Private Health Insurance",
      "Protected Health Information",
      "Patient Hospital Index",
      "Personal Health Instrument"
    ],
    answerIndex: 1,
    explanation: "Protected Health Information (PHI) is any individually identifiable health information protected under HIPAA rules.",
  },
  {
    id: "informatics-q10",
    question: "What is the primary role of a Health Information Exchange (HIE)?",
    options: [
      "To audit medical records for billing fraud",
      "To allow healthcare providers to securely share and access a patient's medical history electronically",
      "To trade pharmaceutical stocks on global markets",
      "To act as a state agency licensing medical informatics practitioners"
    ],
    answerIndex: 1,
    explanation: "An HIE enables secure, electronic sharing of clinical data among independent doctors, clinics, and hospitals to improve care coordination.",
  }
];
