// import {
//   CanActivate,
//   ExecutionContext,
//   Injectable,
//   UnauthorizedException,
// } from '@nestjs/common';

// @Injectable()
// export class AuthGuard implements CanActivate {
//   canActivate(context: ExecutionContext): boolean {
//     const req = context.switchToHttp().getRequest();
//     const expected = process.env.API_TOKEN;

//     // если токен не задан вообще — пускаем всех
//     if (!expected) return true;

//     // разрешаем публичный GET /api/datasets
//     if (
//       req.method === 'GET' &&
//       (req.url === '/api/datasets' || req.url.startsWith('/api/datasets?'))
//     ) {
//       return true;
//     }

//     const auth = req.headers['authorization'] as string | undefined;
//     if (!auth?.startsWith('Bearer ')) {
//       throw new UnauthorizedException('No token');
//     }
//     const token = auth.slice('Bearer '.length);
//     if (token !== expected) {
//       throw new UnauthorizedException('Bad token');
//     }
//     return true;
//   }
// }


import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // ВРЕМЕННО: всё пускаем
    return true;
  }
}
