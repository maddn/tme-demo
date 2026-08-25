all: proxies/prompt.txt proxies/tools.json node_modules
	npm run build
.PHONY: all clean

proxies/prompt.txt: src/assistant-prompt.txt
	# proxies is a symlink to common-topology/proxies.
	ln -sfn ../../packages/tme-demo-ui/src/ui/src/assistant-prompt.txt $@

proxies/tools.json: src/assistant-tools.json
	# proxies is a symlink to common-topology/proxies.
	ln -sfn ../../packages/tme-demo-ui/src/ui/src/assistant-tools.json $@

node_modules:
	npm install

clean:
	rm -f proxies/prompt.txt proxies/tools.json
