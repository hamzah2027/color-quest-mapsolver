
# Map Coloring Problem Solver

An interactive web application for exploring the Map Coloring Problem - a classic problem in AI and constraint satisfaction.

## Features

- Interactive map editor to create custom maps
- Sample pre-defined maps (Australia, USA)
- Visual backtracking algorithm simulation
- Step-by-step visualization of the solving process
- Adjustable visualization speed
- Control over the maximum number of colors used

## About the Map Coloring Problem

The map coloring problem is a classic constraint satisfaction problem where we need to assign colors to different regions on a map such that no adjacent regions share the same color.

### Four Color Theorem

The Four Color Theorem states that any map can be colored using at most four colors, ensuring no adjacent regions share the same color. This theorem was proven in 1976.

### Backtracking Algorithm

This tool uses a backtracking algorithm to solve the map coloring problem:

1. Start with an uncolored map
2. Try to color one region at a time with an available color
3. Check if the coloring violates any constraints (adjacent regions with same color)
4. If valid, move to the next region
5. If not valid, try a different color or backtrack to a previous region
6. Continue until all regions are colored or all possibilities are exhausted

## How to Use

1. Select a sample map or create your own custom map using the editor
2. Configure the maximum number of colors and animation speed
3. Click "Start Visualization" to watch the algorithm solve the map coloring problem
4. Switch between the "Map Editor" and "Solution" tabs to see the final result

## Technical Implementation

- Built with React, TypeScript, and Tailwind CSS
- Uses SVG for map rendering and interaction
- Implements a backtracking algorithm with visualization

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Start the development server with `npm run dev`
4. Open your browser to the local development URL

## License

This project is available under the MIT License.
