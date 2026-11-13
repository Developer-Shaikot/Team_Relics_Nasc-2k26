# Branch workflow

```
            ┌──────────► main         (production: GitHub Pages / Vercel)
  QA ───────┤
            └──────────► android-app  (Android app: APK / AAB for Google Play)
```

| Branch | What it holds | Gets updates from |
|---|---|---|
| `QA` | The web game. All game / WebGL work happens here. | your commits |
| `main` | What is live. **Only** receives QA. | `QA` only |
| `android-app` | QA **plus** the Android app (`android/`, Capacitor, build script). | `QA` |

Rules:

- Never merge `android-app` into `QA` or `main`. The **Branch Guard** GitHub check fails if
  Android files or `@capacitor` packages show up on `QA`/`main`, or if a pull request into
  `main` comes from any branch other than `QA`.
- Android files never exist on `QA`/`main`. Leftover local files after switching branches
  (`android/`, `release/`, keystores) are git-ignored there.

## Everyday commands

**Web work (QA):**

```bash
git checkout QA
git pull origin QA
# ...edit, commit...
git push origin QA
```

**Release the web game (QA → main):** open a pull request `QA → main` on GitHub, or:

```bash
git checkout main
git pull origin main
git merge QA
git push origin main        # deploys to production
git checkout QA
```

**Update the Android app with the latest web game (QA → android-app):**

```bash
git checkout android-app
git pull origin android-app
git merge QA
# raise versionCode in android/app/build.gradle (needed for every Google Play upload)
npm install
npm run android:release     # signed APK + AAB saved in release/
git push origin android-app
git checkout QA
```
