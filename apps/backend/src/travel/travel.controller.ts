import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { TravelService } from './travel.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('travel-plans')
export class TravelController {
  constructor(private readonly travelService: TravelService) {}

  @Get()
  async getAllTravelPlans() {
    return this.travelService.getAllTravelPlans();
  }

  @Get('recommended')
  @UseGuards(AuthGuard('jwt'))
  async getRecommendedTravelPlans(
    @Query('latitude') latitude?: string,
    @Query('longitude') longitude?: string,
  ) {
    return this.travelService.getRecommendedTravelPlans(
      latitude ? parseFloat(latitude) : undefined,
      longitude ? parseFloat(longitude) : undefined,
    );
  }

  @Get('spot/:spotId')
  async getTravelPlansBySpot(@Param('spotId') spotId: string) {
    return this.travelService.getTravelPlansBySpot(BigInt(spotId));
  }

  @Get('theme/:theme')
  async getTravelPlansByTheme(@Param('theme') theme: string) {
    return this.travelService.getTravelPlansByTheme(theme);
  }

  @Get(':id')
  async getTravelPlanById(@Param('id') id: string) {
    return this.travelService.getTravelPlanById(BigInt(id));
  }
}
