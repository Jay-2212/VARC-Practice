# VARC Practice - Testing

## Running Tests

This project uses Jest for testing. To run the tests:

1. Install dependencies:
```bash
npm install
```

2. Run all tests:
```bash
npm test
```

3. Run tests in watch mode (re-runs on file changes):
```bash
npm run test:watch
```

4. Generate coverage report:
```bash
npm run test:coverage
```

## Test Structure

- `__tests__/utils.test.js` - Tests for utility functions (validation, sanitization, formatting)
- `__tests__/storage.test.js` - Tests for StorageManager (localStorage operations)

## Test Coverage

Tests cover:
- **Security**: XSS prevention, HTML sanitization, input validation
- **Error Handling**: Null checks, bounds validation, graceful degradation
- **Edge Cases**: Empty arrays, division by zero, invalid inputs
- **Core Functionality**: Answer tracking, timer management, question navigation

## Adding New Tests

When adding new functionality:
1. Create a test file in `js/__tests__/` with `.test.js` extension
2. Use descriptive test names that explain what is being tested
3. Test both success and failure cases
4. Include edge cases and boundary conditions

## Test Philosophy

- **Safety First**: Tests prioritize security and error handling
- **Defensive Programming**: Validate all inputs and assumptions
- **Clear Expectations**: Each test should verify one specific behavior
- **Comprehensive Coverage**: Test both happy paths and error conditions
