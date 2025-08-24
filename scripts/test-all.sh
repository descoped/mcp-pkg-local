#!/bin/bash

# Run ALL tests including external integration tests
# This is for comprehensive validation, not regular CI

echo "======================================"
echo "Running COMPLETE test suite"
echo "======================================"
echo ""

# Check if authly venv exists
AUTHLY_PATH="../authly/.venv"
if [ -d "$AUTHLY_PATH" ]; then
    echo "✓ Authly venv found - will run external tests"
    export TEST_AUTHLY=1
else
    echo "⚠ Authly venv not found - skipping external tests"
fi

echo ""
echo "Starting test run..."
echo ""

# Run all tests
npm test

# Capture exit code
EXIT_CODE=$?

echo ""
echo "======================================"
if [ $EXIT_CODE -eq 0 ]; then
    echo "✓ All tests passed successfully!"
else
    echo "✗ Some tests failed. Exit code: $EXIT_CODE"
fi
echo "======================================"

exit $EXIT_CODE