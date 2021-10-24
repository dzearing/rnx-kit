// TODO: move 2 resolve methods to resolve.ts and add tests

// TODO: rename file to host.ts and add tests

// TODO: find other areas where you depend on tools-node or fs and replace with calls through host
//       all I/O must be logged (outer layer) and cached (inner layer)

import {
  isFileModuleRef,
  isPackageModuleRef,
  parseModuleRef,
} from "@rnx-kit/tools-node";
import { builtinModules } from "module";
import path from "path";
import ts from "typescript";
import { getWorkspaces } from "workspace-tools";

import { ExtensionsTypeScript, hasExtension } from "./extension";
import {
  ResolverLog,
  ResolverLogMode,
  changeModuleResolutionHostToLogFileSystemReads,
} from "./log";
import { createReactNativePackageNameReplacer } from "./react-native-package-name";
import {
  resolveFileModule,
  resolvePackageModule,
  resolveWorkspaceModule,
} from "./resolve";
import type { ResolverContext, ModuleResolutionHostLike } from "./types";
import { queryWorkspaceModuleRef } from "./workspace";

/**
 * Change the TypeScript `CompilerHost` implementation so it makes use of
 * react-native module resolution.
 *
 * This includes binding the `trace` method to a react-native trace logger.
 * The logger is active when the compiler option `traceResolution` is true, or
 * when react-native error tracing is enabled. All file and directory reads
 * are logged, making it easy to see what the resolver is doing.
 *
 * @param host Compiler host
 * @param options Compiler options
 * @param platform Target platform
 * @param platformExtensionNames Optional list of platform file extensions, from highest precedence (index 0) to lowest. Example: `["ios", "mobile", "native"]`.
 * @param disableReactNativePackageSubstitution Flag to prevent substituting the module name `react-native` with the target platform's out-of-tree NPM package implementation. For example, on Windows, devs expect `react-native` to implicitly refer to `react-native-windows`.
 * @param traceReactNativeModuleResolutionErrors Flag to enable trace logging when a resolver error occurs. All messages involved in the failed module resolution are aggregated and logged.
 * @param traceResolutionLog Optional file to use for logging trace message. When not present, log messages go to the console.
 */
export function changeCompilerHostToUseReactNativeResolver(
  host: ts.CompilerHost,
  options: ts.ParsedCommandLine["options"],
  platform: string,
  platformExtensionNames: string[] | undefined,
  disableReactNativePackageSubstitution: boolean,
  traceReactNativeModuleResolutionErrors: boolean,
  traceResolutionLog: string | undefined
): void {
  let mode = ResolverLogMode.Never;
  if (options.traceResolution) {
    mode = ResolverLogMode.Always;
  } else if (traceReactNativeModuleResolutionErrors) {
    mode = ResolverLogMode.OnFailure;
  }
  const log = new ResolverLog(mode, traceResolutionLog);
  host.trace = log.log.bind(log);

  // Ensure that optional methods have an implementation so they can be hooked
  // for logging.
  host.directoryExists = host.directoryExists ?? ts.sys.directoryExists;
  host.realpath = host.realpath ?? ts.sys.realpath;
  host.getDirectories = host.getDirectories ?? ts.sys.getDirectories;

  changeModuleResolutionHostToLogFileSystemReads(
    host as ModuleResolutionHostLike
  );

  const allowedExtensions = [...ExtensionsTypeScript];
  if (options.checkJs) {
    allowedExtensions.push(ts.Extension.Js, ts.Extension.Jsx);
  }
  if (options.resolveJsonModule) {
    allowedExtensions.push(ts.Extension.Json);
  }

  const context: ResolverContext = {
    host: host as ModuleResolutionHostLike,
    options,
    disableReactNativePackageSubstitution,
    log,
    platform,
    platformExtensions: [platform, ...(platformExtensionNames || [])].map(
      (e) => `.${e}` // prepend a '.' to each name to make it a file extension
    ),
    workspaces: getWorkspaces(process.cwd()),
    allowedExtensions,
    replaceReactNativePackageName: createReactNativePackageNameReplacer(
      platform,
      disableReactNativePackageSubstitution,
      log
    ),
  };

  host.resolveModuleNames = resolveModuleNames.bind(undefined, context);
  host.resolveTypeReferenceDirectives = resolveTypeReferenceDirectives.bind(
    undefined,
    context
  );
}

export function resolveModuleNames(
  context: ResolverContext,
  moduleNames: string[],
  containingFile: string,
  _reusedNames: string[] | undefined,
  _redirectedReference?: ts.ResolvedProjectReference
): (ts.ResolvedModuleFull | undefined)[] {
  const { log, workspaces, allowedExtensions, replaceReactNativePackageName } =
    context;

  //
  //  If the containing file is a type file (.d.ts), it can only import
  //  other type files. Search for both .d.ts and .ts files, as some
  //  modules import as "foo.d" with the intent to resolve to "foo.d.ts".
  //
  const extensions = hasExtension(containingFile, ts.Extension.Dts)
    ? [ts.Extension.Dts, ts.Extension.Ts]
    : allowedExtensions;

  const resolutions: (ts.ResolvedModuleFull | undefined)[] = [];

  for (let moduleName of moduleNames) {
    log.begin();
    log.log(
      "======== Resolving module '%s' from '%s' ========",
      moduleName,
      containingFile
    );

    //
    //  Replace any reference to 'react-native' with the platform-specific
    //  react-native package name.
    //
    moduleName = replaceReactNativePackageName(moduleName);

    let module: ts.ResolvedModuleFull | undefined = undefined;

    const workspaceRef = queryWorkspaceModuleRef(
      workspaces,
      moduleName,
      containingFile
    );
    if (workspaceRef) {
      module = resolveWorkspaceModule(context, workspaceRef, extensions);
    } else {
      const moduleRef = parseModuleRef(moduleName);
      if (isPackageModuleRef(moduleRef)) {
        module = resolvePackageModule(
          context,
          moduleRef,
          path.dirname(containingFile),
          extensions
        );
      } else if (isFileModuleRef(moduleRef)) {
        module = resolveFileModule(
          context,
          moduleRef,
          path.dirname(containingFile),
          extensions
        );
      }
    }

    resolutions.push(module);
    if (module) {
      log.log(
        "File %s exists - using it as a module resolution result.",
        module.resolvedFileName
      );
      log.log(
        "======== Module name '%s' was successfully resolved to '%s' ========",
        moduleName,
        module.resolvedFileName
      );
      log.endSuccess();
    } else {
      log.log("Failed to resolve module %s to a file.", moduleName);
      log.log(
        "======== Module name '%s' failed to resolve to a file ========",
        moduleName
      );
      if (
        log.getMode() !== ResolverLogMode.Never &&
        shouldShowResolverFailure(moduleName)
      ) {
        log.endFailure();
      } else {
        log.reset();
      }
    }
  }

  return resolutions;
}

export function resolveTypeReferenceDirectives(
  context: ResolverContext,
  typeDirectiveNames: string[],
  containingFile: string,
  redirectedReference?: ts.ResolvedProjectReference
): (ts.ResolvedTypeReferenceDirective | undefined)[] {
  const { host, options, log } = context;

  const resolutions: (ts.ResolvedTypeReferenceDirective | undefined)[] = [];

  for (const typeDirectiveName of typeDirectiveNames) {
    log.begin();

    const { resolvedTypeReferenceDirective: directive } =
      ts.resolveTypeReferenceDirective(
        typeDirectiveName,
        containingFile,
        options,
        host,
        redirectedReference
      );

    resolutions.push(directive);
    if (directive) {
      log.endSuccess();
    } else {
      log.endFailure();
    }
  }

  return resolutions;
}

/**
 * Decide whether or not to show failure information for the named module.
 *
 * @param moduleName Module
 */
export function shouldShowResolverFailure(moduleName: string): boolean {
  // ignore resolver errors for built-in node modules
  if (
    builtinModules.indexOf(moduleName) !== -1 ||
    moduleName === "fs/promises" || // doesn't show up in the list, but it's a built-in
    moduleName.toLowerCase().startsWith("node:") // explicit use of a built-in
  ) {
    return false;
  }

  // ignore resolver errors for multimedia files
  const multimediaExts =
    /\.(aac|aiff|bmp|caf|gif|html|jpeg|jpg|m4a|m4v|mov|mp3|mp4|mpeg|mpg|obj|otf|pdf|png|psd|svg|ttf|wav|webm|webp)$/i;
  if (path.extname(moduleName).match(multimediaExts)) {
    return false;
  }

  // ignore resolver errors for code files
  const codeExts = /\.(css)$/i;
  if (path.extname(moduleName).match(codeExts)) {
    return false;
  }

  return true;
}
