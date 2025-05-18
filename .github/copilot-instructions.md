# Timelapse Frontend Viewer Coding Instructions

## Project Overview
This is a React-based frontend application for viewing and managing timelapse images captured by the camera frontend.

## Technology Stack
- React with TypeScript
- Vite as the build tool
- Shadcn/UI for component styling
- Flexbox for layout positioning

## Coding Standards
- Use TypeScript for type safety with proper interface definitions
- Use functional components with React hooks
- Follow component-based architecture
- Prefer arrow function syntax for component definitions
- Use async/await for asynchronous operations
- Use Shadcn/UI components for all UI elements
- Use the native Fetch API for network requests

## Component Guidelines
- Keep components small and focused on a single responsibility
- Use Shadcn/UI components following their documentation
- Use proper TypeScript interfaces for props and state
- Implement proper error handling for API calls and data processing
- Use semantic HTML elements where appropriate
- Ensure accessibility compliance

## Styling Guidelines
- Use Tailwind CSS classes via Shadcn/UI
- Use Flexbox for component positioning and layouts
- Do not create custom CSS classes except for specific layouts
- Follow the Shadcn/UI theming system
- Maintain responsive design principles

## State Management
- Use React hooks (useState, useEffect, useRef) for state management
- Organize state logically by feature or component
- Use context API for deeply nested component trees if needed
- Implement proper loading and error states

## Performance Considerations
- Use lazy loading for images in gallery view
- Implement virtualization for large image collections
- Use memo and useCallback for expensive operations
- Implement proper cleanup in useEffect hooks to prevent memory leaks
- Consider web workers for intensive operations like video processing
