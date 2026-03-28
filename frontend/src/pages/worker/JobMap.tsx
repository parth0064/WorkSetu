import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { getNearbyJobs, applyForJob } from '@/services/jobService';
import { applyToProject } from '@/services/projectService';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, AlertCircle, Navigation, MapPin, RefreshCcw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const containerStyle = {
  width: '100%',
  height: '500px'
};

const JobMap = () => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  const [center, setCenter] = useState({ lat: 18.5204, lng: 73.8567 }); // Fallback to Pune center
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [loadingLoc, setLoadingLoc] = useState(true);
  const [loadingApply, setLoadingApply] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<'gps' | 'profile' | 'default'>('default');
  const { user } = useAuth();

  // Fetch jobs dynamically based on coordinate anchor
  const fetchJobs = async (lat: number, lng: number) => {
    try {
       const res = await getNearbyJobs(lat, lng, 15); // 15km Discovery Radius
       setJobs(res.data || []);
    } catch (err) {
       toast.error("Failed to fetch nearby geographical jobs");
    }
  };

  const handleFallback = async () => {
    // Attempt to Geocode the worker's registered profile location first!
    if (user?.location) {
      try {
        const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!API_KEY) {
           console.error("VITE_GOOGLE_MAPS_API_KEY IS MISSING! Map will not load corectly.");
        }
        
        const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(user.location)}&key=${API_KEY}`);
        const data = await res.json();
        
        if (data.status === 'OK' && data.results.length > 0) {
           const { lat, lng } = data.results[0].geometry.location;
           setCenter({ lat, lng });
           setGpsStatus('profile');
           setLoadingLoc(false);
           fetchJobs(lat, lng);
           toast.info(`Using your profile location: ${user.location}`);
           return;
        }
      } catch (e) {
        console.error("Profile geocoding failed", e);
      }
    }
    
    // Absolute fallback
    toast.warning("Location access denied. Using default map center.");
    setGpsStatus('default');
    setLoadingLoc(false);
    fetchJobs(center.lat, center.lng);
  };

  const handleLiveGPS = () => {
    setLoadingLoc(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
           const lat = position.coords.latitude;
           const lng = position.coords.longitude;
           setCenter({ lat, lng });
           setGpsStatus('gps');
           setLoadingLoc(false);
           fetchJobs(lat, lng);
           toast.success("Live GPS Location Locked!");
        },
        (err) => {
           console.warn("GPS Permission Denied or Timeout", err);
           handleFallback();
           if (err.code === 1) {
              toast.error("Location Permission Denied. Please enable it in browser settings.");
           }
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    } else {
       handleFallback();
    }
  };

  useEffect(() => {
    handleLiveGPS(); // Attempt Live GPS on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApply = async (id: string, type: 'job' | 'project' = 'job') => {
    setLoadingApply(true);
    try {
      if (type === 'project') {
        await applyToProject(id);
        toast.success("Project Application Sent!", { description: "The constructor has been notified of your interest." });
      } else {
        await applyForJob(id);
        toast.success("Applied Successfully!", { description: "The employer has been notified directly from the map." });
      }
      setSelectedJob(null);
      // Force map refresh
      fetchJobs(center.lat, center.lng);
    } catch (error: any) {
       toast.error(error.response?.data?.message || "Failed to apply");
    } finally {
      setLoadingApply(false);
    }
  };

  if (!isLoaded || loadingLoc) {
    return (
       <div className="h-[500px] flex items-center justify-center bg-secondary/30 rounded-xl border border-border">
           <Loader2 className="animate-spin text-primary mr-3" size={24} /> 
           <span className="font-bold text-muted-foreground">Initializing Live Map Engine...</span>
       </div>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden border border-border shadow-xl">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={13}
        options={{ disableDefaultUI: false }}
      >
        {/* Worker Current Location Marker (Blue Dot) */}
        <Marker 
           position={center} 
           icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#3b82f6',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
           }} 
        />

        {/* Distributed markers (Jobs/Projects) */}
        {jobs.map((item) => {
           // Protection against legacy or malformed location documents in DB
           let lat = 0, lng = 0;
           
           if (item.location?.coordinates) {
              lng = item.location.coordinates[0];
              lat = item.location.coordinates[1];
           } else if (item.type === 'project') {
              // Fallback for projects that only have string addresses: 
              // Create a cluster around the center so they are at least visible on map
              const offset = (Math.random() - 0.5) * 0.02;
              lat = center.lat + offset;
              lng = center.lng + offset;
           } else {
              return null;
           }

           return (
             <Marker
               key={item._id}
               position={{ lat, lng }}
               onClick={() => setSelectedJob(item)}
               animation={window.google.maps.Animation.DROP}
               icon={item.type === 'project' ? "http://maps.google.com/mapfiles/ms/icons/green-dot.png" : undefined}
             />
           );
        })}

        {/* Interactive Popup GUI for active Marker */}
        {selectedJob && (
           <InfoWindow
             position={
               selectedJob.location?.coordinates 
               ? { lng: selectedJob.location.coordinates[0], lat: selectedJob.location.coordinates[1] }
               : center // Fallback for geocoding
             }
             onCloseClick={() => setSelectedJob(null)}
           >
              <div className="p-2 max-w-[220px]">
                 <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-extrabold text-sm truncate text-foreground">{selectedJob.title}</h3>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${selectedJob.type === 'project' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
                       {selectedJob.type === 'project' ? 'Project' : 'Job'}
                    </span>
                 </div>
                 <p className="text-xs text-foreground mb-2 flex justify-between">
                    <span className="font-semibold text-muted-foreground mr-2">{selectedJob.type === 'project' ? 'Wage/Day' : 'Wage'}:</span> 
                    <span className="text-success font-black tracking-wider">₹{selectedJob.wage}</span>
                 </p>
                 <p className="text-[10px] text-muted-foreground mb-3 leading-tight line-clamp-2">
                     {selectedJob.location?.address || selectedJob.location || "Area unknown"}
                 </p>
                 
                 <Button 
                    size="sm" 
                    className="w-full h-8 text-[11px] font-black uppercase tracking-widest" 
                    onClick={() => handleApply(selectedJob._id, selectedJob.type)}
                    disabled={loadingApply}
                 >
                    {loadingApply ? <Loader2 size={12} className="animate-spin" /> : "Apply via Map"}
                 </Button>
              </div>
           </InfoWindow>
        )}
      </GoogleMap>
      
      {/* Custom Map Controls Overlay */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
         {/* Live Status Badge */}
         <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 shadow-lg border backdrop-blur-md transition-all ${
            gpsStatus === 'gps' ? "bg-success/20 text-success border-success/30" : 
            gpsStatus === 'profile' ? "bg-primary/20 text-primary border-primary/30" : 
            "bg-warning/20 text-warning border-warning/30"
         }`}>
            <div className={`w-2 h-2 rounded-full animate-pulse ${
               gpsStatus === 'gps' ? "bg-success" : 
               gpsStatus === 'profile' ? "bg-primary" : 
               "bg-warning"
            }`} />
            {gpsStatus === 'gps' ? "Live Live GPS Active" :
             gpsStatus === 'profile' ? `Profile: ${user?.location || "Locked"}` :
             "Using Default City"}
         </div>
         
         {/* Manual Trigger Button */}
         <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLiveGPS}
            className="bg-background/80 backdrop-blur-md hover:bg-background border-border/50 shadow-md gap-2 font-bold text-[11px]"
         >
            <Navigation size={14} className={loadingLoc ? "animate-pulse" : ""} />
            Try GPS Again
         </Button>
      </div>

      <div className="absolute top-4 right-4 z-10">
          <Button 
            variant="outline" 
            size="icon" 
            className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-md border-border/50 shadow-lg"
            onClick={() => fetchJobs(center.lat, center.lng)}
          >
             <RefreshCcw size={18} className="text-muted-foreground" />
          </Button>
      </div>

      {jobs.length === 0 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 glass-card px-4 py-2 font-bold text-xs flex items-center gap-2 shadow-2xl border-warning/30 bg-background/90 text-foreground transition-all">
              <AlertCircle size={14} className="text-warning" /> No open jobs found within 15km
          </div>
      )}
    </div>
  );
};

export default JobMap;
