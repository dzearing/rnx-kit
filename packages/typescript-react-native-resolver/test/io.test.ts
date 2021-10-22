import "jest-extended";
import path from "path";

import { createLoggedIO } from "../src/io";
import type { ResolverLog } from "../src/log";

const fixturePath = path.join(process.cwd(), "test", "__fixtures__", "io-test");

const mockLog = jest.fn();
const resolverLog: unknown = {
  log: mockLog,
};

describe("IO > LoggedIO > isFile", () => {
  const io = createLoggedIO(resolverLog as ResolverLog);

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("returns true if the path refers to a file", () => {
    expect(io.isFile(path.join(fixturePath, "package.json"))).toBeTrue();
  });

  test("does not write a message to the log on success", () => {
    io.isFile(path.join(fixturePath, "package.json"));
    expect(mockLog).not.toBeCalled();
  });

  test("returns false if the path refers to a directory", () => {
    expect(io.isFile(fixturePath)).toBeFalse();
  });

  test("writes a message to the log on failure", () => {
    io.isFile(fixturePath);
    expect(mockLog).toBeCalled();
  });

  test("returns false if the path refers to something that does not exist", () => {
    expect(io.isFile(path.join(fixturePath, "does-not-exist"))).toBeFalse();
  });
});

describe("IO > LoggedIO > isDirectory", () => {
  const io = createLoggedIO(resolverLog as ResolverLog);

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("returns true if the path refers to a directory", () => {
    expect(io.isDirectory(fixturePath)).toBeTrue();
  });

  test("does not write a message to the log on success", () => {
    io.isDirectory(fixturePath);
    expect(mockLog).not.toBeCalled();
  });

  test("returns false if the path refers to a file", () => {
    expect(io.isDirectory(path.join(fixturePath, "package.json"))).toBeFalse();
  });

  test("writes a message to the log on failure", () => {
    io.isDirectory(path.join(fixturePath, "package.json"));
    expect(mockLog).toBeCalled();
  });

  test("returns false if the path refers to something that does not exist", () => {
    expect(
      io.isDirectory(path.join(fixturePath, "does-not-exist"))
    ).toBeFalse();
  });
});

describe("IO > LoggedIO > readPackage", () => {
  const io = createLoggedIO(resolverLog as ResolverLog);

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("returns the package contents", () => {
    const pkg = io.readPackage(fixturePath);
    expect(pkg).toBeObject();
    expect(pkg.name).toEqual("ts");
    expect(pkg.version).toEqual("1");
  });

  test("writes a message to the log", () => {
    io.readPackage(fixturePath);
    expect(mockLog).toBeCalled();
  });
});

describe("IO > LoggedIO > findPackageDependencyDir", () => {
  const io = createLoggedIO(resolverLog as ResolverLog);

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("returns the directory of an unscoped package", () => {
    expect(
      io.findPackageDependencyDir(
        { name: "test-package" },
        { startDir: fixturePath }
      )
    ).toEqual(path.join(fixturePath, "node_modules", "test-package"));
  });

  test("returns the directory of a scoped package", () => {
    expect(
      io.findPackageDependencyDir(
        { scope: "@abc", name: "def" },
        { startDir: fixturePath }
      )
    ).toEqual(path.join(fixturePath, "node_modules", "@abc", "def"));
  });

  test("writes a message to the log", () => {
    io.findPackageDependencyDir(
      { name: "test-package" },
      { startDir: fixturePath }
    );
    expect(mockLog).toBeCalled();
  });
});
