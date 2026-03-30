on run argv
	set volumeName to item 1 of argv
	set appName to item 2 of argv
	set volumePath to item 3 of argv
	set volumeAlias to (POSIX file volumePath) as alias

	tell application "Finder"
		open volumeAlias
		delay 1

		set diskWindow to container window of disk volumeName
		set current view of diskWindow to icon view
		try
			set toolbar visible of diskWindow to false
		end try
		try
			set statusbar visible of diskWindow to false
		end try
		set bounds of diskWindow to {120, 120, 660, 420}

		set opts to icon view options of diskWindow
		set arrangement of opts to not arranged
		set icon size of opts to 128
		set text size of opts to 14

		set position of item appName of disk volumeName to {150, 170}
		set position of item "Applications" of disk volumeName to {390, 170}
		tell disk volumeName to update without registering applications
		delay 1
	end tell

	return "success"
end run
