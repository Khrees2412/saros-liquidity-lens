# Liquidity Lens — A Saros DLMM Demo

Liquidity Lens is a demo application built for the Saros DLMM Hackathon. It showcases how to use the `@saros-finance/dlmm-sdk` to build a real-world application for managing liquidity on Saros's Dynamic Liquidity Market Maker (DLMM).

This project is built with Next.js (App Router), Bun, Tailwind CSS, and shadcn/ui.

**Live Demo:** [Deploy your own to Vercel/Netlify to get a live link]

## Core Features

-   **Wallet Connection:** Connect your Phantom wallet (or any other wallet compatible with `@solana/wallet-adapter-react`).
-   **Pool Discovery:** Browse and select from a list of available DLMM pools on Saros.
-   **Create Liquidity Position:** Open a new liquidity position with a custom price range. The app provides a real-time preview of the transaction before you sign.
-   **Position Dashboard (Coming Soon):** Track your active positions, and monitor your profit and loss (PnL).
-   **Impermanent Loss (IL) Chart:** A visual representation of impermanent loss, built with Recharts.

## Tech Stack

-   **Framework:** [Next.js](https://nextjs.org/) (using the App Router)
-   **Package Manager:** [Bun](https://bun.sh/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
-   **Saros Integration:** [@saros-finance/dlmm-sdk](https://www.npmjs.com/package/@saros-finance/dlmm-sdk)
-   **Solana Integration:**
    -   `@solana/web3.js`
    -   `@solana/wallet-adapter-react`
-   **Data Fetching:** [SWR](https://swr.vercel.app/) for real-time pool data.
-   **Utilities:**
    -   `bn.js` for handling large numbers.
    -   `clsx` & `tailwind-merge` for clean class name management.
    -   `recharts` for charting.

## Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/en/) (v18 or higher)
-   [Bun](https://bun.sh/)

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/your-username/liquidlens.git
    cd liquidlens
    ```

2.  Install the dependencies:
    ```bash
    bun install
    ```

### Running the Development Server

To run the app in development mode, execute the following command:

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Learn More

To learn more about the technologies used in this project, check out the following resources:

-   [Saros Finance Documentation](https://docs.saros.finance/)
-   [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
-   [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
-   [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)
-   [shadcn/ui Documentation](https://ui.shadcn.com/docs)
-   [Tailwind CSS Documentation](https://tailwindcss.com/docs)
