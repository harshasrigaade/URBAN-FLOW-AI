import networkx as nx
import math
import difflib
from app.schemas import RoutePoint

# Official Hyderabad Metro Stations Data
RED_STATIONS = [
    ("Miyapur", 17.4968, 78.3725),
    ("JNTU College", 17.4930, 78.3916),
    ("KPHB Colony", 17.4842, 78.3986),
    ("Kukatpally", 17.4725, 78.4116),
    ("Balanagar", 17.4690, 78.4215),
    ("Moosapet", 17.4635, 78.4239),
    ("Bharat Nagar", 17.4539, 78.4235),
    ("Erragadda", 17.4518, 78.4278),
    ("ESI Hospital", 17.4475, 78.4325),
    ("SR Nagar", 17.4431, 78.4398),
    ("Ameerpet", 17.4347, 78.4484),
    ("Punjagutta", 17.4265, 78.4533),
    ("Irrum Manzil", 17.4215, 78.4578),
    ("Khairatabad", 17.4128, 78.4619),
    ("Lakdikapul", 17.4042, 78.4650),
    ("Assembly", 17.3995, 78.4715),
    ("Nampally", 17.3919, 78.4735),
    ("Gandhi Bhavan", 17.3855, 78.4755),
    ("Osmania Medical College", 17.3812, 78.4815),
    ("MG Bus Station", 17.3732, 78.4827),
    ("Malakpet", 17.3695, 78.4912),
    ("New Market", 17.3692, 78.5015),
    ("Musarambagh", 17.3698, 78.5135),
    ("Dilsukhnagar", 17.3688, 78.5285),
    ("Chaitanyapuri", 17.3682, 78.5398),
    ("Victoria Memorial", 17.3658, 78.5505),
    ("LB Nagar", 17.3592, 78.5559)
]

BLUE_STATIONS = [
    ("Raidurg", 17.4429, 78.3770),
    ("HITEC City", 17.4435, 78.3820),
    ("Durgam Cheruvu", 17.4428, 78.3905),
    ("Madhapur", 17.4395, 78.4005),
    ("Peddamma Gudi", 17.4355, 78.4110),
    ("Jubilee Hills Check Post", 17.4342, 78.4210),
    ("Road No. 5 Jubilee Hills", 17.4328, 78.4298),
    ("Yusufguda", 17.4345, 78.4358),
    ("Madhura Nagar", 17.4338, 78.4418),
    ("Ameerpet", 17.4347, 78.4484),
    ("Begumpet", 17.4372, 78.4595),
    ("Prakash Nagar", 17.4385, 78.4705),
    ("Rasoolpura", 17.4402, 78.4820),
    ("Paradise", 17.4425, 78.4905),
    ("Parade Ground", 17.4445, 78.4982),
    ("Secunderabad East", 17.4428, 78.5025),
    ("Mettuguda", 17.4318, 78.5205),
    ("Tarnaka", 17.4285, 78.5375),
    ("Habsiguda", 17.4248, 78.5505),
    ("NGRI", 17.4195, 78.5635),
    ("Stadium", 17.4148, 78.5705),
    ("Uppal", 17.4085, 78.5775),
    ("Nagole", 17.4022, 78.5835)
]

GREEN_STATIONS = [
    ("JBS Parade Ground", 17.4445, 78.4982),
    ("Secunderabad West", 17.4405, 78.4998),
    ("Gandhi Hospital", 17.4295, 78.5032),
    ("Musheerabad", 17.4218, 78.5050),
    ("RTC X Roads", 17.4128, 78.5042),
    ("Chikkadpally", 17.4072, 78.5055),
    ("Narayanaguda", 17.3978, 78.4962),
    ("Sultan Bazaar", 17.3862, 78.4935),
    ("MG Bus Station", 17.3732, 78.4827)
]

def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class MetroGraphRouter:
    def __init__(self):
        self.G = nx.Graph()
        self.stations_meta = {}
        self.build_graph()

    def build_graph(self):
        # 1. Add Red Line Stations
        for i in range(len(RED_STATIONS)):
            name, lat, lng = RED_STATIONS[i]
            node = f"{name} (Red)"
            self.G.add_node(node, name=name, lat=lat, lng=lng, line="Red", is_interchange=False)
            self.stations_meta[node] = {"name": name, "lat": lat, "lng": lng, "line": "Red"}
            if i > 0:
                prev_node = f"{RED_STATIONS[i-1][0]} (Red)"
                self.G.add_edge(prev_node, node, weight=1.0) # Hop weight

        # 2. Add Blue Line Stations
        for i in range(len(BLUE_STATIONS)):
            name, lat, lng = BLUE_STATIONS[i]
            node = f"{name} (Blue)"
            self.G.add_node(node, name=name, lat=lat, lng=lng, line="Blue", is_interchange=False)
            self.stations_meta[node] = {"name": name, "lat": lat, "lng": lng, "line": "Blue"}
            if i > 0:
                prev_node = f"{BLUE_STATIONS[i-1][0]} (Blue)"
                self.G.add_edge(prev_node, node, weight=1.0)

        # 3. Add Green Line Stations
        for i in range(len(GREEN_STATIONS)):
            name, lat, lng = GREEN_STATIONS[i]
            node = f"{name} (Green)"
            self.G.add_node(node, name=name, lat=lat, lng=lng, line="Green", is_interchange=False)
            self.stations_meta[node] = {"name": name, "lat": lat, "lng": lng, "line": "Green"}
            if i > 0:
                prev_node = f"{GREEN_STATIONS[i-1][0]} (Green)"
                self.G.add_edge(prev_node, node, weight=1.0)

        # 4. Add Interchange Edges
        # Ameerpet Red <-> Blue
        self.G.add_edge("Ameerpet (Red)", "Ameerpet (Blue)", weight=0.1) # low weight for physical transfer
        self.G.nodes["Ameerpet (Red)"]["is_interchange"] = True
        self.G.nodes["Ameerpet (Blue)"]["is_interchange"] = True

        # MG Bus Station Red <-> Green
        self.G.add_edge("MG Bus Station (Red)", "MG Bus Station (Green)", weight=0.1)
        self.G.nodes["MG Bus Station (Red)"]["is_interchange"] = True
        self.G.nodes["MG Bus Station (Green)"]["is_interchange"] = True

        # Parade Ground Blue <-> JBS Parade Ground Green
        self.G.add_edge("Parade Ground (Blue)", "JBS Parade Ground (Green)", weight=0.1)
        self.G.nodes["Parade Ground (Blue)"]["is_interchange"] = True
        self.G.nodes["JBS Parade Ground (Green)"]["is_interchange"] = True

    def find_nearest_station(self, lat, lng):
        nearest_node = None
        min_dist = float('inf')
        for node, meta in self.stations_meta.items():
            dist = haversine_distance(lat, lng, meta["lat"], meta["lng"])
            if dist < min_dist:
                min_dist = dist
                nearest_node = node
        return nearest_node, min_dist

    def fuzzy_match_station(self, input_name):
        all_names = list(set([meta["name"] for meta in self.stations_meta.values()]))
        matches = difflib.get_close_matches(input_name, all_names, n=1, cutoff=0.5)
        if matches:
            # find first node with this name
            for node, meta in self.stations_meta.items():
                if meta["name"] == matches[0]:
                    return node, matches[0]
        return None, None

    def plan_route(self, start_loc, end_loc, is_coords=False):
        # Resolve start node
        is_start_metro = False
        start_dist = 0.0
        if is_coords:
            start_node, start_dist = self.find_nearest_station(start_loc[0], start_loc[1])
            is_start_metro = (start_dist < 0.15) # Within 150m is a match
            start_name = self.stations_meta[start_node]["name"]
            if is_start_metro:
                start_info = f"Source Station: {start_name} (Confirmed Metro Station)"
            else:
                start_info = f"Source location is not a metro station. Nearest station selected: {start_name} ({start_dist:.2f} km away)"
        else:
            start_node, start_name = self.fuzzy_match_station(start_loc)
            if not start_node:
                raise ValueError(f"No Hyderabad Metro station matches '{start_loc}'")
            start_info = f"Source Station: {start_name}"
            is_start_metro = True

        # Resolve end node
        is_end_metro = False
        end_dist = 0.0
        if is_coords:
            end_node, end_dist = self.find_nearest_station(end_loc[0], end_loc[1])
            is_end_metro = (end_dist < 0.15)
            end_name = self.stations_meta[end_node]["name"]
            if is_end_metro:
                end_info = f"Destination Station: {end_name} (Confirmed Metro Station)"
            else:
                end_info = f"Destination location is not a metro station. Nearest station selected: {end_name} ({end_dist:.2f} km away)"
        else:
            end_node, end_name = self.fuzzy_match_station(end_loc)
            if not end_node:
                raise ValueError(f"No Hyderabad Metro station matches '{end_loc}'")
            end_info = f"Destination Station: {end_name}"
            is_end_metro = True

        # Calculate Dijkstra Path
        try:
            path_nodes = nx.dijkstra_path(self.G, start_node, end_node, weight="weight")
        except Exception:
            raise ValueError(f"No valid Hyderabad Metro route exists between {start_name} and {end_name}")
        
        # Analyze path
        clean_path_names = []
        interchanges = []
        lines_used = []
        path_points = []
        
        current_line = self.stations_meta[path_nodes[0]]["line"]
        lines_used.append(current_line)
        
        i = 0
        while i < len(path_nodes):
            curr_node = path_nodes[i]
            curr_meta = self.stations_meta[curr_node]
            curr_name = curr_meta["name"]
            curr_line = curr_meta["line"]
            
            # Check if this is an interchange step
            if i < len(path_nodes) - 1:
                next_node = path_nodes[i+1]
                next_meta = self.stations_meta[next_node]
                next_name = next_meta["name"]
                next_line = next_meta["line"]
                
                # Check transfer
                if curr_name == next_name or (curr_name in ["Parade Ground", "JBS Parade Ground"] and next_name in ["Parade Ground", "JBS Parade Ground"]):
                    # This is an interchange edge
                    interchanges.append(curr_name)
                    lines_used.append(next_line)
                    clean_path_names.append(f"{curr_name} [Interchange to {next_line} Line]")
                    path_points.append({"lat": curr_meta["lat"], "lng": curr_meta["lng"]})
                    i += 2
                    continue
            
            clean_path_names.append(curr_name)
            path_points.append({"lat": curr_meta["lat"], "lng": curr_meta["lng"]})
            i += 1
            
        # Count actual stations (excluding transfer nodes)
        total_stations = len(path_points)
        
        # Calculate time: ~2 minutes per station hop + 5 minutes per interchange transfer
        num_hops = len(path_points) - 1
        est_time_mins = num_hops * 2 + len(interchanges) * 5
        
        # Avoid unnecessary calculations or invalid route outputs
        if total_stations <= 0:
            raise ValueError("No valid Hyderabad Metro route exists for the given endpoints")

        return {
            "source": self.stations_meta[start_node]["name"],
            "destination": self.stations_meta[end_node]["name"],
            "is_start_metro": is_start_metro,
            "is_end_metro": is_end_metro,
            "start_info": start_info,
            "end_info": end_info,
            "route_sequence": clean_path_names,
            "interchanges": list(set(interchanges)),
            "lines": list(set(lines_used)),
            "total_stations": total_stations,
            "estimated_time_mins": est_time_mins,
            "path_points": path_points
        }

metro_router = MetroGraphRouter()
