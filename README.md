# Tech Assess QA

A Quality Assurance (QA) technical assessment project demonstrating manual and automated testing practices, including test planning, test case design, execution, and reporting.

## Overview

This project showcases QA skills and testing methodologies used to validate software quality and reliability. It includes test scenarios, test execution, and automation scripts where applicable.

## Objectives

- Verify application functionality against requirements
- Identify and document defects
- Ensure a positive user experience
- Demonstrate QA best practices and automation capabilities

## Features

- Functional Testing
- UI Testing
- End-to-End Test Scenarios
- Defect Reporting
- Test Documentation
- Automated Test Execution

## Tech Stack

- Python
- Robot Framework
- Selenium
- Requests Library
- Git & GitHub

## Project Structure

```text
tech-assess-qa/
├── tests/
├── resources/
├── testdata/
├── reports/
├── screenshots/
├── requirements.txt
└── README.md
```

## Installation

Clone the repository:

```bash
git clone https://github.com/NawaphonB/tech-assess-qa.git
cd tech-assess-qa
```

Install dependencies:

```bash
pip install -r requirements.txt
```

## Running Tests

Run all test suites:

```bash
robot tests/
```

Run a specific test suite:

```bash
robot tests/<test_suite>.robot
```

## Test Reports

After execution, Robot Framework generates the following reports:

```text
report.html
log.html
output.xml
```

Open `report.html` in your browser to review the test results.

## Test Coverage

### Functional Testing
- User authentication
- Form validation
- Navigation flow
- Business rules verification

### UI Testing
- Element visibility
- User interactions
- Responsive behavior
- Error messages and validations

### API Testing
- Status code validation
- Response schema verification
- Data validation
- Error handling

## Best Practices Applied

- Reusable test components
- Maintainable test structure
- Clear test documentation
- Consistent naming conventions
- Automated reporting

## Author

**Nawaphon Boonnitikorn**

GitHub: https://github.com/NawaphonB

## License

This project is intended for assessment and demonstration purposes.
