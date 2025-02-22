import { Test } from "@nestjs/testing";
import { FileUploadModule } from "@/files/files.module";
import { I18nService } from "nestjs-i18n";

const mockI18nService = {
  translate: jest.fn().mockResolvedValue("translated text"),
};

describe("FileUploadModule", () => {
  it("should compile the module", async () => {
    const module = await Test.createTestingModule({
      imports: [FileUploadModule],
    })
      .useMocker((token) => {
        if (token === I18nService) {
          return mockI18nService;
        }
      })
      .compile();

    expect(module).toBeDefined();
  });
});
