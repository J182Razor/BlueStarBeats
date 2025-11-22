import UIKit
import Capacitor
import AVFoundation
import MediaPlayer
#if DEBUG
import InjectHotReload
#endif

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        
        // Configure audio session for background playback and device controls
        configureAudioSession()
        setupRemoteTransportControls()
        
        return true
    }
    
    private func configureAudioSession() {
        do {
            let audioSession = AVAudioSession.sharedInstance()
            try audioSession.setCategory(.playback, mode: .default, options: [.mixWithOthers, .duckOthers])
            try audioSession.setActive(true)
            print("Audio session configured for background playback")
        } catch {
            print("Failed to configure audio session: \(error.localizedDescription)")
        }
    }
    
    private func setupRemoteTransportControls() {
        let commandCenter = MPRemoteCommandCenter.shared()
        
        // Play command
        commandCenter.playCommand.addTarget { [weak self] event in
            NotificationCenter.default.post(name: .playAudio, object: nil)
            return .success
        }
        
        // Pause command
        commandCenter.pauseCommand.addTarget { [weak self] event in
            NotificationCenter.default.post(name: .pauseAudio, object: nil)
            return .success
        }
        
        // Toggle play/pause
        commandCenter.togglePlayPauseCommand.addTarget { [weak self] event in
            NotificationCenter.default.post(name: .togglePlayPause, object: nil)
            return .success
        }
        
        // Enable background modes
        UIApplication.shared.beginReceivingRemoteControlEvents()
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
        
        // Reconfigure audio session when returning from background
        configureAudioSession()
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
        
        // Re-activate audio session when app becomes active
        do {
            let audioSession = AVAudioSession.sharedInstance()
            try audioSession.setCategory(.playback, mode: .default, options: [.mixWithOthers, .duckOthers])
            try audioSession.setActive(true)
            print("Audio session reactivated for foreground")
        } catch {
            print("Failed to activate audio session: \(error.localizedDescription)")
        }
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

    override func remoteControlReceived(with event: UIEvent?) {
        super.remoteControlReceived(with: event)
        
        guard let event = event else { return }
        
        switch event.subtype {
        case .remoteControlPlay:
            NotificationCenter.default.post(name: .playAudio, object: nil)
        case .remoteControlPause:
            NotificationCenter.default.post(name: .pauseAudio, object: nil)
        case .remoteControlTogglePlayPause:
            NotificationCenter.default.post(name: .togglePlayPause, object: nil)
        default:
            break
        }
    }
}

// Notification extensions for audio control
extension Notification.Name {
    static let playAudio = Notification.Name("playAudio")
    static let pauseAudio = Notification.Name("pauseAudio")
    static let togglePlayPause = Notification.Name("togglePlayPause")
}
