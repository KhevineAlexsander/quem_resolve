import React from 'react';
import { Professional } from '../types';
import { ProfessionalCard } from './ProfessionalCard';

interface MapViewProps {
  professionals: Professional[];
  selectedProfessionalId?: string;
  onSelectProfessional?: (pro: Professional) => void;
  userCoordinates?: { latitude: number; longitude: number };
  onUserCoordinatesChange?: (coords: { latitude: number; longitude: number }) => void;
  heightClass?: string;
}

export const MapView: React.FC<MapViewProps> = ({
  professionals,
  onSelectProfessional,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {professionals.map(pro => (
        <ProfessionalCard
          key={pro.id}
          professional={pro}
          onRequestQuote={() => onSelectProfessional?.(pro)}
        />
      ))}
    </div>
  );
};
