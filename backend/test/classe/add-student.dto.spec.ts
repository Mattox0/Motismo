import { validate } from "class-validator";

import { AddStudentDto } from "@/classe/dto/addStudent.dto";

describe("AddStudentDto", () => {
  it("should be defined", () => {
    expect(AddStudentDto).toBeDefined();
  });

  describe("validation", () => {
    it("should pass validation with valid UUID", async () => {
      const dto = new AddStudentDto();

      dto.studentId = "550e8400-e29b-41d4-a716-446655440000";

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it("should fail validation with empty studentId", async () => {
      const dto = new AddStudentDto();

      dto.studentId = "";

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty("isNotEmpty");
    });

    it("should fail validation with invalid UUID", async () => {
      const dto = new AddStudentDto();

      dto.studentId = "invalid-uuid";

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty("isUuid");
    });

    it("should fail validation with non-string studentId", async () => {
      const dto = new AddStudentDto();

      (dto as any).studentId = 123;

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty("isString");
    });
  });
});
