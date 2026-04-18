# FormFlow

FormFlow is a modern, premium web application for building, sharing, and analyzing forms. It boasts a stunning, interactive glassmorphism UI, real-time analytics, robust form building features including conditional logic and complex field types, as well as powerful user management backed by a robust Next.js and MongoDB setup.

## Features

*   **Premium Glassmorphism Design:** A beautiful, visually rich, interactive UI built with modern aesthetics in mind, heavily utilizing Framer Motion for animations.
*   **Advanced Form Builder:** Create complex forms with ease. Supports diverse field types, conditional logic functionality, and real-time previews.
*   **Offline Resilience & Auto-Save:** Integrated "Offline Resilience Mode" synced with IndexedDB and a custom `useFormAutoSave` hook ensures that you never lose your work, with visual UI feedback.
*   **Dynamic Custom URLs & Content:** Generate custom vanity URLs with live validation and visual feedback using a bespoke `CustomSlugInput` component.
*   **Comprehensive Analytics:** Rich analytics and submission tracking using Recharts. Track responses, device types, and more.
*   **Authentication & Security:** Secure user authentication with NextAuth.js (supporting Google Sign-In and local credentials).
*   **Responsive & Accessible:** Fully responsive design that works seamlessly across all devices, prioritizing a great mobile and desktop user experience.
*   **Data Export:** Easily export form submissions to CSV format.

## Technology Stack

*   **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) with a specialized Midnight Glassmorphism theme.
*   **UI Components:** [Radix UI](https://www.radix-ui.com/) primitives combined with custom Framer Motion animations.
*   **State Management:** React Hooks, local state, and Context/Providers.
*   **Database:** [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/).
*   **Authentication:** [NextAuth.js](https://next-auth.js.org/).
*   **Drag and Drop:** [@dnd-kit](https://docs.dndkit.com/).
*   **Icons:** [Lucide React](https://lucide.dev/).
*   **Date Handling:** date-fns & react-day-picker.

## Getting Started

Follow these instructions to get a local copy up and running.

### Prerequisites

*   Node.js (v18 or higher recommended)
*   npm, yarn, pnpm, or bun
*   A MongoDB database (e.g., MongoDB Atlas)
*   A Cloudinary account (for handling potential media uploads, if features are expanded)
*   Google Cloud Console account (for Google OAuth credentials)

### Installation

1.  **Clone the repository (or download the source code):**
    ```bash
    git clone <repository-url>
    cd form
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    # or
    bun install
    ```

3.  **Set up Environmental Variables:**
    Create a new file named `.env.local` in the root of the project and populate it with your specific credentials based on the `.env.local.example` (or the provided sample below):

    ```env
    # MongoDB Connection String (Replace with your actual string)
    MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=<AppName>

    # Cloudinary Credentials (Optional, if using image handling)
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret

    # NextAuth Configuration
    # Generate a secret using: openssl rand -base64 32
    NEXTAUTH_SECRET=your_generated_secret
    NEXTAUTH_URL=http://localhost:3000

    # Google OAuth Credentials (for Google Sign In)
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    ```

4.  **Run the Development Server:**
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    # or
    bun dev
    ```

5.  **Access the application:**
    Open [http://localhost:3000](http://localhost:3000) in your web browser.

## Project Structure

A brief overview of the top-level directory structure:

*   `/app`: Next.js App Router paradigm files (`page.tsx`, `layout.tsx`, routing directories like `/api`, `/dashboard`, `/builder`, etc.).
*   `/components`: Reusable UI components. Includes UI primitives (`/components/ui`) and complex custom components like `FormRenderer`, `CustomSlugInput`, `AuthForm`, etc.
*   `/lib`: Utility functions, database connection helpers (`mongodb.ts`), analytics helpers, and authentication configurations.
*   `/models`: Mongoose schemas defining the data structure (`User.ts`, `Form.ts`, `Submission.ts`, `FormActivity.ts`).
*   `/hooks`: Custom React hooks, including custom solutions like offline syncing tools.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
