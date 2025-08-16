import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { CreateChoiceDto } from "@/choice/dto/createChoice.dto";

describe("CreateChoiceDto validation", () => {
  it("should be defined", () => {
    expect(new CreateChoiceDto()).toBeDefined();
  });

  it("valid payload passes", async () => {
    const payload = { text: "Option A", isCorrect: true };
    const dto = plainToInstance(CreateChoiceDto, payload);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it("text must be a string", async () => {
    const payload = { text: 123 as any, isCorrect: false };
    const dto = plainToInstance(CreateChoiceDto, payload);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const textErr = errors.find((e) => e.property === "text");

    expect(textErr).toBeDefined();
  });

  it("isCorrect is required", async () => {
    const payload = { text: "Missing correctness" } as any;
    const dto = plainToInstance(CreateChoiceDto, payload);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const corrErr = errors.find((e) => e.property === "isCorrect");

    expect(corrErr).toBeDefined();
  });

  it("isCorrect must be boolean", async () => {
    const payload = { text: "Bad type", isCorrect: "true" as any };
    const dto = plainToInstance(CreateChoiceDto, payload);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const corrErr = errors.find((e) => e.property === "isCorrect");

    expect(corrErr).toBeDefined();
  });

  it("accepts false for isCorrect", async () => {
    const payload = { text: "Option B", isCorrect: false };
    const dto = plainToInstance(CreateChoiceDto, payload);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });
});
