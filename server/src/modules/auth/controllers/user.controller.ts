import { Body, Controller, UseGuards, Patch, Get } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CurrentUser } from 'src/libs/common/decorators/current-user.decorator';
import { User } from '../entity/user.entity';
import { AuthGuard } from 'src/libs/common/guards/auth.guard';

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
}
