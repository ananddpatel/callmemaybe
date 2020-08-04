export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  phoneNumbers: RegisteredNumber[];
}

export type RegisteredNumber = {
  title: string;
  phoneNum: string;
  verified: boolean;
};

export type Reminder = {
  id?: string;
  title: string;
  voiceCallSay: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed';
  phoneNumber: string;
  uid: string;
};
