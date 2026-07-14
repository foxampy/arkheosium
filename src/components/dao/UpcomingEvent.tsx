import React from 'react';
import { DAOEvent } from '@/types';
import { format } from 'date-fns';

interface UpcomingEventProps {
  event: DAOEvent;
}

const UpcomingEvent: React.FC<UpcomingEventProps> = ({ event }) => {
  const eventDate = new Date(event.date);
  const day = eventDate.getDate();
  const month = format(eventDate, 'MMM').toUpperCase();
  const timeString = format(eventDate, 'HH:mm');
  const colorClass = event.id % 2 === 0 ? 'accent' : 'primary';
  
  return (
    <div className="p-3 bg-background/30 rounded-lg">
      <div className="flex">
        <div className={`w-12 h-12 bg-${colorClass}/20 rounded-lg flex flex-col items-center justify-center mr-3`}>
          <span className={`text-${colorClass} font-bold`}>{day}</span>
          <span className={`text-${colorClass} text-xs`}>{month}</span>
        </div>
        <div>
          <h4 className="font-space font-medium text-white text-sm">{event.title}</h4>
          <p className="text-white/60 text-xs">{event.description}</p>
          <p className={`text-${colorClass} text-xs mt-1`}>
            {timeString} UTC • {event.isVirtual ? 'Virtual' : event.location}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpcomingEvent;
