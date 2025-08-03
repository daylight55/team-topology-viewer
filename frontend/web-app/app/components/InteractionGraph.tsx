import { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';
import type { Team, Interaction } from '~/types';

cytoscape.use(fcose);

interface InteractionGraphProps {
  teams: Team[];
  interactions: Interaction[];
}

export function InteractionGraph({ teams, interactions }: InteractionGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const teamTypeColors = {
      stream_aligned: '#3B82F6',
      platform: '#10B981',
      enabling: '#F59E0B',
      complicated_subsystem: '#8B5CF6',
    };
    
    const interactionModeStyles = {
      collaboration: { lineStyle: 'solid', lineColor: '#9333EA' },
      x_as_a_service: { lineStyle: 'dashed', lineColor: '#3B82F6' },
      facilitating: { lineStyle: 'dotted', lineColor: '#10B981' },
    };
    
    const elements = [
      ...teams.map(team => ({
        data: { 
          id: team.id, 
          label: team.name,
          type: team.type,
        },
      })),
      ...interactions.map(interaction => ({
        data: {
          id: `${interaction.teamAId}-${interaction.teamBId}`,
          source: interaction.teamAId,
          target: interaction.teamBId,
          mode: interaction.mode,
          intensity: interaction.intensity,
        },
      })),
    ];
    
    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': (ele: any) => teamTypeColors[ele.data('type') as keyof typeof teamTypeColors] || '#666',
            'label': 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'color': '#fff',
            'text-outline-width': 2,
            'text-outline-color': (ele: any) => teamTypeColors[ele.data('type') as keyof typeof teamTypeColors] || '#666',
            'width': 80,
            'height': 80,
          },
        },
        {
          selector: 'edge',
          style: {
            'width': (ele: any) => {
              const intensity = ele.data('intensity');
              return intensity === 'high' ? 6 : intensity === 'medium' ? 4 : 2;
            },
            'line-color': (ele: any) => interactionModeStyles[ele.data('mode') as keyof typeof interactionModeStyles]?.lineColor || '#999',
            'line-style': (ele: any) => interactionModeStyles[ele.data('mode') as keyof typeof interactionModeStyles]?.lineStyle || 'solid',
            'target-arrow-color': (ele: any) => interactionModeStyles[ele.data('mode') as keyof typeof interactionModeStyles]?.lineColor || '#999',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
          },
        },
      ],
      layout: {
        name: 'fcose',
        quality: 'proof',
        randomize: true,
        animate: true,
        animationDuration: 1000,
        nodeDimensionsIncludeLabels: true,
        nodeRepulsion: 8000,
        idealEdgeLength: 150,
        edgeElasticity: 0.45,
        nestingFactor: 0.1,
        gravity: 0.25,
        numIter: 2500,
        tile: true,
      },
    });
    
    return () => {
      cy.destroy();
    };
  }, [teams, interactions]);
  
  return (
    <div className="relative">
      <div ref={containerRef} className="w-full h-[600px] border border-gray-300 rounded-lg bg-gray-50" />
      <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-md">
        <h4 className="font-semibold mb-2">凡例</h4>
        <div className="space-y-2">
          <div className="text-sm">
            <div className="font-medium mb-1">チームタイプ:</div>
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Stream-aligned</span>
            </div>
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Platform</span>
            </div>
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-4 h-4 bg-amber-500 rounded"></div>
              <span>Enabling</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-violet-500 rounded"></div>
              <span>Complicated Subsystem</span>
            </div>
          </div>
          <div className="text-sm mt-3">
            <div className="font-medium mb-1">インタラクション:</div>
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-8 h-0 border-t-2 border-purple-600"></div>
              <span>Collaboration</span>
            </div>
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-8 h-0 border-t-2 border-blue-600 border-dashed"></div>
              <span>X-as-a-Service</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-0 border-t-2 border-green-600 border-dotted"></div>
              <span>Facilitating</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}