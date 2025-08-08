# Contribution Guide

Thank you for considering contributing to Advanced Patch Generator! This document provides guidelines for contributions.

## 🚀 How to Contribute

### 1. Environment Setup

1. **Fork the repository**
2. **Clone your fork:**
   ```bash
   git clone https://github.com/your-username/advanced-patch-generator.git
   cd advanced-patch-generator
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Install Xdelta3:**
   - **Windows:** `choco install xdelta3` or `scoop install xdelta3`
   - **Linux:** `sudo apt-get install xdelta3`
   - **macOS:** `brew install xdelta3`

### 2. Development

1. **Create a branch for your feature:**
   ```bash
   git checkout -b feature/new-functionality
   ```

2. **Make your changes**

3. **Run tests:**
   ```bash
   npm test
   ```

4. **Check linting:**
   ```bash
   npm run lint
   ```

5. **Commit your changes:**
   ```bash
   git commit -m 'feat: add new functionality'
   ```

6. **Push to your branch:**
   ```bash
   git push origin feature/new-functionality
   ```

### 3. Pull Request

1. **Open a Pull Request** on GitHub
2. **Describe your changes** clearly
3. **Include tests** if applicable
4. **Update documentation** if necessary

## 📋 Code Guidelines

### Commit Conventions

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Code formatting
- `refactor:` Refactoring
- `test:` Tests
- `chore:` Maintenance tasks

### Code Standards

- **Indentation:** 2 spaces
- **Quotes:** Single (`'`)
- **Semicolons:** Always
- **Line length:** Maximum 80 characters
- **Variable names:** camelCase
- **Class names:** PascalCase

### Documentation

- **JSDoc:** Use to document public functions
- **README:** Update when adding new features
- **Examples:** Include usage examples

### Tests

- **Coverage:** Maintain high test coverage
- **Test cases:** Include positive and negative cases
- **Integration tests:** For complex features

## 🐛 Reporting Bugs

### Before Reporting

1. **Check if it's already reported**
2. **Test with the latest version**
3. **Reproduce the issue**

### Required Information

- **Node.js version**
- **Operating system**
- **Xdelta3 version**
- **Steps to reproduce**
- **Expected vs. actual behavior**
- **Error logs** (if applicable)

## 💡 Suggesting Improvements

### Before Suggesting

1. **Check if it's already suggested**
2. **Research existing alternatives**
3. **Consider the impact**

### Required Information

- **Clear description of the improvement**
- **Use cases**
- **Expected benefits**
- **Possible drawbacks**

## 🏷️ Versions

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR:** Breaking changes
- **MINOR:** Compatible new features
- **PATCH:** Compatible fixes

### Changelog

- **Keep CHANGELOG.md updated**
- **Use Keep a Changelog format**
- **Include all relevant changes**

## 🤝 Communication

### Channels

- **Issues:** For bugs and improvements
- **Discussions:** For general discussions
- **Pull Requests:** For contributions

### Code of Conduct

- **Be respectful**
- **Stay focused on the project**
- **Help other contributors**

## 📚 Useful Resources

### Documentation

- [Node.js](https://nodejs.org/docs/)
- [Xdelta3](https://github.com/jmacd/xdelta)
- [ESLint](https://eslint.org/docs/)

### Tools

- **ESLint:** For linting
- **JSDoc:** For documentation
- **GitHub Actions:** For CI/CD

## 🎯 Contribution Areas

### Priorities

1. **Bug fixes**
2. **Performance improvements**
3. **New features**
4. **Documentation**
5. **Tests**

### Improvement Ideas

- **Support for more patch formats**
- **Graphical interface**
- **CI/CD integration**
- **Editor plugins**
- **REST API**

## 📞 Support

If you have questions about contributing:

- **Open an issue** for discussion
- **Use the appropriate issue template**
- **Be specific** about your question

## 🙏 Acknowledgments

Thank you for contributing to make Advanced Patch Generator better for everyone!