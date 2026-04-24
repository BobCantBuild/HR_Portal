# HR Portal Mobile Deployment Guide

## Part 1: Understanding the Technology

### Capacitor vs React Native
You might hear both terms - here's the difference:

**React Native** - Build a completely native app from scratch using React-like syntax
- Complete native app
- Steeper learning curve
- Better performance for complex apps

**Capacitor** (What we're using) - Wrap your existing React web app as a native app
- Your React app runs inside a WebView (like a browser)
- Easier conversion from web apps
- Perfect for HR Portal - no need to rewrite!
- Can access native features (camera, GPS, etc.)

### What We Did So Far
1. ✅ Built your React web app with Vite
2. ✅ Wrapped it with Capacitor framework
3. ✅ Generated Android native files
4. ✅ Compiled everything into an APK (Android executable)

---

## Part 2: Understanding the Build Process

### The 4-Step Process Every Time You Update Code

```
React Code → Build Web → Sync to Android → Compile APK
   (src/)       (npm)     (capacitor)      (gradle)
```

**Step 1: Update Your React Code**
```bash
# Edit files in src/ folder
# Example: src/App.jsx, src/components/Login.jsx
```

**Step 2: Build the Web Version**
```bash
cd c:\myfiles\IFB\hr portal_3\hr portal_1
npm run build
# Creates dist/ folder with optimized code
```

**Step 3: Sync to Android**
```bash
npx cap sync android
# Copies dist/ files to Android project
```

**Step 4: Compile Android APK**
```bash
cd android
.\gradlew.bat assembleDebug
# Generates app-debug.apk file
```

### Shortcut Command
I added this for you - runs all 4 steps:
```bash
npm run build:apk
```

---

## Part 3: File Structure Explained

```
your-project/
├── src/                          ← React app code
│   ├── App.jsx                  ← Main component
│   ├── components/
│   │   ├── Login.jsx
│   │   └── SidebarMenu.jsx
│   └── main.jsx
│
├── android/                      ← Android native files
│   ├── app/
│   │   └── src/main/
│   │       ├── java/            ← Java files
│   │       └── AndroidManifest.xml
│   └── local.properties          ← Android SDK location
│
├── dist/                         ← Built web app (created after npm run build)
├── capacitor.config.json         ← Capacitor configuration
└── package.json                  ← Project dependencies
```

---

## Part 4: Step-by-Step - Running on Mobile

### Option A: Physical Android Device (Recommended)

#### Prerequisites:
- Android device (phone/tablet)
- USB cable
- USB debugging enabled on device

#### Steps:

**1. Enable USB Debugging on Your Phone**
```
Settings → Developer Options → USB Debugging (toggle ON)
(If Developer Options not visible: Settings → About → tap Build Number 7 times)
```

**2. Connect Phone to Computer**
```
- Plug in USB cable
- Select "Transfer files" mode when phone asks
```

**3. Verify Connection**
```bash
cd c:\myfiles\IFB\hr portal_3\hr portal_1
# Run this command:
# You should see your device listed

# Check platforms installed:
.\android\gradlew.bat --version
```

**4. Build and Deploy**
```bash
cd c:\myfiles\IFB\hr portal_3\hr portal_1\android
.\gradlew.bat assembleDebug
# Wait for BUILD SUCCESSFUL message
```

**5. Install on Phone**
```bash
# The APK is now at:
# android/app/build/outputs/apk/debug/app-debug.apk

# Copy file to phone's Downloads folder OR
# Use adb to install directly:
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

**6. Run the App**
```
On phone: Look for "HR Portal" app icon
Tap it to launch
```

---

### Option B: Android Emulator (If no physical device)

**1. Open Android Studio**
```
Start → Android Studio
```

**2. Create/Start Emulator**
```
In Android Studio:
Tools → Device Manager → Create Virtual Device
Select a device → Download system image → Create
```

**3. Start the Emulator**
```
Device Manager → Click play icon next to your device
Wait 1-2 minutes for it to start
```

**4. Deploy App**
```bash
cd c:\myfiles\IFB\hr portal_3\hr portal_1\android
.\gradlew.bat assembleDebug
# It will automatically install on running emulator
```

---

## Part 5: Making Changes to Your App

### Workflow for Updates

**Scenario: You want to change the login screen**

```
1. Edit src/components/Login.jsx
2. Save file
3. Run: npm run build:apk
   (This does all 4 steps automatically)
4. Wait ~5-10 minutes
5. When BUILD SUCCESSFUL appears:
   - Connect phone again
   - Uninstall old app from phone
   - Install new APK
   - Test
```

---

## Part 6: Common Commands Reference

```bash
# Build and generate APK (all-in-one)
npm run build:apk

# Just build web version
npm run build

# Just sync to Android
npx cap sync android

# Just compile APK
cd android
.\gradlew.bat assembleDebug

# Open Android project in Android Studio
npx cap open android

# Start development web server (for testing in browser)
npm run dev

# Check for build errors
.\android\gradlew.bat build --info
```

---

## Part 7: Troubleshooting

### "APK not installing"
```bash
# Uninstall old version first
adb uninstall com.ifb.hrportal

# Then install new one
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### "Build fails with Java error"
```
We already fixed this! JDK 21 is configured in gradle.properties
If error still appears, Android Studio JBR is being used
```

### "White screen on app launch"
```
Check browser console in Android Studio for errors:
Android Studio → Logcat tab → Filter: "HR Portal"
```

### "App crashes on startup"
```
1. Check file permissions in AndroidManifest.xml
2. Check internet permission is enabled:
   android/app/src/main/AndroidManifest.xml
   Should have: <uses-permission android:name="android.permission.INTERNET" />
```

---

## Part 8: Production Build (When Ready to Deploy)

```bash
# Create signed release APK (not debug)
cd android
.\gradlew.bat assembleRelease

# APK location:
# android/app/build/outputs/apk/release/app-release.apk
# (Smaller, optimized file)
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Run on phone | `npm run build:apk` then connect phone |
| Test in browser | `npm run dev` then visit http://localhost:5173 |
| Check Android logs | `adb logcat` |
| List connected devices | `adb devices` |
| Open in Android Studio | `npx cap open android` |
| Clean build | `cd android && .\gradlew.bat clean` |

---

## Next Steps

1. **Right Now**: Connect your Android phone and run `npm run build:apk`
2. **After It Builds**: Install APK on phone and test
3. **After Testing**: Make changes to src/ files as needed
4. **Then**: Rerun `npm run build:apk` for each update

You're all set to become a mobile developer! 🚀
