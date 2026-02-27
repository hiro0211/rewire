require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'ExpoWidgetSync'
  s.version        = package['version']
  s.summary        = 'Expo module for syncing data to iOS WidgetKit'
  s.description    = 'Expo module for syncing data to iOS WidgetKit via App Groups UserDefaults'
  s.license        = 'MIT'
  s.author         = 'Rewire'
  s.homepage       = 'https://github.com/example/expo-widget-sync'
  s.platforms      = { :ios => '15.1' }
  s.swift_version  = '5.4'
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  s.source_files = '**/*.{h,m,swift}'
end
