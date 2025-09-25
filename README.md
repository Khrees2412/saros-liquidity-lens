# Liquidity Lens — A Saros DLMM Demo

This project, **Liquidity Lens**, is a comprehensive demo application developed for the Saros DLMM Hackathon. It serves as a practical showcase for leveraging the `@saros-finance/dlmm-sdk` to construct a robust, real-world application for managing liquidity within Saros's Dynamic Liquidity Market Maker (DLMM) protocol.
The application provides users with tools to interact with DLMM pools on the Solana blockchain, offering functionalities that enhance liquidity provision and monitoring.

This project is built with Next.js (App Router), Bun, Tailwind CSS, and shadcn/ui.

**Live Demo:** [**Add your live deployed app link here!**]

## Core Features

-   **Wallet Connection:** Connect your Phantom wallet (or any other wallet compatible with `@solana/wallet-adapter-react`).
-   **Pool Discovery:** Browse, search, filter, and sort from a list of available DLMM pools on Saros, with enriched information like current price and liquidity.
-   **Create Liquidity Position:** Open a new liquidity position with a custom price range. The app provides a real-time preview of estimated fees and liquidity distribution before you sign.
-   **Position Dashboard:** Track your active liquidity positions, monitor profit and loss (PnL), and visualize impermanent loss for each position.
-   **Impermanent Loss (IL) Chart:** A visual representation of impermanent loss, adapted to show the range of concentrated liquidity positions, built with Recharts.

## Tech Stack

-   **Framework:** [Next.js](https://nextjs.org/) (using the App Router)
-   **Package Manager:** [Bun](https://bun.sh/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
-   **Saros Integration:** [@saros-finance/dlmm-sdk](https://www.npmjs.com/package/@saros-finance/dlmm-sdk) - Used for fetching pool data, managing user positions, and creating liquidity positions.
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

## Future Enhancements

-   **Advanced IL Calculation:** Implement a more precise impermanent loss calculation for concentrated liquidity positions.
-   **Position Management:** Add features for adjusting liquidity ranges, adding/removing liquidity, and closing positions.
-   **Strategy Vaults:** Explore integration with simplified strategy vaults for automated liquidity management.
-   **Real-time Data:** Integrate actual market data for total liquidity, 24h volume, and APR for pools.
-   **Comprehensive Analytics:** Provide more in-depth analytics for user positions, including historical performance.

## Learn More

To learn more about the technologies used in this project, check out the following resources:

-   [Saros Finance Documentation](https://docs.saros.finance/)
-   [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
-   [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
-   [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)
-   [shadcn/ui Documentation](https://ui.shadcn.com/docs)
-   [Tailwind CSS Documentation](https://tailwindcss.com/docs)
