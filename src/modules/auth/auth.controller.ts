import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HttpStatusCode } from '@common/constants';
import { ZodValidationPipe } from '@common/pipes/zod-validation.pipe';
import { AuthService } from './auth.service';
import {
  CurrentUser,
  CurrentUserData,
} from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { ForgotPasswordApiDto } from './dto/forgot-password.dto';
import { RefreshTokenApiDto } from './dto/refresh-token.dto';
import { ResetPasswordApiDto } from './dto/reset-password.dto';
import { SignInApiDto } from './dto/sign-in.dto';
import { SignUpApiDto } from './dto/sign-up.dto';
import { VerifyEmailApiDto } from './dto/verify-email.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import {
  forgotPasswordSchema,
  refreshTokenSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  verifyEmailSchema,
} from './schemas';
import type {
  ForgotPasswordDto,
  RefreshTokenDto,
  ResetPasswordDto,
  SignInDto,
  SignUpDto,
  VerifyEmailDto,
} from './schemas';
import {
  AuthResponse,
  TokenResponse,
} from './interfaces/token-response.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('sign-up')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: SignUpApiDto })
  @ApiResponse({
    status: HttpStatusCode.CREATED,
    description: 'User registered successfully',
  })
  @ApiResponse({
    status: HttpStatusCode.BAD_REQUEST,
    description: 'Validation error',
  })
  @ApiResponse({
    status: HttpStatusCode.CONFLICT,
    description: 'User already exists',
  })
  @UsePipes(new ZodValidationPipe(signUpSchema))
  async signUp(@Body() dto: SignUpDto): Promise<{ message: string }> {
    return this.authService.signUp(dto);
  }

  @Public()
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in user' })
  @ApiBody({ type: SignInApiDto })
  @ApiResponse({
    status: HttpStatusCode.OK,
    description: 'User signed in successfully',
  })
  @ApiResponse({
    status: HttpStatusCode.UNAUTHORIZED,
    description: 'Invalid credentials',
  })
  @UsePipes(new ZodValidationPipe(signInSchema))
  async signIn(@Body() dto: SignInDto): Promise<AuthResponse> {
    return this.authService.signIn(dto);
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ type: RefreshTokenApiDto })
  @ApiResponse({
    status: HttpStatusCode.OK,
    description: 'Tokens refreshed successfully',
  })
  @ApiResponse({
    status: HttpStatusCode.UNAUTHORIZED,
    description: 'Invalid refresh token',
  })
  @UsePipes(new ZodValidationPipe(refreshTokenSchema))
  async refresh(
    @Body() _dto: RefreshTokenDto,
    @CurrentUser() user: CurrentUserData & { tokenId: string },
  ): Promise<TokenResponse> {
    return this.authService.refreshTokens(user.id, user.email, user.tokenId);
  }

  @Post('sign-out')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign out user (revoke all refresh tokens)' })
  @ApiResponse({
    status: HttpStatusCode.OK,
    description: 'User signed out successfully',
  })
  @ApiResponse({
    status: HttpStatusCode.UNAUTHORIZED,
    description: 'Not authenticated',
  })
  async signOut(
    @CurrentUser('id') userId: number,
  ): Promise<{ message: string }> {
    return this.authService.signOut(userId);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiBody({ type: ForgotPasswordApiDto })
  @ApiResponse({
    status: HttpStatusCode.OK,
    description: 'Password reset email sent if account exists',
  })
  @UsePipes(new ZodValidationPipe(forgotPasswordSchema))
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using token' })
  @ApiBody({ type: ResetPasswordApiDto })
  @ApiResponse({
    status: HttpStatusCode.OK,
    description: 'Password reset successfully',
  })
  @ApiResponse({
    status: HttpStatusCode.BAD_REQUEST,
    description: 'Invalid or expired token',
  })
  @UsePipes(new ZodValidationPipe(resetPasswordSchema))
  async resetPassword(
    @Body() dto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.resetPassword(dto);
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address' })
  @ApiBody({ type: VerifyEmailApiDto })
  @ApiResponse({
    status: HttpStatusCode.OK,
    description: 'Email verified successfully',
  })
  @ApiResponse({
    status: HttpStatusCode.BAD_REQUEST,
    description: 'Invalid or expired token',
  })
  @UsePipes(new ZodValidationPipe(verifyEmailSchema))
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<{ message: string }> {
    return this.authService.verifyEmail(dto);
  }

  @Public()
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend verification email' })
  @ApiBody({ type: ForgotPasswordApiDto })
  @ApiResponse({
    status: HttpStatusCode.OK,
    description: 'Verification email sent if unverified account exists',
  })
  @UsePipes(new ZodValidationPipe(forgotPasswordSchema))
  async resendVerification(
    @Body() dto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.resendVerificationEmail(dto.email);
  }
}
