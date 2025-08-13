import { IWebsocketType } from "../../../src/game/types/IWebsocketType";

describe("IWebsocketType", () => {
  it("should have all required enum values", () => {
    expect(IWebsocketType.JOIN).toBe("JOIN");
    expect(IWebsocketType.ERROR).toBe("ERROR");
    expect(IWebsocketType.MEMBERS).toBe("MEMBERS");
    expect(IWebsocketType.STATUS).toBe("STATUS");
    expect(IWebsocketType.START).toBe("START");
    expect(IWebsocketType.ANSWER).toBe("ANSWER");
    expect(IWebsocketType.DISPLAY_ANSWER).toBe("DISPLAY_ANSWER");
    expect(IWebsocketType.DISPLAY_RANKING).toBe("DISPLAY_RANKING");
    expect(IWebsocketType.NEXT_QUESTION).toBe("NEXT_QUESTION");
    expect(IWebsocketType.QUESTION_DATA).toBe("QUESTION_DATA");
    expect(IWebsocketType.RESULTS).toBe("RESULTS");
    expect(IWebsocketType.RANKING).toBe("RANKING");
    expect(IWebsocketType.TIMER).toBe("TIMER");
  });

  it("should have correct number of enum values", () => {
    const enumValues = Object.values(IWebsocketType);

    expect(enumValues).toHaveLength(13);
  });

  it("should have unique values", () => {
    const enumValues = Object.values(IWebsocketType);
    const uniqueValues = new Set(enumValues);

    expect(uniqueValues.size).toBe(enumValues.length);
  });

  it("should be used as string literals", () => {
    const joinEvent: IWebsocketType = IWebsocketType.JOIN;
    const startEvent: IWebsocketType = IWebsocketType.START;

    expect(typeof joinEvent).toBe("string");
    expect(typeof startEvent).toBe("string");
    expect(joinEvent).toBe("JOIN");
    expect(startEvent).toBe("START");
  });
});
