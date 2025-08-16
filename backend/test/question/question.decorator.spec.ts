import { ExecutionContext } from "@nestjs/common";

const captured: { factory?: (data: unknown, ctx: ExecutionContext) => any } = {};

jest.mock("@nestjs/common", () => {
  const actual = jest.requireActual("@nestjs/common");

  return {
    ...actual,
    createParamDecorator: (factory: (data: unknown, ctx: ExecutionContext) => any) => {
      captured.factory = factory;
      const fakeDecorator: any = () => undefined;

      return fakeDecorator;
    },
  };
});

describe("QuestionRequest decorator", () => {
  const { QuestionRequest } = jest.requireActual("@/question/decorator/question.decorator");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("is defined", () => {
    expect(QuestionRequest).toBeDefined();
    expect(typeof captured.factory).toBe("function");
  });

  it("returns request.question from ExecutionContext", () => {
    const ctx: ExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({ question: { id: "q1", title: "T" } }),
      }),
    } as any;

    const result = captured.factory!(undefined, ctx);

    expect(result).toEqual({ id: "q1", title: "T" });
  });

  it("returns undefined when request.question is missing", () => {
    const ctx: ExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
    } as any;

    const result = captured.factory!(undefined, ctx);

    expect(result).toBeUndefined();
  });

  it("ignores the data argument", () => {
    const ctx: ExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({ question: "ok" }),
      }),
    } as any;

    const result = captured.factory!("any-data", ctx);

    expect(result).toBe("ok");
  });
});
