import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DetallesClase({ route }) {
	const clase = route?.params?.class;

	return (
		<View style={styles.contenedor}>
			<Text style={styles.titulo}>{clase?.titulo || 'Detalle de la clase'}</Text>
			<Text>{clase?.descripcion || 'No hay información disponible.'}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	contenedor: {
		flex: 1,
		padding: 24,
		justifyContent: 'center',
	},
	titulo: {
		fontSize: 24,
		fontWeight: '700',
		marginBottom: 12,
	},
});
