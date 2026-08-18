import { useId, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { LoadingState } from '@/components/ui/LoadingState';
import {
  generateLinkedinPost,
  type LinkedinCta,
  type LinkedinEmojiLevel,
  type LinkedinHashtagLevel,
  type LinkedinLength,
  type LinkedinPostResult,
  type LinkedinPostType,
  type LinkedinTone,
  type LinkedinVoice,
} from '@/services/data/preparation/linkedinPost.service';
import { cx } from '@/utils/classNames';
import { ToolBackLink } from './ToolBackLink';
import {
  CTA_CHOICES,
  EMOJI_CHOICES,
  HASHTAG_CHOICES,
  LENGTH_CHOICES,
  POST_TYPE_CHOICES,
  TONE_CHOICES,
  VOICE_CHOICES,
  type Choice,
} from './linkedinOptions';
import screen from '@/app/layouts/appShell.module.css';
import styles from './linkedinPost.module.css';

/**
 * Preparación · Creador de publicaciones para LinkedIn.
 *
 * La idea de la herramienta es que nadie tenga que llegar con el texto medio
 * armado: se escribe todo lo que uno quiere que aparezca, desordenado y como
 * salga, y las preferencias de abajo deciden en qué se convierte.
 *
 * Esas preferencias se eligen **antes** de generar, no después: cambian cómo
 * se escribe el texto desde cero, no son un filtro que se le aplica a algo ya
 * escrito.
 */

/** Lo mismo que el backend exige antes de llamar a Gemini. */
const MIN_RAW_TEXT_LENGTH = 40;
const MAX_RAW_TEXT_LENGTH = 6000;

/** Tope del campo de LinkedIn: más largo que esto no se puede pegar. */
const MAX_POST_LENGTH = 3000;

type ViewState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; result: LinkedinPostResult }
  | { status: 'error'; message: string };

/** Los pasos reales del workflow, en orden. */
const LOADING_STEPS = [
  'Leyendo lo que contaste…',
  'Ordenando la historia…',
  'Escribiendo con el tono que elegiste…',
  'Ajustando el cierre y los hashtags…',
];

export function LinkedinPostSection() {
  const rawTextId = useId();

  const [rawText, setRawText] = useState('');
  const [postType, setPostType] = useState<LinkedinPostType>('logro');
  const [tone, setTone] = useState<LinkedinTone>('profesional');
  const [length, setLength] = useState<LinkedinLength>('medio');
  const [emojis, setEmojis] = useState<LinkedinEmojiLevel>('pocos');
  const [hashtags, setHashtags] = useState<LinkedinHashtagLevel>('pocos');
  const [voice, setVoice] = useState<LinkedinVoice>('yo');
  const [cta, setCta] = useState<LinkedinCta>('ninguno');

  const [state, setState] = useState<ViewState>({ status: 'idle' });
  /* La publicación editable. Se separa del resultado porque a partir de que
     aparece es de la persona: puede retocarla antes de copiarla. */
  const [draft, setDraft] = useState('');

  const trimmed = rawText.trim();
  const tooShort = trimmed.length > 0 && trimmed.length < MIN_RAW_TEXT_LENGTH;
  const isLoading = state.status === 'loading';
  const canSubmit = trimmed.length >= MIN_RAW_TEXT_LENGTH && !isLoading;

  const generate = async () => {
    setState({ status: 'loading' });

    const result = await generateLinkedinPost({
      rawText: trimmed,
      postType,
      tone,
      length,
      emojis,
      hashtags,
      voice,
      cta,
    });

    if (result.status === 'success') {
      setState({ status: 'success', result: result.data.generated });
      setDraft(result.data.generated.post);
      return;
    }

    setState({
      status: 'error',
      message:
        result.status === 'error'
          ? result.error.message
          : 'No se pudo generar la publicación. Intentá de nuevo en unos minutos.',
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canSubmit) void generate();
  };

  return (
    <div className={styles.body}>
      <ToolBackLink />

      <div className={screen.header}>
        <div>
          <p className={screen.headerTitle}>Creador de publicaciones para LinkedIn</p>
          <p className={screen.headerMeta}>
            Contá todo lo que querés que aparezca, como salga, y elegí cómo tiene que sonar.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor={rawTextId}>
            Qué querés publicar
          </label>
          <textarea
            id={rawTextId}
            className={styles.textarea}
            placeholder="Escribí todo lo que se te ocurra, sin ordenarlo: qué pasó, cuándo, con quién, qué hiciste vos, qué te llevás, qué querés que la gente sepa. Cuanto más cuentes, menos tiene que suponer."
            value={rawText}
            onChange={(event) => setRawText(event.target.value.slice(0, MAX_RAW_TEXT_LENGTH))}
            disabled={isLoading}
            rows={9}
          />
          <div className={styles.fieldFooter}>
            <span className={styles.fieldHint}>
              {tooShort
                ? 'Contá un poco más: con esto no alcanza para escribir algo que sea tuyo.'
                : 'No se guarda en ningún lado. Se usa sólo para escribir esta publicación.'}
            </span>
            <span className={styles.counter}>
              {trimmed.length} / {MAX_RAW_TEXT_LENGTH}
            </span>
          </div>
        </div>

        <div className={styles.options}>
          <OptionGroup
            label="De qué se trata"
            choices={POST_TYPE_CHOICES}
            value={postType}
            onChange={setPostType}
            disabled={isLoading}
            wide
          />
          <OptionGroup
            label="Tono"
            choices={TONE_CHOICES}
            value={tone}
            onChange={setTone}
            disabled={isLoading}
            wide
          />

          <div className={styles.optionsRow}>
            <OptionGroup
              label="Largo"
              choices={LENGTH_CHOICES}
              value={length}
              onChange={setLength}
              disabled={isLoading}
            />
            <OptionGroup
              label="Emojis"
              choices={EMOJI_CHOICES}
              value={emojis}
              onChange={setEmojis}
              disabled={isLoading}
            />
            <OptionGroup
              label="Hashtags"
              choices={HASHTAG_CHOICES}
              value={hashtags}
              onChange={setHashtags}
              disabled={isLoading}
            />
            <OptionGroup
              label="Quién habla"
              choices={VOICE_CHOICES}
              value={voice}
              onChange={setVoice}
              disabled={isLoading}
            />
          </div>

          <OptionGroup
            label="Cómo cierra"
            choices={CTA_CHOICES}
            value={cta}
            onChange={setCta}
            disabled={isLoading}
            wide
          />
        </div>

        <Button type="submit" disabled={!canSubmit}>
          {isLoading ? 'Escribiendo…' : 'Generar publicación'}
        </Button>
      </form>

      {isLoading && (
        <div className={styles.result}>
          <LoadingState messages={LOADING_STEPS} />
        </div>
      )}

      {state.status === 'error' && (
        <p className={styles.errorState} role="alert">
          {state.message}
        </p>
      )}

      {state.status === 'success' && (
        <PostResult
          result={state.result}
          draft={draft}
          onDraftChange={setDraft}
          onRegenerate={() => void generate()}
        />
      )}
    </div>
  );
}

interface OptionGroupProps<T extends string> {
  label: string;
  choices: Choice<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled: boolean;
  /** Ocupa la fila entera. Los grupos de dos o tres opciones no la necesitan. */
  wide?: boolean;
}

function OptionGroup<T extends string>({
  label,
  choices,
  value,
  onChange,
  disabled,
  wide,
}: OptionGroupProps<T>) {
  const selected = choices.find((choice) => choice.id === value);

  return (
    <fieldset className={cx(styles.group, wide && styles.groupWide)} disabled={disabled}>
      <legend className={styles.groupLabel}>{label}</legend>

      <div className={styles.chips}>
        {choices.map((choice) => (
          <button
            key={choice.id}
            type="button"
            title={choice.hint}
            /* `title` solo alcanza para el cursor: como nombre accesible del
               botón le gana a la etiqueta visible, y quien usa lector de
               pantalla escucharía la explicación sin saber qué opción es.
               Acá van las dos, en ese orden. */
            aria-label={`${choice.label}. ${choice.hint}`}
            aria-pressed={choice.id === value}
            className={cx(styles.chip, choice.id === value && styles.chipActive)}
            onClick={() => onChange(choice.id)}
          >
            {choice.label}
          </button>
        ))}
      </div>

      {/* La etiqueta sola no alcanza para elegir: acá se lee qué implica lo
          que está marcado, sin tener que pasar el cursor por cada opción. */}
      {selected && <p className={styles.groupHint}>{selected.hint}</p>}
    </fieldset>
  );
}

interface PostResultProps {
  result: LinkedinPostResult;
  draft: string;
  onDraftChange: (value: string) => void;
  onRegenerate: () => void;
}

function PostResult({ result, draft, onDraftChange, onRegenerate }: PostResultProps) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  const tooLong = draft.length > MAX_POST_LENGTH;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(draft);
      setCopyFailed(false);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* Sin permiso de portapapeles no hay nada que hacer desde acá: el texto
         está a la vista y se puede seleccionar a mano. */
      setCopyFailed(true);
    }
  };

  const applyHook = (hook: string) => {
    onDraftChange(replaceOpening(draft, hook));
  };

  return (
    <div className={styles.result}>
      <div className={styles.postHeader}>
        <p className={styles.postTitle}>Tu publicación</p>
        <span className={cx(styles.counter, tooLong && styles.counterOver)}>
          {draft.length} / {MAX_POST_LENGTH}
        </span>
      </div>

      {/* Editable a propósito: lo que sale de acá es un borrador, y casi
          siempre hay un nombre o un dato que sólo la persona puede corregir. */}
      <textarea
        className={cx(styles.postText, tooLong && styles.postTextOver)}
        value={draft}
        onChange={(event) => onDraftChange(event.target.value)}
        rows={14}
        aria-label="Publicación generada, editable"
      />

      {tooLong && (
        <p className={styles.fieldHint}>
          LinkedIn no acepta más de {MAX_POST_LENGTH} caracteres: recortá antes de pegarla.
        </p>
      )}

      <div className={styles.actions}>
        <Button type="button" onClick={() => void handleCopy()} iconLeading={copied ? 'check' : undefined}>
          {copied ? 'Copiada' : 'Copiar publicación'}
        </Button>
        <Button type="button" variant="secondary" onClick={onRegenerate}>
          Generar otra versión
        </Button>
      </div>

      {copyFailed && (
        <p className={styles.fieldHint} role="alert">
          El navegador no dejó copiar. Seleccioná el texto de arriba y copialo a mano.
        </p>
      )}

      {result.hooks.length > 0 && (
        <section className={styles.list}>
          <p className={styles.listTitle}>Otros inicios posibles</p>
          {/* En LinkedIn sólo se ven las primeras líneas antes del "ver más":
              cambiar el arranque es el cambio que más se nota. */}
          <p className={styles.listIntro}>
            Es lo único que se lee antes del “ver más”. Probá otro y mirá cómo queda.
          </p>

          <ul className={styles.listItems}>
            {result.hooks.map((hook) => (
              <li key={hook} className={styles.hook}>
                <span className={styles.hookText}>{hook}</span>
                <Button type="button" variant="quiet" size="sm" onClick={() => applyHook(hook)}>
                  Usar este
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {result.tips.length > 0 && (
        <section className={styles.list}>
          <p className={styles.listTitle}>Antes de publicar</p>

          <ul className={styles.listItems}>
            {result.tips.map((tip) => (
              <li key={tip} className={styles.tip}>
                <Icon name="spark" size={15} className={styles.tipIcon} />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

/**
 * Cambia el arranque conservando el resto.
 *
 * El gancho es el primer párrafo, no la publicación entera: se corta en la
 * primera línea en blanco, que es como separa los párrafos el workflow. Si no
 * hay ninguna, se cae al primer salto de línea; y si el texto es un bloque sin
 * cortes, el gancho se antepone en vez de reemplazarlo — reemplazar ahí sería
 * borrar toda la publicación.
 */
function replaceOpening(post: string, hook: string): string {
  const paragraphBreak = post.indexOf('\n\n');
  if (paragraphBreak !== -1) return hook + post.slice(paragraphBreak);

  const lineBreak = post.indexOf('\n');
  if (lineBreak !== -1) return hook + post.slice(lineBreak);

  return `${hook}\n\n${post}`;
}
