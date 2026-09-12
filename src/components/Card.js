import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import EtiquetaNivel from './EtiquetaNivel';
import { colors, radius, spacing } from '../theme';
import { formatearPrecio } from '../data/clases';

export default function Card ({ clase, onPress }){
    return(
        <Pressable
            onPress={onPress}
            style={styles.tarjeta}
        >
            <Image source={{ uri: clase.imagen }} style={styles.imagen} resizeMode="cover" />
            <View style={styles.cuerpo}>
                <EtiquetaNivel nivel={clase.nivel}/>
                <Text style={styles.titulo}>{clase.titulo}</Text>
                <Text style={styles.profesor}>{clase.profesor.nombre}</Text>
                <View style={styles.pie}>
                    <Text style={styles.meta}>{clase.duracion} min</Text>
                    <Text style={styles.precio}>{formatearPrecio(clase.precio)}</Text>
                </View>
            </View>
       </Pressable>

    )
}

    const styles = StyleSheet.create({
        tarjeta: {
            backgroundColor: colors.superficie,
            borderRadius: radius.lg,
            overflow: 'hidden',
            marginBottom: spacing.lg,
  },
        imagen: {
            width: '100%',
            height: 130,
            backgroundColor: colors.primarioSuave,
  },
        cuerpo: {
            padding: spacing.lg,
            gap: spacing.sm,
  },
        titulo: { fontSize: 16, fontWeight: '700', color: colors.texto },
        filaProfesor: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
        avatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.borde },
        profesor: { fontSize: 13, color: colors.textoSuave, flexShrink: 1 },
        pie: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: spacing.xs,
  },
        filaCentro: { flexDirection: 'row', alignItems: 'center', gap: 4 },
        meta: { fontSize: 12, color: colors.textoSuave },
        punto: { color: colors.borde, marginHorizontal: 2 },
        precio: { fontSize: 14, fontWeight: '800', color: colors.primario },
});