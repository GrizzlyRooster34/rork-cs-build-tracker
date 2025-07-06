# Contributing to CS Build Tracker

Thank you for your interest in contributing to CS Build Tracker! This document provides guidelines and information for contributors.

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Expo CLI (`npm install -g @expo/cli`)
- Git
- A code editor (VS Code recommended)

### Development Setup

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/yourusername/cs-build-tracker.git
   cd cs-build-tracker
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run start
   ```

5. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow the existing code style and patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Keep components small and focused

### File Structure

- Place reusable components in `/components`
- Store types in `/types/index.ts`
- Create new stores in `/store` for state management
- Add utilities in `/utils`
- Follow Expo Router conventions for pages in `/app`

### State Management

- Use Zustand for complex state management
- Persist data with AsyncStorage when appropriate
- Keep stores focused on specific domains
- Use TypeScript interfaces for store state

### Mobile-First Development

- Design for mobile screens first
- Test on both iOS and Android
- Ensure web compatibility (avoid mobile-only APIs)
- Use responsive design principles
- Consider one-handed usage patterns

### Testing

- Test on multiple platforms (iOS, Android, Web)
- Verify data persistence works correctly
- Test edge cases (empty states, large datasets)
- Ensure proper error handling

## Contribution Types

### Bug Fixes

1. Check if the issue already exists in GitHub Issues
2. Create a new issue if it doesn't exist
3. Reference the issue number in your commit message
4. Include steps to reproduce the bug
5. Test your fix thoroughly

### New Features

1. Discuss the feature in GitHub Issues first
2. Ensure it fits the app's purpose (VW Passat B6 project tracking)
3. Follow the existing UI/UX patterns
4. Add appropriate TypeScript types
5. Update documentation if needed

### Documentation

- Update README.md for significant changes
- Add inline code comments for complex logic
- Update type definitions
- Include examples in documentation

## Pull Request Process

1. Ensure your code follows the project's style guidelines
2. Update documentation as needed
3. Add or update tests if applicable
4. Ensure all existing tests pass
5. Create a clear pull request description:
   - What changes were made
   - Why the changes were necessary
   - How to test the changes
   - Screenshots for UI changes

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Testing
- [ ] Tested on iOS
- [ ] Tested on Android
- [ ] Tested on Web
- [ ] Data persistence works
- [ ] No console errors

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Closes #(issue number)
```

## Code Review Process

1. All pull requests require review before merging
2. Address feedback promptly and professionally
3. Make requested changes in new commits
4. Squash commits before final merge if requested

## Reporting Issues

### Bug Reports

Include:
- Device/platform information
- Steps to reproduce
- Expected vs actual behavior
- Screenshots or videos if helpful
- Console errors if any

### Feature Requests

Include:
- Clear description of the feature
- Use case and benefits
- Mockups or examples if helpful
- Consider how it fits with existing features

## Development Tips

### Working with Expo

- Use `expo start` for development
- Test on physical devices when possible
- Use Expo DevTools for debugging
- Check Expo documentation for API limitations

### State Management

- Keep stores simple and focused
- Use TypeScript for type safety
- Test data persistence thoroughly
- Consider performance implications

### UI/UX Guidelines

- Follow the existing dark theme
- Use the established color palette
- Maintain consistent spacing and typography
- Ensure accessibility (contrast, touch targets)
- Design for various screen sizes

### Performance

- Optimize images and assets
- Use lazy loading where appropriate
- Minimize re-renders
- Profile performance on lower-end devices

## Community Guidelines

- Be respectful and professional
- Help other contributors
- Share knowledge and best practices
- Focus on constructive feedback
- Celebrate successes and learn from mistakes

## Questions?

If you have questions about contributing:

1. Check existing GitHub Issues and Discussions
2. Create a new Discussion for general questions
3. Create an Issue for specific bugs or feature requests
4. Reach out to maintainers if needed

Thank you for contributing to CS Build Tracker! 🚗⚡