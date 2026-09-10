import React from 'react';
import LocationCard from './LocationCard';
import type { LocationCardProps } from './LocationCard';

const CollectorCard: React.FC<LocationCardProps> = (props) => <LocationCard {...props} />;

export default CollectorCard;
