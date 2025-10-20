import { Body, Controller, UseGuards, Patch, Get, Param } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CurrentUser } from 'src/libs/common/decorators/current-user.decorator';
import { User } from '../entity/user.entity';
import { AuthGuard } from 'src/libs/common/guards/auth.guard';
import { UpdateCustomStructureDto } from '../dto/update-custom-structure.dto';

@Controller({
  path: 'user',
  version: '1',
})
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get('')
  async getAuthenticatedUser(@CurrentUser() user: User) {
    return await this.userService.getAuthenticatedUser(user);
  }

  @Patch(':id/custom-structure')
  async updateCustomStructure(
    @Param('id') userId: string,
    @Body() body: UpdateCustomStructureDto,
  ) {
    return await this.userService.updateCustomStructure(userId, body);
  }
}
