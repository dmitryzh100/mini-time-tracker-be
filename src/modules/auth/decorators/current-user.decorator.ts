import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { CurrentUserData, RequestWithUser } from '../interfaces';

export type { CurrentUserData };

export const CurrentUser = createParamDecorator(
  (
    data: keyof CurrentUserData | undefined,
    ctx: ExecutionContext,
  ): CurrentUserData | number | string | null => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);
