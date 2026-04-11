import {
  Controller,
  Post,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';

@UseGuards(AuthGuard('jwt'))
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('init/history')
  async initHistory(
    @Query('start', new ParseIntPipe({ optional: true })) start?: number,
    @Query('end', new ParseIntPipe({ optional: true })) end?: number,
  ) {
    const message = await this.adminService.initializeWinningInfo(
      start ?? 1,
      end,
    );
    return { message };
  }

  @Post('init/spots')
  async initSpots(
    @Query('start', new ParseIntPipe({ optional: true })) start?: number,
    @Query('end', new ParseIntPipe({ optional: true })) end?: number,
  ) {
    const message = await this.adminService.initializeWinningStores(
      start ?? 1,
      end,
    );
    return { message };
  }
}
