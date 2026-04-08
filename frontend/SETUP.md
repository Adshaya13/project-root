# Campus Hub - Frontend Setup Guide

Welcome to the Campus Hub frontend repository! Since this is a group project, this guide will help all team members quickly set up and run the frontend application on their local machines.

## Prerequisites

Before you begin, ensure you have the following installed on your PC:
1. **Node.js**: We recommend using Node.js v18.x or higher. You can download it from [nodejs.org](https://nodejs.org/).
2. **Git**: Required for version control and pulling project updates.
3. **IDE/Editor**: We recommend using [Visual Studio Code (VS Code)](https://code.visualstudio.com/) for development.

## 1. Installing Dependencies

Once you have cloned the repository and navigated into the `frontend` folder (`cd frontend`), you must install all the required JavaScript packages and dependencies. 

Since this project contains a `package.json` and a lock file, you can install the dependencies using either **yarn** (recommended as there is a `yarn.lock` file) or **npm**.

Using **npm**:
```bash
npm install
```

Or using **yarn** (if you have it installed):
```bash
yarn install
```

### Important Dependencies Added:
We have integrated some modern UI libraries to enhance the user experience:
- **framer-motion**: For high-quality animations and parallax effects.
- **lucide-react**: Our primary icon library for a clean, consistent look.
- **shadcn/ui**: A collection of high-performance, accessible UI components.
- **Magic UI (BorderBeam)**: Used for premium visual effects like the glowing borders on login cards.

## 2. Running the Development Server

To start the application locally and see your changes in real-time, run the following command in the `frontend` folder:

Using **npm**:
```bash
npm start
```

Or using **yarn**:
```bash
yarn start
```

This command will start the development server. 
- Open your browser and navigate to **`http://localhost:3000`** to view the **Landing Page**.
- The page will automatically reload if you make edits to the code.
- You will see any lint errors or compilation warnings in the terminal window.

## 3. Project Structure Highlights

If you're jumping in to make edits, here are where the important files live:
- `src/pages/Home.jsx`: The new premium landing page with parallax scrolling.
- `src/pages/auth/Login.jsx`: Updated login page with glassmorphism and animated borders.
- `src/components/ui/`: Contains shadcn and custom UI components (Parallax, Cards, Buttons, etc.).
- `src/registry/magicui/`: Custom animation components like `BorderBeam`.
- `public/images/`: Assets for the hero sections and background images.
- `src/context/`: State management (e.g., AuthContext).
- `src/services/`: API configuration and service calls connecting to our backend.

## Troubleshooting

- **"Port 3000 is already in use"**: If you see this error when running `npm start`, it means another process is using the port. The terminal will usually ask if you want to use another port (like 3001). Type `Y` and press enter.
- **Missing Dependencies**: Check if you have properly run `npm install`. Sometimes pulling new changes from Git requires running `npm install` again to add recently added packages!
- **White Screen / CORS errors**: Ensure the backend server is also running on its designated port, and that both the frontend and backend CORS configurations match.

---
*Happy coding, team!*
