import React, { useState, useMemo } from 'react';
import {View, Text, Pressable, StyleSheet, TextInput, ScrollView, FlatList,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import CardClase from '../components/Card';
import NivelChip from '../components/NivelChip';
import useResponsive from '../hooks/useResposive';
import { colors, radius, spacing, typography } from '../theme';
import { CLASES, NIVELES } from '../data/clases';

export default function ClasesScreen({ navigation }) {

    const insets = useSafeAreaInsets();
    const { columnas, paddingHorizontal } = useResponsive();

    const [nivel, setNivel] = useState('Basico');
    const [busqueda, setBusqueda] = useState('');

    const resultados = useMemo(() => {
        const textoBusqueda = busqueda.trim().toLowerCase();

        return CLASES.filter((clase) => {
            const coincideNivel = clase.nivel === nivel;

            const coincideBusqueda =
                textoBusqueda === '' ||
                clase.titulo.toLowerCase().includes(textoBusqueda) ||
                clase.profesor.nombre.toLowerCase().includes(textoBusqueda);

            return coincideNivel && coincideBusqueda;
        });
    }, [nivel, busqueda]);

    return (
        <View
            style={[
                style.pantalla,
                {
                    paddingTop: insets.top + spacing.md,
                    paddingHorizontal: paddingHorizontal,
                },
            ]}
        >

            <Text style={typography.titulo}>
                Aplicacion para clases de ingles
            </Text>

            <View style={style.buscador}>

                <Ionicons
                    name="search"
                    size={18}
                    color={colors.textoSuave}
                />

                <TextInput
                    style={style.input}
                    placeholder="Buscar por nivel"
                    placeholderTextColor={colors.textoSuave}
                    value={busqueda}
                    onChangeText={setBusqueda}
                    autoCorrect={false}
                />

                {busqueda.length > 0 ? (
                    <Pressable onPress={() => setBusqueda('')}>
                        <Ionicons
                            name="close-circle"
                            size={18}
                            color={colors.textoSuave}
                        />
                    </Pressable>
                ) : null}

            </View>

            <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                style={{ flexGrow: 0 }}
            >

                {NIVELES.map((item) => (
                    <NivelChip
                        key={item}
                        etiqueta={item}
                        activo={item === nivel}
                        onPress={() => setNivel(item)}
                    />
                ))}

            </ScrollView>

            <FlatList
                data={resultados}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: 12,
                    flexGrow: 1,
                }}
                renderItem={({ item }) => (
                    <CardClase
                        clase={item}
                        onPress={() =>
                            navigation.navigate(
                                'DetallesClase',
                                { class: item }
                            )
                        }
                    />
                )}
            />

        </View>
    );
}

const style = StyleSheet.create({
    pantalla: {
        flex: 1,
        backgroundColor: colors.fondo,
    },

    buscador: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: colors.superficie,
        borderRadius: radius.md,
        paddingHorizontal: spacing.lg,
        height: 46,
        marginTop: spacing.lg,
        borderWidth: 1,
        borderColor: colors.borde,
    },

    input: {
        flex: 1,
        fontSize: 14,
        color: colors.texto,
        paddingVertical: 0,
    },
});
