export const flashcards = [
  {
    id: "biomed-f1",
    term: "Defibrillator",
    definition: "A device that delivers a therapeutic dose of electrical energy to the heart to restore normal rhythm.",
    example: "Biomedical technicians verify defibrillator energy output using a simulator.",
    difficulty: "easy"
  },
  {
    id: "biomed-f2",
    term: "Macroshock",
    definition: "A large, physiological shock caused by electrical current flowing through the body externally.",
    example: "Proper grounding prevents macroshock hazards in patient-care areas.",
    difficulty: "medium"
  }
];

export const quizQuestions = [
  {
    id: "biomed-q1",
    question: "Which NFPA standard establishes guidelines for electrical safety in health care facilities, including maximum leakage current limits?",
    options: ["NFPA 70", "NFPA 99", "NFPA 101", "NFPA 70E"],
    answerIndex: 1,
    explanation: "NFPA 99 establishes requirements for healthcare facilities, including safety and testing standards for medical equipment.",
  },
  {
    id: "biomed-q2",
    question: "What is the primary function of a transducer in a medical patient monitor?",
    options: [
      "To amplify the electrical signal",
      "To convert a physical physiological signal into an electrical signal",
      "To filter noise from the power supply",
      "To store digital waveforms for recall"
    ],
    answerIndex: 1,
    explanation: "A transducer converts physiological physical parameters (e.g., pressure, temperature) into measurable electrical signals.",
  },
  {
    id: "biomed-q3",
    question: "Which physiological signal is measured using a pulse oximeter via two different wavelengths of light?",
    options: ["Oxygen saturation (SpO2)", "Cardiac output", "Partial pressure of carbon dioxide (PaCO2)", "Hematocrit levels"],
    answerIndex: 0,
    explanation: "Pulse oximeters use red (660nm) and infrared (940nm) light to calculate the ratio of oxygenated to deoxygenated hemoglobin.",
  },
  {
    id: "biomed-q4",
    question: "What component in an X-ray system is responsible for controlling the shape and size of the X-ray beam?",
    options: ["Gantry", "Collimator", "Cathode", "Photodetector"],
    answerIndex: 1,
    explanation: "The collimator restricts the dimensions of the X-ray beam, reducing scattered radiation and exposure to unwanted tissue.",
  },
  {
    id: "biomed-q5",
    question: "What is the purpose of performing a preventive maintenance (PM) electrical safety test on an ECG machine?",
    options: [
      "To verify lead spelling accuracy",
      "To measure chassis leakage current and ground resistance",
      "To calibrate the heart rate calculator algorithm",
      "To increase the amplification gain of the electrodes"
    ],
    answerIndex: 1,
    explanation: "PM electrical safety testing ensures leakage currents are within safe limits and ground connections are intact to prevent shock.",
  },
  {
    id: "biomed-q6",
    question: "Which device is designed to measure the electrical activity of the brain over time?",
    options: ["Electrocardiograph (ECG)", "Electromyograph (EMG)", "Electroencephalograph (EEG)", "Electroneurograph (ENG)"],
    answerIndex: 2,
    explanation: "An EEG records electrical activity along the scalp, reflecting synaptic activity in the cerebral cortex.",
  },
  {
    id: "biomed-q7",
    question: "In patient ventilation, what does PEEP stand for?",
    options: [
      "Pulmonary Expiratory Flow Pressure",
      "Positive End-Expiratory Pressure",
      "Partial Expiratory Evaluation Phase",
      "Peak Elastic Expulsion Pressure"
    ],
    answerIndex: 1,
    explanation: "PEEP stands for Positive End-Expiratory Pressure, which maintains alveolar patency at the end of expiration.",
  },
  {
    id: "biomed-q8",
    question: "Which gas is commonly used in medical cryosurgery due to its extremely low boiling point?",
    options: ["Liquid Nitrogen", "Carbon Dioxide", "Nitrous Oxide", "Helium"],
    answerIndex: 0,
    explanation: "Liquid nitrogen (-196°C) is commonly used to freeze and destroy abnormal or diseased tissues.",
  },
  {
    id: "biomed-q9",
    question: "A microshock occurs when current is introduced directly to the heart tissue. What is the maximum safe leakage current limit for patient-applied parts according to standard limits?",
    options: ["10 microamps (µA)", "100 microamps (µA)", "500 microamps (µA)", "1 milliamp (mA)"],
    answerIndex: 0,
    explanation: "Standard guidelines state that patient-applied parts with direct cardiac connection (such as catheters) must have leakage current under 10 µA.",
  },
  {
    id: "biomed-q10",
    question: "What is the function of a dialysis machine's dialysate solution?",
    options: [
      "To clean the internal fluid lines of the machine between treatments",
      "To draw waste products and excess water from the patient's blood across a semipermeable membrane",
      "To replace blood loss dynamically during high-pressure cycles",
      "To anesthetize the patient's arterial access site"
    ],
    answerIndex: 1,
    explanation: "Dialysate flows counter-current to blood in the dialyzer, pulling urea, creatinine, and extra fluid from the blood by diffusion.",
  }
];
