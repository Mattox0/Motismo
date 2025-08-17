import { validate } from "class-validator";

import { CreateClasseDto } from "@/classe/dto/createClasse.dto";

describe("CreateClasseDto", () => {
  it("should be defined", () => {
    expect(CreateClasseDto).toBeDefined();
  });

  describe("validation", () => {
    it("should pass validation with valid data", async () => {
      const dto = new CreateClasseDto();
      dto.name = "Test Class";

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it("should fail validation with empty name", async () => {
      const dto = new CreateClasseDto();
      dto.name = "";

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty("isNotEmpty");
    });

    it("should fail validation with name too short", async () => {
      const dto = new CreateClasseDto();
      dto.name = "ab";

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty("minLength");
    });

    it("should fail validation with non-string name", async () => {
      const dto = new CreateClasseDto();
      (dto as any).name = 123;

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty("isString");
    });
  });
});
