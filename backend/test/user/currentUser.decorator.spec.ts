/* eslint-disable no-empty-function */
import { ExecutionContext } from "@nestjs/common";
import { CurrentUser } from "@/user/decorators/currentUser.decorator";
import { ROUTE_ARGS_METADATA } from "@nestjs/common/constants";

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
function getParamDecoratorFactory(decorator: Function) {
  class Test {
    public test(@decorator() value) {}
  }

  const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, Test, "test");

  return args[Object.keys(args)[0]].factory;
}

describe("CurrentUser Decorator", () => {
  it("should return user from request", () => {
    const factory = getParamDecoratorFactory(CurrentUser);
    const mockUser = {
      id: "1",
      username: "John Doe",
      email: "yoohoo@yoohoo.fr",
      password: "password",
      role: "Customer",
      creationDate: new Date("2025-02-23T20:13:43.578Z"),
    };

    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: mockUser,
        }),
      }),
    } as unknown as ExecutionContext;

    const result = factory(null, context);

    expect(result).toBe(mockUser);
  });
});
