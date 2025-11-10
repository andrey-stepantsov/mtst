# Montana Swimming Time Standards Calculator

A single-page application to help swimmers and coaches easily check swimming times against the official Montana Swimming time standards for various age groups and courses.

## Features

- Select age group and gender to view relevant standards.
- Add swimming events for both Short Course Yards (SCY) and Long Course Meters (LCM).
- Enter a time for an event to see which standard ("cut") has been achieved.
- Calculates and displays the time difference to the next higher standard.
- Your selected events and times are saved in your browser for your next visit.

## Development

This repository contains the `mtst-spa` single-page application. The application was bootstrapped with [Vite](https://vitejs.dev/) and [React](https://react.dev/).

### Prerequisites

- Node.js (v18 or later recommended)
- npm

### Getting Started

1.  Clone the repository.

2.  Navigate into the application directory:
    ```sh
    cd mtst-spa
    ```

3.  Install dependencies:
    ```sh
    npm install
    ```

4.  Run the development server:
    ```sh
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

### Managing Standards Data

The swimming time standards are sourced from CSV files located in the `standards/` directory at the root of this repository.

The `mtst-spa` application contains a script to process these CSV files into a JSON format that the application uses.

To update the standards:

1.  Place the new or updated CSV files in the `standards/` directory. The file naming convention is important for the data generation script.
2.  Navigate into the `mtst-spa` directory if you are not already there.
3.  Run the script to process the CSVs and generate the JSON data:
    ```sh
    npm run generate-standards
    ```
    This script will parse the CSV files from `../standards/` and output JSON files into the `mtst-spa/public/standards/` directory.
