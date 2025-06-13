# Assessment

<p align="center">
  <img src="public/assessment-logo.svg" alt="Assessment Logo" width="120" />
</p>

## Overview

Assessment is a Next.js application designed to evaluate and monitor system capabilities for video conferencing and similar applications. It provides real-time checks for webcam access, microphone functionality, network connectivity, and lighting conditions to ensure optimal user experience.

## Features

- **System Status Monitoring**: Real-time monitoring of critical system components
- **Webcam Access Check**: Verifies camera permissions and functionality
- **Lighting Quality Analysis**: Analyzes lighting conditions to ensure optimal video quality
- **Network Connectivity Test**: Monitors network status for stable connections
- **Responsive UI**: Modern interface built with Tailwind CSS

## Technologies

- **Framework**: Next.js 15.3.3
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React, Iconsax
- **Media Handling**: React Webcam
- **State Management**: Zustand
- **Development**: TypeScript, ESLint, Prettier

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- pnpm package manager

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/frizzyondabeat/assessment.git
   cd assessment
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Start the development server:

   ```bash
   pnpm dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

The application will guide you through a series of system checks:

1. **Webcam Check**: Grants access to your camera to verify it's working properly
2. **Lighting Check**: Analyzes the lighting conditions in your environment
3. **Microphone Check**: Verifies your microphone is functioning correctly
4. **Network Check**: Tests your internet connection stability

Each check will display a status indicator showing whether the component is:

- Checking (in progress)
- Good/Granted (passed)
- Poor/Denied (failed)
- Error (technical issue)

## Development Commands

- `pnpm dev`: Start the development server with Turbopack
- `pnpm build`: Build the application for production
- `pnpm start`: Start the production server
- `pnpm lint`: Run ESLint to check for code issues
- `pnpm format`: Check code formatting with Prettier
- `pnpm format:fix`: Automatically fix code formatting issues

## CI/CD

This project uses GitHub Actions for continuous integration and deployment:

- **Pull Request Workflow (CI)**: Automatically runs on every PR to the `main` branch
  - Formats code using Prettier
  - Commits any formatting changes back to the PR
  - Runs ESLint to ensure code quality

- **Main Branch Workflow (CD)**: Automatically runs when changes are pushed to the `main` branch
  - Builds a Docker image of the application
  - Pushes the image to GitHub Container Registry (ghcr.io)
  - Tags the image with the commit SHA, branch name, and 'latest'

The workflow configurations can be found in:
- `.github/workflows/ci.yml` - Continuous Integration
- `.github/workflows/cd.yml` - Continuous Deployment

### Docker Deployment

For production deployment, a dedicated `docker-compose.prod.yml` file is provided with:
- Production-specific configurations
- Health checks for reliability
- Resource limits for stability
- Automatic container restart

See [Docker README](README.Docker.md) for more details on Docker usage.

## License

[Add your license information here]

## Contributing

[Add contribution guidelines here]
