export type Answer = 'YES' | 'NO' | 'N/A' | '';

export type RoundItem = {
  section: string;
  question: string;
};

export type ResponseItem = RoundItem & {
  answer: Answer;
  note: string;
};

export type SubmitPayload = {
  timestamp: string;
  roomOrResident: string;
  rounderName: string;
  items: ResponseItem[];
};
