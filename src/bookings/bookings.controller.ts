import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { BookingsFilterDto } from './dto/bookings-filter.dto';
import { UsersService } from '../users/users.service';
import { ServicesService } from '../services/services.service';

@ApiTags('Bookings')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly usersService: UsersService,
    private readonly servicesService: ServicesService,
  ) {}

  @Post()
  async create(@Body() createBookingDto: CreateBookingDto, @Req() req: any) {
    // If legacy payload provided, map to canonical fields
    let userId = req.user?.userId ?? createBookingDto.userId;

    if (!userId && createBookingDto.customerEmail) {
      // Find or create user by email
      const existing = await this.usersService.findByEmail(createBookingDto.customerEmail);
      if (existing) {
        userId = existing.id;
      } else {
        const password = Math.random().toString(36).slice(-8);
        const created = await this.usersService.create({
          name: createBookingDto.customerName ?? createBookingDto.customerEmail,
          email: createBookingDto.customerEmail,
          phone: createBookingDto.customerPhone,
          password,
        });
        userId = created.id;
      }
    }

    // Resolve serviceId: allow legacy numeric id via legacyId
    let serviceId = createBookingDto.serviceId;
    if (typeof serviceId === 'number' || /^[0-9]+$/.test(String(serviceId))) {
      const legacyId = Number(serviceId);
      const svc = await this.servicesService.findByLegacyId(legacyId);
      serviceId = svc.id;
    }

    // Convert legacy bookingDate + bookingTime -> startDate/endDate
    let startDate = createBookingDto.startDate;
    let endDate = createBookingDto.endDate;
    if (!startDate && createBookingDto.bookingDate && createBookingDto.bookingTime) {
      const iso = `${createBookingDto.bookingDate}T${createBookingDto.bookingTime}:00.000Z`;
      startDate = iso;
      // Try to derive duration from service
      let durationMinutes = 60;
      try {
        const svc = await this.servicesService.findOne(serviceId);
        if (svc?.duration) durationMinutes = svc.duration;
      } catch (e) {
        // ignore, use default
      }
      const end = new Date(iso);
      end.setMinutes(end.getMinutes() + durationMinutes);
      endDate = end.toISOString();
    }

    const payload = {
      userId,
      serviceId,
      startDate,
      endDate,
    } as any;

    return this.bookingsService.create(payload);
  }

  @Get()
  findAll(@Query() filter: BookingsFilterDto) {
    return this.bookingsService.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() updateBookingStatusDto: UpdateBookingStatusDto) {
    return this.bookingsService.updateStatus(id, updateBookingStatusDto);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.bookingsService.cancel(id);
  }
}
