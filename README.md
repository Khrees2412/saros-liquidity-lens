# Liquidity Lens — A Saros DLMM Demo

This project, **Liquidity Lens**, is a comprehensive demo application developed for the Saros DLMM Hackathon. It serves as a practical showcase for leveraging the `@saros-finance/dlmm-sdk` to construct a robust, real-world application for managing liquidity within Saros's Dynamic Liquidity Market Maker (DLMM) protocol.
The application provides users with tools to interact with DLMM pools on the Solana blockchain, offering functionalities that enhance liquidity provision and monitoring.

This project is built with Next.js (App Router), Bun, Tailwind CSS, and shadcn/ui.

## Core Features

-   **Wallet Connection:** Connect your Phantom wallet (or any other wallet compatible with `@solana/wallet-adapter-react`).
-   **Pool Discovery:** Browse, search, filter, and sort from a list of available DLMM pools on Saros, with enriched information like current price and liquidity.
-   **Create Liquidity Position:** Open a new liquidity position with a custom price range. The app provides a real-time preview of estimated fees and liquidity distribution before you sign.
-   **Position Dashboard:** Track your active liquidity positions, monitor profit and loss (PnL), and visualize impermanent loss for each position.
-   **Impermanent Loss (IL) Chart:** A visual representation of impermanent loss, adapted to show the range of concentrated liquidity positions, built with Recharts.

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

## Future Enhancements

-   **Advanced IL Calculation:** Implement a more precise impermanent loss calculation for concentrated liquidity positions.
-   **Position Management:** Add features for adjusting liquidity ranges, adding/removing liquidity, and closing positions.
-   **Strategy Vaults:** Explore integration with simplified strategy vaults for automated liquidity management.
-   **Real-time Data:** Integrate actual market data for total liquidity, 24h volume, and APR for pools.
-   **Comprehensive Analytics:** Provide more in-depth analytics for user positions, including historical performance.
