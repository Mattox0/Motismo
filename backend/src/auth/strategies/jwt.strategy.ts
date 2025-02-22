import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { type JwtPayload } from "@/auth/types/JwtPayload";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET environment variable is not defined");
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractJWT,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  private static extractJWT = (request: Request): string | null => {
    if (
      "access_token" in request.cookies &&
      (request.cookies.access_token as string).length > 0
    ) {
      return request.cookies.access_token as string;
    }

    return null;
  };

  validate(payload: JwtPayload) {
    return {
      id: payload.id,
      username: payload.username,
      email: payload.email,
      role: payload.role,
    };
  }
}
