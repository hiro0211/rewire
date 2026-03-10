import { BadgePreviewRow } from '@/components/achievements/BadgePreviewRow';
import { DayCardsRow } from '@/components/achievements/DayCardsRow';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ToolCard } from '@/components/profile/ToolCard';
import { GradientCard } from '@/components/ui/GradientCard';
import { FONT_SIZE, SPACING } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useAchievements } from '@/hooks/achievements/useAchievements';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ROUTES } from '@/lib/routing/routes';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const router = useRouter();
  const { achievements, summary, streak } = useAchievements();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ProfileHeader />

        {/* Badge Preview */}
        <View style={styles.section}>
          <BadgePreviewRow achievements={achievements} />
        </View>

        {/* Achievements Link */}
        <View style={styles.achievementsContainer}>
          <GradientCard>
            <TouchableOpacity
              style={styles.achievementsLink}
              onPress={() => router.push('/achievements')}
              activeOpacity={0.7}
            >
              <View style={styles.achievementsLinkLeft}>
                <Text style={[styles.achievementsLabel, { color: colors.text }]}>Achievements</Text>
                <Text style={[styles.achievementsCount, { color: colors.textSecondary }]}>
                  {summary.unlocked}/{summary.total} Unlocked
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </GradientCard>
        </View>

        {/* Day Cards */}
        <View style={styles.-------------------------------------
Translated Report (Full Report Below)
-------------------------------------

Incident Identifier: 66B8613E-5E2C-4086-99A5-F0D01BA3BCC4
CrashReporter Key:   D0F81157-9676-C73C-C72E-437576B810EE
Hardware Model:      Mac16,10
Process:             rewire [74747]
Path:                /Users/USER/Library/Developer/CoreSimulator/Devices/74BB31BD-C37E-46A4-99E0-A1C96895C715/data/Containers/Bundle/Application/51109643-6A4E-42F4-9937-B2C0B2C57972/rewire.app/rewire
Identifier:          rewire.app.com
Version:             1.0.0 (1)
Code Type:           ARM-64 (Native)
Role:                Foreground
Parent Process:      launchd_sim [34410]
Coalition:           com.apple.CoreSimulator.SimDevice.74BB31BD-C37E-46A4-99E0-A1C96895C715 [63163]
Responsible Process: SimulatorTrampoline [50206]

Date/Time:           2026-03-08 01:36:31.1845 +0900
Launch Time:         2026-03-08 01:33:27.3797 +0900
OS Version:          macOS 15.6 (24G84)
Release Type:        User
Report Version:      104

Exception Type:  EXC_BAD_ACCESS (SIGSEGV)
Exception Subtype: KERN_INVALID_ADDRESS at 0x0000000000000010
Exception Codes: 0x0000000000000001, 0x0000000000000010
VM Region Info: 0x10 is not in any region.  Bytes before following region: 4300193776
      REGION TYPE                    START - END         [ VSIZE] PRT/MAX SHRMOD  REGION DETAIL
      UNUSED SPACE AT START
--->  
      __TEXT                      1004fc000-100500000    [   16K] r-x/r-x SM=COW  /Users/USER/Library/Developer/CoreSimulator/Devices/74BB31BD-C37E-46A4-99E0-A1C96895C715/data/Containers/Bundle/Application/51109643-6A4E-42F4-9937-B2C0B2C57972/rewire.app/rewire
Termination Reason: SIGNAL 11 Segmentation fault: 11
Terminating Process: exc handler [74747]

Triggered by Thread:  0

Thread 0 Crashed::  Dispatch queue: com.apple.main-thread
0   libobjc.A.dylib               	       0x180072c14 objc_msgSend + 20
1   UIKitCore                     	       0x186574ab0 -[UITableView _updateVisibleCellsNow:] + 1100
2   UIKitCore                     	       0x1865852f8 -[UITableView _visibleCellsUsingPresentationValues:] + 336
3   UIKitCore                     	       0x18630d76c -[UIPickerColumnView _allVisibleCells] + 48
4   UIKitCore                     	       0x186315fe4 -[UIPickerView hitTest:withEvent:] + 244
5   React                         	       0x107e2f5a8 -[RCTViewComponentView betterHitTest:withEvent:] + 884
6   React                         	       0x107e2f84c -[RCTViewComponentView hitTest:withEvent:] + 160
7   React                         	       0x107e2f5a8 -[RCTViewComponentView betterHitTest:withEvent:] + 884
8   React                         	       0x107e2f84c -[RCTViewComponentView hitTest:withEvent:] + 160
9   React                         	       0x107e2f5a8 -[RCTViewComponentView betterHitTest:withEvent:] + 884
10  React                         	       0x107e2f84c -[RCTViewComponentView hitTest:withEvent:] + 160
11  React                         	       0x107e2f5a8 -[RCTViewComponentView betterHitTest:withEvent:] + 884
12  React                         	       0x107e2f84c -[RCTViewComponentView hitTest:withEvent:] + 160
13  React                         	       0x107e2f5a8 -[RCTViewComponentView betterHitTest:withEvent:] + 884
14  React                         	       0x107e2f84c -[RCTViewComponentView hitTest:withEvent:] + 160
15  React                         	       0x107e2f5a8 -[RCTViewComponentView betterHitTest:withEvent:] + 884
16  React                         	       0x107e2f84c -[RCTViewComponentView hitTest:withEvent:] + 160
17  UIKitCore                     	       0x1868feeb4 -[UIView(Geometry) _hitTest:withEvent:windowServerHitTestWindow:] + 80
18  UIKitCore                     	       0x1868fedc0 __38-[UIView(Geometry) hitTest:withEvent:]_block_invoke + 88
19  CoreFoundation                	       0x18045a5f4 __NSARRAY_IS_CALLING_OUT_TO_A_BLOCK__ + 16
20  CoreFoundation                	       0x18053dae4 -[__NSSingleObjectArrayI enumerateObjectsWithOptions:usingBlock:] + 88
21  UIKitCore                     	       0x1868fea84 -[UIView(Geometry) hitTest:withEvent:] + 408
22  UIKitCore                     	       0x1868feeb4 -[UIView(Geometry) _hitTest:withEvent:windowServerHitTestWindow:] + 80
23  UIKitCore                     	       0x1868fedc0 __38-[UIView(Geometry) hitTest:withEvent:]_block_invoke + 88
24  CoreFoundation                	       0x18045a5f4 __NSARRAY_IS_CALLING_OUT_TO_A_BLOCK__ + 16
25  CoreFoundation                	       0x18053dae4 -[__NSSingleObjectArrayI enumerateObjectsWithOptions:usingBlock:] + 88
26  UIKitCore                     	       0x1868fea84 -[UIView(Geometry) hitTest:withEvent:] + 408
27  UIKitCore                     	       0x1868feeb4 -[UIView(Geometry) _hitTest:withEvent:windowServerHitTestWindow:] + 80
28  UIKitCore                     	       0x1868fedc0 __38-[UIView(Geometry) hitTest:withEvent:]_block_invoke + 88
29  CoreFoundation                	       0x18045a5f4 __NSARRAY_IS_CALLING_OUT_TO_A_BLOCK__ + 16
30  CoreFoundation                	       0x1803d59c4 -[__NSArrayM enumerateObjectsWithOptions:usingBlock:] + 408
31  UIKitCore                     	       0x1868fea84 -[UIView(Geometry) hitTest:withEvent:] + 408
32  UIKitCore                     	       0x185a92adc -[UILayoutContainerView hitTest:withEvent:] + 56
33  React                         	       0x107e2f5a8 -[RCTViewComponentView betterHitTest:withEvent:] + 884
34  React                         	       0x107e2f84c -[RCTViewComponentView hitTest:withEvent:] + 160
35  rewire.debug.dylib            	       0x1046e41dc -[RNSScreenStackView hitTest:withEvent:] + 752 (RNSScreenStack.mm:1205)
36  React                         	       0x107e2f5a8 -[RCTViewComponentView betterHitTest:withEvent:] + 884
37  React                         	       0x107e2f84c -[RCTViewComponentView hitTest:withEvent:] + 160
38  React                         	       0x107e2f5a8 -[RCTViewComponentView betterHitTest:withEvent:] + 884
39  React                         	       0x107e2f84c -[RCTViewComponentView hitTest:withEvent:] + 160
40  React                         	       0x107e2f5a8 -[RCTViewComponentView betterHitTest:withEvent:] + 884
41  React                         	       0x107e2f84c -[RCTViewComponentView hitTest:withEvent:] + 160
42  UIKitCore                     	       0x1868feeb4 -[UIView(Geometry) _hitTest:withEvent:windowServerHitTestWindow:] + 80
43  UIKitCore                     	       0x1868fedc0 __38-[UIView(Geometry) hitTest:withEvent:]_block_invoke + 88
44  CoreFoundation                	       0x18045a5f4 __NSARRAY_IS_CALLING_OUT_TO_A_BLOCK__ + 16
45  CoreFoundation                	       0x18053dae4 -[__NSSingleObjectArrayI enumerateObjectsWithOptions:usingBlock:] + 88
46  UIKitCore                     	       0x1868fea84 -[UIView(Geometry) hitTest:withEvent:] + 408
47  UIKitCore                     	       0x1868feeb4 -[UIView(Geometry) _hitTest:withEvent:windowServerHitTestWindow:] + 80
48  UIKitCore                     	       0x1868fedc0 __38-[UIView(Geometry) hitTest:withEvent:]_block_invoke + 88
49  CoreFoundation                	       0x18045a5f4 __NSARRAY_IS_CALLING_OUT_TO_A_BLOCK__ + 16
50  CoreFoundation                	       0x18053dae4 -[__NSSingleObjectArrayI enumerateObjectsWithOptions:usingBlock:] + 88
51  UIKitCore                     	       0x1868fea84 -[UIView(Geometry) hitTest:withEvent:] + 408
52  UIKitCore                     	       0x1868feeb4 -[UIView(Geometry) _hitTest:withEvent:windowServerHitTestWindow:] + 80
53  UIKitCore                     	       0x1868fedc0 __38-[UIView(Geometry) hitTest:withEvent:]_block_invoke + 88
54  CoreFoundation                	       0x18045a5f4 __NSARRAY_IS_CALLING_OUT_TO_A_BLOCK__ + 16
55  CoreFoundation                	       0x1803d59c4 -[__NSArrayM enumerateObjectsWithOptions:usingBlock:] + 408
56  UIKitCore                     	       0x1868fea84 -[UIView(Geometry) hitTest:withEvent:] + 408
57  UIKitCore                     	       0x1868c3d08 -[UIDropShadowView hitTest:withEvent:] + 244
58  UIKitCore                     	       0x1868feeb4 -[UIView(Geometry) _hitTest:withEvent:windowServerHitTestWindow:] + 80
59  UIKitCore                     	       0x1868fedc0 __38-[UIView(Geometry) hitTest:withEvent:]_block_invoke + 88
60  CoreFoundation                	       0x18045a5f4 __NSARRAY_IS_CALLING_OUT_TO_A_BLOCK__ + 16
61  CoreFoundation                	       0x18053dae4 -[__NSSingleObjectArrayI enumerateObjectsWithOptions:usingBlock:] + 88
62  UIKitCore                     	       0x1868fea84 -[UIView(Geometry) hitTest:withEvent:] + 408
63  UIKitCore                     	       0x1868d9ea0 -[UITransitionView hitTest:withEvent:] + 52
64  UIKitCore                     	       0x1868feeb4 -[UIView(Geometry) _hitTest:withEvent:windowServerHitTestWindow:] + 80
65  UIKitCore                     	       0x1868fedc0 __38-[UIView(Geometry) hitTest:withEvent:]_block_invoke + 88
66  CoreFoundation                	       0x18045a5f4 __NSARRAY_IS_CALLING_OUT_TO_A_BLOCK__ + 16
67  CoreFoundation                	       0x18053dae4 -[__NSSingleObjectArrayI enumerateObjectsWithOptions:usingBlock:] + 88
68  UIKitCore                     	       0x1868fea84 -[UIView(Geometry) hitTest:withEvent:] + 408
69  UIKitCore                     	       0x1868feeb4 -[UIView(Geometry) _hitTest:withEvent:windowServerHitTestWindow:] + 80
70  UIKitCore                     	       0x186392828 -[UIWindow _hitTestLocation:sceneLocationZ:inScene:withWindowServerHitTestWindow:event:] + 92
71  UIKitCore                     	       0x186392698 __75+[UIWindow _hitTestToPoint:scenePointZ:forEvent:windowServerHitTestWindow:]_block_invoke + 64
72  UIKitCore                     	       0x1865ef0bc __64-[UIWindowScene _topVisibleWindowEnumeratingAsCopy:passingTest:]_block_invoke + 108
73  UIKitCore                     	       0x1865ef2b4 -[UIWindowScene _enumerateWindowsIncludingInternalWindows:onlyVisibleWindows:asCopy:stopped:withBlock:] + 292
74  UIKitCore                     	       0x1865eefd0 -[UIWindowScene _topVisibleWindowEnumeratingAsCopy:passingTest:] + 364
75  UIKitCore                     	       0x186392604 +[UIWindow _hitTestToPoint:scenePointZ:forEvent:windowServerHitTestWindow:] + 192
76  UIKitCore                     	       0x186392908 -[UIWindow _targetWindowForPathIndex:atPoint:scenePointZ:forEvent:windowServerHitTestWindow:] + 184
77  UIKitCore                     	       0x18620da38 __startNewUITouch + 632
78  UIKitCore                     	       0x18620caa0 ____updateTouchesWithDigitizerEventAndDetermineIfShouldSend_block_invoke.28 + 344
79  UIKitCore                     	       0x1869eb6ec _UIEventHIDEnumerateChildren + 160
80  UIKitCore                     	       0x1862118b8 __dispatchPreprocessedEventFromEventQueue + 2792
81  UIKitCore                     	       0x186213f24 __processEventQueue + 4800
82  UIKitCore                     	       0x18620c4d0 updateCycleEntry + 168
83  UIKitCore                     	       0x18582f378 _UIUpdateSequenceRunNext + 120
84  UIKitCore                     	       0x1862640a4 schedulerStepScheduledMainSectionContinue + 56
85  UpdateCycle                   	       0x2501912b4 UC::DriverCore::continueProcessing() + 80
86  CoreFoundation                	       0x18041a4ac __CFMachPortPerform + 164
87  CoreFoundation                	       0x180456aa8 __CFRUNLOOP_IS_CALLING_OUT_TO_A_SOURCE1_PERFORM_FUNCTION__ + 56
88  CoreFoundation                	       0x1804560c0 __CFRunLoopDoSource1 + 480
89  CoreFoundation                	       0x180455188 __CFRunLoopRun + 2100
90  CoreFoundation                	       0x18044fcec _CFRunLoopRunSpecificWithOptions + 496
91  GraphicsServices              	       0x192a669bc GSEventRunModal + 116
92  UIKitCore                     	       0x186348574 -[UIApplication _run] + 772
93  UIKitCore                     	       0x18634c79c UIApplicationMain + 124
94  rewire.debug.dylib            	       0x103f08fe8 __debug_main_executable_dylib_entry_point + 64 (AppDelegate.swift:7)
95  ???                           	       0x10075d3d0 ???
96  dyld                          	       0x100632b98 start + 6076

Thread 1:: com.apple.uikit.eventfetch-thread
0   libsystem_kernel.dylib        	       0x100594b70 mach_msg2_trap + 8
1   libsystem_kernel.dylib        	       0x1005a5fac mach_msg2_internal + 72
2   libsystem_kernel.dylib        	       0x10059cc28 mach_msg_overwrite + 480
3   libsystem_kernel.dylib        	       0x100594ed8 mach_msg + 20
4   CoreFoundation                	       0x180455c04 __CFRunLoopServiceMachPort + 156
5   CoreFoundation                	       0x180454dbc __CFRunLoopRun + 1128
6   CoreFoundation                	       0x18044fcec _CFRunLoopRunSpecificWithOptions + 496
7   Foundation                    	       0x18110be48 -[NSRunLoop(NSRunLoop) runMode:beforeDate:] + 208
8   Foundation                    	       0x18110c068 -[NSRunLoop(NSRunLoop) runUntilDate:] + 60
9   UIKitCore                     	       0x18609fc50 -[UIEventFetcher threadMain] + 392
10  Foundation                    	       0x181132d14 __NSThread__start__ + 716
11  libsystem_pthread.dylib       	       0x10051a5f0 _pthread_start + 104
12  libsystem_pthread.dylib       	       0x100515998 thread_start + 8

Thread 2:
0   libsystem_pthread.dylib       	       0x100515984 start_wqthread + 0

Thread 3:: com.apple.CFStream.LegacyThread
0   libsystem_kernel.dylib        	       0x100594b70 mach_msg2_trap + 8
1   libsystem_kernel.dylib        	       0x1005a5fac mach_msg2_internal + 72
2   libsystem_kernel.dylib        	       0x10059cc28 mach_msg_overwrite + 480
3   libsystem_kernel.dylib        	       0x100594ed8 mach_msg + 20
4   CoreFoundation                	       0x180455c04 __CFRunLoopServiceMachPort + 156
5   CoreFoundation                	       0x180454dbc __CFRunLoopRun + 1128
6   CoreFoundation                	       0x18044fcec _CFRunLoopRunSpecificWithOptions + 496
7   CoreFoundation                	       0x180474184 _legacyStreamRunLoop_workThread + 260
8   libsystem_pthread.dylib       	       0x10051a5f0 _pthread_start + 104
9   libsystem_pthread.dylib       	       0x100515998 thread_start + 8

Thread 4:: com.apple.NSURLConnectionLoader
0   libsystem_kernel.dylib        	       0x100594b70 mach_msg2_trap + 8
1   libsystem_kernel.dylib        	       0x1005a5fac mach_msg2_internal + 72
2   libsystem_kernel.dylib        	       0x10059cc28 mach_msg_overwrite + 480
3   libsystem_kernel.dylib        	       0x100594ed8 mach_msg + 20
4   CoreFoundation                	       0x180455c04 __CFRunLoopServiceMachPort + 156
5   CoreFoundation                	       0x180454dbc __CFRunLoopRun + 1128
6   CoreFoundation                	       0x18044fcec _CFRunLoopRunSpecificWithOptions + 496
7   CFNetwork                     	       0x184eccd6c +[__CFN_CoreSchedulingSetRunnable _run:] + 368
8   Foundation                    	       0x181132d14 __NSThread__start__ + 716
9   libsystem_pthread.dylib       	       0x10051a5f0 _pthread_start + 104
10  libsystem_pthread.dylib       	       0x100515998 thread_start + 8

Thread 5:
0   libsystem_pthread.dylib       	       0x100515984 start_wqthread + 0

Thread 6:
0   libsystem_pthread.dylib       	       0x100515984 start_wqthread + 0

Thread 7:: com.facebook.react.runtime.JavaScript
0   libsystem_kernel.dylib        	       0x100594b70 mach_msg2_trap + 8
1   libsystem_kernel.dylib        	       0x1005a5fac mach_msg2_internal + 72
2   libsystem_kernel.dylib        	       0x10059cc28 mach_msg_overwrite + 480
3   libsystem_kernel.dylib        	       0x100594ed8 mach_msg + 20
4   CoreFoundation                	       0x180455c04 __CFRunLoopServiceMachPort + 156
5   CoreFoundation                	       0x180454dbc __CFRunLoopRun + 1128
6   CoreFoundation                	       0x18044fcec _CFRunLoopRunSpecificWithOptions + 496
7   React                         	       0x108100508 +[RCTJSThreadManager runRunLoop] + 292
8   Foundation                    	       0x181132d14 __NSThread__start__ + 716
9   libsystem_pthread.dylib       	       0x10051a5f0 _pthread_start + 104
10  libsystem_pthread.dylib       	       0x100515998 thread_start + 8

Thread 8:: hades
0   libsystem_kernel.dylib        	       0x100598014 __psynch_cvwait + 8
1   libsystem_pthread.dylib       	       0x10051aab8 _pthread_cond_wait + 976
2   libc++.1.dylib                	       0x180335714 std::__1::condition_variable::wait(std::__1::unique_lock<std::__1::mutex>&) + 28
3   hermes                        	       0x10178b0dc hermes::vm::HadesGC::Executor::worker() + 112
4   hermes                        	       0x10178b040 void* std::__1::__thread_proxy[abi:nn180100]<std::__1::tuple<std::__1::unique_ptr<std::__1::__thread_struct, std::__1::default_delete<std::__1::__thread_struct>>, hermes::vm::HadesGC::Executor::Executor()::'lambda'()>>(void*) + 44
5   libsystem_pthread.dylib       	       0x10051a5f0 _pthread_start + 104
6   libsystem_pthread.dylib       	       0x100515998 thread_start + 8

Thread 9:
0   libsystem_pthread.dylib       	       0x100515984 start_wqthread + 0

Thread 10:: com.facebook.SocketRocket.NetworkThread
0   libsystem_kernel.dylib        	       0x100594b70 mach_msg2_trap + 8
1   libsystem_kernel.dylib        	       0x1005a5fac mach_msg2_internal + 72
2   libsystem_kernel.dylib        	       0x10059cc28 mach_msg_overwrite + 480
3   libsystem_kernel.dylib        	       0x100594ed8 mach_msg + 20
4   CoreFoundation                	       0x180455c04 __CFRunLoopServiceMachPort + 156
5   CoreFoundation                	       0x180454dbc __CFRunLoopRun + 1128
6   CoreFoundation                	       0x18044fcec _CFRunLoopRunSpecificWithOptions + 496
7   Foundation                    	       0x18110be48 -[NSRunLoop(NSRunLoop) runMode:beforeDate:] + 208
8   ReactNativeDependencies       	       0x100c05c10 -[SRRunLoopThread main] + 260
9   Foundation                    	       0x181132d14 __NSThread__start__ + 716
10  libsystem_pthread.dylib       	       0x10051a5f0 _pthread_start + 104
11  libsystem_pthread.dylib       	       0x100515998 thread_start + 8

Thread 11:
0   libsystem_pthread.dylib       	       0x100515984 start_wqthread + 0

Thread 12:: com.apple.CFSocket.private
0   libsystem_kernel.dylib        	       0x10059ef98 __select + 8
1   CoreFoundation                	       0x1804648ac __CFSocketManager + 680
2   libsystem_pthread.dylib       	       0x10051a5f0 _pthread_start + 104
3   libsystem_pthread.dylib       	       0x100515998 thread_start + 8

Thread 13:: hades
0   libsystem_kernel.dylib        	       0x100598014 __psynch_cvwait + 8
1   libsystem_pthread.dylib       	       0x10051aab8 _pthread_cond_wait + 976
2   libc++.1.dylib                	       0x180335714 std::__1::condition_variable::wait(std::__1::unique_lock<std::__1::mutex>&) + 28
3   hermes                        	       0x10178b0dc hermes::vm::HadesGC::Executor::worker() + 112
4   hermes                        	       0x10178b040 void* std::__1::__thread_proxy[abi:nn180100]<std::__1::tuple<std::__1::unique_ptr<std::__1::__thread_struct, std::__1::default_delete<std::__1::__thread_struct>>, hermes::vm::HadesGC::Executor::Executor()::'lambda'()>>(void*) + 44
5   libsystem_pthread.dylib       	       0x10051a5f0 _pthread_start + 104
6   libsystem_pthread.dylib       	       0x100515998 thread_start + 8

Thread 14:
0   libsystem_pthread.dylib       	       0x100515984 start_wqthread + 0

Thread 15:
0   libsystem_pthread.dylib       	       0x100515984 start_wqthread + 0

Thread 16:
0   libsystem_pthread.dylib       	       0x100515984 start_wqthread + 0

Thread 17:
0   libsystem_pthread.dylib       	       0x100515984 start_wqthread + 0

Thread 18:
0   libsystem_pthread.dylib       	       0x100515984 start_wqthread + 0

Thread 19:: com.apple.UIKit.inProcessAnimationManager
0   libsystem_kernel.dylib        	       0x100594aec semaphore_wait_trap + 8
1   libdispatch.dylib             	       0x1801c2258 _dispatch_sema4_wait + 24
2   libdispatch.dylib             	       0x1801c27e0 _dispatch_semaphore_wait_slow + 128
3   UIKitCore                     	       0x1856619c0 0x18519e000 + 4995520
4   UIKitCore                     	       0x185665e88 0x18519e000 + 5013128
5   UIKitCore                     	       0x1852f85d0 0x18519e000 + 1418704
6   Foundation                    	       0x181132d14 __NSThread__start__ + 716
7   libsystem_pthread.dylib       	       0x10051a5f0 _pthread_start + 104
8   libsystem_pthread.dylib       	       0x100515998 thread_start + 8


Thread 0 crashed with ARM Thread State (64-bit):
    x0: 0x0000000165214200   x1: 0x00000001fb75e5ef   x2: 0x0000000100779fc0   x3: 0x0000000000000017
    x4: 0x0000600003e15d80   x5: 0x0000000000000013   x6: 0x0000000000000000   x7: 0x0000000000000008
    x8: 0x00000000001a0200   x9: 0x00000000000b0200  x10: 0x00000001007af148  x11: 0x0000000000000002
   x12: 0x000000008000011f  x13: 0x00000000ffff8017  x14: 0x0000000000000000  x15: 0x0000000000000000
   x16: 0x0000000000000000  x17: 0x000000000000001e  x18: 0x0000000000000000  x19: 0x0000000165214200
   x20: 0x00000001f288b000  x21: 0x000000000000000a  x22: 0x0000000000000032  x23: 0x0000000000000001
   x24: 0x0000000165214e58  x25: 0x000000016f8fb220  x26: 0x0000000165214aa0  x27: 0x0000000000000000
   x28: 0x0000000000000004   fp: 0x000000016f8fb320   lr: 0x0000000186574ab0
    sp: 0x000000016f8fb170   pc: 0x0000000180072c14 cpsr: 0x20000000
   far: 0x0000000000000010  esr: 0x92000006 (Data Abort) byte read Translation fault

Binary Images:
       0x10062c000 -        0x1006c7fff dyld (*) <3247e185-ced2-36ff-9e29-47a77c23e004> /usr/lib/dyld
       0x1004fc000 -        0x1004fffff rewire.app.com (1.0.0) <08d4b719-8f27-3290-9e5c-e1b00a9445d3> /Users/USER/Library/Developer/CoreSimulator/Devices/74BB31BD-C37E-46A4-99E0-A1C96895C715/data/Containers/Bundle/Application/51109643-6A4E-42F4-9937-B2C0B2C57972/rewire.app/rewire
       0x103f04000 -        0x10526bfff rewire.debug.dylib (*) <5d4784b7-0de2-3e13-8abb-961b27e9539e> /Users/USER/Library/Developer/CoreSimulator/Devices/74BB31BD-C37E-46A4-99E0-A1C96895C715/data/Containers/Bundle/Application/51109643-6A4E-42F4-9937-B2C0B2C57972/rewire.app/rewire.debug.dylib
       0x10765c000 -        0x10846ffff react-native.React (1.0) <ac487519-d12b-3ed8-b013-5010ec9bc032> /Users/USER/Library/Developer/CoreSimulator/Devices/74BB31BD-C37E-46A4-99E0-A1C96895C715/data/Containers/Bundle/Application/51109643-6A4E-42F4-9937-B2C0B2C57972/rewire.app/Frameworks/React.framework/React
       0x100bac000 -        0x100d13fff third-party.ReactNativeDependencies (1.0) <1c45f8d4-664a-3470-8fd0-341a04b1a28c> /Users/USER/Library/Developer/CoreSimulator/Devices/74BB31BD-C37E-46A4-99E0-A1C96895C715/data/Containers/Bundle/Application/51109643-6A4E-42F4-9937-B2C0B2C57972/rewire.app/Frameworks/ReactNativeDependencies.framework/ReactNativeDependencies
       0x1015d8000 -        0x10195ffff dev.hermesengine.iphonesimulator (0.12.0) <944bd49b-ad2e-3e3c-96ac-0603909fdd97> /Users/USER/Library/Developer/CoreSimulator/Devices/74BB31BD-C37E-46A4-99E0-A1C96895C715/data/Containers/Bundle/Application/51109643-6A4E-42F4-9937-B2C0B2C57972/rewire.app/Frameworks/hermes.framework/hermes
       0x100574000 -        0x10057bfff libsystem_platform.dylib (*) <43ef9892-7edb-34c5-88d6-2c79fa2e7bd3> /usr/lib/system/libsystem_platform.dylib
       0x100594000 -        0x1005cffff libsystem_kernel.dylib (*) <0960cf7e-fb2e-3068-998e-131a316ed666> /usr/lib/system/libsystem_kernel.dylib
       0x100514000 -        0x100523fff libsystem_pthread.dylib (*) <421e2342-6729-3a9f-a439-29ad130875b3> /usr/lib/system/libsystem_pthread.dylib
       0x100f54000 -        0x100f5ffff libobjc-trampolines.dylib (*) <997b234d-5c24-3e21-97d6-33b6853818c0> /Volumes/VOLUME/*/libobjc-trampolines.dylib
       0x180070000 -        0x1800ad297 libobjc.A.dylib (*) <880f8664-cd53-3912-bdd5-5e3159295f7d> /Volumes/VOLUME/*/libobjc.A.dylib
       0x18519e000 -        0x1873c071f com.apple.UIKitCore (1.0) <196154ff-ba04-33cd-9277-98f9aa0b7499> /Volumes/VOLUME/*/UIKitCore.framework/UIKitCore
       0x1803c3000 -        0x1807df37f com.apple.CoreFoundation (6.9) <4f6d050d-95ee-3a95-969c-3a98b29df6ff> /Volumes/VOLUME/*/CoreFoundation.framework/CoreFoundation
       0x250190000 -        0x250191e9f com.apple.UpdateCycle (1) <e2e29a67-7d1d-333d-9227-e405451edb7d> /Volumes/VOLUME/*/UpdateCycle.framework/UpdateCycle
       0x192a64000 -        0x192a6bdbf com.apple.GraphicsServices (1.0) <4e5b0462-6170-3367-9475-4ff8b8dfe4e6> /Volumes/VOLUME/*/GraphicsServices.framework/GraphicsServices
               0x0 - 0xffffffffffffffff ??? (*) <00000000-0000-0000-0000-000000000000> ???
       0x18085f000 -        0x1815d18df com.apple.Foundation (6.9) <c153116f-dd31-3fa9-89bb-04b47c1fa83d> /Volumes/VOLUME/*/Foundation.framework/Foundation
       0x184ccc000 -        0x18503e15f com.apple.CFNetwork (1.0) <1bb7d015-7687-34a6-93c8-7cc24655033a> /Volumes/VOLUME/*/CFNetwork.framework/CFNetwork
       0x180314000 -        0x18039d52f libc++.1.dylib (*) <21743e1c-a39b-3649-afd2-d1613ce81d75> /Volumes/VOLUME/*/libc++.1.dylib
       0x1801bf000 -        0x1802041bf libdispatch.dylib (*) <ec9ecf10-959d-3da1-a055-6de970159b9d> /Volumes/VOLUME/*/libdispatch.dylib

EOF

-----------
Full Report
-----------

{"app_name":"rewire","timestamp":"2026-03-08 01:36:35.00 +0900","app_version":"1.0.0","slice_uuid":"08d4b719-8f27-3290-9e5c-e1b00a9445d3","build_version":"1","platform":7,"bundleID":"rewire.app.com","share_with_app_devs":0,"is_first_party":0,"bug_type":"309","os_version":"macOS 15.6 (24G84)","roots_installed":0,"name":"rewire","incident_id":"66B8613E-5E2C-4086-99A5-F0D01BA3BCC4"}
{
  "uptime" : 780000,
  "procRole" : "Foreground",
  "version" : 2,
  "userID" : 501,
  "deployVersion" : 210,
  "modelCode" : "Mac16,10",
  "coalitionID" : 63163,
  "osVersion" : {
    "train" : "macOS 15.6",
    "build" : "24G84",
    "releaseType" : "User"
  },
  "captureTime" : "2026-03-08 01:36:31.1845 +0900",
  "codeSigningMonitor" : 2,
  "incident" : "66B8613E-5E2C-4086-99A5-F0D01BA3BCC4",
  "pid" : 74747,
  "translated" : false,
  "cpuType" : "ARM-64",
  "roots_installed" : 0,
  "bug_type" : "309",
  "procLaunch" : "2026-03-08 01:33:27.3797 +0900",
  "procStartAbsTime" : 18726337739081,
  "procExitAbsTime" : 18730748159645,
  "procName" : "rewire",
  "procPath" : "\/Users\/USER\/Library\/Developer\/CoreSimulator\/Devices\/74BB31BD-C37E-46A4-99E0-A1C96895C715\/data\/Containers\/Bundle\/Application\/51109643-6A4E-42F4-9937-B2C0B2C57972\/rewire.app\/rewire",
  "bundleInfo" : {"CFBundleShortVersionString":"1.0.0","CFBundleVersion":"1","CFBundleIdentifier":"rewire.app.com"},
  "storeInfo" : {"deviceIdentifierForVendor":"607F8948-78D2-5BAA-9FA3-052ECB7DDDD5","thirdParty":true},
  "parentProc" : "launchd_sim",
  "parentPid" : 34410,
  "coalitionName" : "com.apple.CoreSimulator.SimDevice.74BB31BD-C37E-46A4-99E0-A1C96895C715",
  "crashReporterKey" : "D0F81157-9676-C73C-C72E-437576B810EE",
  "appleIntelligenceStatus" : {"state":"available"},
  "responsiblePid" : 50206,
  "responsibleProc" : "SimulatorTrampoline",
  "codeSigningID" : "rewire.app.com",
  "codeSigningTeamID" : "",
  "codeSigningFlags" : 570425857,
  "codeSigningValidationCategory" : 10,
  "codeSigningTrustLevel" : 4294967295,
  "codeSigningAuxiliaryInfo" : 0,
  "instructionByteStream" : {"beforePC":"HyAD1R8gA9UfIAPVHyAD1R8gA9UfAADxTQMAVA4AQPnQzX2S7wMQqg==","atPC":"CgpA+Uv9cNNKvUCSLAALCk0RDIuxJf+oPwEB62EAAFQxAhDKIAIf1g=="},
  "bootSessionUUID" : "65F56E5F-7F5B-4125-B17D-2B0D7FDE06BC",
  "sip" : "enabled",
  "vmRegionInfo" : "0x10 is not in any region.  Bytes before following region: 4300193776\n      REGION TYPE                    START - END         [ VSIZE] PRT\/MAX SHRMOD  REGION DETAIL\n      UNUSED SPACE AT START\n--->  \n      __TEXT                      1004fc000-100500000    [   16K] r-x\/r-x SM=COW  \/Users\/USER\/Library\/Developer\/CoreSimulator\/Devices\/74BB31BD-C37E-46A4-99E0-A1C96895C715\/data\/Containers\/Bundle\/Application\/51109643-6A4E-42F4-9937-B2C0B2C57972\/rewire.app\/rewire",
  "exception" : {"codes":"0x0000000000000001, 0x0000000000000010","rawCodes":[1,16],"type":"EXC_BAD_ACCESS","signal":"SIGSEGV","subtype":"KERN_INVALID_ADDRESS at 0x0000000000000010"},
  "termination" : {"flags":0,"code":11,"namespace":"SIGNAL","indicator":"Segmentation fault: 11","byProc":"exc handler","byPid":74747},
  "vmregioninfo" : "0x10 is not in any region.  Bytes before following region: 4300193776\n      REGION TYPE                    START - END         [ VSIZE] PRT\/MAX SHRMOD  REGION DETAIL\n      UNUSED SPACE AT START\n--->  \n      __TEXT                      1004fc000-100500000    [   16K] r-x\/r-x SM=COW  \/Users\/USER\/Library\/Developer\/CoreSimulator\/Devices\/74BB31BD-C37E-46A4-99E0-A1C96895C715\/data\/Containers\/Bundle\/Application\/51109643-6A4E-42F4-9937-B2C0B2C57972\/rewire.app\/rewire",
  "extMods" : {"caller":{"thread_create":0,"thread_set_state":0,"task_for_pid":0},"system":{"thread_create":0,"thread_set_state":1156,"task_for_pid":58},"targeted":{"thread_create":0,"thread_set_state":0,"task_for_pid":0},"warnings":0},
  "faultingThread" : 0,
  "threads" : [{"triggered":true,"id":37836353,"threadState":{"x":[{"value":5991645696},{"value":8513775087,"objc-selector":"_endSuspendingUpdates"},{"value":4302806976},{"value":23},{"value":105553181367680},{"value":19},{"value":0},{"value":8},{"value":1704448},{"value":721408},{"value":4303024456},{"value":2},{"value":2147483935},{"value":4294934551},{"value":0},{"value":0},{"value":0},{"value":30},{"value":0},{"value":5991645696},{"value":8364011520,"symbolLocation":60,"symbol":"_MergedGlobals"},{"value":10},{"value":50},{"value":1},{"value":5991648856},{"value":6166655520},{"value":5991647904},{"value":0},{"value":4}],"flavor":"ARM_THREAD_STATE64","lr":{"value":6548834992},"cpsr":{"value":536870912},"fp":{"value":6166655776},"sp":{"value":6166655344},"esr":{"value":2449473542,"description":"(Data Abort) byte read Translation fault"},"pc":{"value":6442920980,"matchesCrashFrame":1},"far":{"value":16}},"queue":"com.apple.main-thread","frames":[{"imageOffset":11284,"symbol":"objc_msgSend","symbolLocation":20,"imageIndex":10},{"imageOffset":20802224,"symbol":"-[UITableView _updateVisibleCellsNow:]","symbolLocation":1100,"imageIndex":11},{"imageOffset":20869880,"symbol":"-[UITableView _visibleCellsUsingPresentationValues:]","symbolLocation":336,"imageIndex":11},{"imageOffset":18282348,"symbol":"-[UIPickerColumnView _allVisibleCells]","symbolLocation":48,"imageIndex":11},{"imageOffset":18317284,"symbol":"-[UIPickerView hitTest:withEvent:]","symbolLocation":244,"imageIndex":11},{"imageOffset":8205736,"symbol":"-[RCTViewComponentView betterHitTest:withEvent:]","symbolLocation":884,"imageIndex":3},{"imageOffset":8206412,"symbol":"-[RCTViewComponentView hitTest:withEvent:]","symbolLocation":160,"imageIndex":3},{"imageOffset":8205736,"symbol":"-[RCTViewComponentView betterHitTest:withEvent:]","symbolLocation":884,"imageIndex":3},{"imageOffset":8206412,"symbol":"-[RCTViewComponentView hitTest:withEvent:]","symbolLocation":160,"imageIndex":3},{"imageOffset":8205736,"symbol":"-[RCTViewComponentView betterHitTest:withEvent:]","symbolLocation":884,"imageIndex":3},{"imageOffset":8206412,"symbol":"-[RCTViewComponentView hitTest:withEvent:]","symbolLocation":160,"imageIndex":3},{"imageOffset":8205736,"symbol":"-[RCTViewComponentView betterHitTest:withEvent:]","symbolLocation":884,"imageIndex":3},{"imageOffset":8206412,"symbol":"-[RCTViewComponentView hitTest:withEvent:]","symbolLocation":160,"imageIndex":3},{"imageOffset":8205736,"symbol":"-[RCTViewComponentView betterHitTest:withEvent:]","symbolLocation":884,"imageIndex":3},{"imageOffset":8206412,"symbol":"-[RCTViewComponentView hitTest:withEvent:]","symbolLocation":160,"imageIndex":3},{"imageOffset":8205736,"symbol":"-[RCTViewComponentView betterHitTest:withEvent:]","symbolLocation":884,"imageIndex":3},{"imageOffset":8206412,"symbol":"-[RCTViewComponentView hitTest:withEvent:]","symbolLocation":160,"imageIndex":3},{"imageOffset":24514228,"symbol":"-[UIView(Geometry) _hitTest:withEvent:windowServerHitTestWindow:]","symbolLocation":80,"imageIndex":11},{"imageOffset":24513984,"symbol":"__38-[UIView(Geometry) hitTest:withEvent:]_block_invoke","symbolLocation":88,"imageIndex":11},{"imageOffset":620020,"symbol":"__NSARRAY_IS_CALLING_OUT_TO_A_BLOCK__","symbolLocation":16,"imageIndex":12},{"imageOffset":1551076,"symbol":"-[__NSSingleObjectArrayI enumerateObjectsWithOptions:usingBlock:]","symbolLocation":88,"imageIndex":12},{"imageOffset":24513156,"symbol":"-[UIView(Geometry) hitTest:withEvent:]","symbolLocation":408,"imageIndex":11},{"imageOffset":24514228,"symbol":"-[UIView(Geometry) _hitTest:withEvent:windowServerHitTestWindow:]","symbolLocation":80,"imageIndex":11},{"imageOffset":24513984,"symbol":"__38-[UIView(Geometry) hitTest:withEvent:]_block_invoke","symbolLocation":88,"imageIndex":11},{"imageOffset":620020,"symbol":"__NSARRAY_IS_CALLING_OUT_TO_A_BLOCK__","symbolLocation":16,"imageIndex":12},{"imageOffset":1551076,"symbol":"-[__NSSingleObjectArrayI enumerateObjectsWithOptions:usingBlock:]","symbolLocation":88,"imageIndex":12},{"imageOffset":24513156,"symbol":"-[UIView(Geometry) hitTest:withEvent:]","symbolLocation":408,"imageIndex":11},{"imageOffset":24514228,"symbol":"-[UIView(Geometry) _hitTest:withEvent:windowServerHitTestWindow:]","symbolLocation":80,"imageIndex":11},{"imageOffset":24513984,"symbol":"__38-[UIView(Geometry) hitTest:withEvent:]_block_invoke","symbolLocation":88,"imageIndex":11},{"imageOffset":620020,"symbol":"__NSARRAY_IS_CALLING_OUT_TO_A_BLOCK__","symbolLocation":16,"imageIndex":12},{"imageOffset":76228,"symbol":"-[__NSArrayM enumerateObjectsWithOptions:usingBlock:]","symbolLocation":408,"imageIndex":12},{"imageOffset":24513156,"symbol":"-[UIView(Geometry) hitTest:withEvent:]","symbolLocation":408,"imageIndex":11},{"imageOffset":9390812,"symbol":"-[UILayoutContainerView hitTest:withEvent:]","symbolLocation":56,"imageIndex":11},{"imageOffset":8205736,"symbol":"-[RCTViewComponentView betterHitTest:withEvent:]","symbolLocation":884,"imageIndex":3},{"imageOffset":8206412,"symbol":"-[RCTViewComponentView hitTest:withEvent:]","symbolLocation":160,"imageIndex":3},{"imageOffset":8258012,"sourceLine":1205,"sourceFile":"RNSScreenStack.mm","symbol":"-[RNSScreenStackView hitTest:withEvent:]","imageIndex":2,"symbolLocation":752},{"imageOffset":8205736,"symbol":"-[RCTViewComponentView betterHitTest:withEvent:]","symbolLocation":884,"imageIndex":3},{"imageOffset":8206412,"symbol":"-[RCTViewComponentView hitTest:withEvent:]","symbolLocation":160,"imageIndex":3},{"imageOffset":8205736,"symbol":"-[RCTViewComponentView betterHitTest:withEvent:]","symbolLocation":884,"imageIndex":3},{"imageOffset":8206412,"symbol":"-[RCTViewComponentView hitTest:withEvent:]","symbolLocation":160,"imageIndex":3},{"imageOffset":8205736,"symbol":"-[RCTViewComponentView betterHitTest:withEvent:]","symbolLocation":884,"imageIndex":3},{"imageOffset":8206412,"symbol":"-[RCTViewComponentView hitTest:withEvent:]","symbolLocation":160,"imageIndex":3},{"imageOffset":24514228,"symbol":"-[UIView(Geometry) _hitTest:withEvent:windowServerHitTestWindow:]","symbolLocation":80,"imageIndex":11},{"imageOffset":24513984,"symbol":"__38-[UIView(Geometry) hitTest:withEvent:]_block_invoke","symbolLocation":88,"imageIndex":11},{"imageOffset":620020,"symbol":"__NSARRAY_IS_CALLING_OUT_TO_A_BLOCK__","symbolLocation":16,"imageIndex":12},{"imageOffset":1551076,"symbol":"-[__NSSingleObjectArrayI enumerateObjectsWithOptions:usingBlock:]","symbolLocation":88,"imageIndex":12},{"imageOffset":24513156,"symbol":"-[UIView(Geometry) hitTest:withEvent:]","symbolLocation":408,"imageIndex":11},{"imageOffset":24514228,"symbol":"-[UIView(Geometry) _hitTest:withEvent:windowServerHitTestWindow:]","symbolLocation":80,"imageIndex":11},{"imageOffset":24513984,"symbol":"__38-[UIView(Geometry) hitTest:withEvent:]_block_invoke","symbolLocation":88,"imageIndex":11},{"imageOffset":620020,"symbol":"__NSARRAY_IS_CALLING_OUT_TO_A_BLOCK__","symbolLocation":16,"imageIndex":12},{"imageOffset":1551076,"symbol":"-[__NSSingleObjectArrayI enumerateObjectsWithOptions:usingBlock:]","symbolLocation":88,"imageIndex":12},{"imageOffset":24513156,"symbol":"-[UIView(Geometry) hitTest:withEvent:]","symbolLocation":408,"imageIndex":11},{"imageOffset":24514228,"symbol":"-[UIView(Geometry) _hitTest:withEvent:windowServerHitTestWindow:]","symbolLocation":80,"imageIndex":11},{"imageOffset":24513984,"symbol":"__38-[UIView(Geometry) hitTest:withEvent:]_block_invoke","symbolLocation":88,"imageIndex":11},{"imageOffset":620020,"symbol":"__NSARRAY_IS_CALLING_OUT_TO_A_BLOCK__","symbolLocation":16,"imageIndex":12},{"imageOffset":76228,"symbol":"-[__NSArrayM enumerateObjectsWithOptions:usingBlock:]","symbolLocation":408,"imageIndex":12},{"imageOffset":24513156,"symbol":"-[UIView(Geometry) hitTest:withEvent:]","symbolLocation":408,"imageIndex":11},{"imageOffset":24272136,"symbol":"-[UIDropShadowView hitTest:withEvent:]","symbolLocation":244,"imageIndex":11},{"imageOffset":24514228,"symbol":"-[UIView(Geometry) _hitTest:withEvent:windowServerHitTestWindow:]","symbolLocation":80,"imageIndex":11},{"imageOffset":24513984,"symbol":"__38-[UIView(Geometry) hitTest:withEvent:]_block_invoke","symbolLocation":88,"imageIndex":11},{"imageOffset":620020,"symbol":"__NSARRAY_IS_CALLING_OUT_TO_A_BLOCK__","symbolLocation":16,"imageIndex":12},{"imageOffset":1551076,"symbol":"-[__NSSingleObjectArrayI enumerateObjectsWithOptions:usingBlock:]","symbolLocation":88,"imageIndex":12},{"imageOffset":24513156,"symbol":"-[UIView(Geometry) hitTest:withEvent:]","symbolLocation":408,"imageIndex":11},{"imageOffset":24362656,"symbol":"-[UITransitionView hitTest:withEvent:]","symbolLocation":52,"imageIndex":11},{"imageOffset":24514228,"symbol":"-[UIView(Geometry) _hitTest:withEvent:windowServerHitTestWindow:]","symbolLocation":80,"imageIndex":11},{"imageOffset":24513984,"symbol":"__38-[UIView(Geometry) hitTest:withEvent:]_block_invoke","symbolLocation":88,"imageIndex":11},{"imageOffset":620020,"symbol":"__NSARRAY_IS_CALLING_OUT_TO_A_BLOCK__","symbolLocation":16,"imageIndex":12},{"imageOffset":1551076,"symbol":"-[__NSSingleObjectArrayI enumerateObjectsWithOptions:usingBlock:]","symbolLocation":88,"imageIndex":12},{"imageOffset":24513156,"symbol":"-[UIView(Geometry) hitTest:withEvent:]","symbolLocation":408,"imageIndex":11},{"imageOffset":24514228,"symbol":"-[UIView(Geometry) _hitTest:withEvent:windowServerHitTestWindow:]","symbolLocation":80,"imageIndex":11},{"imageOffset":18827304,"symbol":"-[UIWindow _hitTestLocation:sceneLocationZ:inScene:withWindowServerHitTestWindow:event:]","symbolLocation":92,"imageIndex":11},{"imageOffset":18826904,"symbol":"__75+[UIWindow _hitTestToPoint:scenePointZ:forEvent:windowServerHitTestWindow:]_block_invoke","symbolLocation":64,"imageIndex":11},{"imageOffset":21303484,"symbol":"__64-[UIWindowScene _topVisibleWindowEnumeratingAsCopy:passingTest:]_block_invoke","symbolLocation":108,"imageIndex":11},{"imageOffset":21303988,"symbol":"-[UIWindowScene _enumerateWindowsIncludingInternalWindows:onlyVisibleWindows:asCopy:stopped:withBlock:]","symbolLocation":292,"imageIndex":11},{"imageOffset":21303248,"symbol":"-[UIWindowScene _topVisibleWindowEnumeratingAsCopy:passingTest:]","symbolLocation":364,"imageIndex":11},{"imageOffset":18826756,"symbol":"+[UIWindow _hitTestToPoint:scenePointZ:forEvent:windowServerHitTestWindow:]","symbolLocation":192,"imageIndex":11},{"imageOffset":18827528,"symbol":"-[UIWindow _targetWindowForPathIndex:atPoint:scenePointZ:forEvent:windowServerHitTestWindow:]","symbolLocation":184,"imageIndex":11},{"imageOffset":17234488,"symbol":"__startNewUITouch","symbolLocation":632,"imageIndex":11},{"imageOffset":17230496,"symbol":"____updateTouchesWithDigitizerEventAndDetermineIfShouldSend_block_invoke.28","symbolLocation":344,"imageIndex":11},{"imageOffset":25482988,"symbol":"_UIEventHIDEnumerateChildren","symbolLocation":160,"imageIndex":11},{"imageOffset":17250488,"symbol":"__dispatchPreprocessedEventFromEventQueue","symbolLocation":2792,"imageIndex":11},{"imageOffset":17260324,"symbol":"__processEventQueue","symbolLocation":4800,"imageIndex":11},{"imageOffset":17229008,"symbol":"updateCycleEntry","symbolLocation":168,"imageIndex":11},{"imageOffset":6886264,"symbol":"_UIUpdateSequenceRunNext","symbolLocation":120,"imageIndex":11},{"imageOffset":17588388,"symbol":"schedulerStepScheduledMainSectionContinue","symbolLocation":56,"imageIndex":11},{"imageOffset":4788,"symbol":"UC::DriverCore::continueProcessing()","symbolLocation":80,"imageIndex":13},{"imageOffset":357548,"symbol":"__CFMachPortPerform","symbolLocation":164,"imageIndex":12},{"imageOffset":604840,"symbol":"__CFRUNLOOP_IS_CALLING_OUT_TO_A_SOURCE1_PERFORM_FUNCTION__","symbolLocation":56,"imageIndex":12},{"imageOffset":602304,"symbol":"__CFRunLoopDoSource1","symbolLocation":480,"imageIndex":12},{"imageOffset":598408,"symbol":"__CFRunLoopRun","symbolLocation":2100,"imageIndex":12},{"imageOffset":576748,"symbol":"_CFRunLoopRunSpecificWithOptions","symbolLocation":496,"imageIndex":12},{"imageOffset":10684,"symbol":"GSEventRunModal","symbolLocation":116,"imageIndex":14},{"imageOffset":18523508,"symbol":"-[UIApplication _run]","symbolLocation":772,"imageIndex":11},{"imageOffset":18540444,"symbol":"UIApplicationMain","symbolLocation":124,"imageIndex":11},{"imageOffset":20456,"sourceLine":7,"sourceFile":"AppDelegate.swift","symbol":"__debug_main_executable_dylib_entry_point","imageIndex":2,"symbolLocation":64},{"imageOffset":4302689232,"imageIndex":15},{"imageOffset":27544,"symbol":"start","symbolLocation":6076,"imageIndex":0}]},{"id":37836416,"name":"com.apple.uikit.eventfetch-thread","threadState":{"x":[{"value":268451845},{"value":21592279046},{"value":8589934592},{"value":49490908151808},{"value":0},{"value":49490908151808},{"value":2},{"value":4294967295},{"value":0},{"value":17179869184},{"value":0},{"value":2},{"value":0},{"value":0},{"value":11523},{"value":3072},{"value":18446744073709551569},{"value":2},{"value":0},{"value":4294967295},{"value":2},{"value":49490908151808},{"value":0},{"value":49490908151808},{"value":6169533832},{"value":8589934592},{"value":21592279046},{"value":18446744073709550527},{"value":4412409862}],"flavor":"ARM_THREAD_STATE64","lr":{"value":4300890028},"cpsr":{"value":0},"fp":{"value":6169533680},"sp":{"value":6169533600},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4300819312},"far":{"value":0}},"frames":[{"imageOffset":2928,"symbol":"mach_msg2_trap","symbolLocation":8,"imageIndex":7},{"imageOffset":73644,"symbol":"mach_msg2_internal","symbolLocation":72,"imageIndex":7},{"imageOffset":35880,"symbol":"mach_msg_overwrite","symbolLocation":480,"imageIndex":7},{"imageOffset":3800,"symbol":"mach_msg","symbolLocation":20,"imageIndex":7},{"imageOffset":601092,"symbol":"__CFRunLoopServiceMachPort","symbolLocation":156,"imageIndex":12},{"imageOffset":597436,"symbol":"__CFRunLoopRun","symbolLocation":1128,"imageIndex":12},{"imageOffset":576748,"symbol":"_CFRunLoopRunSpecificWithOptions","symbolLocation":496,"imageIndex":12},{"imageOffset":9096776,"symbol":"-[NSRunLoop(NSRunLoop) runMode:beforeDate:]","symbolLocation":208,"imageIndex":16},{"imageOffset":9097320,"symbol":"-[NSRunLoop(NSRunLoop) runUntilDate:]","symbolLocation":60,"imageIndex":16},{"imageOffset":15735888,"symbol":"-[UIEventFetcher threadMain]","symbolLocation":392,"imageIndex":11},{"imageOffset":9256212,"symbol":"__NSThread__start__","symbolLocation":716,"imageIndex":16},{"imageOffset":26096,"symbol":"_pthread_start","symbolLocation":104,"imageIndex":8},{"imageOffset":6552,"symbol":"thread_start","symbolLocation":8,"imageIndex":8}]},{"id":37836418,"frames":[{"imageOffset":6532,"symbol":"start_wqthread","symbolLocation":0,"imageIndex":8}],"threadState":{"x":[{"value":6170112000},{"value":16899},{"value":6169575424},{"value":0},{"value":409604},{"value":18446744073709551615},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":0},"cpsr":{"value":0},"fp":{"value":0},"sp":{"value":6170112000},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4300298628},"far":{"value":0}}},{"id":37836450,"name":"com.apple.CFStream.LegacyThread","threadState":{"x":[{"value":268451845},{"value":21592279046},{"value":8589934592},{"value":153944512790528},{"value":0},{"value":153944512790528},{"value":2},{"value":4294967295},{"value":0},{"value":17179869184},{"value":0},{"value":2},{"value":0},{"value":0},{"value":35843},{"value":3072},{"value":18446744073709551569},{"value":7696581396226},{"value":0},{"value":4294967295},{"value":2},{"value":153944512790528},{"value":0},{"value":153944512790528},{"value":6174646280},{"value":8589934592},{"value":21592279046},{"value":18446744073709550527},{"value":4412409862}],"flavor":"ARM_THREAD_STATE64","lr":{"value":4300890028},"cpsr":{"value":0},"fp":{"value":6174646128},"sp":{"value":6174646048},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4300819312},"far":{"value":0}},"frames":[{"imageOffset":2928,"symbol":"mach_msg2_trap","symbolLocation":8,"imageIndex":7},{"imageOffset":73644,"symbol":"mach_msg2_internal","symbolLocation":72,"imageIndex":7},{"imageOffset":35880,"symbol":"mach_msg_overwrite","symbolLocation":480,"imageIndex":7},{"imageOffset":3800,"symbol":"mach_msg","symbolLocation":20,"imageIndex":7},{"imageOffset":601092,"symbol":"__CFRunLoopServiceMachPort","symbolLocation":156,"imageIndex":12},{"imageOffset":597436,"symbol":"__CFRunLoopRun","symbolLocation":1128,"imageIndex":12},{"imageOffset":576748,"symbol":"_CFRunLoopRunSpecificWithOptions","symbolLocation":496,"imageIndex":12},{"imageOffset":725380,"symbol":"_legacyStreamRunLoop_workThread","symbolLocation":260,"imageIndex":12},{"imageOffset":26096,"symbol":"_pthread_start","symbolLocation":104,"imageIndex":8},{"imageOffset":6552,"symbol":"thread_start","symbolLocation":8,"imageIndex":8}]},{"id":37836461,"name":"com.apple.NSURLConnectionLoader","threadState":{"x":[{"value":268451845},{"value":21592279046},{"value":8589934592},{"value":159459250798592},{"value":0},{"value":159459250798592},{"value":2},{"value":4294967295},{"value":0},{"value":17179869184},{"value":0},{"value":2},{"value":0},{"value":0},{"value":37127},{"value":3072},{"value":18446744073709551569},{"value":4398046512130},{"value":0},{"value":4294967295},{"value":2},{"value":159459250798592},{"value":0},{"value":159459250798592},{"value":6175219016},{"value":8589934592},{"value":21592279046},{"value":18446744073709550527},{"value":4412409862}],"flavor":"ARM_THREAD_STATE64","lr":{"value":4300890028},"cpsr":{"value":0},"fp":{"value":6175218864},"sp":{"value":6175218784},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4300819312},"far":{"value":0}},"frames":[{"imageOffset":2928,"symbol":"mach_msg2_trap","symbolLocation":8,"imageIndex":7},{"imageOffset":73644,"symbol":"mach_msg2_internal","symbolLocation":72,"imageIndex":7},{"imageOffset":35880,"symbol":"mach_msg_overwrite","symbolLocation":480,"imageIndex":7},{"imageOffset":3800,"symbol":"mach_msg","symbolLocation":20,"imageIndex":7},{"imageOffset":601092,"symbol":"__CFRunLoopServiceMachPort","symbolLocation":156,"imageIndex":12},{"imageOffset":597436,"symbol":"__CFRunLoopRun","symbolLocation":1128,"imageIndex":12},{"imageOffset":576748,"symbol":"_CFRunLoopRunSpecificWithOptions","symbolLocation":496,"imageIndex":12},{"imageOffset":2100588,"symbol":"+[__CFN_CoreSchedulingSetRunnable _run:]","symbolLocation":368,"imageIndex":17},{"imageOffset":9256212,"symbol":"__NSThread__start__","symbolLocation":716,"imageIndex":16},{"imageOffset":26096,"symbol":"_pthread_start","symbolLocation":104,"imageIndex":8},{"imageOffset":6552,"symbol":"thread_start","symbolLocation":8,"imageIndex":8}]},{"id":37842233,"frames":[{"imageOffset":6532,"symbol":"start_wqthread","symbolLocation":0,"imageIndex":8}],"threadState":{"x":[{"value":6167818240},{"value":44563},{"value":6167281664},{"value":0},{"value":409604},{"value":18446744073709551615},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":0},"cpsr":{"value":0},"fp":{"value":0},"sp":{"value":6167818240},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4300298628},"far":{"value":0}}},{"id":37842234,"frames":[{"imageOffset":6532,"symbol":"start_wqthread","symbolLocation":0,"imageIndex":8}],"threadState":{"x":[{"value":6168391680},{"value":27671},{"value":6167855104},{"value":0},{"value":409604},{"value":18446744073709551615},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":0},"cpsr":{"value":0},"fp":{"value":0},"sp":{"value":6168391680},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4300298628},"far":{"value":0}}},{"id":37842235,"name":"com.facebook.react.runtime.JavaScript","threadState":{"x":[{"value":268451845},{"value":21592279046},{"value":8589934592},{"value":116612657053696},{"value":0},{"value":116612657053696},{"value":2},{"value":4294967295},{"value":0},{"value":17179869184},{"value":0},{"value":2},{"value":0},{"value":0},{"value":27151},{"value":3072},{"value":18446744073709551569},{"value":1099511628034},{"value":0},{"value":4294967295},{"value":2},{"value":116612657053696},{"value":0},{"value":116612657053696},{"value":6172876104},{"value":8589934592},{"value":21592279046},{"value":18446744073709550527},{"value":4412409862}],"flavor":"ARM_THREAD_STATE64","lr":{"value":4300890028},"cpsr":{"value":0},"fp":{"value":6172875952},"sp":{"value":6172875872},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4300819312},"far":{"value":0}},"frames":[{"imageOffset":2928,"symbol":"mach_msg2_trap","symbolLocation":8,"imageIndex":7},{"imageOffset":73644,"symbol":"mach_msg2_internal","symbolLocation":72,"imageIndex":7},{"imageOffset":35880,"symbol":"mach_msg_overwrite","symbolLocation":480,"imageIndex":7},{"imageOffset":3800,"symbol":"mach_msg","symbolLocation":20,"imageIndex":7},{"imageOffset":601092,"symbol":"__CFRunLoopServiceMachPort","symbolLocation":156,"imageIndex":12},{"imageOffset":597436,"symbol":"__CFRunLoopRun","symbolLocation":1128,"imageIndex":12},{"imageOffset":576748,"symbol":"_CFRunLoopRunSpecificWithOptions","symbolLocation":496,"imageIndex":12},{"imageOffset":11158792,"symbol":"+[RCTJSThreadManager runRunLoop]","symbolLocation":292,"imageIndex":3},{"imageOffset":9256212,"symbol":"__NSThread__start__","symbolLocation":716,"imageIndex":16},{"imageOffset":26096,"symbol":"_pthread_start","symbolLocation":104,"imageIndex":8},{"imageOffset":6552,"symbol":"thread_start","symbolLocation":8,"imageIndex":8}]},{"id":37842236,"name":"hades","threadState":{"x":[{"value":260},{"value":0},{"value":0},{"value":0},{"value":0},{"value":160},{"value":0},{"value":0},{"value":6168964776},{"value":0},{"value":0},{"value":2},{"value":2},{"value":0},{"value":0},{"value":0},{"value":305},{"value":0},{"value":0},{"value":105553171974384},{"value":105553171974448},{"value":6168965344},{"value":0},{"value":0},{"value":0},{"value":1},{"value":256},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":4300319416},"cpsr":{"value":1610612736},"fp":{"value":6168964896},"sp":{"value":6168964752},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4300832788},"far":{"value":0}},"frames":[{"imageOffset":16404,"symbol":"__psynch_cvwait","symbolLocation":8,"imageIndex":7},{"imageOffset":27320,"symbol":"_pthread_cond_wait","symbolLocation":976,"imageIndex":8},{"imageOffset":136980,"symbol":"std::__1::condition_variable::wait(std::__1::unique_lock<std::__1::mutex>&)","symbolLocation":28,"imageIndex":18},{"imageOffset":1781980,"symbol":"hermes::vm::HadesGC::Executor::worker()","symbolLocation":112,"imageIndex":5},{"imageOffset":1781824,"symbol":"void* std::__1::__thread_proxy[abi:nn180100]<std::__1::tuple<std::__1::unique_ptr<std::__1::__thread_struct, std::__1::default_delete<std::__1::__thread_struct>>, hermes::vm::HadesGC::Executor::Executor()::'lambda'()>>(void*)","symbolLocation":44,"imageIndex":5},{"imageOffset":26096,"symbol":"_pthread_start","symbolLocation":104,"imageIndex":8},{"imageOffset":6552,"symbol":"thread_start","symbolLocation":8,"imageIndex":8}]},{"id":37842245,"frames":[{"imageOffset":6532,"symbol":"start_wqthread","symbolLocation":0,"imageIndex":8}],"threadState":{"x":[{"value":6170685440},{"value":37383},{"value":6170148864},{"value":0},{"value":409604},{"value":18446744073709551615},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":0},"cpsr":{"value":0},"fp":{"value":0},"sp":{"value":6170685440},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4300298628},"far":{"value":0}}},{"id":37842249,"name":"com.facebook.SocketRocket.NetworkThread","threadState":{"x":[{"value":268451845},{"value":21592279046},{"value":8589934592},{"value":169423574925312},{"value":0},{"value":169423574925312},{"value":2},{"value":4294967295},{"value":0},{"value":17179869184},{"value":0},{"value":2},{"value":0},{"value":0},{"value":39447},{"value":3072},{"value":18446744073709551569},{"value":2199023256066},{"value":0},{"value":4294967295},{"value":2},{"value":169423574925312},{"value":0},{"value":169423574925312},{"value":6171254104},{"value":8589934592},{"value":21592279046},{"value":18446744073709550527},{"value":4412409862}],"flavor":"ARM_THREAD_STATE64","lr":{"value":4300890028},"cpsr":{"value":0},"fp":{"value":6171253952},"sp":{"value":6171253872},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4300819312},"far":{"value":0}},"frames":[{"imageOffset":2928,"symbol":"mach_msg2_trap","symbolLocation":8,"imageIndex":7},{"imageOffset":73644,"symbol":"mach_msg2_internal","symbolLocation":72,"imageIndex":7},{"imageOffset":35880,"symbol":"mach_msg_overwrite","symbolLocation":480,"imageIndex":7},{"imageOffset":3800,"symbol":"mach_msg","symbolLocation":20,"imageIndex":7},{"imageOffset":601092,"symbol":"__CFRunLoopServiceMachPort","symbolLocation":156,"imageIndex":12},{"imageOffset":597436,"symbol":"__CFRunLoopRun","symbolLocation":1128,"imageIndex":12},{"imageOffset":576748,"symbol":"_CFRunLoopRunSpecificWithOptions","symbolLocation":496,"imageIndex":12},{"imageOffset":9096776,"symbol":"-[NSRunLoop(NSRunLoop) runMode:beforeDate:]","symbolLocation":208,"imageIndex":16},{"imageOffset":367632,"symbol":"-[SRRunLoopThread main]","symbolLocation":260,"imageIndex":4},{"imageOffset":9256212,"symbol":"__NSThread__start__","symbolLocation":716,"imageIndex":16},{"imageOffset":26096,"symbol":"_pthread_start","symbolLocation":104,"imageIndex":8},{"imageOffset":6552,"symbol":"thread_start","symbolLocation":8,"imageIndex":8}]},{"id":37842251,"frames":[{"imageOffset":6532,"symbol":"start_wqthread","symbolLocation":0,"imageIndex":8}],"threadState":{"x":[{"value":6173454336},{"value":25107},{"value":6172917760},{"value":0},{"value":409604},{"value":18446744073709551615},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":0},"cpsr":{"value":0},"fp":{"value":0},"sp":{"value":6173454336},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4300298628},"far":{"value":0}}},{"id":37842252,"name":"com.apple.CFSocket.private","threadState":{"x":[{"value":4},{"value":0},{"value":105553116292432},{"value":0},{"value":0},{"value":0},{"value":10},{"value":0},{"value":6174028000},{"value":0},{"value":105553181506304},{"value":15},{"value":6},{"value":105553181506384},{"value":72057602400272553,"symbolLocation":72057594037927937,"symbol":"OBJC_CLASS_$___NSCFArray"},{"value":8362344616,"symbolLocation":0,"symbol":"OBJC_CLASS_$___NSCFArray"},{"value":93},{"value":6446906352,"symbolLocation":0,"symbol":"-[__NSCFArray objectAtIndex:]"},{"value":0},{"value":105553129148784},{"value":8362364928,"symbolLocation":48,"symbol":"cache"},{"value":32},{"value":8362367408,"symbolLocation":0,"symbol":"__CFActiveSocketsLock"},{"value":0},{"value":105553116292432},{"value":105553129264384},{"value":105553116293952},{"value":0},{"value":105553129263664}],"flavor":"ARM_THREAD_STATE64","lr":{"value":6447057068},"cpsr":{"value":1610612736},"fp":{"value":6174027712},"sp":{"value":6173993936},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4300861336},"far":{"value":0}},"frames":[{"imageOffset":44952,"symbol":"__select","symbolLocation":8,"imageIndex":7},{"imageOffset":661676,"symbol":"__CFSocketManager","symbolLocation":680,"imageIndex":12},{"imageOffset":26096,"symbol":"_pthread_start","symbolLocation":104,"imageIndex":8},{"imageOffset":6552,"symbol":"thread_start","symbolLocation":8,"imageIndex":8}]},{"id":37842262,"name":"hades","threadState":{"x":[{"value":260},{"value":0},{"value":0},{"value":0},{"value":0},{"value":160},{"value":0},{"value":0},{"value":6175796904},{"value":0},{"value":0},{"value":2},{"value":2},{"value":0},{"value":0},{"value":0},{"value":305},{"value":0},{"value":0},{"value":105553172040976},{"value":105553172041040},{"value":6175797472},{"value":0},{"value":0},{"value":0},{"value":1},{"value":256},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":4300319416},"cpsr":{"value":1610612736},"fp":{"value":6175797024},"sp":{"value":6175796880},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4300832788},"far":{"value":0}},"frames":[{"imageOffset":16404,"symbol":"__psynch_cvwait","symbolLocation":8,"imageIndex":7},{"imageOffset":27320,"symbol":"_pthread_cond_wait","symbolLocation":976,"imageIndex":8},{"imageOffset":136980,"symbol":"std::__1::condition_variable::wait(std::__1::unique_lock<std::__1::mutex>&)","symbolLocation":28,"imageIndex":18},{"imageOffset":1781980,"symbol":"hermes::vm::HadesGC::Executor::worker()","symbolLocation":112,"imageIndex":5},{"imageOffset":1781824,"symbol":"void* std::__1::__thread_proxy[abi:nn180100]<std::__1::tuple<std::__1::unique_ptr<std::__1::__thread_struct, std::__1::default_delete<std::__1::__thread_struct>>, hermes::vm::HadesGC::Executor::Executor()::'lambda'()>>(void*)","symbolLocation":44,"imageIndex":5},{"imageOffset":26096,"symbol":"_pthread_start","symbolLocation":104,"imageIndex":8},{"imageOffset":6552,"symbol":"thread_start","symbolLocation":8,"imageIndex":8}]},{"id":37842272,"frames":[{"imageOffset":6532,"symbol":"start_wqthread","symbolLocation":0,"imageIndex":8}],"threadState":{"x":[{"value":6176370688},{"value":34851},{"value":6175834112},{"value":0},{"value":409604},{"value":18446744073709551615},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":0},"cpsr":{"value":0},"fp":{"value":0},"sp":{"value":6176370688},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4300298628},"far":{"value":0}}},{"id":37842273,"frames":[{"imageOffset":6532,"symbol":"start_wqthread","symbolLocation":0,"imageIndex":8}],"threadState":{"x":[{"value":6176944128},{"value":24851},{"value":6176407552},{"value":0},{"value":409604},{"value":18446744073709551615},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":0},"cpsr":{"value":0},"fp":{"value":0},"sp":{"value":6176944128},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4300298628},"far":{"value":0}}},{"id":37842278,"frames":[{"imageOffset":6532,"symbol":"start_wqthread","symbolLocation":0,"imageIndex":8}],"threadState":{"x":[{"value":6177517568},{"value":36883},{"value":6176980992},{"value":0},{"value":409604},{"value":18446744073709551615},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":0},"cpsr":{"value":0},"fp":{"value":0},"sp":{"value":6177517568},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4300298628},"far":{"value":0}}},{"id":37842279,"frames":[{"imageOffset":6532,"symbol":"start_wqthread","symbolLocation":0,"imageIndex":8}],"threadState":{"x":[{"value":6178091008},{"value":46359},{"value":6177554432},{"value":0},{"value":409604},{"value":18446744073709551615},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":0},"cpsr":{"value":0},"fp":{"value":0},"sp":{"value":6178091008},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4300298628},"far":{"value":0}}},{"id":37842280,"frames":[{"imageOffset":6532,"symbol":"start_wqthread","symbolLocation":0,"imageIndex":8}],"threadState":{"x":[{"value":6178664448},{"value":63495},{"value":6178127872},{"value":0},{"value":409604},{"value":18446744073709551615},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":0},"cpsr":{"value":0},"fp":{"value":0},"sp":{"value":6178664448},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4300298628},"far":{"value":0}}},{"id":37842424,"name":"com.apple.UIKit.inProcessAnimationManager","threadState":{"x":[{"value":14},{"value":18446744073709551615},{"value":1},{"value":1},{"value":17179869187},{"value":3},{"value":17179869187},{"value":3},{"value":66823},{"value":18446744073709551615},{"value":0},{"value":0},{"value":8589934595},{"value":3},{"value":8362150760,"symbolLocation":0,"symbol":"OBJC_CLASS_$_OS_dispatch_semaphore"},{"value":8362150760,"symbolLocation":0,"symbol":"OBJC_CLASS_$_OS_dispatch_semaphore"},{"value":18446744073709551580},{"value":6444291256,"symbolLocation":0,"symbol":"-[OS_object retain]"},{"value":0},{"value":105553152430928},{"value":105553152430864},{"value":18446744073709551615},{"value":5907514608},{"value":8512434176,"objc-selector":"OfBytesUsingEncoding:"},{"value":8512434176,"objc-selector":"OfBytesUsingEncoding:"},{"value":105553152430864},{"value":0},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":6444294744},"cpsr":{"value":1610612736},"fp":{"value":6315158592},"sp":{"value":6315158576},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4300819180},"far":{"value":0}},"frames":[{"imageOffset":2796,"symbol":"semaphore_wait_trap","symbolLocation":8,"imageIndex":7},{"imageOffset":12888,"symbol":"_dispatch_sema4_wait","symbolLocation":24,"imageIndex":19},{"imageOffset":14304,"symbol":"_dispatch_semaphore_wait_slow","symbolLocation":128,"imageIndex":19},{"imageOffset":4995520,"imageIndex":11},{"imageOffset":5013128,"imageIndex":11},{"imageOffset":1418704,"imageIndex":11},{"imageOffset":9256212,"symbol":"__NSThread__start__","symbolLocation":716,"imageIndex":16},{"imageOffset":26096,"symbol":"_pthread_start","symbolLocation":104,"imageIndex":8},{"imageOffset":6552,"symbol":"thread_start","symbolLocation":8,"imageIndex":8}]}],
  "usedImages" : [
  {
    "source" : "P",
    "arch" : "arm64e",
    "base" : 4301438976,
    "size" : 638976,
    "uuid" : "3247e185-ced2-36ff-9e29-47a77c23e004",
    "path" : "\/usr\/lib\/dyld",
    "name" : "dyld"
  },
  {
    "source" : "P",
    "arch" : "arm64",
    "base" : 4300193792,
    "CFBundleShortVersionString" : "1.0.0",
    "CFBundleIdentifier" : "rewire.app.com",
    "size" : 16384,
    "uuid" : "08d4b719-8f27-3290-9e5c-e1b00a9445d3",
    "path" : "\/Users\/USER\/Library\/Developer\/CoreSimulator\/Devices\/74BB31BD-C37E-46A4-99E0-A1C96895C715\/data\/Containers\/Bundle\/Application\/51109643-6A4E-42F4-9937-B2C0B2C57972\/rewire.app\/rewire",
    "name" : "rewire",
    "CFBundleVersion" : "1"
  },
  {
    "source" : "P",
    "arch" : "arm64",
    "base" : 4361043968,
    "size" : 20348928,
    "uuid" : "5d4784b7-0de2-3e13-8abb-961b27e9539e",
    "path" : "\/Users\/USER\/Library\/Developer\/CoreSimulator\/Devices\/74BB31BD-C37E-46A4-99E0-A1C96895C715\/data\/Containers\/Bundle\/Application\/51109643-6A4E-42F4-9937-B2C0B2C57972\/rewire.app\/rewire.debug.dylib",
    "name" : "rewire.debug.dylib"
  },
  {
    "source" : "P",
    "arch" : "arm64",
    "base" : 4419076096,
    "CFBundleShortVersionString" : "1.0",
    "CFBundleIdentifier" : "react-native.React",
    "size" : 14761984,
    "uuid" : "ac487519-d12b-3ed8-b013-5010ec9bc032",
    "path" : "\/Users\/USER\/Library\/Developer\/CoreSimulator\/Devices\/74BB31BD-C37E-46A4-99E0-A1C96895C715\/data\/Containers\/Bundle\/Application\/51109643-6A4E-42F4-9937-B2C0B2C57972\/rewire.app\/Frameworks\/React.framework\/React",
    "name" : "React",
    "CFBundleVersion" : "1"
  },
  {
    "source" : "P",
    "arch" : "arm64",
    "base" : 4307206144,
    "CFBundleShortVersionString" : "1.0",
    "CFBundleIdentifier" : "third-party.ReactNativeDependencies",
    "size" : 1474560,
    "uuid" : "1c45f8d4-664a-3470-8fd0-341a04b1a28c",
    "path" : "\/Users\/USER\/Library\/Developer\/CoreSimulator\/Devices\/74BB31BD-C37E-46A4-99E0-A1C96895C715\/data\/Containers\/Bundle\/Application\/51109643-6A4E-42F4-9937-B2C0B2C57972\/rewire.app\/Frameworks\/ReactNativeDependencies.framework\/ReactNativeDependencies",
    "name" : "ReactNativeDependencies",
    "CFBundleVersion" : "1"
  },
  {
    "source" : "P",
    "arch" : "arm64",
    "base" : 4317872128,
    "CFBundleShortVersionString" : "0.12.0",
    "CFBundleIdentifier" : "dev.hermesengine.iphonesimulator",
    "size" : 3702784,
    "uuid" : "944bd49b-ad2e-3e3c-96ac-0603909fdd97",
    "path" : "\/Users\/USER\/Library\/Developer\/CoreSimulator\/Devices\/74BB31BD-C37E-46A4-99E0-A1C96895C715\/data\/Containers\/Bundle\/Application\/51109643-6A4E-42F4-9937-B2C0B2C57972\/rewire.app\/Frameworks\/hermes.framework\/hermes",
    "name" : "hermes",
    "CFBundleVersion" : "0.12.0"
  },
  {
    "source" : "P",
    "arch" : "arm64",
    "base" : 4300685312,
    "size" : 32768,
    "uuid" : "43ef9892-7edb-34c5-88d6-2c79fa2e7bd3",
    "path" : "\/usr\/lib\/system\/libsystem_platform.dylib",
    "name" : "libsystem_platform.dylib"
  },
  {
    "source" : "P",
    "arch" : "arm64",
    "base" : 4300816384,
    "size" : 245760,
    "uuid" : "0960cf7e-fb2e-3068-998e-131a316ed666",
    "path" : "\/usr\/lib\/system\/libsystem_kernel.dylib",
    "name" : "libsystem_kernel.dylib"
  },
  {
    "source" : "P",
    "arch" : "arm64",
    "base" : 4300292096,
    "size" : 65536,
    "uuid" : "421e2342-6729-3a9f-a439-29ad130875b3",
    "path" : "\/usr\/lib\/system\/libsystem_pthread.dylib",
    "name" : "libsystem_pthread.dylib"
  },
  {
    "source" : "P",
    "arch" : "arm64",
    "base" : 4311040000,
    "size" : 49152,
    "uuid" : "997b234d-5c24-3e21-97d6-33b6853818c0",
    "path" : "\/Volumes\/VOLUME\/*\/libobjc-trampolines.dylib",
    "name" : "libobjc-trampolines.dylib"
  },
  {
    "source" : "P",
    "arch" : "arm64",
    "base" : 6442909696,
    "size" : 250520,
    "uuid" : "880f8664-cd53-3912-bdd5-5e3159295f7d",
    "path" : "\/Volumes\/VOLUME\/*\/libobjc.A.dylib",
    "name" : "libobjc.A.dylib"
  },
  {
    "source" : "P",
    "arch" : "arm64",
    "base" : 6528032768,
    "CFBundleShortVersionString" : "1.0",
    "CFBundleIdentifier" : "com.apple.UIKitCore",
    "size" : 35792672,
    "uuid" : "196154ff-ba04-33cd-9277-98f9aa0b7499",
    "path" : "\/Volumes\/VOLUME\/*\/UIKitCore.framework\/UIKitCore",
    "name" : "UIKitCore",
    "CFBundleVersion" : "9126.2.4.1.111"
  },
  {
    "source" : "P",
    "arch" : "arm64",
    "base" : 6446395392,
    "CFBundleShortVersionString" : "6.9",
    "CFBundleIdentifier" : "com.apple.CoreFoundation",
    "size" : 4309888,
    "uuid" : "4f6d050d-95ee-3a95-969c-3a98b29df6ff",
    "path" : "\/Volumes\/VOLUME\/*\/CoreFoundation.framework\/CoreFoundation",
    "name" : "CoreFoundation",
    "CFBundleVersion" : "4201"
  },
  {
    "source" : "P",
    "arch" : "arm64",
    "base" : 9933750272,
    "CFBundleShortVersionString" : "1",
    "CFBundleIdentifier" : "com.apple.UpdateCycle",
    "size" : 7840,
    "uuid" : "e2e29a67-7d1d-333d-9227-e405451edb7d",
    "path" : "\/Volumes\/VOLUME\/*\/UpdateCycle.framework\/UpdateCycle",
    "name" : "UpdateCycle",
    "CFBundleVersion" : "1"
  },
  {
    "source" : "P",
    "arch" : "arm64",
    "base" : 6755336192,
    "CFBundleShortVersionString" : "1.0",
    "CFBundleIdentifier" : "com.apple.GraphicsServices",
    "size" : 32192,
    "uuid" : "4e5b0462-6170-3367-9475-4ff8b8dfe4e6",
    "path" : "\/Volumes\/VOLUME\/*\/GraphicsServices.framework\/GraphicsServices",
    "name" : "GraphicsServices",
    "CFBundleVersion" : "1.0"
  },
  {
    "size" : 0,
    "source" : "A",
    "base" : 0,
    "uuid" : "00000000-0000-0000-0000-000000000000"
  },
  {
    "source" : "P",
    "arch" : "arm64",
    "base" : 6451228672,
    "CFBundleShortVersionString" : "6.9",
    "CFBundleIdentifier" : "com.apple.Foundation",
    "size" : 14100704,
    "uuid" : "c153116f-dd31-3fa9-89bb-04b47c1fa83d",
    "path" : "\/Volumes\/VOLUME\/*\/Foundation.framework\/Foundation",
    "name" : "Foundation",
    "CFBundleVersion" : "4201"
  },
  {
    "source" : "P",
    "arch" : "arm64",
    "base" : 6522978304,
    "CFBundleShortVersionString" : "1.0",
    "CFBundleIdentifier" : "com.apple.CFNetwork",
    "size" : 3613024,
    "uuid" : "1bb7d015-7687-34a6-93c8-7cc24655033a",
    "path" : "\/Volumes\/VOLUME\/*\/CFNetwork.framework\/CFNetwork",
    "name" : "CFNetwork",
    "CFBundleVersion" : "3860.300.31"
  },
  {
    "source" : "P",
    "arch" : "arm64",
    "base" : 6445678592,
    "size" : 562480,
    "uuid" : "21743e1c-a39b-3649-afd2-d1613ce81d75",
    "path" : "\/Volumes\/VOLUME\/*\/libc++.1.dylib",
    "name" : "libc++.1.dylib"
  },
  {
    "source" : "P",
    "arch" : "arm64",
    "base" : 6444281856,
    "size" : 283072,
    "uuid" : "ec9ecf10-959d-3da1-a055-6de970159b9d",
    "path" : "\/Volumes\/VOLUME\/*\/libdispatch.dylib",
    "name" : "libdispatch.dylib"
  }
],
  "sharedCache" : {
  "base" : 6442450944,
  "size" : 4230135808,
  "uuid" : "2058f4a2-b84d-3d82-87f0-45aa7870615c"
},
  "vmSummary" : "ReadOnly portion of Libraries: Total=1.9G resident=0K(0%) swapped_out_or_unallocated=1.9G(100%)\nWritable regions: Total=2.0G written=2355K(0%) resident=2323K(0%) swapped_out=32K(0%) unallocated=2.0G(100%)\n\n                                VIRTUAL   REGION \nREGION TYPE                        SIZE    COUNT (non-coalesced) \n===========                     =======  ======= \nActivity Tracing                   256K        1 \nAttributeGraph Data               1024K        1 \nCG raster data                    24.8M       18 \nCoreAnimation                     26.5M       77 \nFoundation                          16K        1 \nKernel Alloc Once                   32K        1 \nMALLOC                             2.0G       97 \nMALLOC guard page                  288K       18 \nSQLite page cache                 1152K        9 \nSTACK GUARD                       56.3M       20 \nStack                             18.6M       20 \nVM_ALLOCATE                       34.2M       28 \n__DATA                            52.4M      868 \n__DATA_CONST                     111.7M      894 \n__DATA_DIRTY                        91K       13 \n__FONT_DATA                        2352        1 \n__LINKEDIT                       781.6M       11 \n__OBJC_RO                         62.5M        1 \n__OBJC_RW                         2771K        1 \n__TEXT                             1.1G      909 \n__TPRO_CONST                       148K        2 \ndyld private memory                2.2G       16 \nmapped file                      240.2M       29 \npage table in kernel              2323K        1 \nshared memory                       16K        1 \n===========                     =======  ======= \nTOTAL                              6.6G     3038 \n",
  "legacyInfo" : {
  "threadTriggered" : {
    "queue" : "com.apple.main-thread"
  }
},
  "logWritingSignature" : "f93680a13951c2969b3c0501782ef322f129bce6",
  "trialInfo" : {
  "rollouts" : [
    {
      "rolloutId" : "5f72dc58705eff005a46b3a9",
      "factorPackIds" : {

      },
      "deploymentId" : 240000015
    },
    {
      "rolloutId" : "5fb4245a1bbfe8005e33a1e1",
      "factorPackIds" : {

      },
      "deploymentId" : 240000021
    }
  ],
  "experiments" : [

  ]
}
}

section}>
          <DayCardsRow streak={streak} />
        </View>

        {/* Tool Cards */}
        <View style={styles.toolCards}>
          {Platform.OS === 'ios' && (
            <ToolCard
              icon="shield-outline"
              iconColor={colors.danger}
              title="ポルノブロッカー"
              description="ポルノサイトをブロック"
              onPress={() => router.push(ROUTES.contentBlockerSetup)}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: SPACING.xxxl,
  },
  section: {
    marginTop: SPACING.lg,
  },
  achievementsContainer: {
    marginHorizontal: SPACING.screenPadding,
    marginTop: SPACING.xl,
  },
  achievementsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  achievementsLinkLeft: {
    flex: 1,
  },
  achievementsLabel: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
  },
  achievementsCount: {
    fontSize: FONT_SIZE.sm,
    marginTop: 2,
  },
  toolCards: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.screenPadding,
    gap: SPACING.md,
  },
});
