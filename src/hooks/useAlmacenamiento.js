import {useState, useEffect, useCallback} from 'react';
import asyncStorage from '@react-native-async-storage/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function useAlmacenamiento(clave, valorInicial) {
  const [valor, setValor] = useState(valorInicial);
  const {listo, setListo} = useState(false);

  useEffect(() => {

  let activo = true; //Esto es una bandera para saber si estoy guardando el componente o no, para evitar errores de memoria

  AsyncStorage.getItem(clave)
    .then((guardando) => {
      if (activo && guardando !== null) {
        setValor(JSON.parse(guardando));
      }
      setListo(true);
    })
    .catch((error) => {
      console.error(`Error al obtener el valor de ${clave} desde AsyncStorage:`, error);
    })
    .finally(() => {
      setListo(true);

      return () => {
        activo = false; //Cuando el componente se desmonte, activo se vuelve falso y no se ejecuta el setValor
      }
    },{clave});

    const actualizar = useCallback(
        async (nuevoValor) => {
            setValor(nuevoValor);
            try {
                await AsyncStorage.setItem(clave, JSON.stringify(nuevoValor));

            }catch (error) {
                console.error(`Error al guardar el valor de ${clave} en AsyncStorage:`, error);
            }
        }, [clave]


    );


  }
