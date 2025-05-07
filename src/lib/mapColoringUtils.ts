
export type Region = {
  id: string;
  name: string;
  path: string;
  color: string | null;
  adjacentRegions: string[];
};

export type MapData = {
  regions: Region[];
};

// Default color palette for map regions
export const MAP_COLORS = [
  "#3B82F6", // blue
  "#10B981", // green
  "#8B5CF6", // purple
  "#EF4444", // red
];

// Check if a color assignment is valid for a specific region
export function isColorValid(
  regions: Region[],
  regionId: string,
  color: string
): boolean {
  const region = regions.find((r) => r.id === regionId);
  if (!region) return false;

  return !region.adjacentRegions.some((adjacentId) => {
    const adjacentRegion = regions.find((r) => r.id === adjacentId);
    return adjacentRegion?.color === color;
  });
}

// Backtracking algorithm to solve the map coloring problem
export function solveMapColoring(
  regions: Region[],
  maxColors: number = 4,
  onStep?: (regions: Region[], currentRegionId: string | null) => void
): Region[] | null {
  const colors = MAP_COLORS.slice(0, maxColors);
  const uncoloredRegions = [...regions].map((r) => ({ ...r, color: null }));
  
  // Sort regions by most constraints (most adjacent regions) first for better performance
  const sortedRegionIds = [...uncoloredRegions]
    .sort((a, b) => b.adjacentRegions.length - a.adjacentRegions.length)
    .map((r) => r.id);

  function backtrack(index: number): boolean {
    // Base case: all regions colored
    if (index === sortedRegionIds.length) {
      return true;
    }

    const regionId = sortedRegionIds[index];
    
    // Try each color
    for (const color of colors) {
      if (isColorValid(uncoloredRegions, regionId, color)) {
        // Set color for this region
        const region = uncoloredRegions.find((r) => r.id === regionId)!;
        region.color = color;
        
        // Notify about progress if callback provided
        if (onStep) {
          onStep([...uncoloredRegions], regionId);
        }
        
        // Proceed to next region
        if (backtrack(index + 1)) {
          return true;
        }
        
        // If we reach here, this color didn't work, backtrack
        region.color = null;
        
        // Notify about backtracking if callback provided
        if (onStep) {
          onStep([...uncoloredRegions], regionId);
        }
      }
    }
    
    return false;
  }
  
  // Start backtracking with the first region
  const success = backtrack(0);
  return success ? uncoloredRegions : null;
}

// Animation delay helpers
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Sample maps for demonstration
export const sampleMaps: { [key: string]: MapData } = {
  australia: {
    regions: [
      {
        id: "wa",
        name: "Western Australia",
        path: "M10,60 L60,40 L70,120 L20,150 Z",
        color: null,
        adjacentRegions: ["nt", "sa"]
      },
      {
        id: "nt",
        name: "Northern Territory",
        path: "M60,40 L120,40 L110,100 L70,120 Z",
        color: null,
        adjacentRegions: ["wa", "sa", "qld"]
      },
      {
        id: "sa",
        name: "South Australia",
        path: "M70,120 L110,100 L140,140 L100,180 Z",
        color: null,
        adjacentRegions: ["wa", "nt", "qld", "nsw", "vic"]
      },
      {
        id: "qld",
        name: "Queensland",
        path: "M110,100 L120,40 L200,50 L170,130 L140,140 Z",
        color: null,
        adjacentRegions: ["nt", "sa", "nsw"]
      },
      {
        id: "nsw",
        name: "New South Wales",
        path: "M140,140 L170,130 L190,160 L150,180 Z",
        color: null,
        adjacentRegions: ["sa", "qld", "vic"]
      },
      {
        id: "vic",
        name: "Victoria",
        path: "M140,180 L150,180 L180,190 L130,190 Z",
        color: null,
        adjacentRegions: ["sa", "nsw", "tas"]
      },
      {
        id: "tas",
        name: "Tasmania",
        path: "M150,210 C150,210 160,200 170,210 C180,220 160,230 150,220 C140,210 150,210 150,210 Z",
        color: null,
        adjacentRegions: ["vic"]
      }
    ]
  },
  usa: {
    regions: [
      {
        id: "west",
        name: "West Coast",
        path: "M20,40 L60,20 L80,100 L40,120 Z",
        color: null,
        adjacentRegions: ["mountain", "southwest"]
      },
      {
        id: "mountain",
        name: "Mountain",
        path: "M60,20 L120,30 L130,110 L80,100 Z",
        color: null,
        adjacentRegions: ["west", "midwest", "southwest"]
      },
      {
        id: "midwest",
        name: "Midwest",
        path: "M120,30 L200,40 L190,100 L130,110 Z",
        color: null,
        adjacentRegions: ["mountain", "northeast", "south"]
      },
      {
        id: "northeast",
        name: "Northeast",
        path: "M200,40 L240,50 L220,90 L190,100 Z",
        color: null,
        adjacentRegions: ["midwest", "south"]
      },
      {
        id: "southwest",
        name: "Southwest",
        path: "M40,120 L80,100 L130,110 L120,160 L60,150 Z",
        color: null,
        adjacentRegions: ["west", "mountain", "south"]
      },
      {
        id: "south",
        name: "South",
        path: "M130,110 L190,100 L220,90 L200,150 L120,160 Z",
        color: null,
        adjacentRegions: ["midwest", "northeast", "southwest"]
      }
    ]
  },
  // Custom empty map for users to create their own
  custom: {
    regions: []
  }
};
