import { useEffect, useId, useState } from 'react';
import { listSpaceCvs, type SpaceCvPerson } from '@/services/data/mentor/mentor.service';
import styles from './cvMatch.module.css';

interface SpaceCvPickerProps {
  spaces: { id: string; name: string }[];
  /** El CV elegido, o `''` mientras no haya ninguno. */
  value: string;
  onChange: (cvId: string) => void;
  disabled?: boolean;
}

/**
 * Primero el espacio, después la persona y su CV — los dos últimos en un solo
 * desplegable, porque casi siempre hay un CV por persona. Sólo aparece quien
 * tenga alguno: lo contrario sería un callejón sin salida.
 */
export function SpaceCvPicker({ spaces, value, onChange, disabled }: SpaceCvPickerProps) {
  const spaceId = useId();
  const cvSelectId = useId();

  const [selectedSpace, setSelectedSpace] = useState(spaces[0]?.id ?? '');
  const [people, setPeople] = useState<SpaceCvPerson[] | null>(null);

  useEffect(() => {
    if (!selectedSpace) {
      setPeople([]);
      return;
    }

    let active = true;
    setPeople(null);
    onChange('');

    void listSpaceCvs(selectedSpace).then((result) => {
      if (!active) return;
      setPeople(result.status === 'success' ? result.data.people : []);
    });

    return () => {
      active = false;
    };
    /* `onChange` se deja afuera a propósito: viene de quien nos usa y cambia de
       identidad en cada render, así que incluirlo recargaría en bucle. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSpace]);

  return (
    <>
      <select
        id={spaceId}
        className={styles.select}
        value={selectedSpace}
        onChange={(event) => setSelectedSpace(event.target.value)}
        disabled={disabled}
        aria-label="Espacio"
      >
        {spaces.map((space) => (
          <option key={space.id} value={space.id}>
            {space.name}
          </option>
        ))}
      </select>

      {people === null ? (
        <p className={styles.fieldHint}>Buscando CVs…</p>
      ) : people.length === 0 ? (
        <p className={styles.fieldEmpty}>
          Todavía nadie de este espacio subió un CV que se pueda leer.
        </p>
      ) : (
        <select
          id={cvSelectId}
          className={styles.select}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          aria-label="De quién es el CV"
        >
          <option value="">Elegí de quién…</option>
          {people.map((person) => (
            <optgroup key={person.apprenticeId} label={person.fullName ?? 'Sin nombre'}>
              {person.cvs.map((cv) => (
                <option key={cv.id} value={cv.id}>
                  {cv.name}
                  {cv.isPrimary ? ' · principal' : ''}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      )}
    </>
  );
}
