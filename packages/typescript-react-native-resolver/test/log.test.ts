import "jest-extended";
import fs from "fs";

import { ResolverLogMode, ResolverLog } from "../src/log";

const mockWriteFileSync = jest.fn();
fs.writeFileSync = mockWriteFileSync;

const mockConsoleLog = jest.fn();
console.log = mockConsoleLog;

describe("ResolverLog", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test("getMode returns the log mode", () => {
    const log = new ResolverLog(ResolverLogMode.Always);
    expect(log.getMode()).toEqual(ResolverLogMode.Always);
  });

  test("log messages are flushed immediately when begin hasn't been called", () => {
    const log = new ResolverLog(ResolverLogMode.Always);
    log.log("test");
    expect(mockConsoleLog).toBeCalledWith("test");
  });

  test("log messages are buffered between a call to begin and a call to endSuccess", () => {
    const log = new ResolverLog(ResolverLogMode.Always);
    log.begin();
    log.log("test");
    expect(mockConsoleLog).not.toBeCalled();
    log.endSuccess();
    expect(mockConsoleLog).toBeCalledWith("test");
  });

  test("log messages are buffered between a call to begin and a call to endFailure", () => {
    const log = new ResolverLog(ResolverLogMode.Always);
    log.begin();
    log.log("test");
    expect(mockConsoleLog).not.toBeCalled();
    log.endFailure();
    expect(mockConsoleLog).toBeCalledWith("test");
  });

  test("no success log messages are written when logging is set to only report failures", () => {
    const log = new ResolverLog(ResolverLogMode.OnFailure);
    log.begin();
    log.log("test");
    expect(mockConsoleLog).not.toBeCalled();
    log.endSuccess();
    expect(mockConsoleLog).not.toBeCalled();
  });

  test("no failure log messages are written when logging is disabled", () => {
    const log = new ResolverLog(ResolverLogMode.Never);
    log.begin();
    log.log("test");
    expect(mockConsoleLog).not.toBeCalled();
    log.endFailure();
    expect(mockConsoleLog).not.toBeCalled();
  });

  test("log messages are flushed to a file instead of the console", () => {
    const log = new ResolverLog(ResolverLogMode.Always, "foo.log");
    log.log("test");
    expect(mockWriteFileSync).toBeCalledWith(
      "foo.log",
      expect.anything(),
      expect.anything()
    );
  });
});
