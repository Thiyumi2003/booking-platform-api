import { Booking } from '../../entities/booking.entity';

export interface PaginatedBookings {
  data: Booking[];
  page: number;
  limit: number;
  total: number;
}
