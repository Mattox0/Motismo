import { QuestionController } from "@/question/controller/question.controller";
import { QuestionService } from "@/question/service/question.service";
import { FileUploadService } from "@/files/files.service";

describe("QuestionController", () => {
  let controller: QuestionController;
  let mockQuestionService: Partial<QuestionService>;
  let mockFileUploadService: Partial<FileUploadService>;

  beforeEach(() => {
    mockQuestionService = {
      getQuestions: jest.fn().mockResolvedValue([]),
      createQuestion: jest.fn().mockResolvedValue(undefined),
    };

    mockFileUploadService = {
      uploadFile: jest.fn().mockResolvedValue("uploaded-file.jpg"),
      getFileUrl: jest.fn().mockReturnValue("http://localhost/files/uploaded-file.jpg"),
    };

    controller = new QuestionController(
      mockQuestionService as QuestionService,
      mockFileUploadService as FileUploadService
    );
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getQuestions", () => {
    it("should return questions for a quizz", async () => {
      const mockQuizz = { id: "quizz-id" };
      const expectedQuestions = [{ id: "q1", title: "Question 1" }];

      mockQuestionService.getQuestions = jest.fn().mockResolvedValue(expectedQuestions);

      const result = await controller.getQuestions(mockQuizz as any);

      expect(mockQuestionService.getQuestions).toHaveBeenCalledWith(mockQuizz);
      expect(result).toEqual(expectedQuestions);
    });
  });

  describe("getQuestion", () => {
    it("should return the question from request", () => {
      const mockQuestion = { id: "question-id", title: "Test Question" };

      const result = controller.getQuestion(mockQuestion as any);

      expect(result).toEqual(mockQuestion);
    });
  });

  describe("createQuestion", () => {
    const mockQuizz = { id: "quizz-id" };
    const mockCreateQuestionDto = {
      title: "New Question",
      questionType: "MULTIPLE_CHOICES",
    };

    it("should create a question without file", async () => {
      await controller.createQuestion(mockQuizz as any, mockCreateQuestionDto as any);

      expect(mockQuestionService.createQuestion).toHaveBeenCalledWith(
        mockQuizz,
        mockCreateQuestionDto
      );
      expect(mockFileUploadService.uploadFile).not.toHaveBeenCalled();
    });

    it("should create a question with file", async () => {
      const mockFile = { originalname: "test.jpg" } as Express.Multer.File;

      await controller.createQuestion(
        mockQuizz as any,
        mockCreateQuestionDto as any,
        mockFile
      );

      expect(mockFileUploadService.uploadFile).toHaveBeenCalledWith(mockFile);
      expect(mockFileUploadService.getFileUrl).toHaveBeenCalledWith("uploaded-file.jpg");
      expect(mockQuestionService.createQuestion).toHaveBeenCalledWith(
        mockQuizz,
        expect.objectContaining({
          ...mockCreateQuestionDto,
          image: "http://localhost/files/uploaded-file.jpg",
        })
      );
    });
  });
});