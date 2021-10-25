import { changeCompilerHostToUseReactNativeResolver } from "@rnx-kit/typescript-react-native-resolver";
import fs from "fs";
import os from "os";
import ts from "typescript";
import { changeModuleResolutionHostToUseReadCache } from "./cache";

import type { CommandLine } from "./command-line";

/**
 * Create a TypeScript program object using the given command line.
 *
 * If a react-native platform appears on the command-line, the program will
 * use a react-native module resolver which can handle platform extensions
 * such as ".ios.ts" and ".native.tsx". Otherwise, the program will use the
 * standard TypeScript module resolver.
 *
 * @param cmdLine Command line
 * @returns TypeScript program
 */
export function createProgram(cmdLine: CommandLine): ts.Program {
  const {
    platform,
    platformExtensions,
    disableReactNativePackageSubstitution,
    traceReactNativeModuleResolutionErrors,
    traceResolutionLog,
  } = cmdLine.rnts;

  const compilerHost = ts.createCompilerHost(cmdLine.ts.options);

  changeModuleResolutionHostToUseReadCache(compilerHost);

  if (platform) {
    //  A react-native target platform was specified. Use the react-native
    //  TypeScript resolver. This includes configuring a react-native trace
    //  message handler.
    //
    changeCompilerHostToUseReactNativeResolver(
      compilerHost,
      cmdLine.ts.options,
      platform,
      platformExtensions,
      !!disableReactNativePackageSubstitution,
      !!traceReactNativeModuleResolutionErrors,
      traceResolutionLog
    );
  } else {
    //  No react-native platform was specified. Use the standard TypeScript
    //  resolver.
    //
    //  Add a trace message handler which writes to a file or to the console.
    //  Trace messages are only used when the compiler option `traceResolution`
    //  is enabled.
    //
    if (traceResolutionLog) {
      compilerHost.trace = (message: string): void => {
        fs.writeFileSync(traceResolutionLog, message + os.EOL, {
          encoding: "utf-8",
          flag: "a",
        });
      };
    } else {
      compilerHost.trace = ts.sys.write;
    }
  }

  const programOptions = {
    rootNames: cmdLine.ts.fileNames,
    options: cmdLine.ts.options,
    projectReferences: cmdLine.ts.projectReferences,
    host: compilerHost,
    configFileParsingDiagnostics: ts.getConfigFileParsingDiagnostics(
      cmdLine.ts
    ),
  };
  const program = ts.createProgram(programOptions);
  return program;
}
