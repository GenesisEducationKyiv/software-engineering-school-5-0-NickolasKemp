import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class WeatherUpdateDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  appUrl: string;
}
