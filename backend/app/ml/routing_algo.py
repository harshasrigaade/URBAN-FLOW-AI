import networkx as nx
import math
from typing import List, Dict, Any, Tuple
from app.schemas import RoutePoint, ModeRouteDetails, RouteResponse

# Let's represent a smart city graph.
# We will create a synthetic city network representing key coordinate points in a grid format,
# and dynamically route between start and end using custom edge weights.

def haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    # Earth radius in km
    R = 6371.0
    
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lng2 - lng1)
    
    a = math.sin(delta_phi/2.0)**2 + \
        math.cos(phi1) * math.cos(phi2) * \
        math.sin(delta_lambda/2.0)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

class SmartCityRouter:
    def __init__(self):
        # Base setup
        # Generate a grid of points around the user query
        pass

    def build_local_graph(self, start_lat: float, start_lng: float, end_lat: float, end_lng: float) -> Tuple[nx.Graph, int, int]:
        G = nx.Graph()
        
        # Determine coordinate boundaries
        min_lat = min(start_lat, end_lat) - 0.05
        max_lat = max(start_lat, end_lat) + 0.05
        min_lng = min(start_lng, end_lng) - 0.05
        max_lng = max(start_lng, end_lng) + 0.05
        
        # Generate grid nodes (5x5 grid for granular routing representation)
        nodes = []
        node_id = 0
        lat_step = (max_lat - min_lat) / 5
        lng_step = (max_lng - min_lng) / 5
        
        for i in range(6):
            for j in range(6):
                lat = min_lat + i * lat_step
                lng = min_lng + j * lng_step
                G.add_node(node_id, lat=lat, lng=lng)
                nodes.append((node_id, lat, lng))
                node_id += 1
                
        # Insert start and end nodes specifically
        start_id = node_id
        G.add_node(start_id, lat=start_lat, lng=start_lng)
        
        end_id = start_id + 1
        G.add_node(end_id, lat=end_lat, lng=end_lng)
        
        # Connect grid nodes to neighbors
        for i in range(6):
            for j in range(6):
                curr_node = i * 6 + j
                # Connect right
                if j < 5:
                    right_node = curr_node + 1
                    self.add_edge_with_metrics(G, curr_node, right_node)
                # Connect down
                if i < 5:
                    down_node = curr_node + 6
                    self.add_edge_with_metrics(G, curr_node, down_node)
                    
        # Connect start and end nodes to nearest 3 grid nodes to ensure connectivity
        for node_to_connect, name in [(start_id, "start"), (end_id, "end")]:
            lat = G.nodes[node_to_connect]['lat']
            lng = G.nodes[node_to_connect]['lng']
            # Sort all other grid nodes by proximity
            grid_dists = []
            for n in range(start_id):
                n_lat = G.nodes[n]['lat']
                n_lng = G.nodes[n]['lng']
                dist = haversine_distance(lat, lng, n_lat, n_lng)
                grid_dists.append((n, dist))
            grid_dists.sort(key=lambda x: x[1])
            # Connect to top 3 nearest
            for n, d in grid_dists[:3]:
                self.add_edge_with_metrics(G, node_to_connect, n)
                
        return G, start_id, end_id

    def add_edge_with_metrics(self, G: nx.Graph, u: int, v: int):
        lat1, lng1 = G.nodes[u]['lat'], G.nodes[u]['lng']
        lat2, lng2 = G.nodes[v]['lat'], G.nodes[v]['lng']
        dist = haversine_distance(lat1, lng1, lat2, lng2)
        if dist == 0:
            dist = 0.001
            
        # Standard attributes
        # safety_index: 0 (safe) to 10 (very dangerous)
        # We can introduce mock risk indices based on mock city zones
        center_lat = (lat1 + lat2) / 2.0
        center_lng = (lng1 + lng2) / 2.0
        
        # Risk factors (e.g. higher risk in southeast quadrant of graph for demo)
        safety_index = 2.0
        if center_lat < (lat1+lat2)/2.0 + 0.01 and center_lng > (lng1+lng2)/2.0:
            safety_index = 6.5
            
        # Traffic multiplier: 1.0 (free flow), 0.2 (stuck in traffic)
        traffic_multiplier = 0.9
        # Random congestion hotspots
        if (u + v) % 4 == 0:
            traffic_multiplier = 0.35  # heavy traffic
            
        G.add_edge(u, v, 
            distance=dist,
            safety_index=safety_index,
            traffic_multiplier=traffic_multiplier
        )

    def calculate_path(self, G: nx.Graph, start: int, end: int, mode: str, preference: str) -> Dict[str, Any]:
        # Formulate custom weight function based on preference and mode
        # Mode factors: speed, cost per km, carbon emissions per km, base safety
        
        # Mode Specs:
        # speed (km/h), base_cost_per_km, carbon_g_per_km, base_safety
        mode_specs = {
            "walking": {"speed": 5.0, "cost_per_km": 0.0, "co2_per_km": 0.0, "safety": 85.0},
            "bicycle": {"speed": 15.0, "cost_per_km": 0.0, "co2_per_km": 0.0, "safety": 75.0},
            "bus": {"speed": 25.0, "cost_per_km": 3.0, "co2_per_km": 30.0, "safety": 90.0},
            "metro": {"speed": 40.0, "cost_per_km": 5.0, "co2_per_km": 15.0, "safety": 95.0},
            "train": {"speed": 50.0, "cost_per_km": 2.0, "co2_per_km": 20.0, "safety": 95.0},
            "auto": {"speed": 30.0, "cost_per_km": 15.0, "co2_per_km": 80.0, "safety": 70.0},
            "taxi": {"speed": 40.0, "cost_per_km": 22.0, "co2_per_km": 120.0, "safety": 85.0},
            "ride_sharing": {"speed": 40.0, "cost_per_km": 18.0, "co2_per_km": 70.0, "safety": 80.0}
        }
        
        spec = mode_specs[mode]
        
        # custom weight callback for NetworkX Dijkstra
        def weight_func(u, v, d):
            dist = d['distance']
            traffic = d['traffic_multiplier']
            safety = d['safety_index']
            
            # Duration in hours
            if mode in ["walking", "bicycle", "metro", "train"]:
                # public transport & active transit not affected by road traffic multipliers
                duration = dist / spec['speed']
            else:
                # Road vehicles affected by traffic multiplier
                duration = dist / (spec['speed'] * traffic)
                
            cost = dist * spec['cost_per_km']
            co2 = dist * spec['co2_per_km'] / 1000.0  # in kg
            
            # Normalize edge parameters for the optimization goals
            if preference == "fastest":
                return duration
            elif preference == "cheapest":
                return cost + duration * 0.1 # heavily penalize cost, lightly penalize duration
            elif preference == "safest":
                # high safety index is dangerous, so penalize it heavily
                return safety * dist + duration * 0.1
            elif preference == "eco":
                return co2 + duration * 0.1
            else:  # balanced
                return (duration * 10) + cost + (safety * dist) + (co2 * 5)

        try:
            path_nodes = nx.dijkstra_path(G, start, end, weight=weight_func)
        except nx.NetworkXNoPath:
            # Fallback path directly start -> end
            path_nodes = [start, end]
            
        # Reconstruct full path coordinates and calculate total statistics
        path_coords = []
        for n in path_nodes:
            path_coords.append(RoutePoint(
                lat=G.nodes[n]['lat'],
                lng=G.nodes[n]['lng']
            ))
            
        # Compute exact final metrics for this path
        total_dist = 0.0
        total_duration = 0.0
        weighted_safety_risk = 0.0
        traffic_sum = 0.0
        edge_count = 0
        
        for i in range(len(path_nodes) - 1):
            u = path_nodes[i]
            v = path_nodes[i+1]
            edge_data = G[u][v]
            
            dist = edge_data['distance']
            traffic = edge_data['traffic_multiplier']
            safety = edge_data['safety_index']
            
            total_dist += dist
            
            if mode in ["walking", "bicycle", "metro", "train"]:
                total_duration += dist / spec['speed']
            else:
                total_duration += dist / (spec['speed'] * traffic)
                
            weighted_safety_risk += safety * dist
            traffic_sum += traffic
            edge_count += 1
            
        duration_mins = total_duration * 60.0
        
        # Average risk mapping: base mode safety reduced by graph edge risk index
        avg_edge_risk = (weighted_safety_risk / total_dist) if total_dist > 0 else 0
        # safety_score ranges from 0 to 100. Let's scale with avg_edge_risk.
        # safety index of 10 scales safety down.
        safety_score = max(10, min(100, spec['safety'] - (avg_edge_risk * 5)))
        
        # Cost mapping
        avg_traffic = (traffic_sum / edge_count) if edge_count > 0 else 1.0
        surge_mult = 1.0
        if mode in ["auto", "taxi", "ride_sharing"]:
            if avg_traffic < 0.45: # heavy traffic
                surge_mult = 1.4
            elif avg_traffic < 0.75: # medium traffic
                surge_mult = 1.15
        
        if mode in ["walking", "bicycle"]:
            cost = 0.0
        elif mode == "bus":
            cost = max(10.0, min(40.0, total_dist * 4.0))
        elif mode == "metro":
            cost = max(15.0, min(60.0, total_dist * 5.0))
        elif mode == "train":
            cost = max(10.0, min(45.0, total_dist * 3.0))
        elif mode == "auto":
            cost = (30.0 + total_dist * 15.0) * surge_mult
        elif mode == "taxi":
            cost = (100.0 + total_dist * 22.0) * surge_mult
        elif mode == "ride_sharing":
            cost = (50.0 + total_dist * 18.0) * surge_mult
            
        # CO2 emissions
        co2_kg = total_dist * (spec['co2_per_km'] / 1000.0)
        
        # Traffic level tag
        avg_traffic = (traffic_sum / edge_count) if edge_count > 0 else 1.0
        if mode in ["walking", "bicycle", "metro", "train"]:
            traffic_level = "low"
        else:
            if avg_traffic > 0.75:
                traffic_level = "low"
            elif avg_traffic > 0.45:
                traffic_level = "medium"
            else:
                traffic_level = "heavy"
                
        # Simulated directions/instructions
        instructions = [
            f"Start your {mode} journey heading towards the destination.",
            f"Continue for {total_dist*0.4:.1f} km along primary transit corridors.",
            f"Pass the local safety checkpoint (Safety rating: {safety_score:.0f}/100).",
            f"Arrive at your destination ({total_dist:.2f} km total distance)."
        ]
        
        return {
            "mode": mode,
            "duration_mins": round(duration_mins, 1),
            "cost": round(cost, 2),
            "distance_km": round(total_dist, 2),
            "safety_score": round(safety_score, 1),
            "carbon_emissions_kg": round(co2_kg, 3),
            "traffic_level": traffic_level,
            "path": path_coords,
            "instructions": instructions
        }

    def check_metro_availability(self, start_lat: float, start_lng: float, end_lat: float, end_lng: float) -> Tuple[bool, str]:
        # 1. City / Region Coverage Check
        # Hyderabad boundary box approximation
        if not (17.0 <= start_lat <= 17.6 and 78.2 <= start_lng <= 78.7) or \
           not (17.0 <= end_lat <= 17.6 and 78.2 <= end_lng <= 78.7):
            return False, "Metro service is not available for this route: Selected locations are outside the city's metro network coverage."
            
        # 2. Find nearest stations
        metro_stations = [
            {"name": "Miyapur Metro Station", "lat": 17.4968, "lng": 78.3614},
            {"name": "JNTU College Metro Station", "lat": 17.4878, "lng": 78.3752},
            {"name": "Kukatpally Metro Station", "lat": 17.4795, "lng": 78.3908},
            {"name": "Moosapet Metro Station", "lat": 17.4716, "lng": 78.4116},
            {"name": "Bharat Nagar Metro Station", "lat": 17.4646, "lng": 78.4208},
            {"name": "Erragadda Metro Station", "lat": 17.4587, "lng": 78.4286},
            {"name": "ESI Hospital Metro Station", "lat": 17.4529, "lng": 78.4343},
            {"name": "SR Nagar Metro Station", "lat": 17.4437, "lng": 78.4411},
            {"name": "Ameerpet Metro Station", "lat": 17.4375, "lng": 78.4482},
            {"name": "Punjagutta Metro Station", "lat": 17.4248, "lng": 78.4529},
            {"name": "Irrum Manzil Metro Station", "lat": 17.4178, "lng": 78.4561},
            {"name": "Khairatabad Metro Station", "lat": 17.4087, "lng": 78.4604},
            {"name": "Lakdikapul Metro Station", "lat": 17.4018, "lng": 78.4646},
            {"name": "Assembly Metro Station", "lat": 17.3979, "lng": 78.4718},
            {"name": "Nampally Metro Station", "lat": 17.3916, "lng": 78.4735},
            {"name": "Gandhi Bhavan Metro Station", "lat": 17.3854, "lng": 78.4752},
            {"name": "Osmania Medical College Metro Station", "lat": 17.3813, "lng": 78.4815},
            {"name": "MG Bus Station", "lat": 17.3789, "lng": 78.4823},
            {"name": "Malakpet Metro Station", "lat": 17.3718, "lng": 78.4968},
            {"name": "Dilshuknagar Metro Station", "lat": 17.3688, "lng": 78.5247},
            {"name": "LB Nagar Metro Station", "lat": 17.3468, "lng": 78.5486},
            {"name": "Raidurg Metro Station", "lat": 17.4429, "lng": 78.3774},
            {"name": "HITEC City Metro Station", "lat": 17.4435, "lng": 78.3772},
            {"name": "Durgam Cheruvu Metro Station", "lat": 17.4398, "lng": 78.3904},
            {"name": "Madhapur Metro Station", "lat": 17.4348, "lng": 78.4012},
            {"name": "Jubilee Hills Check Post Metro Station", "lat": 17.4289, "lng": 78.4128},
            {"name": "Road No 5 Jubilee Hills Metro Station", "lat": 17.4278, "lng": 78.4235},
            {"name": "Yusufguda Metro Station", "lat": 17.4357, "lng": 78.4354},
            {"name": "Madhura Nagar Metro Station", "lat": 17.4371, "lng": 78.4416},
            {"name": "Begumpet Metro Station", "lat": 17.4379, "lng": 78.4593},
            {"name": "Prakash Nagar Metro Station", "lat": 17.4391, "lng": 78.4716},
            {"name": "Rasoolpura Metro Station", "lat": 17.4418, "lng": 78.4828},
            {"name": "Paradise Metro Station", "lat": 17.4436, "lng": 78.4984},
            {"name": "Secunderabad East Metro Station", "lat": 17.4344, "lng": 78.5011},
            {"name": "Mettuguda Metro Station", "lat": 17.4328, "lng": 78.5243},
            {"name": "Tarnaka Metro Station", "lat": 17.4285, "lng": 78.5375},
            {"name": "Habsiguda Metro Station", "lat": 17.4187, "lng": 78.5534},
            {"name": "Nagole Metro Station", "lat": 17.3985, "lng": 78.5684}
        ]
        
        nearest_start = None
        min_start_dist = float('inf')
        nearest_end = None
        min_end_dist = float('inf')
        
        for station in metro_stations:
            start_dist = haversine_distance(start_lat, start_lng, station['lat'], station['lng'])
            if start_dist < min_start_dist:
                min_start_dist = start_dist
                nearest_start = station
                
            end_dist = haversine_distance(end_lat, end_lng, station['lat'], station['lng'])
            if end_dist < min_end_dist:
                min_end_dist = end_dist
                nearest_end = station
                
        # Proximity Check (4.0 km threshold)
        if min_start_dist > 4.0 or min_end_dist > 4.0:
            return False, "Metro service is not available for this route: Stations are too far from your location (>4km)."
            
        # 3. Valid route existence check
        if nearest_start['name'] == nearest_end['name']:
            return False, "Metro service is not available for this route: Start and end points snap to the same metro station."
            
        # Check if distance between stations is too small
        station_dist = haversine_distance(
            nearest_start['lat'], nearest_start['lng'],
            nearest_end['lat'], nearest_end['lng']
        )
        if station_dist < 1.0:
            return False, "Metro service is not available for this route: No valid metro route exists for this short distance."
            
        return True, f"Metro service is available between {nearest_start['name']} and {nearest_end['name']}."

    def plan_routes(self, start_lat: float, start_lng: float, end_lat: float, end_lng: float, preference: str) -> RouteResponse:
        G, start_id, end_id = self.build_local_graph(start_lat, start_lng, end_lat, end_lng)
        
        metro_ok, metro_msg = self.check_metro_availability(start_lat, start_lng, end_lat, end_lng)
        
        modes = ["walking", "bicycle", "bus", "train", "auto", "taxi", "ride_sharing"]
        if metro_ok:
            modes.append("metro")
            
        options = []
        for mode in modes:
            res = self.calculate_path(G, start_id, end_id, mode, preference)
            options.append(ModeRouteDetails(**res))
            
        return RouteResponse(
            preference=preference,
            options=options,
            metro_available=metro_ok,
            metro_status_message=metro_msg
        )

# Instantiate singleton router
router = SmartCityRouter()
