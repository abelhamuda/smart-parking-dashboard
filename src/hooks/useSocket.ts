import { useEffect } from 'react';
import { socketService } from '../services/socket';

export function useSocket<T>(event: string, callback: (data: T) => void) {
  useEffect(() => {
    socketService.connect();
    
    // Create a stable callback reference
    const callbackRef = (data: T) => {
      callback(data);
    };
    
    socketService.on(event, callbackRef);

    return () => {
      socketService.off(event, callbackRef);
    };
  }, [event, callback]);
}
