---
name: test-patterns
description: Generate tests following project conventions with proper patterns for unit, integration, and e2e testing
license: MIT
compatibility: opencode
metadata:
  audience: developers
  workflow: general
---

## What I do

- Analyze existing test patterns in the project
- Generate tests that follow the same style and conventions
- Cover happy paths, edge cases, and error scenarios
- Use the project's testing framework and utilities

## When to use me

Use this skill when you need to write tests for new or existing code.
This skill first analyzes existing tests to match the project's style.

## Process

1. **Discover**: Find existing tests to understand patterns
   - Look for `*.test.*`, `*.spec.*`, `__tests__/` directories
   - Identify testing framework (Jest, Vitest, Pytest, JUnit, etc.)
   - Note assertion style, mock patterns, and setup/teardown

2. **Analyze**: Read the code under test
   - Identify public API surface
   - Find branching logic and edge cases
   - Note dependencies that need mocking

3. **Generate**: Write tests following discovered patterns

## Test Patterns by Framework

### JavaScript/TypeScript (Vitest/Jest)

```typescript
describe("ModuleName", () => {
  // Setup
  beforeEach(() => { /* ... */ })

  describe("methodName", () => {
    it("should return expected value for valid input", () => {
      // Arrange
      const input = createTestInput()
      // Act
      const result = methodName(input)
      // Assert
      expect(result).toEqual(expectedValue)
    })

    it("should throw for invalid input", () => {
      expect(() => methodName(null)).toThrow(ExpectedError)
    })
  })
})
```

### Python (Pytest)

```python
class TestModuleName:
    @pytest.fixture
    def setup(self):
        return create_test_fixture()

    def test_method_returns_expected_for_valid_input(self, setup):
        result = method_name(setup)
        assert result == expected_value

    def test_method_raises_for_invalid_input(self):
        with pytest.raises(ExpectedError):
            method_name(None)
```

### Java (JUnit 5)

```java
@DisplayName("ModuleName Tests")
class ModuleNameTest {
    @BeforeEach
    void setUp() { /* ... */ }

    @Test
    @DisplayName("should return expected value for valid input")
    void methodName_validInput_returnsExpected() {
        var result = moduleName.methodName(validInput);
        assertEquals(expected, result);
    }

    @Test
    @DisplayName("should throw for invalid input")
    void methodName_invalidInput_throws() {
        assertThrows(ExpectedException.class,
            () -> moduleName.methodName(null));
    }
}
```

## Coverage Targets

- **Unit Tests**: Every public method, all branches
- **Edge Cases**: Null/empty, boundary values, large inputs
- **Error Paths**: Invalid input, network failures, timeouts
- **Integration**: Key workflows between components
