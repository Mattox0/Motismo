import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { CreateChoiceQuestionDto } from "../../src/question/dto/createChoiceQuestion.dto";
import { QuestionType } from "../../src/question/types/questionType";

describe("CreateChoiceQuestionDto", () => {
  describe("validation", () => {
    it("should pass validation with valid data", async () => {
      const dto = plainToClass(CreateChoiceQuestionDto, {
        title: "Test Choice Question",
        image: "test-image.jpg",
        order: 1,
        questionType: QuestionType.MULTIPLE_CHOICES,
        choices: [
          { text: "Choice 1", isCorrect: true },
          { text: "Choice 2", isCorrect: false },
        ],
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it("should pass validation with valid choices", async () => {
      const dto = plainToClass(CreateChoiceQuestionDto, {
        title: "Test Choice Question",
        questionType: QuestionType.MULTIPLE_CHOICES,
        choices: [
          { text: "Choice 1", isCorrect: true },
          { text: "Choice 2", isCorrect: false },
          { text: "Choice 3", isCorrect: false },
        ],
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });

  describe("transform", () => {
    it("should transform choices from JSON string", () => {
      const rawData = {
        title: "Test Choice Question",
        questionType: QuestionType.MULTIPLE_CHOICES,
        choices: JSON.stringify([
          { text: "Choice 1", isCorrect: true },
          { text: "Choice 2", isCorrect: false },
        ]),
      };

      const dto = plainToClass(CreateChoiceQuestionDto, rawData);

      expect(dto.choices).toEqual([
        { text: "Choice 1", isCorrect: true },
        { text: "Choice 2", isCorrect: false },
      ]);
    });

    it("coerces non-string text and truthy/falsy isCorrect from JSON string", () => {
      const rawData = {
        title: "Test",
        questionType: QuestionType.MULTIPLE_CHOICES,
        choices: JSON.stringify([
          { text: 123, isCorrect: "1" },
          { text: null, isCorrect: 0 },
          { text: true, isCorrect: "false" },
        ]),
      };

      const dto = plainToClass(CreateChoiceQuestionDto, rawData);

      expect(dto.choices).toEqual([
        { text: "", isCorrect: true },
        { text: "", isCorrect: false },
        { text: "", isCorrect: true },
      ]);
    });

    it("should handle invalid JSON string in choices", () => {
      const rawData = {
        title: "Test Choice Question",
        questionType: QuestionType.MULTIPLE_CHOICES,
        choices: "invalid json",
      };

      const dto = plainToClass(CreateChoiceQuestionDto, rawData);

      expect(dto.choices).toEqual([]);
    });

    it("should handle non-array JSON in choices", () => {
      const rawData = {
        title: "Test Choice Question",
        questionType: QuestionType.MULTIPLE_CHOICES,
        choices: JSON.stringify({ not: "an array" }),
      };

      const dto = plainToClass(CreateChoiceQuestionDto, rawData);

      expect(dto.choices).toEqual([]);
    });

    it("should transform from array input with coercion", () => {
      const rawData = {
        title: "Test",
        questionType: QuestionType.MULTIPLE_CHOICES,
        choices: [
          { text: "OK", isCorrect: 1 },
          { text: 45, isCorrect: "" },
        ],
      };

      const dto = plainToClass(CreateChoiceQuestionDto, rawData);

      expect(dto.choices).toEqual([
        { text: "OK", isCorrect: true },
        { text: "", isCorrect: false },
      ]);
    });

    it("should handle non-array choices (final fallback branch)", () => {
      const rawData = {
        title: "Test Choice Question",
        questionType: QuestionType.MULTIPLE_CHOICES,
        choices: 123 as any,
      };

      const dto = plainToClass(CreateChoiceQuestionDto, rawData);

      expect(dto.choices).toEqual([]);
    });

    it("should handle null choices", () => {
      const rawData = {
        title: "Test Choice Question",
        questionType: QuestionType.MULTIPLE_CHOICES,
        choices: null,
      };

      const dto = plainToClass(CreateChoiceQuestionDto, rawData);

      expect(dto.choices).toEqual([]);
    });

    it("should handle undefined choices", () => {
      const rawData = {
        title: "Test Choice Question",
        questionType: QuestionType.MULTIPLE_CHOICES,
        choices: undefined,
      };

      const dto = plainToClass(CreateChoiceQuestionDto, rawData);

      expect(dto.choices).toEqual([]);
    });

    it("should handle empty string choices", () => {
      const rawData = {
        title: "Test Choice Question",
        questionType: QuestionType.MULTIPLE_CHOICES,
        choices: "",
      };

      const dto = plainToClass(CreateChoiceQuestionDto, rawData);

      expect(dto.choices).toEqual([]);
    });
  });

  describe("inheritance from CreateQuestionDto", () => {
    it("should inherit title validation", async () => {
      const dto = plainToClass(CreateChoiceQuestionDto, {
        questionType: QuestionType.MULTIPLE_CHOICES,
        choices: [{ text: "Choice 1", isCorrect: true }],
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((error) => error.property === "title")).toBe(true);
    });

    it("should inherit questionType validation", async () => {
      const dto = plainToClass(CreateChoiceQuestionDto, {
        title: "Test Question",
        choices: [{ text: "Choice 1", isCorrect: true }],
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((error) => error.property === "questionType")).toBe(true);
    });

    it("should inherit optional fields", async () => {
      const dto = plainToClass(CreateChoiceQuestionDto, {
        title: "Test Question",
        questionType: QuestionType.MULTIPLE_CHOICES,
        image: "test-image.jpg",
        order: 5,
        choices: [{ text: "Choice 1", isCorrect: true }],
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.image).toBe("test-image.jpg");
      expect(dto.order).toBe(5);
    });
  });

  describe("CreateChoiceQuestionDto transform final fallback", () => {
    it("returns [] when choices is a number", () => {
      const dto = plainToClass(CreateChoiceQuestionDto, {
        title: "Q",
        questionType: QuestionType.MULTIPLE_CHOICES,
        choices: 123,
      });

      expect(dto.choices).toEqual([]);
    });

    it("returns [] when choices is an object", () => {
      const dto = plainToClass(CreateChoiceQuestionDto, {
        title: "Q",
        questionType: QuestionType.MULTIPLE_CHOICES,
        choices: { not: "array" },
      });

      expect(dto.choices).toEqual([]);
    });

    it("returns [] when choices is a boolean", () => {
      const dto = plainToClass(CreateChoiceQuestionDto, {
        title: "Q",
        questionType: QuestionType.MULTIPLE_CHOICES,
        choices: true,
      });

      expect(dto.choices).toEqual([]);
    });
  });
});
