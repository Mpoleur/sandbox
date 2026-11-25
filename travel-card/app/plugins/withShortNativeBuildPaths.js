// Config plugin: keeps the C++ build folders of native libraries on a SHORT path.
//
// Why: on Windows the Android C++ build tool (ninja, shipped with the SDK's CMake 3.22) cannot create folders longer than
// 260 characters, even with Windows long paths switched on. Libraries such as react-native-worklets put the full path of
// their source files inside the object-file path, so a project under Documents\sandbox\... fails with
// "ninja: error: mkdir(...): No such file or directory". Moving only the C++ build folder to a short place fixes it
// without moving the project. The folder holds build leftovers only and can be deleted at any time.
//
// Set TC_CXX_DIR to choose another folder (default C:/x).
const { withSettingsGradle } = require('expo/config-plugins');

const MARKER = '// travel-card: short native build paths';
const SNIPPET = `
${MARKER}
gradle.beforeProject { sp ->
  sp.afterEvaluate {
    def androidExt = sp.extensions.findByName('android')
    if (androidExt != null && androidExt.hasProperty('externalNativeBuild')) {
      def cmake = androidExt.externalNativeBuild.cmake
      if (cmake != null) {
        def base = System.getenv('TC_CXX_DIR') ?: 'C:/x'
        cmake.buildStagingDirectory = new File(base, Integer.toString(Math.abs(sp.name.hashCode()) % 1296, 36))
      }
    }
  }
}
`;

module.exports = function withShortNativeBuildPaths(config) {
  return withSettingsGradle(config, (cfg) => {
    if (cfg.modResults.language === 'groovy' && !cfg.modResults.contents.includes(MARKER)) {
      cfg.modResults.contents += SNIPPET;
    }
    return cfg;
  });
};
