const fsPromises = require('node:fs/promises');
const path = require('node:path');
const maxRenameAttempts = 30;

const rename = fsPromises.rename.bind(fsPromises);
fsPromises.rename = async (...arguments_) => {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await rename(...arguments_);
    } catch (error) {
      if (process.platform !== 'win32' || error?.code !== 'EPERM') throw error;
      if (attempt >= maxRenameAttempts - 1) {
        const [source, destination] = arguments_;
        const sourcePath = path.resolve(String(source));
        const destinationPath = path.resolve(String(destination));
        const safeElectronStage = sourcePath.endsWith('.tmp')
          && destinationPath === sourcePath.slice(0, -4)
          && path.dirname(sourcePath) === path.dirname(destinationPath);
        if (!safeElectronStage) throw error;

        try {
          await fsPromises.access(destinationPath);
          throw error;
        } catch (accessError) {
          if (accessError?.code !== 'ENOENT') throw error;
        }

        await fsPromises.cp(sourcePath, destinationPath, {
          recursive: true,
          errorOnExist: true,
          force: false,
        });
        return;
      }
      await new Promise(resolve => setTimeout(resolve, Math.min(250 * (attempt + 1), 1_000)));
    }
  }
};
