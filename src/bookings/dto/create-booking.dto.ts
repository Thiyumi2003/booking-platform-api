import { IsDateString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookingDto {
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Optional when authenticated; user ID (UUID) for which booking is created',
    example: '6327c935-16d7-46ce-b1f9-c4e732409050',
  })
  userId?: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Service id (UUID) to book, or legacy numeric id',
    example: 'e983fd97-30a2-4b2e-8815-07ebc658c65e',
  })
  serviceId: any;

  @IsDateString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Booking start date/time in ISO 8601 format',
    example: '2030-07-20T10:00:00.000Z',
  })
  startDate?: string;

  @IsDateString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Booking end date/time in ISO 8601 format',
    example: '2030-07-20T11:00:00.000Z',
  })
  endDate?: string;

  // Legacy fields
  @IsOptional()
  @ApiPropertyOptional({ description: 'Legacy: customer full name', example: 'John Doe' })
  customerName?: string;

  @IsOptional()
  @ApiPropertyOptional({ description: 'Legacy: customer email', example: 'john@example.com' })
  customerEmail?: string;

  @IsOptional()
  @ApiPropertyOptional({ description: 'Legacy: customer phone', example: '0771234567' })
  customerPhone?: string;

  @IsOptional()
  @ApiPropertyOptional({ description: 'Legacy: booking date (YYYY-MM-DD)', example: '2030-07-20' })
  bookingDate?: string;

  @IsOptional()
  @ApiPropertyOptional({ description: 'Legacy: booking time (HH:mm)', example: '10:00' })
  bookingTime?: string;

  @IsOptional()
  @ApiPropertyOptional({ description: 'Legacy: additional notes', example: 'Morning appointment' })
  notes?: string;
}
