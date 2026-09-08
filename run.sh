start() {
	echo "Removing existing build directory"
	rm -rf build 
	rm -rf ./packages/**/build
	find . -name "*.tsbuildinfo" -delete

	echo "Compiling..."
	mkdir ./build
	mkdir ./build/web
	pnpm tsc -b # Build the whole project
	echo "Copying static files..."

	rsync -a --exclude='*.ts' src/web/static build/web # Copy the static files into build

	echo -e "Running the Server: \n"
	node ./build/main.js & # Run web server
	return 0
}

cleanup() {
	echo "Exited. Cleaning up..."
}

startInWatchMode() {
	if start; then
		sleep 2 # NOTE: We sleep in between starts, so that the find command won't find the build-folder changes immediately
		while true; do
			result=$(find . -mmin -0.010)
			if [ $(echo -n "$result" | wc -l) -ne 0 ]; then
				echo "These files has been changed:"
				echo "$result"
				echo "Restarting:"
				kill -9 $(pgrep -f "node ./build/**")
				start
				sleep 2
			fi
		done
	fi
}

trap cleanup EXIT
startInWatchMode 
