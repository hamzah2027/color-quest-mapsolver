
import React from 'react';
import { Region, MapData } from '@/lib/mapColoringUtils';
import { Card, CardContent } from '@/components/ui/card';

const MapViewer: React.FC<{ 
  mapData: MapData;
  highlightRegion?: string | null;
}> = ({ mapData, highlightRegion }) => {
  return (
    <Card className="w-full h-full">
      <CardContent className="p-6">
        <svg 
          width="100%" 
          height="400" 
          viewBox="0 0 300 250"
          className="border rounded-md p-1 bg-white"
        >
          {/* Draw regions with their assigned colors */}
          {mapData.regions.map((region) => (
            <path
              key={region.id}
              d={region.path}
              className={`map-region map-region-border ${
                region.id === highlightRegion ? 'animate-pulse-once' : ''
              }`}
              fill={region.color || "#e5e7eb"}
            >
              <title>{region.name}</title>
            </path>
          ))}
          
          {/* Draw adjacency lines */}
          <g>
            {mapData.regions.map(region => 
              region.adjacentRegions.map(adjId => {
                // Only draw each connection once
                if (region.id < adjId) {
                  const adjacentRegion = mapData.regions.find(r => r.id === adjId);
                  if (!adjacentRegion) return null;
                  
                  // Calculate center points of both regions (basic approximation)
                  const path1 = region.path;
                  const path2 = adjacentRegion.path;
                  
                  // Very basic centroid calculation - could be improved
                  const getCenter = (path: string) => {
                    const coordinates = path.match(/[0-9]+(\.[0-9]+)?/g);
                    if (!coordinates) return { x: 0, y: 0 };
                    
                    let sumX = 0, sumY = 0, count = 0;
                    for (let i = 0; i < coordinates.length; i += 2) {
                      if (coordinates[i] && coordinates[i + 1]) {
                        sumX += parseFloat(coordinates[i]);
                        sumY += parseFloat(coordinates[i + 1]);
                        count++;
                      }
                    }
                    
                    return {
                      x: sumX / count,
                      y: sumY / count
                    };
                  };
                  
                  const center1 = getCenter(path1);
                  const center2 = getCenter(path2);
                  
                  return (
                    <line
                      key={`${region.id}-${adjId}`}
                      x1={center1.x}
                      y1={center1.y}
                      x2={center2.x}
                      y2={center2.y}
                      stroke="#9ca3af"
                      strokeWidth="1"
                      strokeDasharray="3,3"
                    />
                  );
                }
                return null;
              })
            )}
          </g>

          {/* Region labels */}
          {mapData.regions.map((region) => {
            // Very basic centroid calculation - could be improved
            const getCenter = (path: string) => {
              const coordinates = path.match(/[0-9]+(\.[0-9]+)?/g);
              if (!coordinates) return { x: 0, y: 0 };
              
              let sumX = 0, sumY = 0, count = 0;
              for (let i = 0; i < coordinates.length; i += 2) {
                if (coordinates[i] && coordinates[i + 1]) {
                  sumX += parseFloat(coordinates[i]);
                  sumY += parseFloat(coordinates[i + 1]);
                  count++;
                }
              }
              
              return {
                x: sumX / count,
                y: sumY / count
              };
            };
            
            const center = getCenter(region.path);

            return (
              <text
                key={`label-${region.id}`}
                x={center.x}
                y={center.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                fontWeight="bold"
                fill={region.color ? "#ffffff" : "#000000"}
                className="pointer-events-none"
              >
                {region.name.substring(0, 6) + (region.name.length > 6 ? '..' : '')}
              </text>
            );
          })}
        </svg>
      </CardContent>
    </Card>
  );
};

export default MapViewer;
