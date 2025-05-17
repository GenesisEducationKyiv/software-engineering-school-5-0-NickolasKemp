import { IsEmail, IsString, IsIn, IsNotEmpty } from 'class-validator';

export class CreateSubscriptionDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsIn(['hourly', 'daily'])
  frequency: 'hourly' | 'daily';
} 