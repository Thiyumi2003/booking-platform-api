import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from '../entities/booking.entity';
import { User } from '../entities/user.entity';
import { ServiceEntity } from '../entities/service.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { BookingsFilterDto } from './dto/bookings-filter.dto';
import { PaginatedBookings } from './interfaces/paginated-bookings.interface';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ServiceEntity)
    private readonly serviceRepository: Repository<ServiceEntity>,
  ) {}

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    const { userId, serviceId, startDate, endDate } = createBookingDto;

    if (!startDate || !endDate) {
      throw new BadRequestException('startDate and endDate are required');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start < now || end < now) {
      throw new BadRequestException('Booking dates cannot be in the past');
    }

    if (end <= start) {
      throw new BadRequestException('Booking end date must be after start date');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const service = await this.serviceRepository.findOne({ where: { id: serviceId } });
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const duplicate = await this.bookingRepository.findOne({
      where: {
        user: { id: userId },
        service: { id: serviceId },
        startDate: start,
        endDate: end,
      },
    });

    if (duplicate) {
      throw new BadRequestException('Duplicate booking is not allowed');
    }

    const booking = this.bookingRepository.create({
      user,
      service,
      startDate: start,
      endDate: end,
      status: BookingStatus.PENDING,
    });
    return this.bookingRepository.save(booking);
  }

  async findAll(filter: BookingsFilterDto): Promise<PaginatedBookings> {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 10;
    const offset = (page - 1) * limit;

    const query = this.bookingRepository.createQueryBuilder('booking')
      .leftJoinAndSelect('booking.user', 'user')
      .leftJoinAndSelect('booking.service', 'service');

    if (filter.search) {
      query.andWhere(
        '(LOWER(user.name) LIKE LOWER(:search) OR LOWER(user.email) LIKE LOWER(:search) OR LOWER(user.phone) LIKE LOWER(:search))',
        { search: `%${filter.search}%` },
      );
    }

    if (filter.status) {
      query.andWhere('booking.status = :status', { status: filter.status });
    }

    const [data, total] = await query
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      page,
      limit,
      total,
    };
  }

  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: { user: true, service: true },
    });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    return booking;
  }

  async updateStatus(id: string, updateBookingStatusDto: UpdateBookingStatusDto): Promise<Booking> {
    const booking = await this.findOne(id);
    if (booking.status === BookingStatus.CANCELLED && updateBookingStatusDto.status === BookingStatus.CONFIRMED) {
      throw new BadRequestException('Cancelled bookings cannot be reactivated');
    }

    booking.status = updateBookingStatusDto.status;
    return this.bookingRepository.save(booking);
  }

  async cancel(id: string): Promise<Booking> {
    const booking = await this.findOne(id);
    if (booking.status === BookingStatus.CANCELLED) {
      return booking;
    }

    booking.status = BookingStatus.CANCELLED;
    return this.bookingRepository.save(booking);
  }
}
