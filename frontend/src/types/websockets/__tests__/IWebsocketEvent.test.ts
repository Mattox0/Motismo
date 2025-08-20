import { IWebsocketEvent } from '../IWebsocketEvent';

describe('IWebsocketEvent', () => {
  it('should have all expected event values', () => {
    expect(IWebsocketEvent.JOIN).toBe('JOIN');
    expect(IWebsocketEvent.CONNECT).toBe('connect');
    expect(IWebsocketEvent.START).toBe('START');
    expect(IWebsocketEvent.STATUS).toBe('STATUS');
    expect(IWebsocketEvent.MEMBERS).toBe('MEMBERS');
    expect(IWebsocketEvent.ERROR).toBe('ERROR');
    expect(IWebsocketEvent.QUESTION_DATA).toBe('QUESTION_DATA');
    expect(IWebsocketEvent.TIMER).toBe('TIMER');
    expect(IWebsocketEvent.ANSWER).toBe('ANSWER');
    expect(IWebsocketEvent.DISPLAY_ANSWER).toBe('DISPLAY_ANSWER');
    expect(IWebsocketEvent.DISPLAY_RANKING).toBe('DISPLAY_RANKING');
    expect(IWebsocketEvent.RESULTS).toBe('RESULTS');
    expect(IWebsocketEvent.RANKING).toBe('RANKING');
    expect(IWebsocketEvent.NEXT_QUESTION).toBe('NEXT_QUESTION');
    expect(IWebsocketEvent.RESET_QUESTION).toBe('RESET_QUESTION');
  });

  it('should have exactly 15 event values', () => {
    const eventValues = Object.values(IWebsocketEvent);
    expect(eventValues).toHaveLength(15);
  });

  it('should have unique values', () => {
    const eventValues = Object.values(IWebsocketEvent);
    const uniqueValues = new Set(eventValues);
    expect(uniqueValues.size).toBe(eventValues.length);
  });

  it('should be usable as string values', () => {
    const event: IWebsocketEvent = IWebsocketEvent.JOIN;
    expect(typeof event).toBe('string');
    expect(event).toBe('JOIN');
  });

  it('should allow comparison with string values', () => {
    expect(IWebsocketEvent.CONNECT === 'connect').toBe(true);
    expect(IWebsocketEvent.START === 'START').toBe(true);
    expect(IWebsocketEvent.ERROR === 'ERROR').toBe(true);
  });

  it('should have consistent naming convention', () => {
    const eventValues = Object.values(IWebsocketEvent);
    const upperCaseEvents = eventValues.filter(event => event === event.toUpperCase());
    const lowerCaseEvents = eventValues.filter(event => event === event.toLowerCase());

    expect(upperCaseEvents.length).toBeGreaterThan(lowerCaseEvents.length);
    expect(IWebsocketEvent.CONNECT).toBe('connect');
  });
});
