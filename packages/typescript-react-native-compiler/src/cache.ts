import fs from "fs";
import ts from "typescript";

export function changeModuleResolutionHostToUseReadCache(
  host: ts.ModuleResolutionHost
  //tracing: boolean
): void {
  const { fileExists: originalFileExists, readFile: originalReadFile } = host;
  const originalDirectoryExists =
    host.directoryExists ?? ts.sys.directoryExists;
  const originalRealpath = host.realpath ?? fs.realpathSync;
  const originalGetDirectories = host.getDirectories ?? ts.sys.getDirectories;

  const cacheFileExists = new Map<string, boolean>();
  // const statsFileExists = new Map<string, { hits: number }>();
  host.fileExists = (fileName: string): boolean => {
    // if (!statsFileExists.has(fileName)) {
    //   statsFileExists.set(fileName, { hits: 0 });
    // }
    if (!cacheFileExists.has(fileName)) {
      cacheFileExists.set(fileName, originalFileExists(fileName));
    } else {
      // statsFileExists.get(fileName)!.hits++;
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return cacheFileExists.get(fileName)!;
  };

  const cacheReadFile = new Map<string, string | undefined>();
  // const statsReadFile = new Map<string, { hits: number }>();
  host.readFile = (fileName: string): string | undefined => {
    // if (!statsReadFile.has(fileName)) {
    //   statsReadFile.set(fileName, { hits: 0 });
    // }
    if (!cacheReadFile.has(fileName)) {
      cacheReadFile.set(fileName, originalReadFile(fileName));
    } else {
      // statsReadFile.get(fileName)!.hits++;
    }
    return cacheReadFile.get(fileName);
  };

  const cacheDirectoryExists = new Map<string, boolean>();
  // const statsDirectoryExists = new Map<string, { hits: number }>();
  host.directoryExists = (directoryName: string): boolean => {
    // if (!statsDirectoryExists.has(directoryName)) {
    //   statsDirectoryExists.set(directoryName, { hits: 0 });
    // }
    if (!cacheDirectoryExists.has(directoryName)) {
      cacheDirectoryExists.set(
        directoryName,
        originalDirectoryExists(directoryName)
      );
    } else {
      // statsDirectoryExists.get(directoryName)!.hits++;
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return cacheDirectoryExists.get(directoryName)!;
  };

  const cacheRealpath = new Map<string, string>();
  // const statsRealpath = new Map<string, { hits: number }>();
  host.realpath = (path: string): string => {
    // if (!statsRealpath.has(path)) {
    //   statsRealpath.set(path, { hits: 0 });
    // }
    if (!cacheRealpath.has(path)) {
      cacheRealpath.set(path, originalRealpath(path));
    } else {
      // statsRealpath.get(path)!.hits++;
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return cacheRealpath.get(path)!;
  };

  const cacheGetDirectories = new Map<string, string[]>();
  // const statsGetDirectories = new Map<string, { hits: number }>();
  host.getDirectories = (path: string): string[] => {
    // if (!statsGetDirectories.has(path)) {
    //   statsGetDirectories.set(path, { hits: 0 });
    // }
    if (!cacheGetDirectories.has(path)) {
      cacheGetDirectories.set(path, originalGetDirectories(path));
    } else {
      // statsGetDirectories.get(path)!.hits++;
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return cacheGetDirectories.get(path)!;
  };

  // (host as unknown as Record<string, unknown>).dumpCacheStats = () => {
  //   if (!tracing) {
  //     return;
  //   }
  //   const top10 = (
  //     stats: Map<string, { hits: number }>
  //   ): { value: string; hits: number }[] => {
  //     const entries: { value: string; hits: number }[] = [];
  //     stats.forEach((value: { hits: number }, key: string): void => {
  //       let index = 0;
  //       while (index < entries.length) {
  //         if (value.hits > entries[index].hits) {
  //           break;
  //         }
  //         index++;
  //       }
  //       if (index < 10) {
  //         entries.splice(index, 0, { value: key, hits: value.hits });
  //       }
  //       if (entries.length > 10) {
  //         entries.splice(10, entries.length - 10);
  //       }
  //     });
  //     return entries;
  //   };

  //   const dump = (topN: { value: string; hits: number }[]): void => {
  //     for (let index = 0; index < topN.length; index++) {
  //       console.log(
  //         "%d: %s (%d hit(s), %f hit-rate)",
  //         index,
  //         topN[index].value,
  //         topN[index].hits,
  //         (100 * topN[index].hits) / (topN[index].hits + 1)
  //       );
  //     }
  //     console.log("");
  //   };

  //   const topFileExists = top10(statsFileExists);
  //   const topReadFile = top10(statsReadFile);
  //   const topDirectoryExists = top10(statsDirectoryExists);
  //   const topRealpath = top10(statsRealpath);
  //   const topGetDirectories = top10(statsGetDirectories);

  //   console.log("******* File System Read-Cache Stats ********");
  //   console.log("== fileExists ==");
  //   dump(topFileExists);
  //   console.log("== readFile ==");
  //   dump(topReadFile);
  //   console.log("== directoryExists ==");
  //   dump(topDirectoryExists);
  //   console.log("== realpath ==");
  //   dump(topRealpath);
  //   console.log("== getDirectories == ");
  //   dump(topGetDirectories);
  // };
}
