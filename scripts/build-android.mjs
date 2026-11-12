// Builds the Android app and saves the APK + AAB into ./release (git-ignored).
//
//   npm run android:release   → signed release APK + AAB (needs android/keystore.properties)
//   npm run android:debug     → debug APK only (installs on any phone, not for Google Play)
//
// Works on any PC: finds Java and the Android SDK by itself (env vars, Android Studio,
// or the portable copies in ~/android-build), so you don't need to set paths by hand.
import fs from 'fs';
import os from 'os';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ANDROID = path.join(ROOT, 'android');
const OUT = path.join(ROOT, 'release');
const APP_NAME = 'RelicsOfTheCosmicDust';
const isWin = process.platform === 'win32';
const home = os.homedir();
const mode = process.argv[2] === 'debug' ? 'debug' : 'release';

const exists = (p) => p && fs.existsSync(p);
const firstExisting = (list) => list.find(exists);
const run = (cmd, opts = {}) => {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', ...opts });
};
const fail = (msg) => {
  console.error(`\n✖ ${msg}\n`);
  process.exit(1);
};

// ---- 1. Java (JDK 21) ----
const javaBin = (dir) => path.join(dir, 'bin', isWin ? 'java.exe' : 'java');
const javaHome = firstExisting([
  process.env.JAVA_HOME,
  path.join(home, 'android-build', 'jdk'),
  isWin && 'C:\\Program Files\\Android\\Android Studio\\jbr',
  !isWin && '/Applications/Android Studio.app/Contents/jbr/Contents/Home',
  !isWin && '/opt/android-studio/jbr',
].filter(Boolean).filter((d) => exists(javaBin(d))));
if (!javaHome) {
  fail('Java (JDK 21) not found. Install Android Studio, or set JAVA_HOME to a JDK 21 folder.');
}

// ---- 2. Android SDK → android/local.properties ----
const sdkDir = firstExisting([
  process.env.ANDROID_HOME,
  process.env.ANDROID_SDK_ROOT,
  path.join(home, 'android-build', 'sdk'),
  isWin && path.join(process.env.LOCALAPPDATA || '', 'Android', 'Sdk'),
  !isWin && path.join(home, 'Library', 'Android', 'sdk'),
  !isWin && path.join(home, 'Android', 'Sdk'),
].filter(Boolean));
if (!sdkDir) {
  fail('Android SDK not found. Install Android Studio (it installs the SDK), or set ANDROID_HOME.');
}
fs.writeFileSync(path.join(ANDROID, 'local.properties'), `sdk.dir=${sdkDir.replace(/\\/g, '/')}\n`);

// ---- 3. Signing check (release only) ----
const keystoreProps = path.join(ANDROID, 'keystore.properties');
if (mode === 'release') {
  if (!exists(keystoreProps)) {
    fail(
      'android/keystore.properties is missing, so the release build cannot be signed.\n' +
      '  Copy android/keystore.properties.example to android/keystore.properties and point it\n' +
      '  at your relics-upload.jks file, or run "npm run android:debug" for a test APK.'
    );
  }
  const storeFile = /storeFile=(.*)/.exec(fs.readFileSync(keystoreProps, 'utf8'))?.[1]?.trim();
  if (!exists(storeFile) && !exists(path.join(ANDROID, 'app', storeFile || ''))) {
    fail(`Keystore file not found: ${storeFile}\n  Fix the storeFile path in android/keystore.properties.`);
  }
}

// ---- 4. Build web app → copy into Android project → Gradle ----
console.log(`Java: ${javaHome}\nSDK:  ${sdkDir}\nMode: ${mode}`);
run('npx vite build', { cwd: ROOT });
run('npx cap sync android', { cwd: ROOT });

const gradlew = `"${path.join(ANDROID, isWin ? 'gradlew.bat' : 'gradlew')}"`;
if (!isWin) fs.chmodSync(path.join(ANDROID, 'gradlew'), 0o755);
const tasks = mode === 'release' ? 'assembleRelease bundleRelease' : 'assembleDebug';
run(`${gradlew} ${tasks}`, { cwd: ANDROID, env: { ...process.env, JAVA_HOME: javaHome, ANDROID_HOME: sdkDir } });

// ---- 5. Copy outputs into ./release ----
const gradle = fs.readFileSync(path.join(ANDROID, 'app', 'build.gradle'), 'utf8');
const version = /versionName\s+"([^"]+)"/.exec(gradle)?.[1] || '0';
const build = /versionCode\s+(\d+)/.exec(gradle)?.[1] || '0';
const tag = `v${version}-build${build}`;
fs.mkdirSync(OUT, { recursive: true });

const outputs = path.join(ANDROID, 'app', 'build', 'outputs');
const copies = mode === 'release'
  ? [
      [path.join(outputs, 'apk', 'release', 'app-release.apk'), `${APP_NAME}-${tag}.apk`],
      [path.join(outputs, 'bundle', 'release', 'app-release.aab'), `${APP_NAME}-${tag}.aab`],
    ]
  : [[path.join(outputs, 'apk', 'debug', 'app-debug.apk'), `${APP_NAME}-${tag}-debug.apk`]];

console.log('\n✔ Build finished. Files saved in ./release:');
for (const [from, name] of copies) {
  if (!exists(from)) fail(`Expected build output missing: ${from}`);
  const to = path.join(OUT, name);
  fs.copyFileSync(from, to);
  console.log(`  ${path.relative(ROOT, to)}  (${(fs.statSync(to).size / 1048576).toFixed(1)} MB)`);
}
if (mode === 'release') {
  console.log('\n  .apk → install on a phone   •   .aab → upload to Google Play');
  console.log('  Next Play upload: raise versionCode in android/app/build.gradle first.');
}
