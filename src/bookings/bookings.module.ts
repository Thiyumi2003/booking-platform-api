import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from '../entities/booking.entity';
import { User } from '../entities/user.entity';
import { ServiceEntity } from '../entities/service.entity';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, User, ServiceEntity])],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
