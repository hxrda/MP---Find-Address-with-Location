import { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, TextInput, Button, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

export default function App() {
	//States:
	/*(initially loaded region is the current device location)*/
	const [region, setRegion] = useState({
		latitude: null,
		longitude: null,
		latitudeDelta: 0.0322,
		longitudeDelta: 0.0221,
	});
	const [address, setAddress] = useState("");
	const [location, setLocation] = useState(null);

	//Variables:
	const apiKey = "65c9fa5015413021980748fjk373770";

	//Functions:
	useEffect(() => {
		(async () => {
			let { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== "granted") {
				Alert.alert("No permission to get location");
				return;
			}
			/*Get location if permission is granted by user:*/
			/*Note that high accuracy may make the app crash*/
			let location = await Location.getCurrentPositionAsync({
				accuracy: Location.Accuracy.High,
			});
			setLocation(location);
			console.log("Location: ", location);

			setRegion({
				...region,
				latitude: location.coords.latitude,
				longitude: location.coords.longitude,
			});
		})();
	}, []);

	const fetchLocation = () => {
		fetch(`https://geocode.maps.co/search?q=${address}&api_key=${apiKey}`)
			.then((response) => {
				if (!response.ok)
					throw new Error("Error in fetch: " + response.statusText);
				return response.json();
			})
			.then((data) => {
				/*Save response strings into float type variables:*/
				const lat = parseFloat(data[0].lat);
				const lon = parseFloat(data[0].lon);

				console.log("Parsed Latitude:", lat);
				console.log("Parsed Longitude:", lon);

				setRegion({ ...region, latitude: lat, longitude: lon });
			})
			.catch((err) => console.error(err));
	};

	//Rendering:
	/*(conditional rendering for marker only when valid coordinates 
    for lat & long are available in the region state)
  */
	return (
		<View style={styles.container}>
			<View style={{ flex: 11 }}>
				<MapView style={styles.mapStyle} region={region}>
					{region.latitude && region.longitude && (
						<Marker
							coordinate={{
								latitude: region.latitude,
								longitude: region.longitude,
							}}
							title="You are here"
							description="..."
						/>
					)}
				</MapView>
			</View>

			<View style={{ flex: 1 }}>
				<TextInput
					placeholder="Type address"
					value={address}
					onChangeText={(text) => setAddress(text)}
				/>
				<Button title="Show" onPress={fetchLocation} />
			</View>

			<StatusBar style="auto" />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	mapStyle: {
		width: "100%",
		height: "100%",
	},
});
