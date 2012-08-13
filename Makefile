
TESTS = test/*.js
REPORTER = dot

test:
	@NODE_ENV=test mocha \
		--require should \
		--reporter $(REPORTER) \
		$(TESTS)

test-server:
	@node test/server/app

docs: test-docs

clean:
	find sites -name "*.log" -exec rm {} \;

.PHONY: test clean

