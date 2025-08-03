/* eslint-disable @typescript-eslint/no-unused-vars, no-empty-function, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment */
import { ExecutionContext } from "@nestjs/common";
import { UserRequest } from "@/user/decorators/user.decorator";
import { ROUTE_ARGS_METADATA } from "@nestjs/common/constants";

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
function getParamDecoratorFactory(decorator: Function) {
  class Test {
    public test(@decorator() value) {}
  }

  const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, Test, "test");

  return args[Object.keys(args)[0]].factory;
}

describe("UserRequest Decorator", () => {
  it("should return user from request", () => {
    const factory = getParamDecoratorFactory(UserRequest);
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
