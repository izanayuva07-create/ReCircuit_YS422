import React from 'react';
import LocationCard from './LocationCard';
import type { LocationCardProps } from './LocationCard';

const RecyclerCard: React.FC<LocationCardProps> = (props) => <LocationCard {...props} />;

export default RecyclerCard;
