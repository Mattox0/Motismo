import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { CreateQuestionDto } from "../../src/question/dto/createQuestion.dto";
import { QuestionType } from "../../src/question/types/questionType";

describe("CreateQuestionDto", () => {
  describe("validation", () => {
    it("should pass validation with valid data", async () => {
      const dto = plainToClass(CreateQuestionDto, {
        title: "Test Question",
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

    it("should fail validation when title is missing", async () => {
      const dto = plainToClass(CreateQuestionDto, {
        questionType: QuestionType.MULTIPLE_CHOICES,
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty("isString");
    });

    it("should fail validation when questionType is missing", async () => {
      const dto = plainToClass(CreateQuestionDto, {
        title: "Test Question",
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty("isEnum");
    });

    it("should fail validation when questionType is invalid", async () => {
      const dto = plainToClass(CreateQuestionDto, {
        title: "Test Question",
        questionType: "INVALID_TYPE",
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty("isEnum");
    });

    it("should pass validation with optional fields missing", async () => {
      const dto = plainToClass(CreateQuestionDto, {
        title: "Test Question",
        questionType: QuestionType.MULTIPLE_CHOICES,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });

  describe("transform", () => {
    it("should transform choices from JSON string", () => {
      const rawData = {
        title: "Test Question",
        questionType: QuestionType.MULTIPLE_CHOICES,
        choices: JSON.stringify([
          { text: "Choice 1", isCorrect: true },
          { text: "Choice 2", isCorrect: false },
        ]),
      };

      const dto = plainToClass(CreateQuestionDto, rawData);

      expect(dto.choices).toEqual([
        { text: "Choice 1", isCorrect: true },
        { text: "Choice 2", isCorrect: false },
      ]);
    });

    it("should handle invalid JSON string in choices", () => {
      const rawData = {
        title: "Test Question",
        questionType: QuestionType.MULTIPLE_CHOICES,
        choices: "invalid json",
      };

      const dto = plainToClass(CreateQuestionDto, rawData);

      expect(dto.choices).toEqual([]);
    });

    it("should handle non-array JSON in choices", () => {
      const rawData = {
        title: "Test Question",
        questionType: QuestionType.MULTIPLE_CHOICES,
        choices: JSON.stringify({ not: "an array" }),
      };

      const dto = plainToClass(CreateQuestionDto, rawData);

      expect(dto.choices).toEqual([]);
    });

    it("should transform choices from array with invalid text types", () => {
      const rawData = {
        title: "Test Question",
        questionType: QuestionType.MULTIPLE_CHOICES,
        choices: [
          { text: 123, isCorrect: true },
          { text: null, isCorrect: false },
          { text: "Valid Choice", isCorrect: "true" },
        ],
      };

      const dto = plainToClass(CreateQuestionDto, rawData);

      expect(dto.choices).toEqual([
        { text: "", isCorrect: true },
        { text: "", isCorrect: false },
        { text: "Valid Choice", isCorrect: true },
      ]);
    });

    it("should handle non-array choices", () => {
      const rawData = {
        title: "Test Question",
        questionType: QuestionType.MULTIPLE_CHOICES,
        choices: "not an array",
      };

      const dto = plainToClass(CreateQuestionDto, rawData);

      expect(dto.choices).toEqual([]);
    });

    it("should handle null choices", () => {
      const rawData = {
        title: "Test Question",
        questionType: QuestionType.MULTIPLE_CHOICES,
        choices: null,
      };

      const dto = plainToClass(CreateQuestionDto, rawData);

      expect(dto.choices).toEqual([]);
    });

    it("should handle undefined choices", () => {
      const rawData = {
        title: "Test Question",
        questionType: QuestionType.MULTIPLE_CHOICES,
        choices: undefined,
      };

      const dto = plainToClass(CreateQuestionDto, rawData);

      expect(dto.choices).toEqual([]);
    });
  });

  describe("different question types", () => {
    it("should validate MULTIPLE_CHOICES type", async () => {
      const dto = plainToClass(CreateQuestionDto, {
        title: "Multiple Choice Question",
        questionType: QuestionType.MULTIPLE_CHOICES,
        choices: [
          { text: "Choice 1", isCorrect: true },
          { text: "Choice 2", isCorrect: false },
        ],
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it("should validate MATCHING type", async () => {
      const dto = plainToClass(CreateQuestionDto, {
        title: "Matching Question",
        questionType: QuestionType.MATCHING,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it("should validate WORD_CLOUD type", async () => {
      const dto = plainToClass(CreateQuestionDto, {
        title: "Word Cloud Question",
        questionType: QuestionType.WORD_CLOUD,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });

  describe("order field", () => {
    it("should accept numeric order", async () => {
      const dto = plainToClass(CreateQuestionDto, {
        title: "Test Question",
        questionType: QuestionType.MULTIPLE_CHOICES,
        order: 5,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.order).toBe(5);
    });

    it("should fail validation with non-numeric order", async () => {
      const dto = plainToClass(CreateQuestionDto, {
        title: "Test Question",
        questionType: QuestionType.MULTIPLE_CHOICES,
        order: "not a number",
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
