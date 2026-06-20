import networkx as nx
import math
from app.schemas import RoutePoint, ModeRouteDetails, RouteResponse
from app.ml.metro_router import metro_router, haversine_distance



def haversine_distance(lat1, lng1, lat2, lng2):
    R = 6371
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)

    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1-a))


class SmartCityRouter:

    def build_local_graph(self, start_lat, start_lng, end_lat, end_lng):
        G = nx.Graph()

        # DIRECT nodes only (fixes huge detours)
        nodes = {
            0: (start_lat, start_lng),
            1: (end_lat, end_lng)
        }

        for n, (lat, lng) in nodes.items():
            G.add_node(n, lat=lat, lng=lng)

        # direct connection (important fix)
        dist = haversine_distance(start_lat, start_lng, end_lat, end_lng)
        G.add_edge(0, 1, distance=dist, traffic_multiplier=1.0, safety_index=2.0)

        return G, 0, 1

    def calculate_path(self, G, start, end, mode, preference):

        spec = {
            "walking": (5, 0),
            "bicycle": (15, 0),
            "bus": (25, 3),
            "train": (50, 2),
            "metro": (40, 5),
            "auto": (30, 15),
            "taxi": (40, 22),
            "ride_sharing": (40, 18)
        }

        speed, cost_km = spec.get(mode, (30, 10))

        def weight(u, v, d):
            dist = d["distance"]

            duration = dist / speed
            cost = dist * cost_km

            if preference == "fastest":
                return duration
            elif preference == "cheapest":
                return cost
            elif preference == "safest":
                return d["safety_index"] * dist
            else:
                return duration + cost

        path = nx.dijkstra_path(G, start, end, weight=weight)

        total_dist = G[start][end]["distance"]
        duration = total_dist / speed

        return {
            "mode": mode,
            "distance_km": round(total_dist, 2),
            "duration_mins": round(duration * 60, 1),
            "cost": round(total_dist * cost_km, 2),
            "safety_score": 85,
            "carbon_emissions_kg": round(total_dist * 0.1, 3),
            "traffic_level": "low",
            "path": [
                RoutePoint(lat=G.nodes[n]["lat"], lng=G.nodes[n]["lng"])
                for n in path
            ],
            "instructions": [
                f"Start {mode} from source",
                f"Travel {total_dist:.2f} km directly",
                "Arrive at destination"
            ]
        }

    def plan_routes(self, start_lat, start_lng, end_lat, end_lng, preference):

        G, s, e = self.build_local_graph(start_lat, start_lng, end_lat, end_lng)

        modes = ["walking", "bicycle", "bus", "train", "auto", "taxi"]

        options = [
            ModeRouteDetails(**self.calculate_path(G, s, e, m, preference))
            for m in modes
        ]

        # Calculate Hyderabad Metro Route option
        metro_available = False
        metro_status_message = "No valid Hyderabad Metro route could be found for this trip."
        try:
            metro_res = metro_router.plan_route((start_lat, start_lng), (end_lat, end_lng), is_coords=True)
            
            # Create instructions list
            instructions = [
                metro_res["start_info"],
                metro_res["end_info"],
                f"Line(s) used: {', '.join(metro_res['lines'])}",
                f"Interchange Station(s): {', '.join(metro_res['interchanges']) if metro_res['interchanges'] else 'None'}",
                f"Total Hops: {metro_res['total_stations']} Stations",
                f"Estimated Duration: {metro_res['estimated_time_mins']} Mins"
            ]
            
            # Format route sequence: Station -> Station [Interchange] -> Station
            instructions.append("Route Sequence:")
            for idx, station in enumerate(metro_res["route_sequence"]):
                instructions.append(f"  {idx + 1}. {station}")
                
            metro_option = ModeRouteDetails(
                mode="metro",
                distance_km=round(sum(
                    haversine_distance(
                        metro_res["path_points"][i]["lat"], metro_res["path_points"][i]["lng"],
                        metro_res["path_points"][i+1]["lat"], metro_res["path_points"][i+1]["lng"]
                    ) for i in range(len(metro_res["path_points"])-1)
                ), 2) if len(metro_res["path_points"]) > 1 else 0.0,
                duration_mins=float(metro_res["estimated_time_mins"]),
                cost=float(10.0 + (metro_res["total_stations"] * 2.0)), # Simulated metro ticket price
                safety_score=98.0, # Highly guarded transit
                carbon_emissions_kg=round(float(metro_res["total_stations"] * 0.012), 3),
                traffic_level="low",
                path=[RoutePoint(lat=pt["lat"], lng=pt["lng"]) for pt in metro_res["path_points"]],
                instructions=instructions
            )
            
            # Insert Metro option at index 2 (between walking/cycling and bus/auto) for high prominence
            options.insert(2, metro_option)
            metro_available = True
            metro_status_message = f"Metro routes calculated: {metro_res['source']} to {metro_res['destination']} ({metro_res['total_stations']} stations)."
        except Exception as metro_err:
            print("[Routing Algo] Metro routing calculation failed:", metro_err)
            metro_status_message = f"Metro route unavailable: {str(metro_err)}"

        return RouteResponse(
            preference=preference,
            options=options,
            metro_available=metro_available,
            metro_status_message=metro_status_message
        )


router = SmartCityRouter()