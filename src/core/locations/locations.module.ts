import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Locations } from './locations.entity';
import { LocationsService } from './locations.service';

@Module({
  imports: [TypeOrmModule.forFeature([Locations])],
  providers: [LocationsService],
  exports: [LocationsService],
})
export class LocationsModule {}
