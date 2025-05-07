
import React, { useState, useEffect } from 'react';
import { Region, MapData, solveMapColoring, delay, MAP_COLORS } from '@/lib/mapColoringUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

const AlgorithmVisualizer: React.FC<{
  mapData: MapData;
  onSolutionFound: (coloredRegions: Region[]) => void;
}> = ({ mapData, onSolutionFound }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [stepDelay, setStepDelay] = useState(500);
  const [maxColors, setMaxColors] = useState(4);
  const [visualizationState, setVisualizationState] = useState<{
    regions: Region[];
    currentRegion: string | null;
    step: number;
    backtrackCount: number;
  }>({
    regions: mapData.regions,
    currentRegion: null,
    step: 0,
    backtrackCount: 0
  });
  const [logs, setLogs] = useState<string[]>([]);

  // Reset visualization state when map data changes
  useEffect(() => {
    setVisualizationState({
      regions: mapData.regions.map(r => ({ ...r, color: null })),
      currentRegion: null,
      step: 0,
      backtrackCount: 0
    });
    setLogs([]);
  }, [mapData]);

  const startVisualization = async () => {
    if (isRunning) return;
    setIsRunning(true);
    
    // Reset state
    setVisualizationState({
      regions: mapData.regions.map(r => ({ ...r, color: null })),
      currentRegion: null,
      step: 0,
      backtrackCount: 0
    });
    setLogs(["Starting map coloring algorithm..."]);
    
    try {
      let prevRegionId: string | null = null;
      let step = 0;
      let backtrackCount = 0;
      
      const solution = await solveMapColoring(
        mapData.regions,
        maxColors,
        async (regions, currentRegionId) => {
          step++;
          const currentRegion = regions.find(r => r.id === currentRegionId);
          
          // Determine if we're backtracking
          if (prevRegionId && currentRegionId === prevRegionId && !currentRegion?.color) {
            backtrackCount++;
            setLogs(prev => [...prev, `Step ${step}: Backtracking from region "${currentRegion?.name}" - no valid color found`]);
          } else if (currentRegionId) {
            setLogs(prev => [...prev, `Step ${step}: Trying ${currentRegion?.color || 'a color'} for region "${currentRegion?.name}"`]);
          }
          
          setVisualizationState({
            regions,
            currentRegion: currentRegionId,
            step,
            backtrackCount
          });
          
          prevRegionId = currentRegionId;
          await delay(stepDelay);
        }
      );
      
      if (solution) {
        setLogs(prev => [...prev, `Success! Map colored with ${maxColors} colors.`]);
        onSolutionFound(solution);
      } else {
        setLogs(prev => [...prev, `Failed to color the map with ${maxColors} colors.`]);
      }
    } catch (error) {
      console.error("Error during visualization:", error);
      setLogs(prev => [...prev, `Error: ${error instanceof Error ? error.message : 'Unknown error'}`]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Algorithm Visualization</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="max-colors">Maximum Colors: {maxColors}</Label>
            <Slider
              id="max-colors"
              min={1}
              max={MAP_COLORS.length}
              step={1}
              value={[maxColors]}
              onValueChange={(value) => setMaxColors(value[0])}
              disabled={isRunning}
              className="my-2"
            />
            
            <div className="flex gap-2 my-2">
              {MAP_COLORS.slice(0, maxColors).map((color, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-md"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          
          <div>
            <Label htmlFor="step-delay">Animation Speed</Label>
            <div className="flex items-center gap-2 my-2">
              <span className="text-sm">Slow</span>
              <Slider
                id="step-delay"
                min={100}
                max={1000}
                step={100}
                value={[stepDelay]}
                onValueChange={(value) => setStepDelay(value[0])}
                disabled={isRunning}
                className="flex-1"
              />
              <span className="text-sm">Fast</span>
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button
              onClick={startVisualization}
              disabled={isRunning || mapData.regions.length === 0}
              className="w-full"
            >
              {isRunning ? "Solving..." : "Start Visualization"}
            </Button>
          </div>
          
          <div className="mt-4">
            <div className="bg-muted p-3 rounded-md h-40 overflow-y-auto text-sm">
              {logs.length === 0 ? (
                <p className="text-muted-foreground">
                  Algorithm logs will appear here...
                </p>
              ) : (
                logs.map((log, i) => (
                  <div 
                    key={i}
                    className={`mb-1 ${i === logs.length - 1 ? 'animate-pulse-once' : ''}`}
                  >
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="mt-2 text-sm text-muted-foreground">
            <p>
              <strong>Step:</strong> {visualizationState.step} |{' '}
              <strong>Backtracks:</strong> {visualizationState.backtrackCount}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlgorithmVisualizer;
