import "jest-extended";
import path from "path";
import type { WorkspaceInfo } from "workspace-tools";

import { queryWorkspaceModuleRef } from "../src/workspace";

const workspaceRoot = path.join(path.sep + "repos", "fruit");

const workspaces: WorkspaceInfo = [
  {
    name: "@food/lemon",
    path: path.join(workspaceRoot, "packages", "lemon"),
  } as WorkspaceInfo[number],
  {
    name: "apple",
    path: path.join(workspaceRoot, "packages", "apple"),
  } as WorkspaceInfo[number],
  {
    name: "orange",
    path: path.join(workspaceRoot, "packages", "orange"),
  } as WorkspaceInfo[number],
];

const containingFile = path.join(
  path.sep + "repos",
  "fruit",
  "packages",
  "orange",
  "main.ts"
);

describe("Workspace > queryWorkspaceModuleRef", () => {
  test("finds the workspace for the @food/lemon package", () => {
    const ref = queryWorkspaceModuleRef(
      workspaces,
      "@food/lemon",
      containingFile
    );
    expect(ref).not.toBeNil();
    expect(ref.workspace.name).toEqual("@food/lemon");
  });

  test("fails to find a workspace for a module which does not exist", () => {
    expect(
      queryWorkspaceModuleRef(workspaces, "does-not-exist", containingFile)
    ).toBeUndefined();
  });

  test("finds the workspace for a file in the apple package", () => {
    const ref = queryWorkspaceModuleRef(
      workspaces,
      path.join(path.sep + "repos", "fruit", "packages", "apple", "fuji.ts"),
      containingFile
    );
    expect(ref).not.toBeNil();
    expect(ref.workspace.name).toEqual("apple");
    expect(ref.path).toEndWith("fuji.ts");
  });

  test("finds the workspace for a file relative to the containing file", () => {
    const ref = queryWorkspaceModuleRef(
      workspaces,
      "./tangelo.ts",
      containingFile
    );
    expect(ref).not.toBeNil();
    expect(ref.workspace.name).toEqual("orange");
    expect(ref.path).toEndWith("tangelo.ts");
  });
});
