"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordUpdateDto = exports.PasswordResetRequestDto = exports.RefreshTokenDto = exports.SignInDto = exports.SignUpDto = void 0;
const nestjs_zod_1 = require("nestjs-zod");
const auth_schemas_1 = require("./auth.schemas");
class SignUpDto extends (0, nestjs_zod_1.createZodDto)(auth_schemas_1.SignUpDtoSchema) {
}
exports.SignUpDto = SignUpDto;
class SignInDto extends (0, nestjs_zod_1.createZodDto)(auth_schemas_1.SignInDtoSchema) {
}
exports.SignInDto = SignInDto;
class RefreshTokenDto extends (0, nestjs_zod_1.createZodDto)(auth_schemas_1.RefreshTokenSchema) {
}
exports.RefreshTokenDto = RefreshTokenDto;
class PasswordResetRequestDto extends (0, nestjs_zod_1.createZodDto)(auth_schemas_1.PasswordResetRequestSchema) {
}
exports.PasswordResetRequestDto = PasswordResetRequestDto;
class PasswordUpdateDto extends (0, nestjs_zod_1.createZodDto)(auth_schemas_1.PasswordUpdateSchema) {
}
exports.PasswordUpdateDto = PasswordUpdateDto;
//# sourceMappingURL=auth.dto.js.map