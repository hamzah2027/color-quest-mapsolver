
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { MapData, sampleMaps } from '@/lib/mapColoringUtils';
import MapEditor from '@/components/MapEditor';
import AlgorithmVisualizer from '@/components/AlgorithmVisualizer';
import MapViewer from '@/components/MapViewer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

const Index = () => {
  const { toast } = useToast();
  const [mapData, setMapData] = useState<MapData>(sampleMaps.australia);
  const [currentTab, setCurrentTab] = useState<string>('editor');
  const [highlightedRegion, setHighlightedRegion] = useState<string | null>(null);
  
  const handleMapChange = (newMapData: MapData) => {
    setMapData(newMapData);
  };
  
  const handleSolutionFound = (coloredRegions: MapData['regions']) => {
    setMapData({
      ...mapData,
      regions: coloredRegions
    });
    
    toast({
      title: "Solution found!",
      description: "The map has been successfully colored.",
    });
  };
  
  const handleMapSelection = (value: string) => {
    if (value === 'custom') {
      setMapData(sampleMaps.custom);
    } else {
      setMapData(sampleMaps[value as keyof typeof sampleMaps]);
    }
  };
  
  const resetColors = () => {
    setMapData({
      ...mapData,
      regions: mapData.regions.map(r => ({ ...r, color: null }))
    });
  };

  const isCustomMap = !Object.keys(sampleMaps).some(
    key => JSON.stringify(sampleMaps[key as keyof typeof sampleMaps].regions) === JSON.stringify(mapData.regions)
  );

  const saveCustomMap = () => {
    // In a real application, we might save to localStorage or a backend
    toast({
      title: "Map saved",
      description: "Your custom map has been saved (demo only).",
    });
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Map Coloring Problem Solver</CardTitle>
          <CardDescription>
            Create, visualize, and solve the map coloring problem using constraint satisfaction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The map coloring problem is a classic constraint satisfaction problem in AI where we need to 
            assign colors to different regions on a map such that no adjacent regions share the same color. 
            This tool allows you to create your own map or use sample maps, visualize the backtracking algorithm, 
            and see the solution.
          </p>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="mb-6">
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="editor">Map Editor</TabsTrigger>
                <TabsTrigger value="solution">Solution</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2">
                <Select
                  onValueChange={handleMapSelection}
                  defaultValue="australia"
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a map" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="australia">Australia</SelectItem>
                    <SelectItem value="usa">USA</SelectItem>
                    <SelectItem value="custom">New Custom Map</SelectItem>
                  </SelectContent>
                </Select>
                
                {isCustomMap && (
                  <Button variant="outline" onClick={saveCustomMap}>
                    Save Map
                  </Button>
                )}
                
                <Button variant="outline" onClick={resetColors}>
                  Reset Colors
                </Button>
              </div>
            </div>

            <TabsContent value="editor" className="mt-4">
              <MapEditor mapData={mapData} onChange={handleMapChange} />
            </TabsContent>
            
            <TabsContent value="solution" className="mt-4">
              <MapViewer mapData={mapData} highlightRegion={highlightedRegion} />
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <AlgorithmVisualizer 
            mapData={mapData} 
            onSolutionFound={handleSolutionFound} 
          />
        </div>
      </div>
      
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>About Map Coloring</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose">
            <p>
              The map coloring problem is a constraint satisfaction problem where we need to assign colors
              to regions on a map such that no adjacent regions share the same color.
            </p>
            <h4>Four Color Theorem</h4>
            <p>
              The Four Color Theorem states that any map can be colored using at most four colors,
              ensuring no adjacent regions share the same color. This theorem was proven in 1976.
            </p>
            <h4>Backtracking Algorithm</h4>
            <p>
              This tool uses a backtracking algorithm to solve the map coloring problem:
            </p>
            <ol className="list-decimal pl-6">
              <li>Start with an uncolored map</li>
              <li>Try to color one region at a time with an available color</li>
              <li>Check if the coloring violates any constraints (adjacent regions with same color)</li>
              <li>If valid, move to the next region</li>
              <li>If not valid, try a different color or backtrack to a previous region</li>
              <li>Continue until all regions are colored or all possibilities are exhausted</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
