#!/bin/bash
# Patch Pods framework script to exclude _CodeSignature from rsync operations
# This fixes the sandbox error: deny(1) file-write-create .../_CodeSignature

set -e

IOS_DIR="ios/App"
PODS_SCRIPT="${IOS_DIR}/Pods/Target Support Files/Pods-BlueStarBeats/Pods-BlueStarBeats-frameworks.sh"

if [ ! -f "$PODS_SCRIPT" ]; then
    echo "❌ Pods script not found at: $PODS_SCRIPT"
    echo "   Run 'pod install' first in ios/App directory"
    exit 1
fi

echo "🔧 Patching Pods framework script to exclude _CodeSignature..."

# Create backup
cp "$PODS_SCRIPT" "${PODS_SCRIPT}.backup"
echo "   ✓ Created backup: ${PODS_SCRIPT}.backup"

# Use Ruby to process the script (more reliable than sed for complex patterns)
ruby_script=$(cat <<'RUBY'
content = File.read(ARGV[0])
modified = false

content.gsub!(/^(.*rsync.*--filter.*)$/) do |line|
  next line if line.include?('_CodeSignature')
  
  # Add _CodeSignature filter after the last existing filter
  if line.include?('Modules')
    # Common pattern: add after "Modules" filter
    new_line = line.sub(/--filter\s+"-\s*Modules"/, '--filter "- Modules" --filter "- _CodeSignature"')
  else
    # Find the last --filter pattern and add ours after it
    # Match: --filter "- something" followed by space
    new_line = line.sub(/(--filter\s+"-[^"]*")(\s+)(?!--filter)/, '\1 --filter "- _CodeSignature"\2')
    # If that didn't work, try adding before source argument
    if new_line == line
      new_line = line.sub(/(--filter\s+"-[^"]*")\s+("\$\{)/, '\1 --filter "- _CodeSignature" \2')
    end
  end
  
  if new_line != line
    modified = true
    new_line
  else
    line
  end
end

File.write(ARGV[0], content)
puts modified ? "true" : "false"
RUBY
)

was_modified=$(ruby -e "$ruby_script" "$PODS_SCRIPT")

if [ "$was_modified" = "true" ]; then
    echo "   ✓ Script patched successfully"
    echo ""
    echo "✅ Fix applied! The Pods script now excludes _CodeSignature from rsync operations."
    echo ""
    echo "📱 Next steps:"
    echo "   1. In Xcode, select Product → Clean Build Folder (Shift + Cmd + K)"
    echo "   2. Rebuild your project"
    echo ""
    echo "💡 Note: This fix will be automatically applied by the Podfile post_install hook"
    echo "   the next time you run 'pod install'"
else
    echo "   ℹ️  Script already has _CodeSignature filter or no changes needed"
    rm "${PODS_SCRIPT}.backup"
fi

