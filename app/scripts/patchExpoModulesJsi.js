const fs = require('fs');
const path = require('path');

const sourceDir = path.join(
  __dirname,
  '..',
  'node_modules',
  'expo-modules-jsi',
  'apple',
  'Sources',
  'ExpoModulesJSI'
);

function patchSwiftFiles(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      patchSwiftFiles(entryPath);
      continue;
    }

    if (!entry.name.endsWith('.swift')) {
      continue;
    }

    const current = fs.readFileSync(entryPath, 'utf8');
    const patched = current.replace(/weak let runtime/g, 'weak var runtime');

    if (patched !== current) {
      fs.writeFileSync(entryPath, patched);
    }
  }
}

patchSwiftFiles(sourceDir);

const sendableRuntimeFiles = [
  path.join(sourceDir, 'Contexts', 'HostFunctionContext.swift'),
  path.join(sourceDir, 'Contexts', 'HostObjectContext.swift'),
  path.join(sourceDir, 'Runtime', 'JavaScriptPropNameID.swift'),
  path.join(sourceDir, 'Runtime', 'Values', 'JavaScriptError.swift'),
  path.join(sourceDir, 'Runtime', 'Values', 'JavaScriptValue.swift'),
];

for (const file of sendableRuntimeFiles) {
  if (!fs.existsSync(file)) {
    continue;
  }

  const current = fs.readFileSync(file, 'utf8');
  const patched = current
    .replace(
      /(?<!nonisolated\(unsafe\) )private weak var runtime/g,
      'nonisolated(unsafe) private weak var runtime'
    )
    .replace(
      /(?<!nonisolated\(unsafe\) )internal weak var runtime/g,
      'nonisolated(unsafe) internal weak var runtime'
    )
    .replace(
      /(?<!nonisolated\(unsafe\) )weak var runtime/g,
      'nonisolated(unsafe) weak var runtime'
    );

  if (patched !== current) {
    fs.writeFileSync(file, patched);
  }
}
