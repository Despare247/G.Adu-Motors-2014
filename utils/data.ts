import { Origin } from '@/types';

export const BUSINESS = {
  name: 'G.Adu Motors',
  tagline: 'Japanese & Korean Auto Spare Parts',
  city: 'Kumasi',
  country: 'Ghana',
  phone: '024 121 5083',
  phoneHref: 'tel:+233241215083',
  whatsapp: '233244670601',
  email: 'gadumotors2014@gmail.com',
  address: 'Suame, Kumasi, Ghana',
  currency: 'GH₵',
  hours: [
    { day: 'Monday', time: '8:30 AM – 5:30 PM' },
    { day: 'Tuesday – Friday', time: '8:00 AM – 5:30 PM' },
    { day: 'Saturday', time: '9:00 AM – 4:00 PM' },
    { day: 'Sunday', time: 'Closed' },
  ],
};

export const ORIGIN_MAKES: Record<Origin, string[]> = {
  Japanese: ['Toyota', 'Honda', 'Nissan', 'Mazda', 'Mitsubishi', 'Suzuki', 'Subaru'],
  Korean: ['Hyundai', 'Kia'],
};

export const BRANDS = [
  'Toyota', 'Honda', 'Nissan', 'Mazda', 'Mitsubishi', 'Suzuki', 'Subaru',
  'Hyundai', 'Kia', 'Bosch', 'Denso', 'NGK',
];
