interface Transport {
	name: string;
	capacity: number;
	fuel_consumption: number;
	company_tax: number;
	route_id: number;
	vehicle_type: string;
	fuel_type: string;
	transport_type: string;
	maintenance_cost: number;
}
interface Route {
	route_id: number;
	date: string;
	start_location: string;
	end_location: string;
	start_time: string;
	end_time: string;
	day_of_week: string;
	day_type: string;
	passenger_count: number;
	fare_amount: number;
	fare_amount_currency: string;
	weather_condition: string;
	traffic_condition: string;
	route_distance: number;
	route_duration: number;
	fuel_price_per_liter: number;
	transport_id: number;
}