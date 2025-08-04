import { CreateChoiceDto } from "@/choice/dto/createChoice.dto";

describe("CreateChoiceDto", () => {
  let dto: CreateChoiceDto;

  beforeEach(() => {
    dto = new CreateChoiceDto();
  });

  it("should be defined", () => {
    expect(dto).toBeDefined();
  });

  it("should have text property", () => {
    dto.text = "Test choice";
    expect(dto.text).toBe("Test choice");
  });

  it("should have isCorrect property", () => {
    dto.isCorrect = true;
    expect(dto.isCorrect).toBe(true);

    dto.isCorrect = false;
    expect(dto.isCorrect).toBe(false);
  });

  it("should be able to create with valid data", () => {
    dto.text = "Valid choice text";
    dto.isCorrect = true;

    expect(dto.text).toBe("Valid choice text");
    expect(dto.isCorrect).toBe(true);
  });
});
