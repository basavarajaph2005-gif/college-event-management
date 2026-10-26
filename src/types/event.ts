export interface CollegeEvent {
  id: string;
  title: string;
  club: string;
  category: 'Technical' | 'Cultural' | 'Sports' | 'Workshop' | 'Seminar' | 'Fest';
  date: string;
  displayDate: string;
  time: string;
  venue: string;
  desc: string;
  fee: number;
  totalSeats: number;
  seatsLeft: number;
  cancelled: boolean;
}

export interface StudentRegistration {
  id: string;
  eventId: string;
  eventTitle: string;
  date: string;
  venue: string;
  time: string;
  name: string;
  usn: string;
  email: string;
  phone: string;
  seats: number;
  fee: number;
  amount: number;
  registeredAt?: string;
  checkedIn?: boolean;
}
