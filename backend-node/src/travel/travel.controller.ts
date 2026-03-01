import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { TravelService } from './travel.service';
import { AuthGuard } from '@nestjs/passport';

/**
 * 여행 플랜 조회를 담당하는 컨트롤러입니다.
 * Kotlin TravelPlanController 로직을 이식함.
 */
@Controller('travel-plans')
export class TravelController {
  constructor(private readonly travelService: TravelService) {}

  /**
   * 전체 여행 플랜 목록 조회
   */
  @Get()
  async getAllTravelPlans() {
    return this.travelService.getAllTravelPlans();
  }

  /**
   * 사용자 맞춤 추천 여행 플랜 조회 (인증 필요)
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('recommended')
  async getRecommendedTravelPlans(@Request() req: any) {
    return this.travelService.getRecommendedTravelPlans(req.user.id);
  }

  /**
   * 특정 명당 기반 여행 플랜 조회
   */
  @Get('spot/:spotId')
  async getTravelPlansBySpot(@Param('spotId') spotId: string) {
    return this.travelService.getTravelPlansBySpot(BigInt(spotId));
  }

  /**
   * 테마별 여행 플랜 조회
   */
  @Get('theme/:theme')
  async getTravelPlansByTheme(@Param('theme') theme: string) {
    return this.travelService.getTravelPlansByTheme(theme);
  }

  /**
   * ID로 여행 플랜 상세 조회
   */
  @Get(':id')
  async getTravelPlanById(@Param('id') id: string) {
    return this.travelService.getTravelPlanById(BigInt(id));
  }
}
