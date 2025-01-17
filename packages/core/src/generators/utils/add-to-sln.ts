import {
  joinPathFragments,
  readWorkspaceConfiguration,
  Tree,
} from '@nx/devkit';

import { parse, relative, resolve } from 'path';

import { DotNetClient, dotnetFactory } from '@nx-dotnet/dotnet';
import { readConfigSection } from '@nx-dotnet/utils';
import { getWorkspaceScope } from './get-scope';

export function addToSolutionFile(
  host: Tree,
  projectRoot: string,
  dotnetClient = new DotNetClient(dotnetFactory()),
  solutionFile?: string | boolean,
) {
  const scope = getWorkspaceScope(host);
  const defaultFilePath = readConfigSection(host, 'solutionFile')?.replace(
    /(\{npmScope\}|\{scope\})/g,
    scope || '',
  );
  if (typeof solutionFile === 'boolean' && solutionFile) {
    solutionFile = defaultFilePath;
  } else if (solutionFile === null || solutionFile === undefined) {
    if (defaultFilePath && host.exists(defaultFilePath)) {
      solutionFile = defaultFilePath;
    }
  }

  if (solutionFile) {
    if (!host.exists(solutionFile)) {
      const { name, dir } = parse(solutionFile);
      dotnetClient.new('sln', {
        name,
        output: joinPathFragments(host.root, dir),
      });
    }
    const relativePath = relative(dotnetClient.cwd ?? host.root, host.root);
    dotnetClient.addProjectToSolution(
      joinPathFragments(relativePath, solutionFile),
      resolve(relativePath, projectRoot),
    );
  }
}
