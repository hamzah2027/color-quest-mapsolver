
import React, { useState, useRef, useEffect } from 'react';
import { Region, MapData } from '@/lib/mapColoringUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Square, Link, Circle } from 'lucide-react';

type Point = { x: number; y: number };

const MapEditor: React.FC<{
  mapData: MapData;
  onChange: (newMapData: MapData) => void;
}> = ({ mapData, onChange }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [mode, setMode] = useState<'draw' | 'link' | 'select'>('select');
  const [points, setPoints] = useState<Point[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [linkSource, setLinkSource] = useState<string | null>(null);

  const handleSvgClick = (e: React.MouseEvent) => {
    if (mode !== 'draw') return;
    
    const svg = svgRef.current;
    if (!svg) return;
    
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    
    setPoints([...points, { x: svgP.x, y: svgP.y }]);
  };

  const createRegion = () => {
    if (points.length < 3) return;
    
    const path = points.map((p, i) => {
      return `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`;
    }).join(' ') + ' Z';
    
    const newRegion: Region = {
      id: `region-${Date.now()}`,
      name: `Region ${mapData.regions.length + 1}`,
      path,
      color: null,
      adjacentRegions: [],
    };
    
    onChange({
      ...mapData,
      regions: [...mapData.regions, newRegion]
    });
    
    setPoints([]);
  };

  const handleRegionClick = (region: Region) => {
    if (mode === 'select') {
      setSelectedRegion(region.id === selectedRegion ? null : region.id);
    } else if (mode === 'link') {
      if (!linkSource) {
        setLinkSource(region.id);
      } else if (linkSource !== region.id) {
        // Add bidirectional links between regions
        const updatedRegions = mapData.regions.map(r => {
          if (r.id === linkSource && !r.adjacentRegions.includes(region.id)) {
            return {
              ...r,
              adjacentRegions: [...r.adjacentRegions, region.id]
            };
          }
          if (r.id === region.id && !r.adjacentRegions.includes(linkSource)) {
            return {
              ...r,
              adjacentRegions: [...r.adjacentRegions, linkSource]
            };
          }
          return r;
        });
        
        onChange({
          ...mapData,
          regions: updatedRegions
        });
        
        setLinkSource(null);
      }
    }
  };

  const renameRegion = (id: string, newName: string) => {
    const updatedRegions = mapData.regions.map(r => 
      r.id === id ? { ...r, name: newName } : r
    );
    
    onChange({
      ...mapData,
      regions: updatedRegions
    });
  };

  const deleteRegion = (id: string) => {
    // Remove the region and any adjacency references to it
    const updatedRegions = mapData.regions
      .filter(r => r.id !== id)
      .map(r => ({
        ...r,
        adjacentRegions: r.adjacentRegions.filter(adjId => adjId !== id)
      }));
    
    onChange({
      ...mapData,
      regions: updatedRegions
    });
    
    setSelectedRegion(null);
  };

  const removeLink = (regionId1: string, regionId2: string) => {
    const updatedRegions = mapData.regions.map(r => {
      if (r.id === regionId1) {
        return {
          ...r,
          adjacentRegions: r.adjacentRegions.filter(id => id !== regionId2)
        };
      }
      if (r.id === regionId2) {
        return {
          ...r,
          adjacentRegions: r.adjacentRegions.filter(id => id !== regionId1)
        };
      }
      return r;
    });
    
    onChange({
      ...mapData,
      regions: updatedRegions
    });
  };

  // Clear everything when switching modes
  useEffect(() => {
    setPoints([]);
    setSelectedRegion(null);
    setLinkSource(null);
  }, [mode]);

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={mode === 'select' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setMode('select')}
                  >
                    <Circle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Select</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={mode === 'draw' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setMode('draw')}
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Draw Region</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={mode === 'link' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setMode('link')}
                  >
                    <Link className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Link Regions</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {mode === 'draw' && points.length >= 3 && (
            <Button onClick={createRegion}>
              Create Region
            </Button>
          )}
          
          {mode === 'link' && linkSource && (
            <div className="text-sm">
              Select another region to link with{' '}
              <span className="font-medium">
                {mapData.regions.find(r => r.id === linkSource)?.name}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2"
                onClick={() => setLinkSource(null)}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        <div className="border rounded-md p-1 bg-white">
          <svg 
            ref={svgRef}
            width="100%" 
            height="400" 
            onClick={handleSvgClick}
            className="cursor-crosshair" 
            viewBox="0 0 300 250"
          >
            {/* Draw existing regions */}
            {mapData.regions.map((region) => (
              <path
                key={region.id}
                d={region.path}
                className={`map-region ${region.id === selectedRegion ? 'stroke-primary stroke-2' : 'map-region-border'} ${
                  region.id === linkSource ? 'stroke-primary stroke-2' : ''
                }`}
                fill={region.color || "#e5e7eb"}
                onClick={() => handleRegionClick(region)}
              />
            ))}

            {/* Draw the points and line for the current region being created */}
            {mode === 'draw' && points.length > 0 && (
              <>
                <path
                  d={points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
                {points.map((point, index) => (
                  <circle
                    key={index}
                    cx={point.x}
                    cy={point.y}
                    r="3"
                    fill="#3B82F6"
                  />
                ))}
              </>
            )}

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
          </svg>
        </div>

        {/* Region properties panel */}
        {selectedRegion && (
          <div className="mt-4 border rounded-md p-4">
            <h3 className="font-medium mb-2">Region Properties</h3>
            
            {(() => {
              const region = mapData.regions.find(r => r.id === selectedRegion);
              if (!region) return null;
              
              return (
                <>
                  <div className="mb-3">
                    <label htmlFor="regionName" className="block text-sm font-medium">
                      Name
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="text"
                        id="regionName"
                        className="flex-1 rounded-md border-gray-300 border px-3 py-2 text-sm"
                        value={region.name}
                        onChange={(e) => renameRegion(region.id, e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium">Adjacent Regions</label>
                    <ul className="mt-1 space-y-1">
                      {region.adjacentRegions.length === 0 ? (
                        <li className="text-sm text-gray-500">No adjacent regions</li>
                      ) : (
                        region.adjacentRegions.map(adjId => {
                          const adjRegion = mapData.regions.find(r => r.id === adjId);
                          return (
                            <li key={adjId} className="flex justify-between items-center">
                              <span className="text-sm">{adjRegion?.name}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeLink(region.id, adjId)}
                              >
                                Remove
                              </Button>
                            </li>
                          );
                        })
                      )}
                    </ul>
                  </div>
                  
                  <div className="mt-4">
                    <Button 
                      variant="destructive"
                      onClick={() => deleteRegion(region.id)}
                    >
                      Delete Region
                    </Button>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MapEditor;
